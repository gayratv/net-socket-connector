import { SocketMessagingClient, MessageToServer, delay, NLog } from 'net-socket-connector';

const s = new SocketMessagingClient('s1', NLog.getInstance());
await s.connect();

//  нет обработчика
await s.sendMsg(JSON.stringify({ type: 'getip', queryIndex: 1, payload: 0 }));
