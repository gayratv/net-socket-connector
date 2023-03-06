import { SocketMessagingClient, MessageToServer, delay, NLog } from 'net-socket-connector';

const s = new SocketMessagingClient('s1', NLog.getInstance());
await s.connect();

const m1: MessageToServer = { type: 'cntResponse', queryIndex: 2, payload: 0 };
await s.sendMsg(JSON.stringify(m1));

for (let i = 1; i < 1000; i++) {
  await s.sendMsg(JSON.stringify({ type: 'cntResponse', queryIndex: i, payload: 0 }));
  await s.sendMsg(JSON.stringify({ type: 'getIp', queryIndex: i + 200, payload: 0 }));
}
