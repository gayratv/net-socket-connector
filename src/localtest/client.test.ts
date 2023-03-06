import { delay, SocketMessagingClient } from '../net-socket/index.js';
import { NLog } from '../logger/logger.implementation.js';

const s = new SocketMessagingClient('s1', NLog.getInstance());
await s.connect();

//  нет обработчика
await s.sendMsg(JSON.stringify({ type: 'getip', queryIndex: 1, payload: 0 }));
await delay(2_000);
// await s.end();
await s.resetAndDestroy();
