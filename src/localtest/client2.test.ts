import { SocketMessaging, MessageToServer, delay } from '../net-socket/index.js';
import { NLog } from '../logger/logger.implementation.js';

const s = new SocketMessaging('s1', NLog.getInstance());
await s.connect();

for (let i = 1; i < 1000; i++) {
  s.sendMsg(JSON.stringify({ type: 'cntResponse', queryIndex: i, payload: 0 }));
  s.sendMsg(JSON.stringify({ type: 'getIp', queryIndex: i + 200, payload: 0 }));
}
