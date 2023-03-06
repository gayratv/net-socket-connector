import { ServerSocket, WorkerForServer, delay, NLog } from 'net-socket-connector';
import type { Executor, GetNextClientJob, JobWorker } from 'net-socket-connector';

// для тестирования пакета
let counter = 0;
const workTestJob1: Executor<{ type: string; cnt: number }> = async (
  demand: GetNextClientJob,
): Promise<{ type: string; cnt: number }> => {
  await delay(4_100);
  return { type: 'cntResponse', cnt: counter++ };
};

const testJobWorker: JobWorker<{ type: string; cnt: number }> = {
  type: 'cntResponse',
  executor: workTestJob1,
};

let counter2 = 100;
const workTestJob2: Executor<{ type: string; cnt: number }> = async (
  demand: GetNextClientJob,
): Promise<{ type: string; cnt: number }> => {
  await delay(2_000);
  return { type: 'getIp', cnt: counter2++ };
};

const testJobWorker2: JobWorker<{ type: string; cnt: number }> = {
  type: 'getIp',
  executor: workTestJob2,
};

console.time('SRV1');
const serverTest = new ServerSocket('SRV1', NLog.getInstance());
serverTest.createServer();
const w = new WorkerForServer(serverTest, NLog.getInstance());
w.registerNewWorker(testJobWorker);
w.registerNewWorker(testJobWorker2);
serverTest.startQueTimer();
