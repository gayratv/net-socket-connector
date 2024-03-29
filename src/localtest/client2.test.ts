import { SocketMessagingClient, MessageToServer } from '../net-socket/index.js';
import { NLog } from 'tslog-fork';

const s = new SocketMessagingClient('s1', NLog.getInstance());
await s.connect();

for (let i = 1; i < 100; i++) {
  s.sendMsg(JSON.stringify({ type: 'cntResponse', queryIndex: i, payload: 0 }));
  s.sendMsg(JSON.stringify({ type: 'getIp', queryIndex: i + 200, payload: 0 }));
}
