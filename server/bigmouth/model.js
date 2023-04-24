let EventEmitter = require("events");

class BaseReactive extends Object {
    #emitter;
    constructor() {
        super();

        this.#emitter = new EventEmitter();
    }

    /**
     * watch key
     * @param {string} key The key of the element to add to this YMap
     * @param {function(args ...any)} f function when things changed
     */
    watch(key, f) {
        this.#emitter.on(key, f);
    }

    /**
     * unwatch key
     * @param {string} key The key of the element to add to this YMap
     * @param {function(args ...any)} f function when things changed
     */
    unwatch(key, f) {
        this.#emitter.off(key, f);
    }

    /**
     * update key value
    //  * @param {REvent} event event detail of change
     * @param {string} key The key of the element to add to this YMap
     * @param {any} v value
     */
    update(key, v) {
        // update(key, event, v) {
        // let le = getLastEvent(this.#events);
        // if (!!le && le.version >= event.version) {
        //     return;
        // }

        // this.#events.push(event);
        this.#emitter.emit(key, v);
        return;
    }
}



class User {
    /**
     * @param {string} id user id.
     * @param {Object<string,any>} m normal object.
     */
    constructor(m) {
        this.id = m.id || "";
        this.name = m.name || "";
        this.email = m.email || "";
        this.desc = m.desc || "";
        this.avatar = m.avatar || "";
    }

    /**
     * @returns {Object<string,any>}.
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            email: this.email,
            desc: this.desc,
            avatar: this.avatar,
        };

        return res;
    }

}

class UsersController extends BaseReactive {
    constructor() {
        super();

        /**
         * @type {Map<string,User>}
         * @private
         */
        this.members = new Map();

        this.idgen = () => Math.floor(Math.random() * 1000000 + 2000000).toString(10)
    }

    /**
     * get user and listen
     * @param {string} id user id.
     * @param {function(User)} f function when user updated.
     * @returns {User} user.
     */
    getUser(id, f) {
        let user = this.members.get(id);
        if (!!f) {
            this.watch(id, f);
        }

        return user;
    }

    /**
     * get user and listen
     * @param {User} user user id.
     * @returns {User} user.
     */
    createUser(user) {
        user.id = this.idgen()

        this.members.set(user.id, user)
        return user
    }

    /**
     * get user and listen
     * @param {User} user user id.
     */
    deleteUser(user) {
        this.members.delete(user.id)
    }

    /**
     * @param {string} id user id.
     * @param {User} user when .
     */
    updateUser(id, user) {
        this.members.set(id, user);

        this.update(id, user);
    }
}


class Room {
    /**
     * @param {string} id user id.
     * @param {Object<string,any>} m normal object.
     */
    constructor(m) {
        this.id = m.id || "";
        this.name = m.name || "";
        this.desc = m.desc || "";
        this.cover = m.cover || "";
    }

    /**
     * @returns {Object<string,any>}.
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            desc: this.desc,
            cover: this.cover,
        };

        return res;
    }

}

class RoomsController extends BaseReactive {
    constructor() {
        super();

        /**
         * @type {Map<string, Room>}
         */
        this.roomsMap = new Map();

        this.idgen = () => Math.floor(Math.random() * 1000000 + 1000000).toString(10)
    }

    /**
     * 获取某 room 的信息
     * @param {string} roomid room id.
     * @param {function(Room)} f update func.
     * @returns {Set<string} users id.
     */
    getRoom(roomid, f) {
        let room = this.roomsMap.get(roomid) || {};

        this.watch(roomid, f);

        return room;
    }

    /**
     * @returns {Set<string>}
     */
    getRoomList() {
        let rooms = new Set(this.roomsMap.keys())


        return rooms
    }

    /**
     * @param {function(Room)} addfunc
     * @param {function(Room)} delfunc
     * @param {function(Room)} updatefunc
     */
    watchRoom(addfunc, delfunc, updatefunc) {
        if (!!addfunc) {
            this.watch("_room_add", addfunc)
        }

        if (!!delfunc) {
            this.watch("_room_del", delfunc)
        }

        if (!!updatefunc) {
            this.watch("_room_update", updatefunc)
        }
    }

    /**
     * 创建 room
     * @param {Room} room update func.
     * @returns {Room} room created.
     */
    createRoom(room) {
        room.id = this.idgen()

        this.roomsMap.set(room.id, room)

        this.dispatchRoomAdd(room)

        return room;
    }

    /**
     * room add callback
     * @param {Room} room update func.
     */
    dispatchRoomAdd(room) {
        this.update("_room_add", room)
    }

    /**
     * room del callback
     * @param {Room} room update func.
     */
    dispatchRoomDel(room) {
        this.update("_room_del", room)
    }

    /**
     * 修改 room
     * @param {Room} room update func.
     * @returns {Room} room created.
     */
    updateRoom(room) {
        this.roomsMap.set(room.id, room)

        this.dispatch(room.id, room)

        return room;
    }

    /**
     * 删除 room
     * @param {Room} room update func.
     */
    deleteRoom(room) {
        this.roomsMap.delete(room.id)

        this.dispatchRoomListChanged()
        this.dispatch(room.id, null)
    }

    /**
     * @param {string} roomid room id.
     * @param {Room} room users id.
     */
    dispatch(roomid, room) {
        this.update(roomid, room);
        this.update("_room_update", room)
    }
}


class RoomToUsersController extends BaseReactive {
    constructor() {
        super();

        /**
         * @type {Map<string, Set<string>>}
         */
        this.roomUsersMap = new Map();
    }
    /**
     * 获取某 room 对应的 user ids
     * @param {string} roomid room id.
     * @param {funciton(Set<string>)} f update func.
     * @returns {Set<string>} users id.
     */
    getRoomUserIDs(roomid, f) {
        let uset = this.roomUsersMap.get(roomid) || [];

        let uids = [];
        uset.forEach(uid => {
            uids.push(uid);
        });

        this.watch(roomid, f);

        return uids;
    }

    /**
     * 加入一个房间
     * @param {string} uid user id.
     * @param {string} roomid room id.
     */
    joinRoom(uid, roomid) {
        let uset = this.roomUsersMap.get(roomid)
        if (!uset) {
            /**
             * @type {Set<string>}
             */
            uset = new Set()
            this.roomUsersMap.set(roomid, uset)
        }

        uset.add(uid)

        this.dispatch(roomid, uset)
    }


    /**
     * 离开一个房间
     * @param {string} uid user id.
     * @param {string} roomid room id.
     */
    leaveRoom(uid, roomid) {
        let uset = this.roomUsersMap.get(roomid)
        if (!uset) {
            /**
             * @type {Set<string>}
             */
            uset = new Set()
            this.roomUsersMap.set(roomid, uset)
            return
        }

        uset.delete(uid)

        this.dispatch(roomid, uset)
    }

    /**
     * @param {string} roomid room id.
     * @param {Set<string>} uset users id.
     */
    dispatch(roomid, uset) {
        this.update(roomid, uset);
    }
}

class RoomInfo {
    #roomCtl
    #userCtl
    #roomUsersCtl

    /**
     * @param {string} id room id
     * @param {RoomsController} roomCtl roomCtl
     * @param {UsersController} userCtl userCtl
     * @param {RoomToUsersController} roomUsersCtl roomUsersCtl
     * @param {function(RoomInfo)} f
     */
    constructor(id, roomCtl, userCtl, roomUsersCtl, f) {
        this.#roomCtl = roomCtl
        this.#userCtl = userCtl
        this.#roomUsersCtl = roomUsersCtl

        /**
         * @type {Map<string, User>}
         */
        this.users = new Map()

        let room = roomCtl.getRoom(id, room => this.updateRoom(room))

        this.id = id
        this.name = room.name
        this.desc = room.desc
        this.cover = room.cover

        this.userCount = 0


        let userIDs = roomUsersCtl.getRoomUserIDs(id, (userIDs) => this.updateUserIDs(userIDs))

        userIDs.forEach(uid => {
            let user = userCtl.getUser(uid, user => this.updateUser(user))

            this.users.set(user.id, user)
        })

        this.userCount = userIDs.size

        this.f = f
    }

    /**
     * @param {User} user user
     */
    updateUser(user) {
        this.users.set(user.id, user)

        this.dispatch()
    }


    /**
     * @param {Set<string>} userIds user ids
     */
    updateUserIDs(userIds) {
        this.users.forEach((user, uid) => {
            if (userIds.has(uid)) {
                return
            }

            // 被删掉了
            this.users.delete(uid)

            this.#userCtl.unwatch(uid, users => this.updateUser(users)) // 这里的实现是有问题的，要拿一个全局 func 引用
        })

        userIds.forEach(uid => {
            if (this.users.has(uid)) {
                return
            }

            let user = this.#userCtl.getUser(uid, users => this.updateUser(users))
            this.users.set(uid, user)
        })

        this.userCount = userIds.size

        this.dispatch()
    }

    /**
     * @param {Room} room 
     */
    updateRoom(room) {
        this.cover = room.cover
        this.desc = room.desc
        this.cover = room.cover
        this.name = room.name

        this.dispatch()
    }

    destroy() {
        this.#roomCtl.unwatch(this.id, room => this.updateRoom(room)) // 这里的实现有问题
        this.#roomUsersCtl.unwatch(this.id, uids => this.updateUserIDs(uids))

        this.users.forEach((user, uid) => {
            this.#userCtl.unwatch(uid, user => this.updateUser(user))
        })
    }

    dispatch() {
        this.f(this)
    }

    /**
     * @returns {Object<string, any>}
     */
    toJson() {
        let users = {}
        this.users.forEach(user => {
            users[user.id] = user.toJson()
        })

        return {
            id: this.id,
            name: this.name,
            desc: this.desc,
            cover: this.cover,
            userCount: this.userCount,
            users: users
        }
    }
}


// RoomInfosController 房间的信息, viewer
class RoomInfosController extends BaseReactive {
    /**
     * @param {UsersController} userCtl users controller
     * @param {RoomsController} roomCtl rooms controller
     * @param {RoomToUsersController} roomUserCtl room users controller
     */
    constructor(userCtl, roomCtl, roomUserCtl) {
        super()
        /**
         * @type {Map<string, RoomInfo>}
         */
        this.roomInfoMap = new Map()

        this.userCtl = userCtl
        this.roomCtl = roomCtl
        this.roomUserCtl = roomUserCtl

        this.roomlist = this.roomCtl.getRoomList()
        this._getAllRoomInfos()

        this.roomCtl.watchRoom(room => {
            // 新增了 room
            let roominfo = this.getRoomInfo(room.id, (roominfo) => {
                this.roomInfoMap.set(roominfo.id, roominfo)
            })

            this.roomInfoMap.set(roominfo.id, roominfo)

            this.dispatchAnyUpdate()
        }, room => {
            // 删除了 room
            this.roomInfoMap.delete(room.id)
            this.dispatchAnyUpdate()
        }, room => {
            // room 修改会从在 room update 体现
        })

    }

    _getAllRoomInfos() {
        this.roomlist.forEach(roomid => {
            this.getRoomInfo(roomid)
        })
    }

    dispatchAnyUpdate() {
        let infos = new Map()
        this.roomInfoMap.forEach((ri, k) => {
            infos.set(k, ri)
        })

        this.update("_any_update", infos)
    }

    /**
     * get room info
     * @param {string} roomid 
     * @param {function(RoomInfo)} f 
     * @returns {RoomInfo}
     */
    getRoomInfo(roomid, f) {
        let roomInfo = this.roomInfoMap.get(roomid)
        if (!roomInfo) {
            roomInfo = new RoomInfo(roomid, this.roomCtl, this.userCtl, this.roomUserCtl, (roomInfo) => {
                this.roomInfoMap.set(roomid, roomInfo)
                this.dispatch(roomid, roomInfo)

                this.dispatchAnyUpdate()
            })

            this.roomInfoMap.set(roomid, roomInfo)
        }

        if (!!f) {
            this.watch(roomid, f)
        }

        return roomInfo
    }

    /**
     * get room info
     * @param {function(Map<string, RoomInfo>)} f
     * @returns {Map<string, RoomInfo>}
     */
    getRoomInfoAll(f) {
        let infos = new Map()
        this.roomInfoMap.forEach((ri, k) => {
            infos.set(k, ri)
        })

        if (!!f) {
            this.watch("_any_update", f)
        }
        return infos
    }

    /**
     * room info changed callback
     * @param {string} roomid room id
     * @param {RoomInfo} roominfo room info
     */
    dispatch(roomid, roominfo) {
        this.update(roomid, roominfo)
    }
}

class Talk {
    /**
     * talk
     * @param {number} id talk sequence
     * @param {string} from user id of sender
     * @param {Array<string>} tos user id of receivers
     * @param {string} content content
     */
    constructor(m) {
        /**@type {string} */
        this.id = m.id || ""
        /**@type {string} */
        this.from = m.from || ""
        /**@type {Array<string>} */
        this.tos = m.tos || []
        /**@type {string} */
        this.content = m.content || ""
    }

    toJson() {
        return {
            id: this.id,
            from: this.from,
            tos: this.tos.map(v => v),
            content: this.content
        }
    }
}

class RoomTalks {
    /**
     * room talks
     * @param {string} id room id
     * @param {Array<Talk>} preTalks pre talks
     * @param {function(RoomTalks)} f update func
     */
    constructor(id, preTalks, f) {
        this.id = id
        /**
         * @type {Array<Talk>}
         */
        this.talks = new Array(...preTalks)

        this.idgen = () => Math.floor(Math.random() * 1000000 + 3000000).toString(10)

        this.f = f
    }

    /**
     * talk to this room
     * @param {Talk} t talk
     * @returns {Talk} t talk
     */
    talk(t) {
        t.id = this.idgen()

        this.talks.push(t)

        this.dispatch()

        return t
    }

    dispatch() {
        this.f(this)
    }

    toJson() {
        return {
            id: this.id,
            talks: this.talks.map(t => t.toJson())
        }
    }
}

class RoomTalksController extends BaseReactive {
    constructor() {
        super()

        /**
         * @type {Map<string, RoomTalks>}
         */
        this.roomTalksMap = new Map()
    }

    /**
     * 
     * @param {string} roomid room id
     * @param {function(RoomTalks)} f 
     * @returns {RoomTalks}
     */
    getTalks(roomid, f) {
        let roomTalks = this.roomTalksMap.get(roomid)
        if (!roomTalks) {
            roomTalks = new RoomTalks(roomid, [], (roomTalks) => {
                this.onTalksChanged(roomid, roomTalks)
            })
        }

        this.watch(roomid, f)

        return roomTalks
    }

    /**
     * talk to
     * @param {string} roomid room id
     * @param {Talk} talk talk
     */
    talkTo(roomid, talk) {
        let roomTalks = this.roomTalksMap.get(roomid)
        if (!roomTalks) {
            roomTalks = new RoomTalks(roomid, [], (roomTalks) => {
                this.onTalksChanged(roomid, roomTalks)
            })
            this.roomTalksMap.set(roomid, roomTalks)
        }

        roomTalks.talk(talk)
    }

    /**
     * talks change callback
     * @param {string} roomid room id
     * @param {RoomTalks} talks room talks
     */
    onTalksChanged(roomid, talks) {
        this.update(roomid, talks)
    }

}

let usersCtl = new UsersController()
let roomsCtl = new RoomsController()
let roomToUserCtl = new RoomToUsersController()
let roomInfosCtl = new RoomInfosController(usersCtl, roomsCtl, roomToUserCtl)
let roomTalksCtl = new RoomTalksController()

module.exports = {
    BaseReactive,
    User,
    UsersController,
    Room,
    RoomsController,
    RoomToUsersController,
    RoomInfo,
    RoomInfosController,
    Talk,
    RoomTalks,
    RoomTalksController,

    usersCtl,
    roomsCtl,
    roomToUserCtl,
    roomInfosCtl,
    roomTalksCtl
}