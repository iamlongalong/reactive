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

class Userx {
    /**
     * @param {string} id user id.
     * @param {Object<string,any>} m normal object.
     */
    #name;
    constructor(id, m) {
        this.id = id
        // this.name = m.name || ""
        this.email = m.email || ""
        this.desc = m.desc || ""
        this.avatar = m.avatar || ""
        this.#name = m.name || ""
    }

    get name() {
        return this.#name || "none name"
    }
    set name(n) {
        this.#name = n
    }

    /**
     * @returns {Object<string,any>} normal object.
     */
    toJson() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            desc: this.desc,
            avatar: this.avatar
        }
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

        // this.emitter = new EventEmitter({ captureRejections: true })
    }

    /**
     * @param {string} id user id.
     * @returns {User} user.
     */
    getUser(id) {
        return this.users.get(id)
    }

    /**
     * get user and listen
     * @param {string} id user id.
     * @param {function(User)} f function when user updated.
     * @returns {User} user.
     */
    getUser(id, f) {
        let u = this.users.get(id)
        this.watchUser(id, f)
        return u
    }

    /**
     * @param {string} id user id.
     * @param {function(User)} f function when user updated.
     */
    watchUser(id, f) {
        this.emitter.on(id, f)
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


class TeamMember {
    /**
     * @param {UsersController} userscontroller users controller.
     * @param {string} id user id.
     * @param {User} user user id.
     * @param {string} occupation occupation of user.
     * @param {string} role user role.
     */
    constructor(id, occupation, role, userscontroller, onupdate) {
        this.id = id

        userscontroller.getUser(id, (user) => {
            this.updateUser(user)
        })
        this.occupation = occupation
        this.role = role
    }

    /**
    * @param {User} user user id.
    */
    updateUser(user) {
        this.avatar = user.avatar
        this.desc = user.desc
        this.name = user.name
        this.email = user.email
    }
}

class globalTeamMembersController extends BaseReactive {
    constructor() {
        super()

        this.tmControllers = new Map()
    }

    /**
     * @param {string} tid team id.
     * @param {funciton(TeamMembersController)} f team.
     * @returns {TeamMembersController} userscontroller users controller.
     */
    getTeamMemControllers(tid, f) {
        this.watch(tid, f)

        return this.tmControllers.get(tid)
    }

    /**
     * @param {string} tid team id.
     * @param {TeamMembersController} tm users controller.
     */
    setTeamMemControllers(tid, tm) {
        this.tmControllers.set(tid, tm)
        this.update(tid, tm)
    }
}


class TeamMembersController extends BaseReactive {
    /**
     * @param {string} tid team id.
     * @param {UsersController} userscontroller users controller.
     */
    constructor(tid, userscontroller) {
        super()
        this.teamid = tid
        this.userscontroller = userscontroller

        /**
         * @type {Object<string,TeamMember>}
         */
        this.members = new Map()
    }

    /**
     * @param {string} uid user id.
     * @param {function(TeamMember)} f users controller.
     */
    getTeamMember(id, f) {
        let tm = this.members.get(id)

        this.watch(id, f)
    }

    /**
     * @param {string} id user id.
     * @param {TeamMember} tm user role.
     */
    updateTeamMember(id, tm) {
        this.members.set(id, tm)
        this.update(id, tm)
    }

    /**
     * @param {function(TeamMember)} f users controller.
     * @returns {Object<string,TeamMember>}
     */
    getAll(f) {
        let members = new Map()
        Object.keys(this.members).forEach(k => {
            let t = this.getTeamMember(k, f)
            members.set(k, t)
        })

        return members
    }
}

class MembersController extends BaseReactive {
    /**
     * @param {UsersController} userscontroller users controller.
     * @param {string} userid user id.
     * @param {string} occupation occupation of user.
     * @param {string} role user role.
     */
    constructor(userscontroller, userid, occupation, role) {

        userscontroller.getUser(userid, (user) => {
            this.updateuser(user)
        })

        super(id, user)
        this.occupation = occupation
        this.role = role
    }

    getMemberSets(ids = []) {
        for (id of ids) {

        }
    }

    /**
     * @param {User} user user
     */
    updateuser(user) {
        this.id = user.id
        this.avatar = user.avatar
        this.desc = user.desc
        this.name = user.name
        this.email = user.email
    }
}

class TeamPO {
    constructor(id, m) {
        /**
         * @param {string} id team id.
         * @param {Object<string,any>} m normal object.
         */
        this.id = id
        this.name = m.name || ""
        this.desc = m.desc || ""
        this.icon = m.icon || ""
        this.members = m.members || []
    }
}

class TeamBO {
    /**
     * @param {TeamPO} tpo team po.
     * @param {Object<string,any>} m normal object.
     */
    constructor(tpo, membersBuilder) {

    }

    updateMembers(ids = []) {

    }
}

class MembersController extends BaseReactive {
    constructor() {
        super()
        this.members = new Map()
    }

    getMember(id) {
        return this.members.get(id)
    }
    getWatchMember(id, f) {
        let m = this.members.get(id)
        this.watch(id, f)
        return m
    }
}

class MemberSet {
    /**
     * @param {[]<string>} ids user ids.
     * @param {MembersController} membersBuilder normal object.
     */
    constructor(ids, membersBuilder) {
        this.set = new Map()

        for (id of ids) {
            membersBuilder.avatar
        }
    }
}

class MemberPO {
    constructor(id, user) {
        this.id = id
        this.user = user
    }
}

class MemberBO {
    constructor(id, usersBuilder) {

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

