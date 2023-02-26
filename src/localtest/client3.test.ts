import { SocketMessaging, MessageToServer, delay } from '../net-socket/index.js';
import chalk from 'chalk';
import { CLIENT_LOG_TIME_LABEL } from '../net-socket/types/net-socket-types.js';

const s = new SocketMessaging('s1');
await s.connect();

console.log(chalk.green('sendMsg ***************'));
// здесь принудительно указывается queryIndex 1 - который будет в последущем кофнфилктовать с вызовом req с тем же самым queryIndex
await s.sendMsg(JSON.stringify({ type: 'cntResponse', queryIndex: 1 }));
console.time(CLIENT_LOG_TIME_LABEL);

await req();
console.log('delay start');
// await delay(10_000);
await req();
await req();

/*

await s.sendMsg(JSON.stringify({ type: 'cntResponse', queryIndex: 200, payload: 0 }));
await s.sendMsg(JSON.stringify({ type: 'cntResponse', queryIndex: 201, payload: 0 }));

console.timeLog('T2', chalk.blue('REQUEST '), await s.requestServer('cntResponse'));
console.timeLog('T2', chalk.blue('REQUEST '), await s.requestServer('cntResponse'));
console.timeLog('T2', chalk.blue('REQUEST '), await s.requestServer('cntResponse'));
*/

async function req() {
  console.log();
  console.timeLog(CLIENT_LOG_TIME_LABEL, chalk.bgCyan('requestServer START'), s.currentQueryIndex);
  const res = await s.requestServer('cntResponse');
  if (!('err' in res)) {
    Reflect.deleteProperty(res, 'type');
    // @ts-ignore
    res.result = res.resultJob.cnt;
    Reflect.deleteProperty(res, 'resultJob');
    console.timeLog(CLIENT_LOG_TIME_LABEL, chalk.blue('REQUEST '), res);
    console.log();
  }
}
