let EventEmitter = require("events")

class BaseReactive extends Object {
    #emitter
    constructor() {
        this.#emitter = new EventEmitter()
    }

    /**
     * watch key
     * @param {string} key The key of the element to add to this YMap
     * @param {function(args ...any)} f function when things changed
     */
    watch(key, f) {
        this.#emitter.on(key, f)
    }

    /**
     * unwatch key
     * @param {string} key The key of the element to add to this YMap
     * @param {function(args ...any)} f function when things changed
     */
    unwatch(key, f) {
        this.#emitter.off(key, f)
    }

    /**
     * update key value
     * @param {string} key The key of the element to add to this YMap
     * @param {any} v value
     */
    update(key, v) {
        this.#emitter.emit(key, v)
    }
}

class MapReactive extends BaseReactive {
    /**
     * @param {Object} m base object.
     */
    constructor(m) {
        super(m)

        this._map = m
    }

    listen() {

    }

    /**
     * Adds or updates an element with a specified key and value.
     *
     * @param {string} key The key of the element to add to this YMap
     * @param {MapType} value The value of the element to add
     */
    set(key, val) {

    }

    /**
     * Returns a specified element from this YMap.
     *
     * @param {string} key
     * @return {MapType|undefined}
     */
    get(key) {

    }

    /**
     * Executes a provided function on once on every key-value pair.
     *
     * @param {function(MapType,string,YMap<MapType>):void} f A function to execute on every element of this YArray.
     */
    forEach(f) {
        /**
         * @type {Object<string,MapType>}
         */
        const map = {}
        this._map.forEach((item, key) => {
            if (!item.deleted) {
                f(item.content.getContent()[item.length - 1], key, this)
            }
        })
        return map
    }

    /**
     * Transforms this Shared Type to a JSON object.
     *
     * @return {Object<string,any>}
     */
    toJson() {

    }
}


class User {
    /**
     * @param {string} id user id.
     * @param {Object<string,any>} m normal object.
     */
    constructor(id, m) {
        this.id = id
        this.name = m.name || ""
        this.email = m.email || ""
        this.desc = m.desc || ""
        this.avatar = m.avatar || ""
    }
}

class UsersController extends BaseReactive {
    constructor() {
        super()

        /**
         * @type {Map<string,User>}
         * @private
         */
        this.users = new Map()
    }

    /**
     * get user and listen
     * @param {string} id user id.
     * @param {function(User)} f function when user updated.
     * @returns {User} user.
     */
    getUser(id, f) {
        let user = this.users.get(id)
        this.watch(id, f)

        return user
    }

    /**
     * @param {string} id user id.
     * @param {User} user when .
     */
    updateUser(id, user) {
        this.users.set(id, user)
        this.emitter.emit(id, user)
    }
}


class TeamMemberInfo {
    /**
     * @param {string} tid team id
     * @param {string} uid user id
     * @param {Object<string,any>} m 
     */
    constructor(tid, uid, m) {
        this.tid = tid
        this.uid = uid
        this.occupation = m.occupation || ""
        this.role = m.role || "onlooker"
    }
}

class TeamMemberInfoController extends BaseReactive {
    constructor() {
        super()

        /**
         * @type {Map<string,TeamMemberInfo>}
         * @private
         */
        this.meminfos = new Map() // 姑且用 map，之后换成一系列 adaptor，例如从数据库取数据
    }
    /**
     * @param {string} tid team id
     * @param {string} uid user id
     * @param {function(TeamMemberInfo)} f function when user updated.
     * @returns {TeamMemberInfo}  update func
     */
    getMemberInfo(tid, uid, f) {
        let id = this._genid(tid, uid)
        let m = this.meminfos.get(id)

        this.watch(id, f)

        return m
    }

    /**
     * @param {string} tid team id
     * @param {string} uid user id
     * @param {TeamMemberInfo} m 
     */
    setMemberInfo(tid, uid, m) {
        let id = this._genid(tid, uid)
        this.meminfos.set(id, m)

        this.update(id, m)
    }

    /**
     * @param {string} tid team id
     * @param {string} uid user id
     * @returns {string}
     */
    _genid(tid, uid) {
        return `${tid}:${uid}`
    }

}

class TeamMember {
    /**
     * @param {User} user user
     * @param {TeamMemberInfo} mi member info
     */
    constructor(user, mi) {
        this.id = user.id || ""
        this.name = user.name || ""
        this.email = user.email || ""
        this.occupation = mi.occupation || ""
        this.role = mi.role || ""
    }

    /**
     * @returns {Map<string,any>}.
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            email: this.email,
            occupation: this.occupation,
            role: this.role,
        }

        return res
    }
}

class TeamMembers {
    /**
     * @param {string} tid team id
     * @param {UsersController} usersController users controller.
     * @param {TeamMemberInfoController} teamMemberInfoController users controller.
     * @param {Array<string>} uids users id.
     * @param {funciton(TeamMembers)} f update func.
     */
    constructor(tid, usersController, teamMemberInfoController, uids, f) {
        super()

        this.tid = tid
        this.usersController = usersController
        this.teamMemberInfoController = teamMemberInfoController

        /**
         * @type {Map<string,TeamMember>}
         * @private
         */
        this.members = new Map()
        this.f = f

        this._setMembers(uids)
    }



    /**
     * @param {Array<string>} uids users id.
     */
    setMembers(uids) {
        this.members = new Map()

        return this.addMember(uids)
    }

    /**
     * @param {Array<string>} uids users id.
     */
    _setMembers(uids) {
        uids.forEach(uid => {
            let user = this.usersController.getUser(uid, this.onUserChange)

            let ti = this.teamMemberInfoController.getMemberInfo(this.tid, uid, this.onMemberInfoChanged)

            let member = new TeamMember(user, ti)
            this.members.set(uid, member)
        })
    }
    /**
     * @param {Array<string>} uids users id.
     */
    addMember(uids) {
        this._setMembers(uids)

        this.dispatch()
    }

    // 姑且先 dispatch this, 之后可以用 event 做细节控制
    dispatch() {
        this.f(this)
    }

    /**
     * @param {User} user user.
     */
    onUserChange(user) {
        let m = this.members.get(user.id)
        if (!m) {
            return
        }

        m.name = user.name
        m.email = user.email
        m.avatar = user.avatar
        m.desc = user.desc

        this.members.set(user.id, m)

        this.dispatch()
    }

    /**
     * @param {TeamMemberInfo} mi .
     */
    onMemberInfoChanged(mi) {
        let m = this.members.get(mi.uid)
        if (!m) {
            return
        }

        m.occupation = mi.occupation
        m.role = mi.role

        this.members.set(mi.uid, m)

        this.dispatch()
    }

    /**
     * @returns {Object<string,any>}.
     */
    toJson() {
        let res = {}

        this.members.forEach((v, k) => {
            res[k] = v.toJson()
        })

        return res
    }
}


class TeamMembersController extends BaseReactive {
    /**
     * @param {UsersController} usersController users controller.
     * @param {TeamMemberInfoController} tiController team info controller.
     */
    constructor(usersController, tiController) {
        super()

        /**
         * @type {Object<string, TeamMembers>}
         */
        this.tmembers = new Map()

        /**
         * @type {Object<string, Array<string>>}
         */
        this.tidToUids = new Map()

        this.usersController = usersController
        this.tiController = tiController
    }

    /**
     * 内部设置 tid to uids, 类似于设置 user_to_team 表
     * @param {string} tid team id.
     * @param {Array<string>} uids users id.
     */
    _setTidToUids(tid, uids) {
        this.tidToUids[tid] = uids
    }

    /**
     * 设置 tid to uids, 类似于设置 user_to_team 表
     * @param {string} tid team id.
     * @param {Array<string>} uids users id.
     */
    setTidToUids(tid, uids) {
        this._setTidToUids(tid, uids)

        let tms = this._getMembers(tid)

        this.dispatch(tid, tms)
    }

    /**
     * 内部获取 members，若无则创建
     * @param {string} tid team id.
     */
    _getMembers(tid) {
        // 按理应该从
        let uids = this.tidToUids[tid]
        let tms = new TeamMembers(tid, this.usersController, this.tiController, uids, (tms) => this.dispatch(tm.tid, tms))

        this.tmembers.set(tid, tms)
        return tms
    }

    /**
     * 外部获取 team members，并设置监听
     * @param {string} tid team id.
     * @param {function(TeamMembers)} f users controller.
     * @returns {TeamMembers} team members
     */
    getTeamMembers(tid, f) {
        let tms = this.members.get(tid)
        if (!tms) {
            tms = this._getMembers(tid)
        }

        this.watch(tid, f)
        return tms
    }

    /**
     * @param {string} tid team id.
     * @param {TeamMembers} tms team members
     */
    dispatch(tid, tms) {
        this.update(tid, tms)
    }
}



class Document {
    /**
     * @param {Object<string, any>} m users controller.
     */
    constructor(m) {
        this.id = m.id || ""
        this.name = m.name || ""
        this.updated_at = m.updated_at || ""
        this.cover = m.cover || ""
    }

    /**
     * @param {Object<string, any>} m users controller.
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            updated_at: this.updated_at,
            cover: this.cover,
        }

        return res
    }
}

class DocumentController extends BaseReactive {
    /**
     * @param {string} tid team id
     * @param {TeamMembersController} tmsController users controller.
     * @param {TeamInfo} ti teaminfo.
     * @param {funciton(Team)} f update func.
     */
    constructor() {
        /**
         * @type {Map<string, Document>}
         */
        this.docs = new Map()
    }

    /**
     * @param {string} did document id.
     * @param {funciton(Document)} f update func.
     */
    getDocument(did, f) {
        let doc = this.docs.get(did)
        this.watch(did, f)

        return doc
    }

}


class ProjectInfo {
    /**
     * @param {Object<string, any>} m
     */
    constructor(m) {
        this.id = m.id || ""
        this.name = m.name || ""
    }

    /**
     * @param {Object<string, any>} m users controller.
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            desc: this.desc,
            icon: this.icon,
        }

        return res
    }
}

class Project {
    /**
     * @param {string} pid project id
     * @param {TeamMembersController} tmsController users controller.
     * @param {TeamInfo} ti teaminfo.
     * @param {funciton(Team)} f update func.
     */
    constructor(tid, tmsController, ti, f) {
        this.id = tid
        this.name = ti.name
        this.desc = ti.desc
        this.icon = ti.icon

        this.members = tmsController.getTeamMembers(tid, this.onTeamMemberChange)

        this.f = f
    }

    /**
     * @param {TeamMembers} tms team members.
     */
    onTeamMemberChange(tms) {
        this.members = tms

        this.dispatch()
    }

    dispatch() {
        this.f(this)
    }

    /**
     * @param {Object<string, any>} m users controller.
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            desc: this.desc,
            icon: this.icon,
            members: this.members.toJson(),
        }

        return res
    }
}

class TeamInfo {
    /**
     * @param {Object<string, any>} m users controller.
     */
    constructor(m) {
        this.id = m.id || ""
        this.name = m.name || ""
        this.desc = m.desc || ""
        this.icon = m.icon || ""
    }

    /**
     * @param {Object<string, any>} m users controller.
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            desc: this.desc,
            icon: this.icon,
        }

        return res
    }
}

class Team {
    /**
     * @param {string} tid team id
     * @param {TeamMembersController} tmsController users controller.
     * @param {TeamInfo} ti teaminfo.
     * @param {funciton(Team)} f update func.
     */
    constructor(tid, tmsController, ti, f) {
        this.id = tid
        this.name = ti.name
        this.desc = ti.desc
        this.icon = ti.icon

        this.members = tmsController.getTeamMembers(tid, this.onTeamMemberChange)

        this.f = f
    }

    /**
     * @param {TeamMembers} tms team members.
     */
    onTeamMemberChange(tms) {
        this.members = tms

        this.dispatch()
    }

    dispatch() {
        this.f(this)
    }

    /**
     * @param {Object<string, any>} m users controller.
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            desc: this.desc,
            icon: this.icon,
            members: this.members.toJson(),
        }

        return res
    }

}


class TeamsController extends BaseReactive {
    constructor() {
        super()

        /**
         * @type {Map<string,User>}
         * @private
         */
        this.teams = new Map()
    }

    /**
     * @param {string} id user id.
     * @returns {User} user.
     */
    getTeam(id) {
        return this.teams.get(id)
    }


    /**
     * get user and listen
     * @param {string} id user id.
     * @param {function(User)} f function when user updated.
     * @returns {User} user.
     */
    getTeam(id, f) {
        let u = this.teams.get(id)
        this.watch(id, f)
        return u
    }

    /**
     * @param {string} id user id.
     * @param {function(Team)} f function when team updated.
     */
    watchTeam(id, f) {
        this.watch(id, f)
    }

    /**
     * @param {string} id user id.
     * @param {Team} team when .
     */
    updateTeam(id, team) {
        this.teams.set(id, team)

        this.update(id, team)
    }
}

let c = new UsersController()

c.watchUser("1001", (user) => {
    console.log("watch user func ", user)
})

let x = new User("1001", { name: "longalong", email: "long@longalong.cn", desc: "hello world", avatar: "/static/img/user_1001.jpg" })

c.updateUser(x.id, x)

