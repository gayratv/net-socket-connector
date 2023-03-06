import { ServerSocket, WorkerForServer, delay, NLog, createNewJober } from 'net-socket-connector';
import type { Executor, GetNextClientJob } from 'net-socket-connector';

console.time('SRV1');
const serverTest = new ServerSocket('SRV1', NLog.getInstance());
serverTest.createServer();
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
