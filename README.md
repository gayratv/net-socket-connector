# client - server communication using net socket

## Предназначение

Пакет предназначен для построения высоконагруженного микросервиса управления ресурсами. Связь клиент-сервер построена на модуле net socket с протоколом TCP/IP.

## Описание

Микросервис построен в предположении, что идёт большой параллельный поток запросов какого либо ресурса у сервера от многих клиентов.

Сервер складывает поступившие запросы в очередь и сообщает Worker что необходимо начать обработку запросов.

Клиент может запрашивать какой-либо ресурс, например билеты в кинотеатр переговорные комнаты, прокси-сервера и т.д.

Для подобного рода запросов создаётся пул ресурсов который может как пополняться, так и освобождаться.  Из этого пула ресурсов микросервис выдаёт по запросу один или несколько ресурсов.

Например, у вас есть некие заранее выделенные прокси-сервера и Вы должны выдать первый свободный прокси сервер.

Чтобы не создавать проблемы с возможной взаимной блокировкой ресурсов все запросы обрабатываются одним Worker, который координирует работу jobber.

Каждый запрос характеризуется своим типом. Например, один тип запроса - это выдать прокси сервер второй тип запроса - освободить прокси сервер. Третий запрос может бронировать переговорные комнаты.

Поскольку предполагается большой параллельный поток запросов к микросервису, то возникает вполне естественный вопрос по коммуникации между клиентом и сервером.
С одной стороны для данной задачи вполне подходит стандартная коммуникация через rest api.  Но она достаточно затратна по ресурсам.

Поэтому было принято решение использовать net socket. У net socket  есть несколько важных преимуществ:
- использование протокола tcp
- возможность бинарной передачи контента (в настоящий момент я эту возможность не использую - пользуюсь стандарнтым JSON)
- быстрая связь между клиентом и  сервером

Установка
```shell
npm install --save resource-manager
```

### Общие замечания

Для использования пакета вам нужно создать один экземпляр сервера, который будет принимать запросы от клиентов. Также необходим один экземпляр Worker. У Worker необходимо зарегистрировать необходимое количество jober (по одному для каждого типа запроса)

Worker получает уведомления от сервера о том что имеются запросы от клиентов.
Worker анализирует типы запросов и запускает необходимые джоберы.

Один джобер обрабатывает один тип запроса.

Для разных типов запросов worker может запускать параллельно несколько джоберов по одному джоберу на каждый тип запроса.

То есть Вы можете продавать билеты в кинотеатр и одновременно раздавать прокси-сервера.


### Инициализация сервера

Сейчас сервер выдает отладочные сообщения с временными метками. Для активации меток необходимо использовать команду 
```console.time('SRV1');```

Инициализация сервера:

```
const serverTest = new ServerSocket('SRV1');
serverTest.createServer();
```

Инициализация Worker - координатора
```const w = new WorkerForServer(serverTest);```

Зарегистрируйте необходимое количество jobber для каждого типа запроса
```js
let counter = 0;
const workTestJob1: Executor<{ type: string; cnt: number }> = async (
  demand: GetNextClientJob,
): Promise<{ type: string; cnt: number }> => {
  await delay(2_000);
  return { type: 'cntResponse', cnt: counter++ };
};

const testJobWorker: JobWorker<{ type: string; cnt: number }> = {
  type: 'cntResponse',
  executor: workTestJob1,
};

w.registerNewWorker(testJobWorker);
```

Обратите внимаение - что jober  должен возвращать объект с обязательным   полем type, которое должно в точности соответствовать типу обрабабатываемого им запроса, например 

```{ type: 'cntResponse', cnt: counter++ };```

В примере используется команда ```serverTest.startQueTimer();``` которая выводит текущую длину очереди сообщений, хранящихся на сервере. Данная команда не обязательна.

## Инициализация клиента

```js
const s = new SocketMessaging('s1');
await s.connect();
```
Информация для соединения с сервером берется из файла .env

```dotenv
SOCKET_PORT=41969
SOCKET_HOST=localhost
```

вместо localhost необходимо указать IP сервера на котором работает server

Для запуска диагностических сообщений необходимо дать команду ```console.time(CLIENT_LOG_TIME_LABEL);```

Наиболее удобный способ запросить сервер и получить ответ - метод ```const res = await s.requestServer('cntResponse');```

Послать запрос к серверу также можно с помощью метода ```await s.sendMsg(JSON.stringify({ type: 'getip', queryIndex: 1, payload: 0 }));```