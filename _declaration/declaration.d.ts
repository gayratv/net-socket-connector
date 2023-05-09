/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
declare module "net-socket/types/net-socket-types" {
    export interface MessageToServer {
        type: string;
        queryIndex: number;
        payload?: any;
    }
    export interface TBaseResultJob {
        type: string;
    }
    export type ServerResponce<T extends TBaseResultJob> = {
        type: string;
        queryIndex: number;
        resultJob: Omit<T, 'type'>;
    };
    export type RecievedServerMessages<T> = {
        type: string;
        queryIndex: number;
        timestamp: Date;
        resultJob: T;
    };
    export interface ErrType {
        err: string;
    }
    export interface Demand extends MessageToServer {
        key: string;
        errorCount: number;
        internalIndex: number;
        inProcessState: boolean;
    }
    export const MaxInternalIndex = 64000;
    export type Formater<TresultJob> = (arg: EventJobDoneArgs<TresultJob>) => string;
    export type JobWorker<TresultJob extends TBaseResultJob> = {
        type: string;
        executor: Executor<TresultJob>;
        formater?: Formater<TresultJob>;
    };
    export type Executor<TresultJob extends TBaseResultJob> = (demand: GetNextClientJob) => Promise<TresultJob>;
    export type QueueOneTypeProcessing<TresultJob extends TBaseResultJob> = {
        demandQueIsProcessing: boolean;
        type: string;
        runner: Executor<TresultJob>;
        formater?: Formater<TresultJob>;
    };
    export type EventJobDoneArgs<T> = {
        demand: GetNextClientJob;
        resultJob: T;
        formater?: Formater<T>;
    };
    export type GetNextClientJob = {
        index: number;
        queItem: Demand;
    };
    export type TypeOfClassMethod<T, M extends keyof T> = T[M] extends Function ? T[M] : never;
    export interface ErrorNet extends Error {
        code: string;
    }
    export const serverJobRecieved = "SERVER_JOB_RECIEVED";
    export const workerJobDone = "WORKER_JOB_DONE";
    export const MAX_JOB_RETRYES = 5;
    export const MESSAGE_SEPARATOR = "\uD83E\uDD80";
    export const JobSrvQueuePrintType = "srvQueuePrint";
}
declare module "net-socket/helpers/socket-helpers" {
    export function splitMessages(s: string): string[];
}
declare module "net-socket/lib/client-socket-message" {
    import * as net from 'node:net';
    import type { ErrType } from "net-socket/types/net-socket-types";
    import { RecievedServerMessages } from "net-socket/types/net-socket-types";
    import { ILogger } from 'tslog-fork';
    export class SocketMessagingClient {
        name: string;
        log: ILogger;
        socketPortParam: number;
        socketHostParam: string;
        clientWaitForServerAnswer: number;
        clientSocket: net.Socket;
        recievedServerMessages: Array<RecievedServerMessages<any>>;
        private msgBuffer;
        currentQueryIndex: number;
        constructor(name: string, log: ILogger, socketPortParam: number, socketHostParam: string, clientWaitForServerAnswer?: number);
        connect(): Promise<unknown>;
        sendMsg(s: string): Promise<unknown>;
        end(): void;
        resetAndDestroy(): void;
        isConnected(): boolean;
        private increaseMaxCountListeners;
        private decreaseMaxCountListeners;
        private serverAnswered;
        waitForServerAnswer: <T2>(typeParam: string, queryIndex: number) => Promise<void | ErrType | RecievedServerMessages<T2>>;
        requestServer<T1>(typePararm: string, payload?: any): Promise<RecievedServerMessages<T1> | ErrType>;
        printServerQueue(): Promise<void | ErrType | RecievedServerMessages<unknown>>;
    }
}
declare module "net-socket/helpers/validate" {
    export function validateMsgToServer(o: any): boolean;
}
declare module "net-socket/helpers/common" {
    export function delay(ms?: number): Promise<unknown>;
    export function getPort(p: string): string;
    export function objectToString(objectExample: any): any;
}
declare module "net-socket/lib/worker-for-server" {
    import { ServerSocket } from "net-socket/lib/server-socket";
    import type { Formater, GetNextClientJob, JobWorker, TBaseResultJob } from "net-socket/types/net-socket-types";
    import { ILogger } from 'tslog-fork';
    export const defaultFormater: Formater<any>;
    export class WorkerForServer<TresultJob extends TBaseResultJob> {
        serverSocket: ServerSocket<TresultJob>;
        protected log: ILogger;
        private registeredWorkers;
        constructor(serverSocket: ServerSocket<TresultJob>, log: ILogger);
        worker: (type: string) => void;
        processOneItem: (type: string) => Promise<void>;
        registerNewWorker(workForJob: JobWorker<TresultJob>): void;
        private registerSystemErrorJober;
        private registerJobSrvQueuePrint;
    }
    export function createNewJober<T extends TBaseResultJob>(type: string, w: WorkerForServer<any>, runner: (demand: GetNextClientJob) => Promise<T>): void;
}
declare module "net-socket/lib/server-socket" {
    import { EventEmitter } from 'events';
    import { Demand, GetNextClientJob, TBaseResultJob } from "net-socket/types/net-socket-types";
    import { Socket } from 'node:net';
    import { ILogger } from 'tslog-fork';
    export class ServerSocket<TresultJob extends TBaseResultJob> extends EventEmitter {
        name: string;
        log: ILogger;
        clientsSocket: Record<string, Socket>;
        clientQueues: Array<Demand>;
        private clientQueuesCounter;
        private server;
        private msgBuffer;
        constructor(name: string, log: ILogger);
        createServer(socketPortParam: number): Promise<void>;
        printQue: () => void;
        printQueShort: () => void;
        startQueTimer(): void;
        getNextClientJob(): GetNextClientJob;
        getNextClientJobForType(type: string): GetNextClientJob;
        removeQueueElement(demand: GetNextClientJob): void;
        putCurrentDemandToTheQueueEnd(demand: GetNextClientJob): void;
        deleteClientRequestAfterSocketClose(socket: Socket): void;
        dropClientRequestByType(typeP: string): void;
        private getInternalIndex;
    }
}
declare module "net-socket/index" {
    export type { MessageToServer, Executor, GetNextClientJob, JobWorker } from "net-socket/types/net-socket-types";
    export { SocketMessagingClient } from "net-socket/lib/client-socket-message";
    export { ServerSocket } from "net-socket/lib/server-socket";
    export { WorkerForServer, createNewJober } from "net-socket/lib/worker-for-server";
    export type { TBaseResultJob, Formater, RecievedServerMessages, ErrType } from "net-socket/types/net-socket-types";
}
declare module "localtest/client-error" { }
declare module "localtest/client4.queue.print" { }
declare module "localtest/helpers/common" {
    export function getRandomArbitrary(min: number, max: number): number;
    export function delayRnd(minSec: number, maxSec: number): Promise<unknown>;
}
