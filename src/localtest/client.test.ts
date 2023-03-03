import { SocketMessaging } from '../net-socket/index.js';
import { NLog } from '../logger/logger.implementation.js';

const s = new SocketMessaging('s1', NLog.getInstance());
await s.connect();

//  нет обработчика
await s.sendMsg(JSON.stringify({ type: 'getip', queryIndex: 1, payload: 0 }));
