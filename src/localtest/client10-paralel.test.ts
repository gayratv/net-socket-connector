import { SocketMessagingClient, MessageToServer } from '../net-socket/index.js';
import { EventEmitter } from 'events';
import { NLog } from 'tslog-fork';

const s = new SocketMessagingClient('s1', NLog.getInstance());
await s.connect();
console.log('defaultMaxListeners ', EventEmitter.defaultMaxListeners);

console.log(s.log.debug(s.log.sw('sendMsg ***************', 'green')));

const promiseArr = [];
for (let i = 0; i < 10; i++) {
  // await req();
  // s.log.silly('push ', i);
  promiseArr.push(req());
}

await Promise.allSettled(promiseArr);

async function req() {
  console.log();
  s.log.info(s.log.sw('requestServer START', 'bgCyan'), s.currentQueryIndex);
  const res = await s.requestServer('cntResponse');
  // s.log.info('eventNames : ', s.clientSocket.eventNames());
  let r = `MaxListeners : ${s.clientSocket.getMaxListeners().toString()} `;
  s.clientSocket.eventNames().forEach((value: string) => {
    r += ` ${value} : ${s.clientSocket.listenerCount(value)} `;
    // s.log.info(` evnt listeners count for event ${value} : ${s.clientSocket.listenerCount(value)}`);
  });
  s.log.info(r);
  if (!('err' in res)) {
    Reflect.deleteProperty(res, 'type');
    // @ts-ignore
    res.result = res.resultJob.cnt;
    Reflect.deleteProperty(res, 'resultJob');
    s.log.info(s.log.sw('REQUEST ', 'blue'), res);
    console.log();
  }
}
