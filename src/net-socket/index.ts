export type { MessageToServer, Executor, GetNextClientJob, JobWorker } from './types/net-socket-types.js';
export { SocketMessaging } from './lib/client-socket-message.js';
export { ServerSocket } from './lib/server-socket.js';
export { WorkerForServer } from './lib/worker-for-server.js';
export { delay } from './helpers/common.js';
// обязательный контракт для логера
export type { ILogger, LoggerLevel } from 'log/logger.interface.js';
// необязательная реализация логера
export { NLog } from 'log/logger.implementation.js';
