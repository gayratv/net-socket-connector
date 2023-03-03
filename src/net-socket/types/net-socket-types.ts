// формат сообщения для запроса на сервер

/*
 * Клиент посылает такое сообщение серверу
 *
 * queryIndex - внутренний номер клиента запроса (сервер его хранит и отвечает вместе с ним)
 */
export interface MessageToServer {
  type: string;
  queryIndex: number;
  payload?: any;
}

export interface TBaseResultJob {
  type: string;
}

// для использования сервером
export type ServerResponce<T extends TBaseResultJob> = {
  type: string; // определяет worker
  queryIndex: number; // число ранее полученное от клиента
  // первоначально worker возвращает resultJob включая type, type переносим в начало и удаляем его из результатов
  resultJob: Omit<T, 'type'>; // результат работы - грубо говоря any
};

// для использования клиентом
export type ServerResponceClient<T> = {
  type: string; // определяет worker
  queryIndex: number; // число ранее полученное от клиента
  resultJob: T; // результат работы - грубо говоря any
};

/*
 * Внутри сервер хранит следующую структуру запроса пользователя
 *
 * key - IP:PORT клиента от которого пришел вызов
 * type - вид запроса к серверу, например getProxy, returnProxy и тд
 * queryIndex - внутренний номер запроса клиента (каждый клиент ведет его самостоятельно
 * payload - возможно при запросе сервера надо указать какую то еще информацию
 * errorCount - количество ошибок при обработке запроса
 */
export interface Demand extends MessageToServer {
  key: string;
  errorCount: number;
  inProcessState: boolean; // показывает что запрос передан в работу
}

/*
 * executor должен возвращать объект в котором как минимум должно быть {type:string} а также результат работы
 *
 * type - определяет тип, на который реагирует обработчик события
 * он должен быть уникальным для каждого обработчика
 */
export type JobWorker<TresultJob extends TBaseResultJob> = {
  type: string;
  executor: Executor<TresultJob>;
};

export type Executor<TresultJob extends TBaseResultJob> = (demand: GetNextClientJob) => Promise<TresultJob>;

export type QueueOneTypeProcessing<TresultJob extends TBaseResultJob> = {
  demandQueIsProcessing: boolean; // очередь сообщений обрабатывается
  type: string;
  runner: Executor<TresultJob>;
};

/*
 * При завершении работы worker извещает сервер, что работа сделана путем отправки сообщения
 * T - тип в котором записаны результаты работы worker
 */
export type EventJobDoneArgs<T> = { demand: GetNextClientJob; resultJob: T };

/*
 * GetNextClientJob - тип сервера для извлечения следующего запроса клиента
 *
 * index - индекс запроса в массиве clientQueues
 */
export type GetNextClientJob = { index: number; queItem: Demand };

// служебный тип для получения типа для метода класса
// eslint-disable-next-line @typescript-eslint/ban-types
export type TypeOfClassMethod<T, M extends keyof T> = T[M] extends Function ? T[M] : never;

export interface ErrorNet extends Error {
  code: string;
}

// константы сообщения для Eventemitter сервера
export const serverJobRecieved = 'SERVER_JOB_RECIEVED';
export const workerJobDone = 'WORKER_JOB_DONE';

// макс количество повторных обработок задания
export const MAX_JOB_RETRYES = 5;

// строка символов для разделения сообщений
export const MESSAGE_SEPARATOR = '🦀';

// максимальное время ожидания клиентом ответа от сервера
export const CLIENT_WAIT_FOR_SERVER_ANSWER = 10_000;
