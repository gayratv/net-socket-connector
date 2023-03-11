import { delay, SocketMessagingClient } from '../net-socket/index.js';
import { NLog } from '../logger/logger.implementation.js';
import type { ServerResponceClient } from '../net-socket/types/net-socket-types.js';

const s = new SocketMessagingClient('s1', NLog.getInstance());
await s.connect();

//  нет обработчика
await s.sendMsg(JSON.stringify({ type: 'getip', queryIndex: 1, payload: 0 }));
await delay(2_000);

const res = await s.requestServer<{ cnt: number }>('cntResponse');

// {type: string, queryIndex: number, resultJob: {cnt: number}, timestamp: Date}
type A = ServerResponceClient<{ cnt: number }>;

console.log(res);
// await s.end();
await s.resetAndDestroy();
