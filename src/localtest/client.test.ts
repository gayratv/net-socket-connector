import { delay, SocketMessagingClient } from '../net-socket/index.js';
import { NLog } from '../logger/logger.implementation.js';
import type { RecievedServerMessages } from '../net-socket/types/net-socket-types.js';

const s = new SocketMessagingClient('s1', NLog.getInstance());
await s.connect();

//  нет обработчика
/*

const r1 = await s.sendMsg(JSON.stringify({ type: 'getip', queryIndex: 1, payload: 0 }));
await delay(2_000);
*/

const res = await s.requestServer<{ cnt: number }>('cntResponse').catch((err) => {
  console.log('--- ', err);
});

/*const p = s.requestServer<{ cnt: number }>('cntResponse');
console.log(p);
p.then((data) => {
  console.log('data : ', data);
}).catch((err) => {
  console.log('--- ', err);
});
await delay(1000);
console.log(p);*/

// {type: string, queryIndex: number, resultJob: {cnt: number}, timestamp: Date}
type A = RecievedServerMessages<{ cnt: number }>;

console.log('-> ', res);
await s.resetAndDestroy();
