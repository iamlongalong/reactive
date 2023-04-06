import Mixin from './mixin';
import Listener from './listener';
import Emitter from './emitter';
import SocketIO from 'socket.io-client';

export default class OnlineState {

  /**
   * lets take all resource
   * @param io
   * @param vuex
   * @param options
   */
  constructor({ connection, vuex, options }) {

    this.io = this.connect(connection, options);
    this.emitter = new Emitter(vuex);
    this.listener = new Listener(this.io, this.emitter);

  }

  /**
   * Vue.js entry point
   * @param Vue
   */
  install(Vue) {

    const version = Number(Vue.version.split('.')[0]);

    if (version >= 3) {
      Vue.config.globalProperties.$socket = this.io;
      Vue.config.globalProperties.$onlineState = this;
    } else {
      Vue.prototype.$socket = this.io;
      Vue.prototype.$onlineState = this;
    }

    Vue.mixin(Mixin);

  }


  /**
   * registering SocketIO instance
   * @param connection
   * @param options
   */
  connect(connection, options) {
    if (connection && typeof connection === 'object') {
      return connection;
    } else if (typeof connection === 'string') {

      return this.io = SocketIO(connection, options);
    } else {

      throw new Error('Unsupported connection type');
    }
  }
}
