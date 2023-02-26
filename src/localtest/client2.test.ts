import { SocketMessaging, MessageToServer, delay } from '../net-socket/index.js';
import { CLIENT_LOG_TIME_LABEL } from '../net-socket/types/net-socket-types.js';

const s = new SocketMessaging('s1');
await s.connect();
console.time(CLIENT_LOG_TIME_LABEL);

for (let i = 1; i < 1000; i++) {
  await s.sendMsg(JSON.stringify({ type: 'cntResponse', queryIndex: i, payload: 0 }));
  await s.sendMsg(JSON.stringify({ type: 'getIp', queryIndex: i + 200, payload: 0 }));
}
