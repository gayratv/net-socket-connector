// подписывается на событыие сервера и выполняет работу
import { ServerSocket } from './server-socket.js';
import type { Executor, Formater, GetNextClientJob, JobWorker, TBaseResultJob } from '../types/net-socket-types.js';
import {
  EventJobDoneArgs,
  JobSrvQueuePrintType,
  QueueOneTypeProcessing,
  serverJobRecieved,
  workerJobDone,
} from '../types/net-socket-types.js';
import { delay, getPort, objectToString } from '../helpers/common.js';
import { ILogger } from 'tslog-fork';

export const defaultFormater: Formater<any> = (args: EventJobDoneArgs<any>) => {
  return `${workerJobDone} queryIndex ${args.demand.queItem.queryIndex}  cliIp : ${getPort(
    args.demand.queItem.key,
  )} JobResult : ${objectToString(args.resultJob)}`;
};

/*
В задачи worker входит обработка очереди сервера
worker получает событие о том что в очередь добавилась задача
Получив сообщение worker начинает обработку очереди и останавливается после того как обработал всю очередь

WorkerForServer на вход получает собственно обработчик - который обрабатывает входящие сообщения и выдает результат

Refactor : сделаем несколько очередей для разных запросов (отдельную очередь для каждого типа сообщений)
 */

// внутри ServerSocket лежит очередь клиентских запросов
// queueClientsQuery: Record<string, ClientQuery> = {};
export class WorkerForServer<TresultJob extends TBaseResultJob> {
  private registeredWorkers: Record<string, QueueOneTypeProcessing<TresultJob>> = {};
  constructor(public serverSocket: ServerSocket<TresultJob>, protected log: ILogger) {
    this.serverSocket.on(serverJobRecieved, this.worker);
    this.registerSystemErrorJober();
    this.registerJobSrvQueuePrint();

    // add ping/pong jobber to check server is living
    let counter1 = 0;
    createNewJober<{ type: string; pong: number }>('ping', this, async (demand: GetNextClientJob) => {
      return { type: demand.queItem.type, pong: counter1++ };
    });
  }

  // запускаектся при появлении сообщения от сервера о том что пришло новое сообщение от клиента
  worker = (type: string) => {
    this.log.info('WorkerForServer : получено сообщение о задании ', type);

    let worker = this.registeredWorkers[type];

    if (!worker) {
      // такой обработчие не зарегистрирован
      this.log.error(this.log.sw('Не найден обработчик для запроса ', 'red'), type);
      const workJob: Executor<{ type: string; err: string }> = async (
        demand: GetNextClientJob,
      ): Promise<{ type: string; err: string }> => {
        return { type: type, err: `Не найден обработчик для запроса ` + type };
      };
      const jobWorker: JobWorker<{ type: string; err: string }> = {
        type: type,
        executor: workJob,
      };
      this.registerNewWorker(jobWorker as unknown as JobWorker<TresultJob>);
      worker = this.registeredWorkers[type];
    }

    // предотвратить многократный запуск обработчика задания
    if (!worker.demandQueIsProcessing) {
      worker.demandQueIsProcessing = true;
      setImmediate(this.processOneItem, type); // возможно что запустится еще один обработчик
    }
  };
  // обрабатывает один запрос из очереди
  processOneItem = async (type: string) => {
    const demand = this.serverSocket.getNextClientJobForType(type);
    // this.log.info('processOneItem demand ', demand);
    // console.timeLog('SRV1', 'processOneItem demand', demand?.queItem?.queryIndex, demand?.index);
    if (!demand) {
      //  признак того, что очередь type свободна
      if (this.registeredWorkers[type]) this.registeredWorkers[type].demandQueIsProcessing = false;
      return;
    }

    try {
      const workerForProcess = this.registeredWorkers[type];
      if (!workerForProcess) {
        this.log.error(this.log.sw('Не найден обработчик для запроса ', 'red'), type);
        const msgToServer: EventJobDoneArgs<TresultJob> = {
          demand,
          resultJob: {
            type: demand.queItem.type,
            err: `ERROR - could not process` + demand.queItem.type,
          } as unknown as TresultJob,
          formater: workerForProcess.formater,
        };
        this.serverSocket.emit(workerJobDone, msgToServer);
      } else {
        workerForProcess.demandQueIsProcessing = true; // очередь type занята работой
        let result;
        try {
          result = await workerForProcess.runner(demand);
        } catch (err) {
          result = null; // jobber не смог обработать запрос
        }
        const msgToServer: EventJobDoneArgs<TresultJob> = {
          demand,
          resultJob: result,
          formater: workerForProcess.formater,
        };
        this.serverSocket.emit(workerJobDone, msgToServer);
      }
    } catch (err) {
      // Job не смог быть выполнен, подождем 1 сек и попробуем еще
      await delay(1_000);
      this.serverSocket.putCurrentDemandToTheQueueEnd(demand);
    } finally {
      // продолжить обработку очереди пока в ней что то есть
      setImmediate(this.processOneItem, type);
    }
  };

  /*
   * регистрирует обработчика запроса типа type
   */
  registerNewWorker(workForJob: JobWorker<TresultJob>) {
    this.registeredWorkers[workForJob.type] = {
      type: workForJob.type,
      runner: workForJob.executor,
      demandQueIsProcessing: false,
      formater: workForJob.formater ? workForJob.formater : defaultFormater,
    };
  }

  /*
   * зарегистрировать специальный worker для обработки ошибочных сообщений серверу
   */
  private registerSystemErrorJober() {
    const WjobErrMsg = 'errMsgFromClient';
    interface TjobErrMsg extends TBaseResultJob {
      type: string;
      err: string;
      msg: string;
    }

    const jobErrMsg: JobWorker<TjobErrMsg> = {
      type: WjobErrMsg,
      executor: async (demand: GetNextClientJob): Promise<TjobErrMsg> => {
        return { type: WjobErrMsg, msg: 'ошибка в сообщении к серверу', err: demand.queItem.payload };
      },
    };

    this.registerNewWorker(jobErrMsg as unknown as JobWorker<TresultJob>);
  }

  /*
   * jober для печати очереди сервера
   */
  private registerJobSrvQueuePrint() {
    // Печать очереди
    type TjobSrvQueuePrint = { type: string };

    const jobSrvQueuePrint: JobWorker<TjobSrvQueuePrint> = {
      type: JobSrvQueuePrintType,
      executor: async (demand: GetNextClientJob): Promise<TjobSrvQueuePrint> => {
        this.serverSocket.printQue();
        return { type: JobSrvQueuePrintType };
      },
    };
    this.registerNewWorker(jobSrvQueuePrint as unknown as JobWorker<TresultJob>);
  }
}

export function createNewJober<T extends TBaseResultJob>(
  type: string,
  w: WorkerForServer<any>,
  runner: (demand: GetNextClientJob) => Promise<T>,
): void {
  const jobWorker: JobWorker<T> = {
    type: type,
    executor: async (demand: GetNextClientJob): Promise<T> => {
      return await runner(demand);
    },
  };
  w.registerNewWorker(jobWorker);
}
