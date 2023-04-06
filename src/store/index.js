import Vuex from 'vuex';

const store = new Vuex.Store({
  state: {
    users: {},
    chats: []
  },
  mutations: {
    "online_chat": (args) => {
      console.log("got online chat", args);
    }
  },
  actions: {
    "online_join": (args) => {
      console.log("got online join", args);
    }
  }
});

export default store;