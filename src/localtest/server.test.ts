// для тестирования пакета
import { delay, Executor, JobWorker, GetNextClientJob, ServerSocket, WorkerForServer } from '../net-socket/index.js';
import { NLog } from '../logger/logger.implementation.js';

const serverTest = new ServerSocket('SRV1', NLog.getInstance());
serverTest.createServer();
const w = new WorkerForServer(serverTest, NLog.getInstance());

// ========================================
let counter1 = 0;
const WorkTestJob1 = 'cntResponse';
type TworkTestJob1 = { type: string; cnt: number };

const testJobWorker1: JobWorker<TworkTestJob1> = {
  type: WorkTestJob1,
  executor: async (demand: GetNextClientJob): Promise<TworkTestJob1> => {
    await delay(1_000);
    return { type: WorkTestJob1, cnt: counter1++ };
  },
};
// ========================================
w.registerNewWorker(testJobWorker1);

// ========================================
let counter2 = 100;
const WorkTestJob2 = 'getIp';
type TworkTestJob2 = { type: string; ip: number };

const testJobWorker2: JobWorker<TworkTestJob2> = {
  type: WorkTestJob2,
  executor: async (demand: GetNextClientJob): Promise<TworkTestJob2> => {
    await delay(2_000);
    return { type: WorkTestJob2, ip: counter2++ };
  },
};
// ========================================
w.registerNewWorker(testJobWorker2);

/*
// ========================================

const WjobErrMsg = 'errMsgFromClient';
type TjobErrMsg = { type: string; err: string; msg: string };

const jobErrMsg: JobWorker<TjobErrMsg> = {
  type: WjobErrMsg,
  executor: async (demand: GetNextClientJob): Promise<TjobErrMsg> => {
    return { type: WjobErrMsg, msg: 'ошибка в сообщении к серверу', err: demand.queItem.payload };
  },
};
// ========================================
w.registerNewWorker(jobErrMsg);
*/

/*
// Печать очереди
// ========================================
const JobSrvQueuePrintType = 'srvQueuePrint';
type TjobSrvQueuePrint = { type: string };

const jobSrvQueuePrint: JobWorker<TjobSrvQueuePrint> = {
  type: JobSrvQueuePrintType,
  executor: async (demand: GetNextClientJob): Promise<TjobSrvQueuePrint> => {
    w.serverSocket.printQue();
    return { type: JobSrvQueuePrintType };
  },
};
w.registerNewWorker(jobSrvQueuePrint);
// ========================================*/

serverTest.startQueTimer();
