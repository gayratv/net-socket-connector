import { SocketMessaging } from '../net-socket/index.js';

const s = new SocketMessaging('s1');
await s.connect();

//  нет обработчика
await s.sendMsg(JSON.stringify({ type: 'getip', queryIndex: 1, payload: 0 }));
