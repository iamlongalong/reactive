const { log } = require("console");
let EventEmitter = require("events");

class REvent {
    /**
     * 先只用 version，之后可以加修改的细节
     * @param {number} version change version of this event
     */
    constructor(version) {
        this.version = version;
    }
}

class EventManager {
    /**
     * @param {number} baseVersion
     */
    constructor(baseVersion) {
        this.version = baseVersion;
    }

    /**
     * @param {any} val
     * @returns {REvent}
     */
    newEvent(val) {
        let e = new REvent(this.version);

        this.version++;
        return e;
    }
}

class BaseReactive extends Object {
    #emitter;
    #events;
    constructor() {
        super();

        this.#emitter = new EventEmitter();
        /**
         * @type {Array<REvent>} event list
         */
        this.#events = new Array();
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
     * @param {REvent} event event detail of change
     * @param {string} key The key of the element to add to this YMap
     * @param {any} v value
     */
    update(key, event, v) {
        let le = getLastEvent(this.#events);
        if (!!le && le.version >= event.version) {
            return;
        }

        this.#events.push(event);
        this.#emitter.emit(key, event, v);
        return;
    }
}

/**
 * @param {Array<REvent>} items event detail of change
 * @return {REvent|null} 
 */
function getLastEvent(items) {
    if (items.length > 0) {
        return items[items.length - 1];
    }

    return null;
};


/**
 * 先只用 version，之后可以加修改的细节
 * @param {number} version change version of this event
 */
function shouldGoOn();

class MapReactive extends BaseReactive {
    /**
     * @param {Object} m base object.
     */
    constructor(m) {
        super(m);

        this._map = m;
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
        const map = {};
        this._map.forEach((item, key) => {
            if (!item.deleted) {
                f(item.content.getContent()[item.length - 1], key, this);
            }
        });
        return map;
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
        this.id = id;
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
    }

    /**
     * get user and listen
     * @param {string} id user id.
     * @param {function(User)} f function when user updated.
     * @returns {User} user.
     */
    getUser(id, f) {
        let user = this.members.get(id);
        this.watch(id, f);

        return user;
    }

    /**
     * @param {REvent} event event.
     * @param {string} id user id.
     * @param {User} user when .
     */
    updateUser(id, event, user) {
        this.members.set(id, user);

        this.update(id, event, user);
    }
}


class TeamMemberInfo {
    /**
     * @param {string} tid team id
     * @param {string} uid user id
     * @param {Object<string,any>} m 
     */
    constructor(tid, uid, m) {
        this.tid = tid;
        this.uid = uid;
        this.occupation = m.occupation || "";
        this.role = m.role || "onlooker";
    }
}

class TeamMemberInfoController extends BaseReactive {
    constructor() {
        super();

        /**
         * @type {Map<string,TeamMemberInfo>}
         * @private
         */
        this.meminfos = new Map(); // 姑且用 map，之后换成一系列 adaptor，例如从数据库取数据
    }
    /**
     * @param {string} tid team id
     * @param {string} uid user id
     * @param {function(TeamMemberInfo)} f function when user updated.
     * @returns {TeamMemberInfo}  update func
     */
    getMemberInfo(tid, uid, f) {
        let id = this._genid(tid, uid);
        let m = this.meminfos.get(id);

        this.watch(id, f);

        return m;
    }

    /**
     * @param {string} tid team id
     * @param {string} uid user id
     * @param {TeamMemberInfo} mi
     */
    setMemberInfo(tid, uid, mi) {
        let id = this._genid(tid, uid);
        this.meminfos.set(id, mi);

        this.update(id, mi);
    }

    /**
     * @param {string} tid team id
     * @param {string} uid user id
     * @returns {string}
     */
    _genid(tid, uid) {
        return `${tid}:${uid}`;
    }

}

class TeamMember {
    /**
     * @param {User} user user
     * @param {TeamMemberInfo} mi member info
     */
    constructor(user, mi) {
        this.id = user.id || "";
        this.name = user.name || "";
        this.email = user.email || "";
        this.occupation = mi.occupation || "";
        this.role = mi.role || "";
    }

    /**
     * @returns {Object<string,any>}.
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            email: this.email,
            occupation: this.occupation,
            role: this.role,
        };

        return res;
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
        this.tid = tid;
        this.usersController = usersController;
        this.teamMemberInfoController = teamMemberInfoController;

        /**
         * @type {Map<string,TeamMember>}
         * @private
         */
        this.members = new Map();
        this.f = f;

        this._setMembers(uids);
    }



    /**
     * @param {Array<string>} uids users id.
     */
    setMembers(uids) {
        this.members = new Map();

        return this.addMember(uids);
    }

    /**
     * @param {Array<string>} uids users id.
     */
    _setMembers(uids) {
        uids.forEach(uid => {
            let user = this.usersController.getUser(uid, (user) => this.onUserChange(user));

            let tmi = this.teamMemberInfoController.getMemberInfo(this.tid, uid, tmi => this.onMemberInfoChanged(tmi));

            let member = new TeamMember(user, tmi);
            this.members.set(uid, member);
        });
    }
    /**
     * @param {Array<string>} uids users id.
     */
    addMember(uids) {
        this._setMembers(uids);

        this.dispatch();
    }

    // 姑且先 dispatch this, 之后可以用 event 做细节控制
    dispatch() {
        this.f(this);
    }

    /**
     * @param {User} user user.
     */
    onUserChange(user) {
        let m = this.members.get(user.id);
        if (!m) {
            return;
        }

        m.name = user.name;
        m.email = user.email;
        m.avatar = user.avatar;
        m.desc = user.desc;

        this.members.set(user.id, m);

        this.dispatch();
    }

    /**
     * @param {TeamMemberInfo} mi .
     */
    onMemberInfoChanged(mi) {
        let m = this.members.get(mi.uid);
        if (!m) {
            return;
        }

        m.occupation = mi.occupation;
        m.role = mi.role;

        this.members.set(mi.uid, m);

        this.dispatch();
    }

    /**
     * @returns {Object<string,any>}.
     */
    toJson() {
        let res = {};

        this.members.forEach((v, k) => {
            res[k] = v.toJson();
        });

        return res;
    }
}


class TeamMembersController extends BaseReactive {
    /**
     * @param {UsersController} usersController users controller.
     * @param {TeamMemberInfoController} tmiController team info controller.
     */
    constructor(usersController, tmiController) {
        super();

        /**
         * @type {Object<string, TeamMembers>}
         */
        this.members = new Map();

        /**
         * @type {Object<string, Array<string>>}
         */
        this.tidToUids = new Map();

        this.usersController = usersController;
        this.tmiController = tmiController;
    }

    /**
     * 内部设置 tid to uids, 类似于设置 user_to_team 表
     * @param {string} tid team id.
     * @param {Array<string>} uids users id.
     */
    _setTidToUids(tid, uids) {
        this.tidToUids[tid] = uids;
    }

    /**
     * 设置 tid to uids, 类似于设置 user_to_team 表
     * @param {string} tid team id.
     * @param {Array<string>} uids users id.
     */
    setTidToUids(tid, uids) {
        this._setTidToUids(tid, uids);

        let tms = this._getMembers(tid);

        this.dispatch(tid, tms);
    }

    /**
     * 内部获取 members，若无则创建
     * @param {string} tid team id.
     */
    _getMembers(tid) {
        // 按理应该从
        let uids = this.tidToUids[tid];
        let tms = new TeamMembers(tid, this.usersController, this.tmiController, uids, (tms) => this.dispatch(tms.tid, tms));

        this.members.set(tid, tms);
        return tms;
    }

    /**
     * 外部获取 team members，并设置监听
     * @param {string} tid team id.
     * @param {function(TeamMembers)} f users controller.
     * @returns {TeamMembers} team members
     */
    getTeamMembers(tid, f) {
        let tms = this.members.get(tid);
        if (!tms) {
            tms = this._getMembers(tid);
        }

        this.watch(tid, f);
        return tms;
    }

    /**
     * @param {string} tid team id.
     * @param {TeamMembers} tms team members
     */
    dispatch(tid, tms) {
        this.update(tid, tms);
    }
}



class Document {
    /**
     * @param {Object<string, any>} m users controller.
     */
    constructor(m) {
        this.id = m.id || "";
        this.name = m.name || "";
        this.updated_at = m.updated_at || "";
        this.cover = m.cover || "";
        this.projectid = m.projectid || "";
    }

    /**
     * @returns {Object<string, any>} json object
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            updated_at: this.updated_at,
            cover: this.cover,
            projectid: this.projectid,
        };

        return res;
    }
}


class DocumentsController extends BaseReactive {
    /**
     * @param {string} tid team id
     * @param {TeamMembersController} tmsController users controller.
     * @param {TeamInfo} ti teaminfo.
     * @param {funciton(Team)} f update func.
     */
    constructor() {
        super();

        /**
         * @type {Map<string, Document>}
         */
        this.members = new Map();
    }

    /**
     * @param {string} did document id.
     * @param {funciton(Document)} f update func.
     */
    getDocument(did, f) {
        let doc = this.members.get(did);
        this.watch(did, f);

        return doc;
    }



    /**
     * @param {string} did document id.
     * @param {Document} doc update func.
     */
    setDocument(did, doc) {
        this.members.set(did, doc);

        this.dispatch(did, doc);
    }

    /**
     * @param {string} did document id.
     * @param {Document} doc update func.
     */
    dispatch(did, doc) {
        this.update(did, doc);
    }
}

class Documents {
    /**
     * @param {Array<string>} docIds document id.
     * @param {DocumentsController} docController update func.
     * @param {funciton(Documents)} f update func.
     */
    constructor(id, docIds, docController, f) {
        this.id = id; // maybe project id or team id

        /**
         * @type {Map<string, Document>}
         */
        this.members = new Map();
        this.f = f;

        for (let docid of docIds) {
            let doc = docController.getDocument(docid, d => this.onUpdate(d));

            this.members.set(docid, doc);
        }
    }

    /**
     * @param {Document} doc update func.
     */
    onUpdate(doc) {
        this.members.set(doc.id, doc);

        this.f(this);
    }

    /**
     * @returns {Object<string,any>}.
     */
    toJson() {
        let res = {};

        this.members.forEach((v, k) => {
            res[k] = v.toJson();
        });

        return res;
    }
}


class ProjectDocumentsController extends BaseReactive {
    /**
     * @param {DocumentsController} docsController
     */
    constructor(docsController) {
        super();

        /**
         * @type {Map<string, Set<string>>}
         */
        this.pdocs = new Map();
        this.docsController = docsController;
    }

    /**
     * @param {string} pid project id.
     * @param {funciton(Documents)} f update func.
     */
    getDocsByPID(pid, f) {
        let pset = this.pdocs.get(pid) || [];

        let docIDs = [];
        pset.forEach((docid) => {
            docIDs.push(docid);
        });

        let docs = new Documents(pid, docIDs, this.docsController, (docs) => {
            this.dispatch(docs.id, docs);
        });

        this.watch(pid, f);

        return docs;
    }

    /**
     * @param {string} pid project id.
     * @param {Array<string>} docIDs update func.
     */
    updateProjectDocIDs(pid, docIDs) {

        let docIDSet = new Set(docIDs);
        this.pdocs.set(pid, docIDSet);

        let docs = new Documents(pid, docIDs, this.docsController, (docs) => {
            this.dispatch(docs.id, docs);
        });

        this.dispatch(pid, docs);
    }

    dispatch(pid, docs) {
        this.update(pid, docs);
    }

}



class ProjectInfo {
    /**
     * @param {Object<string, any>} m
     */
    constructor(m) {
        this.id = m.id || "";
        this.name = m.name || "";
    }

    /**
     * @returns {Object<string, any>} json object
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            desc: this.desc,
            icon: this.icon,
        };

        return res;
    }
}


class Project {
    /**
     * @param {string} pid project id
     * @param {ProjectDocumentsController} pdsController users controller.
     * @param {ProjectInfosController} piController pi controller.
     * @param {funciton(Project)} f update func.
     */
    constructor(pid, pdsController, piController, f) {
        this.id = pid;

        let pi = piController.getProjectInfoByID(pid, pi => this.onProjectInfoChange(pi));

        this.name = pi.name;

        this.documents = pdsController.getDocsByPID(pid, ds => this.onDocumentsChange(ds));

        this.f = f;
    }

    /**
     * @param {Documents} docs documents.
     */
    onDocumentsChange(docs) {
        this.documents = docs;

        this.dispatch();
    }

    /**
     * @param {ProjectInfo} pi project info.
     */
    onProjectInfoChange(pi) {
        this.name = pi.name;

        this.dispatch();
    }

    dispatch() {
        this.f(this);
    }

    /**
     * @returns {Object<string, any>} json object
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,

            documents: this.documents.toJson(),
        };

        return res;
    }
}

class ProjectInfosController extends BaseReactive {
    /**
     * @param {string} id team id.
     * @param {Array<string>} pids projects id.
     * @param {ProjectDocumentsController} pdsController update func.
     * @param {funciton(Projects)} f update func.
     */
    constructor() {
        super();

        /**
         * @type {Map<string, ProjectInfo>}
         */
        this.members = new Map();
    }

    /**
     * @param {string} pid project id.
     * @param {funciton(ProjectInfo)} f update func.
     * @returns {ProjectInfo} project
     */
    getProjectInfoByID(pid, f) {
        let pi = this.members.get(pid);
        // TODO 如果没有获取到的处理

        this.watch(pid, f);
        return pi;
    }

    /**
     * @param {string} pid project id.
     * @param {ProjectInfo} pi
     */
    updateProjectInfo(pid, pi) {
        this.members.set(pid, pi);

        this.update(pid, pi);
    }
}

class ProjectsController extends BaseReactive {
    /**
     * @param {ProjectDocumentsController} pdsController .
     * @param {ProjectInfosController} piController .
     */
    constructor(piController, pdsController) {
        super();


        /**
         * @type {Map<string, Project>}
         */
        this.members = new Map();

        this.pdsController = pdsController;
        this.piController = piController;
    }

    /**
     * @param {string} pid project id.
     * @param {funciton(Project)} f update func.
     * @returns {Project} project
     */
    getProjectByID(pid, f) {
        let p = this.members.get(pid);
        if (!p) {
            p = new Project(pid, this.pdsController, this.piController, (p) => {
                this.members.set(p.id, p);

                this.dispatch(p.id, p);
            });

            this.members.set(pid, p);
        }

        this.watch(pid, f);

        return p;
    }

    dispatch(pid, project) {
        this.update(pid, project);
    }

}


class Projects {
    /**
     * @param {string} id team id.
     * @param {Array<string>} pids projects id.
     * @param {ProjectsController} projectController project controller.
     * @param {funciton(Projects)} f update func.
     */
    constructor(id, pids, projectController, f) {
        this.id = id; // maybe project id or team id

        /**
         * @type {Map<string, Project>}
         */
        this.members = new Map();
        this.f = f;

        for (let pid of pids) {
            let p = projectController.getProjectByID(pid, p => this.onUpdate(p));

            this.members.set(pid, p);
        }
    }

    /**
     * @param {Project} project project.
     */
    onUpdate(project) {
        this.members.set(project.id, project);

        this.f(this);
    }

    /**
     * @returns {Object<string,any>}.
     */
    toJson() {
        let res = {};

        this.members.forEach((v, k) => {
            res[k] = v.toJson();
        });

        return res;
    }
}


class TeamProjectsController extends BaseReactive {
    /**
     * @param {ProjectsController} pController update func.
     */
    constructor(pController) {
        super();

        /**
         * @type {Map<string, Set<string>>}
         */
        this.tProjects = new Map();
        this.pController = pController;
    }
    /**
     * @param {string} tid team id.
     * @param {funciton(Projects)} f update func.
     * @returns {Projects} projects.
     */
    getProjects(tid, f) {
        let pset = this.tProjects.get(tid) || [];

        let pids = [];
        pset.forEach(pid => {
            pids.push(pid);
        });

        let ps = new Projects(tid, pids, this.pController, (ps) => {
            this.dispatch(ps.id, ps);
        });

        this.watch(tid, f);

        return ps;
    }

    /**
     * @param {string} tid team id.
     * @param {Array<string>} pids project ids.
     */
    updateUserTIDs(tid, pids) {
        let tidSet = new Set(pids);
        this.tProjects.set(tid, tidSet);

        let ps = new Projects(tid, pids, this.pController, (ps) => {
            this.dispatch(ps.id, ps);
        });

        this.dispatch(tid, ps);
    }

    /**
     * @param {string} tid team id.
     * @param {Projects} projects
     */
    dispatch(tid, projects) {
        this.update(tid, projects);
    }
}

class TeamInfo {
    /**
     * @param {Object<string, any>} m
     */
    constructor(m) {
        this.id = m.id || "";
        this.name = m.name || "";
        this.desc = m.desc || "";
        this.icon = m.icon || "";
    }

    /**
     * @returns {Object<string, any>} json object
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            desc: this.desc,
            icon: this.icon,
        };

        return res;
    }
}

class TeamInfoController extends BaseReactive {
    constructor() {
        super();

        /**
         * @type {Map<string, TeamInfo>}
         */
        this.members = new Map();
    }
    /**
     * @param {string} tid team id
     * @param {funciton(TeamInfo)} f update func.
     * @returns {TeamInfo} ti teaminfo.
     */
    getTeamInfo(tid, f) {
        let ti = this.members.get(tid);
        this.watch(tid, f);

        return ti;
    }

    /**
     * @param {string} tid team id
     * @param {TeamInfo} ti teaminfo.
     */
    updateTeamInfo(tid, ti) {
        this.members.set(tid, ti);

        this.update(tid, ti);
    }
}

class Team {
    /**
     * @param {string} tid team id
     * @param {TeamMembersController} tmsController users controller.
     * @param {TeamProjectsController} tpsController users controller.
     * @param {TeamInfoController} tiController teaminfo controller.
     * @param {funciton(Team)} f update func.
     */
    constructor(tid, tmsController, tpsController, tiController, f) {
        this.id = tid;

        let ti = tiController.getTeamInfo(tid, ti => this.onTeamInfoChange(ti));
        this.name = ti.name;
        this.desc = ti.desc;
        this.icon = ti.icon;

        this.members = tmsController.getTeamMembers(tid, t => this.onTeamMembersChange(t));

        this.projects = tpsController.getProjects(tid, p => this.onTeamProjectsChange(p));

        this.f = f;
    }

    /**
     * @param {TeamMembers} tms team members.
     */
    onTeamMembersChange(tms) {
        this.members = tms;

        this.dispatch();
    }

    /**
     * @param {TeamInfo} ti team info.
     */
    onTeamInfoChange(ti) {
        this.name = ti.name;
        this.desc = ti.desc;
        this.icon = ti.icon;

        this.dispatch();
    }

    /**
     * @param {Projects} ps projects.
     */
    onTeamProjectsChange(ps) {
        this.projects = ps;

        this.dispatch();
    }

    dispatch() {
        this.f(this);
    }

    /**
     * @returns {Object<string, any>} json object
     */
    toJson() {
        let res = {
            id: this.id,
            name: this.name,
            desc: this.desc,
            icon: this.icon,
            members: this.members.toJson(),
            projects: this.projects.toJson(),
        };

        return res;
    }
}


class TeamsController extends BaseReactive {
    /**
     * @param {TeamMembersController} tmsController users controller.
     * @param {TeamProjectsController} tpsController users controller.
     * @param {TeamInfoController} tiController teaminfo controller.
     */
    constructor(tmsController, tpsController, tiController) {
        super();

        /**
         * @type {Map<string,Team>}
         * @private
         */
        this.members = new Map();

        this.tmsController = tmsController;
        this.tpsController = tpsController;
        this.tiController = tiController;
    }

    /**
     * get user and listen
     * @param {string} tid team id.
     * @param {function(Team)} f function when team updated.
     * @returns {Team} team.
     */
    getTeamByID(tid, f) {
        let team = this.members.get(tid);
        if (!team) {
            team = new Team(tid, this.tmsController, this.tpsController, this.tiController, (t) => {
                this.members.set(t.id, t);

                this.dispatch(t.id, t);
            });
            this.members.set(tid, team);
        }

        this.watch(tid, f);

        return team;
    }

    /**
     * @param {string} tid team id.
     * @param {Team} team team.
     */
    dispatch(pid, team) {
        this.update(pid, team);
    }

}



class Teams {
    /**
     * @param {string} id user id.
     * @param {Array<string>} tids teams id.
     * @param {TeamsController} tsController teams controller.
     * @param {funciton(Projects)} f update func.
     */
    constructor(id, tids, tsController, f) {
        this.id = id;

        /**
         * @type {Map<string, Project>}
         */
        this.members = new Map();
        this.f = f;

        for (let tid of tids) {
            let t = tsController.getTeamByID(tid, t => this.onUpdate(t));

            this.members.set(tid, t);
        }
    }

    /**
     * @param {Team} team project.
     */
    onUpdate(team) {
        this.members.set(team.id, team);

        this.f(this);
    }

    /**
     * @returns {Object<string,any>}.
     */
    toJson() {
        let res = {};

        this.members.forEach((v, k) => {
            res[k] = v.toJson();
        });

        return res;
    }
}


class UserTeamsController extends BaseReactive {
    /**
     * @param {TeamsController} tController update func.
     */
    constructor(tController) {
        super();

        /**
         * @type {Map<string, Set<string>>}
         */
        this.uTeams = new Map();
        this.tController = tController;
    }
    /**
     * 获取某 user 对应的 teams
     * @param {string} uid user id.
     * @param {funciton(Teams)} f update func.
     * @returns {Teams} teams.
     */
    getTeams(uid, f) {
        let tset = this.uTeams.get(uid) || [];

        let tids = [];
        tset.forEach(tid => {
            tids.push(tid);
        });

        let teams = new Teams(uid, tids, this.tController, (teams) => {
            this.dispatch(teams.id, teams);
        });

        this.watch(uid, f);

        return teams;
    }

    /**
     * 设置或修改 user 对应的 team ids
     * @param {string} uid user id.
     * @param {Array<string>} tids team ids.
     */
    updateUserTIDs(uid, tids) {
        let uidSet = new Set(tids);
        this.uTeams.set(uid, uidSet);

        let teams = new Teams(uid, tids, this.tController, (ts) => {
            this.dispatch(ts.id, ts);
        });

        this.dispatch(uid, teams);
    }

    /**
     * @param {string} uid user id.
     * @param {Teams} teams project ids.
     */
    dispatch(uid, teams) {
        this.update(uid, teams);
    }
}

class IndexView {
    /**
     * @param {string} uid user id.
     * @param {UsersController} uController user controller.
     * @param {UserTeamsController} utsController user teams controller.
     * @param {funciton(IndexView)} f update func
     */

    constructor(uid, uController, utsController, f) {
        this.id = uid;

        /**
         * @type {User}
         */
        this.user = uController.getUser(uid, u => this.onUserChange(u));

        /**
         * @type {Teams}
         */
        this.teams = utsController.getTeams(uid, t => this.onTeamsChange(t));

        this.f = f;
    }

    /**
     * @param {User} user user
     */
    onUserChange(user) {
        this.user = user;

        this.dispatch();
    }

    /**
     * @param {Teams} teams teams
     */
    onTeamsChange(teams) {
        this.teams = teams;

        this.dispatch();
    }

    dispatch() {
        this.f(this);
    }

    /**
     * @returns {Object<string, any>} json object
     */
    toJson() {
        let res = {
            user: this.user.toJson(),
            teams: this.teams.toJson(),
        };

        return res;
    }

}


class IndexViewController extends BaseReactive {
    /**
     * @param {UsersController} uController user controller.
     * @param {UserTeamsController} utsController user teams controller.
     */
    constructor(uController, utsController) {
        super();

        /**
         * @type {Map<string, IndexView>}
         */
        this.members = new Map();

        this.uController = uController;
        this.utsController = utsController;

    }

    /**
     * @param {string} uid user controller.
     * @param {funciton(IndexView)} f update func
     * @returns {IndexView}
     */
    getUserIndexView(uid, f) {
        let idxview = this.members.get(uid);
        if (!idxview) {
            idxview = new IndexView(uid, this.uController, this.utsController, (view) => {
                this.dispatch(view.id, view);
            });

            this.members.set(uid, idxview);
        }

        this.watch(uid, f);

        return idxview;
    }

    /**
     * @param {string} uid 
     * @param {uid} uController user controller.
     * @returns {} uController user controller.
     */
    dispatch(uid, view) {
        this.update(uid, view);
    }

}

// let c = new UsersController();

// c.watchUser("1001", (user) => {
//     console.log("watch user func ", user);
// });

// let x = new User("1001", { name: "longalong", email: "long@longalong.cn", desc: "hello world", avatar: "/static/img/user_1001.jpg" });

// c.updateUser(x.id, x)

// users
let uController = new UsersController();
let u1_id = "1001";
let u1 = new User(u1_id, { name: "longalong", email: "long@longalong.cn", desc: "hello world", avatar: "/static/img/user_1001.jpg" });

let u2_id = "1002";
let u2 = new User(u2_id, { name: "long2", email: "long2@longalong.cn", desc: "hello world 2", avatar: "/static/img/user_1002.jpg" });

// add some users
uController.updateUser(u1_id, u1);
uController.updateUser(u2_id, u2);

// team member info
let teamMemberInfoController = new TeamMemberInfoController();
let t1_tid = "2001";
let t2_tid = "2002";
let t1_u1_info = new TeamMemberInfo(t1_tid, u1_id, { occupation: "developer", role: "owner" });
let t1_u2_info = new TeamMemberInfo(t1_tid, u2_id, { occupation: "designer", role: "member" });
let t2_u2_info = new TeamMemberInfo(t2_tid, u2_id, { occupation: "designer", role: "owner" });
teamMemberInfoController.setMemberInfo(t1_tid, u1_id, t1_u1_info);
teamMemberInfoController.setMemberInfo(t1_tid, u2_id, t1_u2_info);
teamMemberInfoController.setMemberInfo(t2_tid, u2_id, t2_u2_info);

// team members
let teamMembersController = new TeamMembersController(uController, teamMemberInfoController);
teamMembersController.setTidToUids(t1_tid, [u1_id, u2_id]);
teamMembersController.setTidToUids(t2_tid, [u2_id]);

// team info
let teamInfoController = new TeamInfoController();
let t1_info = new TeamInfo({ id: t1_tid, name: "我的团队", desc: "这是我的团队001", icon: "/static/img/team_001.jpg" });
let t2_info = new TeamInfo({ id: t2_tid, name: "第2个团队", desc: "团队002", icon: "/static/img/team_002.jpg" });
teamInfoController.updateTeamInfo(t1_info.id, t1_info);
teamInfoController.updateTeamInfo(t2_info.id, t2_info);


// project info
let projectInfoController = new ProjectInfosController();
let t1_p1_id = "3001";
let t1_p2_id = "3002";
let t1_p1_info = new ProjectInfo({ id: t1_p1_id, name: "project_001" });
let t1_p2_info = new ProjectInfo({ id: t1_p2_id, name: "project_002" });
projectInfoController.updateProjectInfo(t1_p1_id, t1_p1_info);
projectInfoController.updateProjectInfo(t1_p2_id, t1_p2_info);


// documents
let documentsController = new DocumentsController();
let doc1_info = {
    name: "document_001",
    id: "4001",
    updated_at: "20230420010130",
    cover: "/static/img/document_001.png",
    projectid: t1_p1_id
};
let doc2_info = {
    name: "document_002",
    id: "4002",
    updated_at: "20230420010211",
    cover: "/static/img/document_002.png",
    projectid: t1_p1_id
};
let doc1 = new Document(doc1_info);
let doc2 = new Document(doc2_info);
documentsController.setDocument(doc1_info.id, doc1);
documentsController.setDocument(doc2_info.id, doc2);

// project documents
let projectDocumentsController = new ProjectDocumentsController(documentsController);
projectDocumentsController.updateProjectDocIDs(doc1_info.projectid, [doc1_info.id, doc2_info.id]);

// projects
let projectsController = new ProjectsController(projectInfoController, projectDocumentsController);


// team projects
let teamProjectsController = new TeamProjectsController(projectsController);
teamProjectsController.updateUserTIDs(t1_tid, [t1_p1_id, t1_p2_id]);

// teams
let teamsController = new TeamsController(teamMembersController, teamProjectsController, teamInfoController);
teamsController.update;

// user_teams
let userTeamsController = new UserTeamsController(teamsController);
userTeamsController.updateUserTIDs(u1_id, [t1_tid]);
userTeamsController.updateUserTIDs(u2_id, [t1_tid, t2_tid]);




let idxViewCtl = new IndexViewController(uController, userTeamsController);

let iv = idxViewCtl.getUserIndexView(u1_id, (v) => {
    console.log("<<<<<<< >>>>>>>");
    console.log("idx view changed", JSON.stringify(v.toJson(), null, "  "));
});

console.log("get idx view", JSON.stringify(iv.toJson(), null, "  "));

u1.desc = "hahaha I changed my desc from hello world to this";
uController.updateUser(u1.id, u1)

