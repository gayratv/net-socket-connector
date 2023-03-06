import { SocketMessagingClient, MessageToServer, delay } from 'net-socket-connector';
import { NLog } from 'net-socket-connector';

const s = new SocketMessagingClient('s1', NLog.getInstance());
await s.connect();

// s.log.debug(await s.requestServer('srvQueuePrint'));
await s.printServerQueue();
await s.resetAndDestroy();
