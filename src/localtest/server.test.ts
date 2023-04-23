// для тестирования пакета
import { Executor, JobWorker, GetNextClientJob, ServerSocket, WorkerForServer } from '../net-socket/index.js';
import { createNewJober } from '../net-socket/lib/worker-for-server.js';
import { NLog } from 'tslog-fork';
import { delay } from '../net-socket/helpers/common.js';

const serverTest = new ServerSocket('SRV1', NLog.getInstance());
serverTest.createServer(41969);
const w = new WorkerForServer(serverTest, NLog.getInstance());

let counter1 = 0;
createNewJober<{ type: string; cnt: number }>('cntResponse', w, async (demand: GetNextClientJob) => {
  await delay(2_000);
  return { type: demand.queItem.type, cnt: counter1++ };
});

let counter2 = 1000;
createNewJober<{ type: string; ip: number }>('getIp', w, async (demand: GetNextClientJob) => {
  await delay(2_000);
  return { type: demand.queItem.type, ip: counter2++ };
});

serverTest.startQueTimer();
