export type { MessageToServer, Executor, GetNextClientJob, JobWorker } from './types/net-socket-types.js';
export { SocketMessagingClient } from './lib/client-socket-message.js';
export { ServerSocket } from './lib/server-socket.js';
export { WorkerForServer, createNewJober } from './lib/worker-for-server.js';
// обязательный контракт для логера
export type { ILogger } from '../logger/logger.interface.js';
export { LoggerLevel } from '../logger/logger.interface.js';
// необязательная реализация логера
export { NLog, SimpleLog } from '../logger/logger.implementation.js';
export type { TBaseResultJob, Formater, RecievedServerMessages, ErrType } from './types/net-socket-types.js';
