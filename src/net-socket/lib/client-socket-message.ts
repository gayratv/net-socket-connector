import '../helpers/dotenv-init.js';
import * as net from 'node:net';
import type { ErrorNet, ErrType, MessageToServer } from '../types/net-socket-types.js';
import {
  JobSrvQueuePrintType,
  MESSAGE_SEPARATOR,
  ServerResponce,
  RecievedServerMessages,
  TBaseResultJob,
} from '../types/net-socket-types.js';
import { splitMessages } from '../helpers/socket-helpers.js';
import { ILogger } from '../../logger/logger.interface.js';

// export class SocketMessagingClient<T extends TBaseResultJob> {
export class SocketMessagingClient {
  clientSocket: net.Socket;

  recievedServerMessages: Array<RecievedServerMessages<any>> = [];
  private msgBuffer = '';
  currentQueryIndex = 0;
  /*
   * clientWaitForServerAnswer - максимальное время ожидания клиентом ответа от сервера
   */
  constructor(public name: string, public log: ILogger, public clientWaitForServerAnswer = 20_000) {}
  connect() {
    return new Promise((resolve, reject) => {
      this.clientSocket = net.connect(
        { port: parseInt(process.env.SOCKET_PORT, 10), host: process.env.SOCKET_HOST },
        () => {
          // listener for the 'connect' event once.
          this.log.info(`${this.name} Connected to server!`);
          resolve(true);
        },
      );

      /*
       * клиент получает сообщения от сервера и складывает их в массив
       */
      this.clientSocket.on('data', (data) => {
        const msgArray = splitMessages(this.msgBuffer + data.toString());
        this.msgBuffer = '';

        // Обработка поступившей информации с учетом буфера ранее поступившей информации
        //---->>>>>>>>
        const objArray: Array<any> = [];
        let isRestMsg = false;
        const timestamp = new Date();
        msgArray.forEach((val) => {
          let res: any;
          try {
            res = JSON.parse(val); // преобразуем в объекты
            res.timestamp = timestamp;
            objArray.push(res);
          } catch (e) {
            isRestMsg = true;
          }
        });
        // надо добавить в буфер последний элемент массива - по идее он не преобразовался в json
        const lastMsg = msgArray[msgArray.length - 1];
        // последний символ не краб
        if (isRestMsg && !lastMsg.endsWith(MESSAGE_SEPARATOR)) this.msgBuffer = lastMsg;
        //---->>>>>>>>

        this.recievedServerMessages = this.recievedServerMessages.concat(objArray);
        this.log.info(`  client ${this.name} Received data: `, msgArray);

        // удалим запросы старше CLIENT_WAIT_FOR_SERVER_ANSWER
        const timestampMs = timestamp.getTime();
        this.recievedServerMessages = this.recievedServerMessages.filter(
          (val) => Math.abs(val.timestamp.getTime() - timestampMs) < this.clientWaitForServerAnswer,
        );
      });

      this.clientSocket.on('end', () => {
        this.log.info(`Soket ${this.name} Disconnected from server`);
      });

      this.clientSocket.on('error', (err: ErrorNet) => {
        if (err.code === 'ECONNREFUSED') {
          this.log.info(`ECONNREFUSED can't connect to server`);
          reject(err);
        } else {
          reject(err);
          // throw new Error(err.message);
        }
      });
    });
  }

  sendMsg(s: string) {
    // this.log.info(this.client);
    return new Promise((resolve, reject) => {
      this.clientSocket.write(s + MESSAGE_SEPARATOR, 'utf8', (err?: Error) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  end() {
    this.clientSocket.end();
  }
  resetAndDestroy() {
    this.clientSocket.resetAndDestroy();
  }

  isConnected() {
    return this.clientSocket.writable;
  }

  // получен какой то ответ от сервера
  serverAnswered() {
    return new Promise((resolve) => {
      this.clientSocket.once('data', resolve);
    });
  }

  // ждать ответа определенного типа
  waitForServerAnswer = async <T2>(
    typeParam: string,
    queryIndex: number,
  ): Promise<RecievedServerMessages<T2> | ErrType> => {
    return new Promise(async (resolve, reject) => {
      // проверим пришел ли ответ ожидаемого типа

      // сразу запустим таймер, который прервет любое ожидание
      const timeHandle = setTimeout(() => {
        reject({ err: 'не дождались ответа сервера' });
      }, this.clientWaitForServerAnswer);

      // поскольку мы только что передали запрос - то ответа от сервера в очереди быть еще не может и надо ждать данных
      await this.serverAnswered();

      let ind = -1;
      while (true) {
        ind = this.recievedServerMessages.findIndex((elm) => elm.type === typeParam && queryIndex === elm.queryIndex);
        if (ind === -1) await this.serverAnswered();
        else break;
      }
      // ответ от сервера получен до истечения времени ожидания
      clearTimeout(timeHandle);
      const res = this.recievedServerMessages[ind];
      this.recievedServerMessages.splice(ind, 1);
      return resolve(res as unknown as Promise<RecievedServerMessages<T2> | ErrType>);
    });
  };

  async requestServer<T1>(typePararm: string, payload?: any): Promise<RecievedServerMessages<T1> | ErrType> {
    if (!this.isConnected()) return { err: 'нет соединения с сервером' };

    const curQuery = this.currentQueryIndex++;
    const m: MessageToServer = { type: typePararm, queryIndex: curQuery };
    if (payload) m.payload = payload;
    await this.sendMsg(JSON.stringify(m));
    // ждать ответа сервера
    return await this.waitForServerAnswer(typePararm, curQuery);
  }

  async printServerQueue() {
    const curQuery = this.currentQueryIndex++;
    const m: MessageToServer = { type: JobSrvQueuePrintType, queryIndex: curQuery };
    await this.sendMsg(JSON.stringify(m));
    // ждать ответа сервера
    return await this.waitForServerAnswer(JobSrvQueuePrintType, curQuery);
  }
}
