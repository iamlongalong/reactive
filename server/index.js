const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

const vuex = require("vuex")

const store = vuex.createStore({
    state() {
        return {
            users: {
                "0001": {
                    name: "longalong",
                    age: 18,
                    gender: "male"
                }
            },
            chats: [
                {
                    "from": "0001",
                    "to": "all",
                    "content": "hello world"
                }
            ]
        }
    },
    mutations: {
        chat(state, payload) {
            let chatcontent = {
                from: payload.uid || "",
                to: payload.data?.to || "",
                content: payload.data?.content || ""
            }

            state.chats.push(chatcontent)
        }
    }
})

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io", "http://127.0.0.1:5500"],
        credentials: true
    }
});

const rooms = new Set(["longroom"])

io.on("connection", (socket) => {
    console.log(socket);
    socket.onAny(async (event, payload) => {
        console.log("got ", event);

        // 默认加入 longroom
        socket.join("longroom")

        if (event === "chat") {
            console.log("got a chat mutation : ", payload);

            store.commit("chat", payload)

            setInterval(() => {
                let ok = io.to("longroom").emit("chat", payload)
                console.log("to longroom ok ?", ok);
            }, 1000)
        }
    })
})

// 添加 admin
instrument(io, {
    auth: {
        type: "basic",
        username: "long",
        password: "$2a$10$NamQAXrQDlnLUYZx6shEAOwV8zv2aYhrjrK6eC9gqSFz3g4tq/6GK"
    },
    mode: "development",
});

console.log("server running at http://127.0.0.1:3030");
httpServer.listen(3030);


// 创建密码 require("bcryptjs").hashSync("xxxx", 10)
// 验证密码 require("bcryptjs").compareSync("xxxx", "xxxxxxxx")
