// import * as net from 'node:net';
import '../helpers/dotenv-init.js';
import { EventEmitter } from 'events';
import {
  Demand,
  ErrorNet,
  EventJobDoneArgs,
  GetNextClientJob,
  MAX_JOB_RETRYES,
  MaxInternalIndex,
  MESSAGE_SEPARATOR,
  MessageToServer,
  serverJobRecieved,
  ServerResponce,
  TBaseResultJob,
  workerJobDone,
} from '../types/net-socket-types.js';
import { AddressInfo, Socket, Server, createServer } from 'node:net';
import { splitMessages } from '../helpers/socket-helpers.js';
import { ILogger } from '../../logger/logger.interface.js';
import { validateMsgToServer } from '../helpers/validate.js';
import { defaultFormater } from './worker-for-server.js';
function socketState(socket: Socket) {
  return `socketstate: ${socket.remoteAddress}:${socket.remotePort} -- ${socket.readyState}==${socket.remoteFamily}`;
}

export class ServerSocket<TresultJob extends TBaseResultJob> extends EventEmitter {
  //  ключ ${socket.remoteAddress}:${socket.remotePort}
  // по ключю находится объект : socket
  public clientsSocket: Record<string, Socket> = {};
  // по ключю ${socket.remoteAddress}:${socket.remotePort} идентифицируется socket, который выдал запрос
  // на будущее оставлю locked?: boolean; timestamp
  clientQueues: Array<Demand> = [];
  // внутренний индекс
  private clientQueuesCounter = 0;

  // внутренний счетчик сервера для учета сообщений клиента - сообщения будут искаться по этому номеру
  private server: Server;

  private msgBuffer = ''; // остаток буфера
  constructor(public name: string, public log: ILogger) {
    super();
  }

  async createServer() {
    this.server = createServer((socket) => {
      // this.log.silly('Client connected ', socketState(socket));

      socket.on('data', (data) => {
        const keySocket = `${socket.remoteAddress}:${socket.remotePort}`;
        if (!this.clientsSocket[keySocket]) this.clientsSocket[keySocket] = socket;

        const msgArray = splitMessages(this.msgBuffer + data.toString());
        /* if (this.msgBuffer) {
          this.log.silly('');
          this.log.silly(chalk.green('Остаток '), this.msgBuffer);
          this.log.silly(msgArray[0]);
          this.log.silly('--------');
        }*/
        this.msgBuffer = '';

        const objArray: Array<any> = [];
        let isRestMsg = false;
        msgArray.forEach((val) => {
          let res: any;
          try {
            res = JSON.parse(val); // преобразуем в объекты
            objArray.push(res);
          } catch (e) {
            // this.log.silly(chalk.red(`createServer socket.on can't convert to object`), val);
            isRestMsg = true;
          }
        });
        // надо добавить в буфер последний элемент массива - по идее он не преобразовался в json
        const lastMsg = msgArray[msgArray.length - 1];
        // последний символ не краб
        if (isRestMsg && !lastMsg.endsWith(MESSAGE_SEPARATOR)) this.msgBuffer = lastMsg;

        this.log.silly('Recieved message from client : ', keySocket, ' cntMessages ', msgArray.length);

        // валидируем тип входящего сообщения
        for (let i = 0; i < objArray.length; i++) {
          if (!validateMsgToServer(objArray[i])) {
            const newMsg: MessageToServer = {
              type: 'errMsgFromClient',
              queryIndex: objArray[i].queryIndex ?? 0,
              payload: JSON.stringify(objArray[i]),
            };
            objArray[i] = newMsg;
          }
        }

        // извещаем worker что появилась работа type
        const typeMap = new Map();
        objArray.forEach((val) => {
          const d: Demand = {
            key: keySocket,
            type: val.type,
            queryIndex: val.queryIndex,
            payload: val.payload,
            errorCount: 0,
            inProcessState: false,
            internalIndex: this.getInternalIndex(),
          };
          this.clientQueues.push(d);
          // this.log.debug(d);
          typeMap.set(val.type, true);
        });

        // извещаем worker что появилась работа type, сообщение посылаем только по уникальным type
        typeMap.forEach((val, key, map) => {
          this.emit(serverJobRecieved, key);
        });
      });

      socket.on('end', () => {
        this.deleteClientRequestAfterSocketClose(socket);
        this.log.silly(this.log.sw('Client disconnected ', ['yellow', 'bold']), socketState(socket));
      });

      socket.on('error', (err: ErrorNet) => {
        if (err.code === 'ECONNRESET') {
          this.log.silly(this.log.sw('ECONNRESET Client connection reset ', ['yellow', 'bold']), socketState(socket));
        } else {
          this.log.error(this.log.sw(`Socket unknown error: ${err}`, 'red'));
        }
        this.deleteClientRequestAfterSocketClose(socket);
      });
    });

    // установлено соединение с клиентом
    this.server.on('connection', (socket) => {
      this.log.silly(
        this.log.sw(
          `${this.name} Client connection details - ${socket.remoteAddress}:${socket.remotePort}`,
          'bgBlackBright',
        ),
      );
      // socket.write(`${this.name}  SERVER: Hello! Connection successfully made.`);
    });

    this.server.on('close', (socket: Socket) => {
      this.log.silly('Close connection', socket.address());
    });

    this.server.on('error', (err) => {
      this.log.error(err);
    });

    this.server.listen(parseInt(process.env.SOCKET_PORT, 10), () => {
      this.log.silly(`${this.name} opened server on port ${(this.server.address() as AddressInfo).port}`);
      this.log.silly(this.server.address());
    });

    // worker успешно выполнил задачу
    super.on(workerJobDone, (args: EventJobDoneArgs<TresultJob>) => {
      /* this.log.silly(
        workerJobDone,
        ' queryIndex ',
        args.demand.queItem.queryIndex,
        args.demand.queItem.key,
        ' JobResult ',
        args.resultJob,
      ); */

      const logText = args.formater ? args.formater(args) : defaultFormater(args);
      this.log.silly(logText);

      //   теперь отправим результат клиенту
      const socket = this.clientsSocket[args.demand.queItem.key];
      if (socket) {
        const type = args.resultJob.type ?? 'unknown type'; // определяет worker
        const resultJob = { ...args.resultJob };
        Reflect.deleteProperty(resultJob, 'type'); // чтобы type два раза не дублировался
        const responce: ServerResponce<TresultJob> = {
          type,
          queryIndex: args.demand.queItem.queryIndex, // число ранее полученное от клиента
          resultJob,
        };

        socket.write(JSON.stringify(responce) + MESSAGE_SEPARATOR, 'utf-8');
      }
      this.removeQueueElement(args.demand); // пока с одним worker это синхронная операция
    });
  }

  printQue = () => {
    this.log.info(`---------- QUEUE PRINT ITEMS count ${this.clientQueues.length}-------------`);

    /*this.clientQueues.forEach((val) => {
      // this.log.silly(`${val.key} -- ${val.type}:${val.queryIndex}`);
      this.log.silly(`\t ${val.type}:${val.queryIndex}`);
    });
    */

    for (let i = 0; i < this.clientQueues.length; i++) {
      const val = this.clientQueues[i];
      this.log.silly(`\t ${i} : ${val.type}:${val.queryIndex} client ${val.key}`);
    }
    this.log.info(`---------- QUEUE PRINT ITEMS FINISH -------------`);
  };
  printQueShort = () => {
    this.log.silly('---------- QUEUE ------------- ', this.clientQueues.length);
  };

  startQueTimer() {
    setInterval(this.printQueShort, 4_000);
  }

  // пока сделано в расчетет только на одного обработчика очереди
  // соответственно нет блокировок элемента очереди и всегда извлекается первый элемент
  getNextClientJob(): GetNextClientJob {
    if (this.clientQueues.length === 0) return null;
    // найти первое задание не переданное в работу
    const ind = this.clientQueues.findIndex((val) => !val.inProcessState);
    if (ind >= 0) {
      const elem = this.clientQueues[ind];
      elem.inProcessState = true; // запрос передан в работу
      return { queItem: elem, index: ind };
    } else return null; // все задания находятся в работе
  }

  getNextClientJobForType(type: string): GetNextClientJob {
    if (this.clientQueues.length === 0) return null;
    // найти первое задание не переданное в работу
    const ind = this.clientQueues.findIndex((val) => !val.inProcessState && val.type === type);
    if (ind >= 0) {
      const elem = this.clientQueues[ind];
      elem.inProcessState = true; // запрос передан в работу
      return { queItem: elem, index: ind };
    } else return null; // все задания находятся в работе
  }

  removeQueueElement(demand: GetNextClientJob) {
    const ind = this.clientQueues.findIndex((value) => value.internalIndex === demand.queItem.internalIndex);
    if (ind >= 0) this.clientQueues.splice(ind, 1);
  }

  // поместить запрос в конец очереди такая потребность возникает когда worker не смог обработать запрос
  putCurrentDemandToTheQueueEnd(demand: GetNextClientJob) {
    if (this.clientQueues.length === 0) return;
    if (++demand.queItem.errorCount > MAX_JOB_RETRYES) {
      // удалить задание из очереди
      this.clientQueues.splice(demand.index, 1);
      return;
    }
    demand.queItem.inProcessState = false; // разрешить взять запрос в работу еще раз
    if (this.clientQueues.length <= 1) return; // в очереди не более 1 запроса
    const demandSave = this.clientQueues[demand.index];
    this.clientQueues.splice(demand.index, 1);
    this.clientQueues.push(demandSave);
  }

  deleteClientRequestAfterSocketClose(socket: Socket) {
    const keySocket = `${socket.remoteAddress}:${socket.remotePort}`;
    Reflect.deleteProperty(this.clientsSocket, keySocket);
    //   удалить все необработанные сообщения из очереди
    this.clientQueues = this.clientQueues.filter((val) => !(val.key === keySocket && !val.inProcessState));
  }

  /*
   * dropClientRequestByType
   * discard all client queue by type
   */
  dropClientRequestByType(typeP: string) {
    //   удалить все необработанные сообщения из очереди
    this.clientQueues = this.clientQueues.filter((val) => !(val.type !== typeP && !val.inProcessState));
  }

  private getInternalIndex(): number {
    if (this.clientQueuesCounter + 1 > MaxInternalIndex) this.clientQueuesCounter = 0;
    return this.clientQueuesCounter++;
  }
}
