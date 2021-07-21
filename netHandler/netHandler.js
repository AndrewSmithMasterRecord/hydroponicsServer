const net = require('net');

const CONNECTED = "connected";
const ERROR = "error";
const CONFIG = "config";
const RECONNECT = "reconnect";
const CLOSE = "close";
const DATA_SEND = "data_send";
const DATA_READ = "data_read";


class netHandler {
  constructor(host, port) {
    this.state.connectOptions.host = host;
    this.state.connectOptions.port = port;
  }

  state = {
    status: null,
    timer: null,
    errorSocket: null,
    connectOptions: {
      host: null,
      port: null
    },
    readedData: "",
    socketDataEnable: false,
    deviceOperation: null,
    deviceResolve: null,
    deviceReject: null
  }
  socketOptions = {
    allowHalfOpen: false,
    readable: true,
    writable: true
  };
  /*
  * содержимое очереди
  * sendString - строка для передачи на устройство
  * resolve - колбэк промиса запроса
  * reject - колбэк промиса запроса
  * promise - промис отправки данных на устройство
  *
  * */
  _FIFOqueue = {
    queue: [],
    counter: 0,
    max: 20
  };

  socket = new net.Socket(this.socketOptions);

  _addElement(element) {
    if (this._FIFOqueue.counter == this._FIFOqueue.max)
      return 1;
    this._FIFOqueue.queue.unshift(element);
    this._FIFOqueue.counter++;
    return 0;
  };

  _pop() {
    let element;
    element = this._FIFOqueue.queue.pop(); //удаляем последний элемент из очереди
    this._FIFOqueue.counter--;
    return element;
  }

  _reconnect() {
    if (this.state.status == CONFIG) { //изменились настройки
      if (!this.state.timer)
        this.state.timer = setInterval(() => {
          this.state.status = RECONNECT;
          this.socket.destroy();//уничтожаем текущий сокет
          this.socket.connect(this.state.connectOptions);//переподключаемся
        }, 5000);

    } else if (!this.state.timer) //в других случаях реконект через 40с без разрушения
      this.state.timer = setInterval(() => {
        this.state.status = RECONNECT
        this.socket.connect(this.state.connectOptions);
      }, 40000);
  };

  _dataTransferToDevice = (type, sendString) => {
    if (this.state.status != CONNECTED) //если нет подключения
      return  Promise.reject(new Error(`Socket in status - ${this.state.status}!`));
    let promise;
    switch (type) { //проверяем тип данных
      case DATA_SEND:
        this.state.readedData = ""; //зануляем строку приема
        this.state.socketDataEnable = false;
        this.state.deviceOperation = DATA_SEND;
        this.socket.write(sendString);//отправляем данные в сокет
        promise = new Promise((resolve, reject) => {//создаем промис
          this.state.deviceResolve = resolve;
          this.state.deviceReject = reject;
          setTimeout(() => {//таймаут ошибки ожидания ответа
              reject(new Error("SEND timeout!"));
          }, 1000);
        });
        return promise;
      case DATA_READ:
        this.state.readedData = ""; //зануляем строку приема
          this.state.socketDataEnable = false;
          this.state.deviceOperation = DATA_READ;

        this.socket.write(sendString);//отправляем данные в сокет
        promise = new Promise((resolve, reject) => {
          this.state.deviceResolve = resolve;
          this.state.deviceReject = reject;
          setTimeout(() => {//таймаут ошибки ожидания ответа
              reject(new Error("READ timeout!"));
          }, 1000);

        })
        return promise;
      default:
        return  Promise.reject(new Error("Data can't be send to device!"));
    }
  }

  init = () => {
    this.socket.on("connect", () => { //успешное подключение
      this.state.status = CONNECTED;
      if (this.state.timer) {
        clearInterval(this.state.timer);
      }
    });

    this.socket.on("error", (error) => {//ошибка сокета
      if (this.state.status != CONFIG) {
        //  console.log(`net error: ${error.message}`);
        this.state.status = ERROR;
        this.state.status = error.message;
        this._reconnect();
      }
    });

    this.socket.on("close", () => {//сокет закрылся
      if (this.state.status != "config") {
        //   console.log("net closed")
        this.state.status = CLOSE;
        this._reconnect();
      }
    });
    this.socket.on("data", (data) => {//аккуратненько кладем в стопку принятые данные
      this.state.readedData += data;
      this.state.socketDataEnable = true;
      switch (this.state.deviceOperation) {
        case DATA_READ:
          //Пришла ли ошибка в ответ
          let error = this.state.readedData.match(/Error:.+/);
          if (error) {
            error = String(error);
            error = error.slice(7, error.length);
            this.state.deviceReject(new Error(error));
            return;
          }
          //парсим строку ответа в массив типа [слово число]
          let find = this.state.readedData.match(/\w+?\s-?\d+/g);
          //Ошибка ничего не нашли
          if (!find){
            this.state.deviceReject(new Error("Don't find correct data in answer!"));
            return;
          }

          let result = {};
          let word;
          //Создаем объект из массива строк
          for (let i = 0; i < find.length; i++) {
            word = find[i].match(/\w+/)
            result[word] = Number(find[i].match(/-?\d+/));
          }
          this.state.deviceResolve(result);
          this.state.deviceOperation = null;
          break;
        case DATA_SEND:
          //Пришла ли ошибка в ответ
          let errorSend = this.state.readedData.match(/Error:.+/);
          if (errorSend) {
            errorSend = String(errorSend);
            errorSend = errorSend.slice(7, errorSend.length);
            this.state.deviceReject(new Error(errorSend));
            return;
          }
          //парсим строку ответа в массив типа [слово число]
          let resultSend = this.state.readedData.match(/\w+/);
          this.state.deviceResolve(resultSend);//резолвим промис если все хорошо
          this.state.deviceOperation = null;
          break;
        default: break;

      }
    })

    this.socket.connect(this.state.connectOptions);
    this.socket.setKeepAlive(true, 10000);//keep-alive пакет каждые 10с

    setInterval(() => {
      if (this._FIFOqueue.counter == 0) //если очередь пуста
        return;

      if (this._FIFOqueue.queue[this._FIFOqueue.counter - 1].promise == undefined) {
        this._FIFOqueue.queue[this._FIFOqueue.counter - 1].promise =
            this._dataTransferToDevice(this._FIFOqueue.queue[this._FIFOqueue.counter - 1].dataType,
                this._FIFOqueue.queue[this._FIFOqueue.counter - 1].sendString).then(response => {
              this._FIFOqueue.queue[this._FIFOqueue.counter - 1].resolve(response);
              this._pop();

            }, reject => {
              this._FIFOqueue.queue[this._FIFOqueue.counter - 1].reject(new Error(reject))
              this._pop();
            })
      }
    }, 20);

  };

  newConfig(newHost, newPort) {
    this.state.connectOptions.host = newHost;
    this.state.connectOptions.port = newPort;
    this.state.status = CONFIG;
    this.socket.end();
    this._reconnect();
  };

  readData(device, dataType) {
    if (!device)
      return  Promise.reject(new Error("Don't set device!"));
    if (!dataType)
      return  Promise.reject(new Error("DataType must be set!"));
    ;
    let promise;

    promise = new Promise((resolve, reject) => {

      if (this._addElement({ //толкаем данные в очередь
        sendString: `${device} ${dataType}`,
        resolve: resolve,
        reject: reject,
        dataType: DATA_READ,
      })) { //если очередь уже полная
        reject(new Error("Data don't be send, queue is full!"));
      }
    })
    return promise;

  };

  setData(device, data) {
    if (!data)
      return  Promise.reject(new Error("Data must be set!"));
    if (Object.keys(data).length == 0)
      return Promise.reject(new Error("Data not valid!"));
    ;
    if (!device)
      return  Promise.reject(new Error("Don't set device!"));

    let promise;

    promise = new Promise((resolve, reject) => {

      if (this._addElement({ //толкаем данные в очередь
        sendString: `${device} set ${Object.keys(data)[0]} ${Object.values(data)[0]}`,
        resolve: resolve,
        reject: reject,
        dataType: DATA_SEND,
      })) { //если очередь уже полная
        reject(new Error("Data don't be send, queue is full!"));
      }
    })
    return promise;

  }

}

module.exports = netHandler;