<template>
  <Layout>
    <Header style="color: #eee; font-weight: 600;">
      <h2>
        我就是个简单的聊天工具
      </h2>
    </Header>

    <Layout style="height: 90%;">
      <Sider width="300">
        <Row style="margin: 0 10px 20px 10px;">
          <Card :bordered="true">
            <p slot="title">
              <Icon type="ios-person" />用户信息
            </p>
            <div>
              <Input v-model="inputs.user.name" placeholder="请输入昵称..." />
              <Input v-model="inputs.user.email" placeholder="请输入email..." />
              <Input v-model="inputs.user.desc" placeholder="请输入个人介绍..." />
              <Input v-model="inputs.user.avatar" placeholder="头像地址..." />
              <div style="margin: 10px 0 0 0;">
                <Button v-if="!user.id" type="info" @click="createUser">创建用户</Button>
                <Button v-if="!!user.id" type="info" @click="updateUser">修改用户</Button>
              </div>
            </div>
          </Card>
        </Row>
        <br>
        <br>
        <Row style="margin: 0 10px 20px 10px;">
          <Card :bordered="true">
            <p slot="title">
              <Icon type="ios-home" />房间信息
            </p>
            <div>
              <Input v-model="inputs.room.name" @on-blur="updateRoom" placeholder="请输入房间名称..." />
              <Input v-model="inputs.room.desc" @on-blur="updateRoom" placeholder="请输入房间介绍..." />
              <Input v-model="inputs.room.cover" @on-blur="updateRoom" placeholder="请输入封面地址..." />

              <div style="margin: 10px 0 10px 0;">
                <Button v-if="!currentRoomID" type="info" @click="createRoom">创建房间</Button>
                <!-- <Button v-if="!!currentRoomID" type="info" @click="updateRoom">修改房间</Button> -->
                <Button v-if="!!currentRoomID" type="info" @click="leaveRoom">退出房间</Button>
              </div>

              <div v-if="!!currentRoom">
                <Row>
                  <Col span="6" style="text-align: left;">人数:</Col>
                  <Col>{{ currentRoom.userCount || 0 }}</Col>
                </Row>

                <Row v-if="roomHasUser(currentRoom.users)">
                  <Col span="6" style="text-align: left; line-height: 36px;">成员:</Col>
                  <Col>
                  <Tooltip placement="top-start" v-for="(user) in currentRoom.users" v-bind:key="user.id">
                    <Avatar v-if="!!user.avatar" :src="user.avatar" />
                    <Avatar v-else-if="!!user.name" style="color: #f56a00;background-color: #fde3cf">{{
                      user.name[0].toUpperCase() }}</Avatar>
                    <Avatar v-else style="background-color: #87d068" icon="ios-person" />

                    <div slot="content">
                      <p v-if="user.name">{{ user.name }} <span v-if="user.email"> | {{ user.email }}</span></p>
                      <p v-if="user.desc">{{ user.desc }}</p>
                    </div>
                  </Tooltip>
                  </Col>
                </Row>
              </div>

            </div>

          </Card>
        </Row>

      </Sider>


      <Layout>
        <Content :style="{ padding: '24px 0', minHeight: '280px', background: '#eee' }">

          <div style="display: none;">
            <div>
              {{ userid }}
              <input type="text" placeholder="要修改的key" v-model="userkey">
              <input type="text" placeholder="要修改的值" v-model="userval">
            </div>

            user: <div>
              {{ userView.user }}
            </div>
            <br>
            <br>
            <div>
              <div v-for="team in userView.teams" v-bind:key="team.id">
                <div>
                  <div>
                    teamName: {{ team.name }}
                    <br>
                    teamDesc: {{ team.desc }}
                    <br>
                    icon: {{ team.icon }}
                  </div>

                  <br>

                  <div>
                    members:
                    <div>
                      <div v-for="member in team.members" v-bind:key="member.id">
                        <div>
                          name: {{ member.name }}
                          <br>
                          avatar: {{ member.avatar }}
                          <br>
                          email: {{ member.email }}
                          <br>
                          occupation: {{ member.occupation }}
                          <br>
                          role: {{ member.role }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <br>

                  <div>
                    projects:
                    <div>
                      <div v-for="project in team.projects" v-bind:key="project.id">
                        <div>
                          name: {{ project.name }}

                          <div>
                            documents:
                            <div v-for="document in project.documents" v-bind:key="document.id">
                              <div>
                                name: {{ document.name }}
                                <br>
                                updated_at: {{ document.updated_at }}
                                <br>
                                cover: {{ document.cover }}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <input type="button" value="手动获取一下" v-on:click="manualGet">
            <div>
              <br />
            </div>
            <input type="button" value="改一下user" v-on:click="updateUser">
          </div>

          <div v-if="showCreateUser">
            <Row>
              <Col span="4">
              </Col>
              <Col span="16">
              <Card :bordered="false">
                <p slot="title">先创建个账号~</p>
                <p style="padding: 24px 0;">要进入聊天室，得创建个账号，不然谁知道是谁说的话呢~
                </p>
              </Card>
              </Col>
              <Col span="4">
              </Col>
            </Row>
          </div>

          <div v-else style="width: 100%; height: 100%; position: relative;">
            <div v-if="!currentRoomID">
              <Row>
                <Col span="16" offset="4">
                <Card :bordered="false">
                  <p slot="title">你还没加入聊天室~</p>
                  <p style="padding: 24px 0;">宠幸一个聊天室吧，看看大家都在聊啥~</p>
                </Card>
                </Col>
                <Col span="4">
                </Col>
              </Row>
            </div>

            <!-- 房间内聊天信息 -->
            <div v-if="!!currentRoomID"
              style="position: absolute; display: flex; flex-direction: column; height: 95%; width: 85%;">
              <Row style="width: 100%; justify-content: center; align-items: center;">
                <h2>{{ currentRoom.name }}</h2>
              </Row>

              <div id="talks-content"
                style="margin: 20px 0 15px 0; height: 85%; overflow-y: auto; display: flex; flex-direction: column; flex: 1;">
                <Row>

                  <!-- <vue-seamless-scroll :data="roomTalks.talks" :classOption="{autoPlay: false}"> -->
                  <div style="width: 100%;" v-for="talk in roomTalks.talks" v-bind:key="talk.id">
                    <Row style="width: 100%;">
                      <Col offset="4">
                      <Tooltip placement="top-start">
                        <Avatar shape="square" v-if="!!getLocalUserInfo(talk.from).avatar"
                          :src="getLocalUserInfo(talk.from).avatar" />
                        <Avatar shape="square" v-else-if="!!getLocalUserInfo(talk.from).name"
                          style="color: #f56a00;background-color: #fde3cf">{{
                            getLocalUserInfo(talk.from).name.length > 5 ?
                            getLocalUserInfo(talk.from).name[0].toUpperCase() :
                            getLocalUserInfo(talk.from).name }}</Avatar>
                        <Avatar shape="square" v-else style="background-color: #87d068" icon="ios-person" />

                        <div slot="content">
                          <p v-if="getLocalUserInfo(talk.from).name">{{ getLocalUserInfo(talk.from).name }} <span
                              v-if="getLocalUserInfo(talk.from).email"> | {{ getLocalUserInfo(talk.from).email }}</span>
                          </p>
                          <p v-if="getLocalUserInfo(talk.from).desc">{{ getLocalUserInfo(talk.from).desc }}</p>
                        </div>
                      </Tooltip>

                      </Col>
                      <Col style="max-width: 60%; margin: 0 0 5px 10px;">
                      <Card>
                        <div style="max-height: 100px; margin: 0 10px 5px 10px; text-align: left; overflow-y: auto;">
                          {{ talk.content }}
                        </div>
                      </Card>
                      </Col>

                    </Row>
                  </div>
                  <!-- </vue-seamless-scroll> -->

                  <!-- <div id="talks-bottom"></div> -->
                </Row>
              </div>

              <!-- <div style="position: fixed; bottom: 10%; width: 80%;"> -->
              <div style="width: 100%;">
                <Row>
                  <Col span="10" offset="4">
                  <Input size="large" v-model="inputs.msgbox.content" @keyup.enter.native="talkToRoom(currentRoomID)"
                    placeholder="说点什么..." />
                  </Col>
                  <Col span="6">
                  <Button size="large" type="info" @click="talkToRoom(currentRoomID)">发送消息</Button>
                  </Col>

                </Row>
              </div>

            </div>

            <div v-if="!currentRoomID">
              <Row v-if="!hasRoom(roomsInfo)" style="background:#eee; padding: 30px 0;">
                <Col span="16" offset="4">
                <Card shadow>
                  当前还没有房间，快去创建第一个吧~
                </Card>
                </Col>
              </Row>

              <Row v-else style="background:#eee; padding: 30px 0;">
                <Col offset="4" span="16">
                <Row>
                  <Col v-for="room in roomsInfo" v-bind:key="room.id" style="display: flex; margin: 0 20px 30px 0;">
                  <Card shadow style="width: 300px;">
                    <p slot="title">{{ room.name }}</p>
                    <div style="display: flex; height: 435px; flex-direction: column;">

                      <div style="display: flex; flex-direction: column; flex: 1; height: 85%;">
                        <Card>
                          <div style="text-align: center">
                            <div style="width: 233px; height: 233px; margin-bottom: 10px; overflow-y: hidden;">
                              <img width="100%" :src="room.cover || 'https://static.longalong.cn/tmpimg/beijing004.png'">
                            </div>

                            <p style="max-height: 60px; overflow-y: auto;">{{ room.desc || "房主很懒,什么都没留下" }}</p>
                          </div>
                        </Card>
                      </div>

                      <div style="padding: 0 0 0 0;">
                        <Row>
                          <Col span="4" offset="1" style="text-align: left;">人数:</Col>
                          <Col>{{ room.userCount || 0 }}</Col>
                        </Row>

                        <Row v-if="roomHasUser(room.users)">
                          <Col span="4" offset="1" style="text-align: left; line-height: 24px;">成员:</Col>
                          <Col>
                          <Tooltip placement="top-start" v-for="(user) in room.users" v-bind:key="user.id">
                            <Avatar size="small" v-if="!!user.avatar" :src="user.avatar" />
                            <Avatar size="small" v-else-if="!!user.name" style="color: #f56a00;background-color: #fde3cf">
                              {{
                                user.name[0].toUpperCase() }}</Avatar>
                            <Avatar size="small" v-else style="background-color: #87d068" icon="ios-person" />

                            <div slot="content">
                              <p v-if="user.name">{{ user.name }} <span v-if="user.email"> | {{ user.email }}</span></p>
                              <p v-if="user.desc">{{ user.desc }}</p>
                            </div>
                          </Tooltip>
                          </Col>
                        </Row>

                        <div style="margin-top: 10px;">
                          <Button type="primary" @click="joinRoom(room.id)">加入房间</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                  </Col>
                </Row>
                </Col>
              </Row>
            </div>

          </div>

        </Content>

      </Layout>
    </Layout>
  </Layout>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "",
      userkey: "desc",
      userval: "hello world",
      userid: "1001",
      userView: {},

      inputs: {
        user: { name: "", email: "", desc: "", avatar: "" },
        room: { name: "", desc: "", cover: "" },
        msgbox: { content: "", tos: [] }
      },
      waittingForGetUserID: "",

      user: {},
      currentRoomID: "",
      roomsInfo: {},
      roomTalks: {},
      isToBottom: true,
    };
  },
  beforeMount() {

    window.ss = this.$socket;
    // this.$onlineState.emitter.addListener("indexViewChanged", (data) => {
    //   console.log("get index changed data", data);
    //   this.userView = data;
    // });

    // this.createMockData()
    this.getRoomInfos();

    this.$onlineState.emitter.addListener("indexViewChanged", (data) => {
      console.log("get index changed data", data);
      this.userView = data;
    });

    this.$onlineState.emitter.addListener("indexViewChanged", (data) => {
      console.log("get index changed data", data);
      this.userView = data;
    });


    // 创建 user 回调
    this.$onlineState.emitter.addListener("onCreateUser", user => {
      console.log("create user ok ", user);
      this.user = user;
      this.updateUserInputs();

      this.saveUserToLocal();
    });

    // 获取 user 回调
    this.$onlineState.emitter.addListener("onGetUser", user => {
      console.log("get user ok ", user);
      if (user.id == this.waittingForGetUserID) {
        this.user = user;
        this.updateUserInputs();

        this.waittingForGetUserID = "";
      }

    });


    // 修改 user 回调
    this.$onlineState.emitter.addListener("onUpdateUser", user => {
      console.log("update user ok ", user);
      this.user = user;
      this.updateUserInputs();
    });

    // 创建 room 回调
    this.$onlineState.emitter.addListener("onCreateRoom", room => {
      console.log("create room ok ", room);
    });

    // 修改 room 回调
    this.$onlineState.emitter.addListener("onUpdateRoom", room => {
      console.log("update room ok ", room);
    });

    this.$onlineState.emitter.addListener("onJoinRoom", ({ roomID }) => {
      this.currentRoomID = roomID;

      this.getRoomTalks(roomID);
    });

    this.$onlineState.emitter.addListener("onLeaveRoom", ({ roomID }) => {
      this.currentRoomID = "";
    });

    this.$onlineState.emitter.addListener("onGetRoomsInfoAll", roomsInfo => {
      console.log("get rooms info ", roomsInfo);
      this.roomsInfo = roomsInfo;
    });

    this.$onlineState.emitter.addListener("onRoomsInfoAllChanged", (roomsInfo) => {
      console.log("on rooms info changed ", roomsInfo);
      this.roomsInfo = roomsInfo;
    });

    this.$onlineState.emitter.addListener("onGetTalks", (talks) => {
      console.log("on get talks ", talks);
      this.roomTalks = talks;
    });

    this.$onlineState.emitter.addListener("onTalksChanged", (talks) => {
      console.log("on talks changed ", talks);
      this.roomTalks = talks;
    });

    this.getUserFromLocal();

  },
  beforeDestroy() { },
  watch: {
    "roomTalks.talks"() {
      if (this.isToBottom) {
        console.log("should go to bottom");
        this.scrollToBottom();
      }
    },
    currentRoomID(n, o) {
      if (!!n) {
        let newRoom = this.roomsInfo[n];
        this.inputs.room = {
          name: newRoom.name,
          desc: newRoom.desc,
          cover: newRoom.cover,
        };
      } else {
        this.inputs.room = {
          name: "",
          desc: "",
          cover: "",
        };
      }
    }
  },
  computed: {
    ...mapState(["users", "chats"]),
    currentRoom() {
      return this.roomsInfo[this.currentRoomID];
    },
    showCreateUser() {
      if (!this.user.id) {
        return true;
      }
      return false;
    },
    knowUsers() {
      let users = {};
      Object.keys(this.roomsInfo).forEach(roomid => {
        let roomInfo = this.roomsInfo[roomid];

        Object.keys(roomInfo.users).forEach(userid => {
          users[userid] = {
            name: roomInfo.users[userid].name,
            email: roomInfo.users[userid].email,
            avatar: roomInfo.users[userid].avatar,
            desc: roomInfo.users[userid].desc,
          };
        });
      });

      return users;
    },
  },
  methods: {
    scrollToBottom() {
      let bottomEle = document.getElementById("talks-content");

      this.$nextTick(() => {
        bottomEle.scrollTop = bottomEle.scrollHeight;
      });
    },
    getLocalUserInfo(uid) {
      let user = this.knowUsers[uid];
      if (user) {
        return user;
      }

      return { name: "佚名", avatar: "", desc: "I am nobody", email: "unknow@unknow.cn" };
    },
    talkToRoom(roomid) {
      if (this.inputs.msgbox.content) {
        this.$socket.emit("talk", { roomID: roomid, talk: { tos: this.inputs.msgbox.tos, from: this.user.id, content: this.inputs.msgbox.content } });
        this.inputs.msgbox.content = "";
        this.inputs.msgbox.tos = [];
      } else {
        this.$Message.info('请先输入点什么~~');
      }
    },
    updateUserInputs() {
      if (this.user.id) {
        this.inputs.user = {
          name: this.user.name,
          email: this.user.email,
          desc: this.user.desc,
          avatar: this.user.avatar
        };
      } else {
        this.inputs.user = {
          name: "",
          email: "",
          desc: "",
          avatar: ""
        };
      }
    },
    saveUserToLocal() {
      if (this.user.id) {
        let url = new URL(window.location.href);
        let sessionKey = url.searchParams.get("sessionkey") || "_chatuser";

        window.localStorage.setItem(sessionKey, JSON.stringify(this.user));
      }
    },
    getUserFromLocal() {
      let url = new URL(window.location.href);
      let sessionKey = url.searchParams.get("sessionkey") || "_chatuser";

      let userStr = window.localStorage.getItem(sessionKey);
      if (!!userStr) {
        let user = JSON.parse(userStr);

        this.waittingForGetUserID = user.id;
        this.$socket.emit("getUser", user);
      }

    },
    createRoom() {
      this.$socket.emit("createRoom", this.inputs.room);
    },
    updateRoom() {
      if (!!this.currentRoomID) {
        this.$socket.emit("updateRoom", Object.assign({ id: this.currentRoomID }, this.inputs.room));
      }
    },
    hasRoom(rooms) {
      return Object.keys(rooms).length > 0;
    },
    roomHasUser(users) {
      return Object.keys(users).length > 0;
    },
    joinRoom(id) {
      if (!!this.currentRoomID) {
        this.leaveRoom(id);
      }

      this.$socket.emit("joinRoom", { roomID: id, userID: this.user.id });
    },
    getRoomTalks(id) {
      this.$socket.emit("getTalks", { roomID: id, userID: this.user.id });
    },
    leaveRoom(id) {
      this.$socket.emit("leaveRoom", { roomID: this.currentRoomID, userID: this.user.id });
    },
    createUser() {
      if (!this.inputs.user.name) {
        alert("user name 必须要有啊 ~~");
      }

      this.$socket.emit("createUser", this.inputs.user);
    },
    updateUser() {
      this.$socket.emit("updateUser", Object.assign({}, this.user, this.inputs.user));
    },
    getRoomInfos() {
      this.$socket.emit("getRoomsInfoAll", {});
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
    },
    createMockData() {
      let room01 = { name: "room_001", desc: "this is room 001", cover: "http://xx.xx.com/img/xx.jpg" };
      let room02 = { name: "room_002", desc: "this is room 002", cover: "http://xx.xx.com/img/xx.jpg" };

      this.$socket.emit("createRoom", room01);
      this.$socket.emit("createRoom", room02);
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

/*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar {
  width: 4px;
  background-color: #f5f5f5;
}

/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 3px rgba(230, 230, 230, 0.3);
  -webkit-box-shadow: inset 0 0 6px rgba(191, 191, 191, 0.3);
  border-radius: 5px;
  background-color: #f5f5f5;
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 5px;
  box-shadow: inset 0 0 6px rgba(200, 200, 200, 0.1);
  -webkit-box-shadow: inset 0 0 6px rgba(143, 141, 141, 0.1);
  background-color: #c8c8c8;
}
</style>
