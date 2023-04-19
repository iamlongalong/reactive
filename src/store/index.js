import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    users: {},
    chats: []
  },
  mutations: {
    "online_chat": (state, payload) => {
      console.log("got online chat", payload);
      let chatcontent = {
        from: payload.uid || "",
        to: (payload.data && payload.data.to) || "",
        content: (payload.data && payload.data.content) || ""
      };

      state.chats.push(chatcontent);
    }
  },
  actions: {
    "online_join": ({ state, commit }, e) => {
      console.log("got online join", e);
    }
  }
});
