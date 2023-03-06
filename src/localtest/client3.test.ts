import { SocketMessagingClient, MessageToServer, delay } from '../net-socket/index.js';
import { NLog } from '../logger/logger.implementation.js';

const s = new SocketMessagingClient('s1', NLog.getInstance());
await s.connect();

console.log(s.log.debug(s.log.sw('sendMsg ***************', 'green')));
// здесь принудительно указывается queryIndex 1 - который будет в последущем кофнфилктовать с вызовом req с тем же самым queryIndex
await s.sendMsg(JSON.stringify({ type: 'cntResponse', queryIndex: 1 }));

await req();
await req();
await req();

async function req() {
  console.log();
  s.log.info(s.log.sw('requestServer START', 'bgCyan'), s.currentQueryIndex);
  const res = await s.requestServer('cntResponse');
  if (!('err' in res)) {
    Reflect.deleteProperty(res, 'type');
    // @ts-ignore
    res.result = res.resultJob.cnt;
    Reflect.deleteProperty(res, 'resultJob');
    s.log.info(s.log.sw('REQUEST ', 'blue'), res);
    console.log();
  }
}
