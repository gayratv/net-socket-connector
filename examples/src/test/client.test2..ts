import { SocketMessaging, MessageToServer, delay, NLog } from 'resource-manager-socket';

const s = new SocketMessaging('s1', NLog.getInstance());
await s.connect();

//  нет обработчика
await s.sendMsg(JSON.stringify({ type: 'getip', queryIndex: 1, payload: 0 }));
