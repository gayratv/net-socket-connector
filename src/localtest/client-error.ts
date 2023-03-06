import { SocketMessagingClient, MessageToServer, delay } from '../net-socket/index.js';
import { NLog } from '../logger/logger.implementation.js';

const s = new SocketMessagingClient('s1', NLog.getInstance());
await s.connect();

s.sendMsg(JSON.stringify({ type1: 'cntResponse', queryIndex: 1, payload: 0 }));
