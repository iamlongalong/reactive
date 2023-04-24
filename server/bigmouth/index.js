const { usersCtl, roomsCtl, roomToUserCtl, roomInfosCtl, roomTalksCtl, RoomInfo, Room, User, Talk } = require("./model")

const { Socket } = require("socket.io");

class BigMouthWsHandler {
    constructor() {

    }
    /**
     * @param {Socket} socket 
     */
    registry(socket) {
        socket.on("createUser", (payload) => {
            this.createUser(socket, payload)
        })

        socket.on("updateUser", (payload) => {
            this.updateUser(socket, payload)
        })

        socket.on("deleteUser", (payload) => {
            this.deleteUser(socket, payload)
        })

        socket.on("getUser", (payload) => {
            this.getUser(socket, payload)
        })

        socket.on("createRoom", (payload) => {
            this.createRoom(socket, payload)
        })

        socket.on("getRoom", (payload) => {
            this.getRoom(socket, payload)
        })

        socket.on("updateRoom", (payload) => {
            this.updateRoom(socket, payload)
        })

        socket.on("getRoomInfo", (payload) => {
            this.getRoomInfo(socket, payload)
        })

        socket.on("getRoomsInfoAll", (payload) => {
            this.getRoomsInfoAll(socket, payload)
        })

        socket.on("joinRoom", (payload) => {
            this.joinRoom(socket, payload)

            if (!!payload.roomID) {
                socket.join(payload.roomID)
            }
        })

        socket.on("leaveRoom", (payload) => {
            this.leaveRoom(socket, payload)

            if (!!payload.roomID) {
                socket.leave(payload.roomID)
            }
        })

        socket.on("talk", (payload) => {
            this.talk(socket, payload)
        })

        socket.on("getTalks", (payload) => {
            this.getTalks(socket, payload)
        })
        
    }

    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    createUser(socket, payload) {
        let user = new User(payload)

        user = usersCtl.createUser(user)

        socket.emit("onCreateUser", user.toJson())
    }
    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    updateUser(socket, payload) {
        let user = new User(payload)

        usersCtl.updateUser(user.id, user)

        socket.emit("onUpdateUser", user.toJson())
    }

    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    deleteUser(socket, payload) {
        let user = new User(payload)

        usersCtl.createUser(user)

        socket.emit("onDeleteUser", user.toJson())
    }

    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    getUser(socket, payload) {
        let id = payload.id || ""
        if (!id) {
            return
        }

        let user = usersCtl.getUser(id, (user) => {
            socket.emit("onUserChanged", user.toJson())
        })

        if (!user) {
            return
        }

        socket.emit("onGetUser", user.toJson())
    }

    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    createRoom(socket, payload) {
        let room = new Room(payload)

        room = roomsCtl.createRoom(room)

        socket.emit("onCreateRoom", room.toJson())
    }
    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    updateRoom(socket, payload) {
        let room = new Room(payload)

        room = roomsCtl.updateRoom(room)
        socket.emit("onUpdateRoom", room.toJson())
    }

    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    deleteRoom(socket, payload) {
        let room = new Room(payload)

        roomsCtl.deleteRoom(room)

        socket.emit("onDeleteRoom", room.toJson())
    }

    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    getRoom(socket, payload) {
        let room = new Room(payload)

        if (!room.id) {
            return
        }

        room = roomsCtl.getRoom(room.id, (room) => {
            socket.emit("onRoomChanged", room.toJson())
        })

        if (!room.id) {
            return
        }

        socket.emit("onGetRoom", room.toJson())
    }

    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    getRoomInfo(socket, payload) {
        let roomID = payload.roomID || ""
        if (!roomID) {
            return
        }

        let roominfo = roomInfosCtl.getRoomInfo(roomID, (roominfo) => {
            socket.emit("onRoomInfoChanged", roominfo.toJson())
        })

        socket.emit("onGetRoomInfo", roominfo.toJson())
    }

    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    getRoomsInfoAll(socket, payload) {
        /**
         * @type {Map<string, RoomInfo>}
         */
        let roomInfos

        /**
         * @type {function(Map<string, RoomInfo>)}
         */
        let roomInfosToJson = function (roomInfos) {
            let res = {}
            roomInfos.forEach((v, k) => {
                res[k] = v.toJson()
            })
            return res
        }

        roomInfos = roomInfosCtl.getRoomInfoAll((roomInfos) => {
            roomInfos = roomInfos

            let res = roomInfosToJson(roomInfos)

            socket.emit("onRoomsInfoAllChanged", res)
        })

        let res = roomInfosToJson(roomInfos)

        socket.emit("onGetRoomsInfoAll", res)
    }


    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    joinRoom(socket, payload) {
        let roomID = payload.roomID || ""
        let userID = payload.userID || ""
        if (!roomID || !userID) {
            return
        }

        roomToUserCtl.joinRoom(userID, roomID)

        socket.emit("onJoinRoom", { userID: userID, roomID: roomID })
    }

    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    leaveRoom(socket, payload) {
        let roomID = payload.roomID || ""
        let userID = payload.userID || ""
        if (!roomID || !userID) {
            return
        }

        roomToUserCtl.leaveRoom(userID, roomID)

        socket.emit("onLeaveRoom", { userID: userID, roomID: roomID })
    }

    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    getTalks(socket, payload) {
        let roomid = payload.roomID || ""
        if (!roomid) {
            return
        }

        let talks = roomTalksCtl.getTalks(roomid, (talks) => {
            socket.emit("onTalksChanged", talks.toJson())
        })

        socket.emit("onGetTalks", talks.toJson())
    }


    /**
     * @param {Socket} socket 
     * @param {any} payload 
     */
    talk(socket, payload) {
        let roomid = payload.roomID || ""
        if (!roomid) {
            return
        }

        let talk = new Talk(payload.talk)

        if (!talk.from) {
            return
        }

        roomTalksCtl.talkTo(roomid, talk)

        socket.emit("onTalk", talk.toJson())
    }

}

module.exports = new BigMouthWsHandler()