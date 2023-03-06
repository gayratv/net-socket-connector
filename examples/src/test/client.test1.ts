import { SocketMessagingClient, MessageToServer, delay, NLog } from 'net-socket-connector';

const s = new SocketMessagingClient('s1', NLog.getInstance());
await s.connect();

//  нет обработчика
await s.sendMsg(JSON.stringify({ type: 'getip', queryIndex: 1, payload: 0 }));
// await s.sendMsg(JSON.stringify({ type: 'getip', queryIndex: 2, payload: 0 }));

// рекомендуемый способ взаимодействия с сервером - послать запрос и ждать ответа
s.log.debug(await s.requestServer('cntResponse'));
s.log.debug(await s.requestServer('getIp'));
await s.end();
