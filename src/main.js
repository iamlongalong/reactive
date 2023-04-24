// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import OnlineState from './pkgs/online';

import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import scroll from 'vue-seamless-scroll';

Vue.config.productionTip = false;

Vue.use(ViewUI);
Vue.use(scroll);

let wsHost = window.location.origin;

if (process.env["NODE_ENV"] == "development") {
  wsHost = 'http://127.0.0.1:3030';
}

console.log(process.env)

Vue.use(new OnlineState({
  // connection: 'http://172.31.101.178:3030',
  connection: wsHost,
  vuex: {
    store: store,
    actionPrefix: 'online_',
    mutationPrefix: 'online_'
  },
  options: {
    path: "/ws/"
  } //Optional options, see socket.io
}));

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  router,
  mixins: {
    // beforeCreate: () => {
    //   this.$state = state
    // },
  },
  store,
  components: { App },
  template: '<App/>'
});