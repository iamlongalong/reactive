// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import OnlineState from './pkgs/online'

Vue.config.productionTip = false;

Vue.use(new OnlineState({
  connection: 'http://127.0.0.1:3030',
  vuex: {
    store: store,
    actionPrefix: 'online_',
    mutationPrefix: 'online_'
  },
  options: {} //Optional options, see socket.io
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