<template>
  <div class="hello">
    <div>
      <!-- <div v-for="i of users">
        {{ i }}
      </div> -->
    </div>
    <input type="text" placeholder="输入要说的话" v-model="msg">
    <input type="button" value="发送一下" v-on:click="sendmsg">
  </div>
</template>

<script>
import store from '../store';
import { mapState } from 'vuex'

export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "",
    };
  },
  computed: {
    // ...mapState(["users", "chats"])
  },
  methods: {
    sendmsg() {
      window.xx = this
      this.$socket.emit("online_chat", this.msg)
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
