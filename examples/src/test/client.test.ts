import { SocketMessaging, MessageToServer, delay, NLog } from 'resource-manager-socket';

const s = new SocketMessaging('s1', NLog.getInstance());
await s.connect();

//  нет обработчика
await s.sendMsg(JSON.stringify({ type: 'getip', queryIndex: 1, payload: 0 }));
// await s.sendMsg(JSON.stringify({ type: 'getip', queryIndex: 2, payload: 0 }));

/*

const m1: MessageToServer = { type: 'cntResponse', queryIndex: 2, payload: 0 };
await s.sendMsg(JSON.stringify(m1));

for (let i = 3; i < 6; i++) {
  const m: MessageToServer = { type: 'cntResponse', queryIndex: i, payload: 0 };
  // await delay(200);
  await s.sendMsg(JSON.stringify(m));
}

for (let i = 200; i < 206; i++) {
  const m: MessageToServer = { type: 'getIp', queryIndex: i, payload: 0 };
  await delay(500);
  await s.sendMsg(JSON.stringify(m));
}
*/

/*

for (let i = 2500; i < 3000; i++) {
  // await delay(200);
  s.sendMsg(JSON.stringify({ type: 'cntResponse', queryIndex: i, payload: 0 }));
}

for (let i = 1; i < 1000; i++) {
  const m: MessageToServer = { type: 'getIp', queryIndex: i, payload: 0 };
  // await delay(1);
  s.sendMsg(JSON.stringify(m));
}
*/

// s.end();
