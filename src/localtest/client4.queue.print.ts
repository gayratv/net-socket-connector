import { SocketMessagingClient, MessageToServer } from '../net-socket/index.js';
import { NLog } from 'tslog-fork';

const s = new SocketMessagingClient('s1', NLog.getInstance(), 41969, 'localhost');
await s.connect();

// s.log.debug(await s.requestServer('srvQueuePrint'));
await s.printServerQueue();
await s.resetAndDestroy();
