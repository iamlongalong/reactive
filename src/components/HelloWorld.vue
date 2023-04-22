<template>
  <div class="hello">
    <div>
      {{ userid }}
    </div>
    <div>
      {{ chats }}
    </div>
    <input type="text" placeholder="输入要说的话" v-model="msg">
    <input type="button" value="发送一下" v-on:click="sendmsg">
    <div>
      {{ userView }}
    </div>
    <input type="button" value="连接一下" v-on:click="connect">
    <input type="button" value="手动获取一下" v-on:click="manualGet">

  </div>
</template>

<script>
import { mapState } from 'vuex';
import SocketIO from 'socket.io-client';

export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "",
      userid: "1001",
      userView: {},
      io: {},
    };
  },
  beforeDestroy() {
    this.$socket.disconnect();
  },
  computed: {
    ...mapState(["users", "chats"])
  },
  methods: {
    sendmsg() {
      window.xx = this;
      this.$socket.emit("chat", this.msg);
    },
    connect() {
      let io = SocketIO("http://127.0.0.1:3030");
      this.io = io;

      console.log(this.io)

      this.io.onevent( (data) => {
        console.log("get index changed data", data);
        this.userView = data;
      });
    },
    manualGet() {

      this.$socket.emit("watchIndexView", { uid: this.userid });


      // window.xxx = this.$socket;
      // this.$socket.onAny((...args) => {
      //   console.log("get any : ", ...args);
      // });
      // this.$socket.on("indexViewChanged", (data) => {
      //   console.log("get index changed data", data);
      //   this.userView = data;
      // });

      // this.$socket.emit("watchIndexView", { uid: this.userid });
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
