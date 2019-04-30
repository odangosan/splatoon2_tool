import Vue from 'vue';
import Vuex from 'vuex';
import moment from "moment";
import { StoredObjectMethods } from "@/models/StoredObject"

Vue.use(Vuex);
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators'
const store = new Vuex.Store({})

class Entity {
    constructor() {
        this.id = this.getRandomId();
    }
    id: string;
    createdAt = moment();
    private getMS() {
        return new Date().getTime().toString();
    }
    private getRandomId() {
        // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
        // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
        for (let i = 0, len = chars.length; i < len; i++) {
            switch (chars[i]) {
                case "x":
                    chars[i] = Math.floor(Math.random() * 16).toString(16);
                    break;
                case "y":
                    chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                    break;
            }
        }
        return chars.join("");
    }

}
export class Player extends Entity {
    name: string = "test";
    rank = 1;
    star: boolean = false
    comment: string = "";
    constructor(init?: Partial<Player>) {
        super();
        if (init)
            Object.assign(this, init);
    }
    getRank() {
        return this.rank + (this.star ? 99 : 0);
    }
}
enum TEAM {
    A, B, WATCHING
}

import { StageRoot, Rule, ConstantModule } from "@/store/modules/Constant"
export class UsingPlayer {
    player: Player;
    weapon: WeaponRoot = new WeaponRoot();
    assignRandomWeapon() {
        let index = Math.floor(Math.random() * ConstantModule.weapons.length);
        this.weapon = ConstantModule.weapons[index];
    }
    constructor(player: Player) {
        this.player = player;
    }
}
export class Game extends Entity {
    teamA: UsingPlayer[] = [];
    teamB: UsingPlayer[] = [];
    spector: UsingPlayer[] = [];
    winning: TEAM = TEAM.A;
    stage: StageRoot = new StageRoot();
    rule: Rule = new Rule();
    constructor(init?: Partial<Game>) {
        super();
        if (init)
            Object.assign(this, init);
    }
    assignPlayers() {
        // StorableModule.StoredObject.players
        this.teamA.push(new UsingPlayer(new Player({ name: "1A" })))
        this.teamA.push(new UsingPlayer(new Player({ name: "2A" })))
        this.teamA.push(new UsingPlayer(new Player({ name: "3A" })))
        this.teamA.push(new UsingPlayer(new Player({ name: "4A" })))
        this.teamB.push(new UsingPlayer(new Player({ name: "1B" })))
        this.teamB.push(new UsingPlayer(new Player({ name: "2B" })))
        this.teamB.push(new UsingPlayer(new Player({ name: "3B" })))
        this.teamB.push(new UsingPlayer(new Player({ name: "4B" })))
        this.spector.push(new UsingPlayer(new Player({ name: "1S" })))
        this.spector.push(new UsingPlayer(new Player({ name: "2S" })))
    }
    assignRandomWeapons() {
        this.teamA.forEach(e => {
            e.assignRandomWeapon();
        })
        this.teamB.forEach(e => {
            e.assignRandomWeapon();
        })
    }
    /**
     * TODO:履歴を参照して重複を避ける
     */
    assignRandomStage() {
        let index = Math.floor(Math.random() * ConstantModule.stages.length);
        this.stage = ConstantModule.stages[index]
        console.log(this.stage);
    }
    /**
    * TODO:履歴を参照して重複を避ける
    */
    assignRandomRule() {
        let index = Math.floor(Math.random() * ConstantModule.rules.length);
        this.rule = ConstantModule.rules[index]
        console.log(this.rule);
    }
}

import { WeaponRoot } from "@/store/modules/Constant"

export class History extends Entity {
    team!: TEAM;
    winning?: TEAM;
    stage!: StageRoot;
    rule!: Rule;
    player!: Player;
    weapon?: WeaponRoot;
    constructor() {
        super();
    }
}
export class StoredObject {
    players: Player[] = [];
    selectedPlayers: Player[] = [];
    games: Game[] = [];
    histories: History[] = [];
    constructor() { }
}
@Module({ dynamic: true, store: store, name: "Storable", namespaced: true })
export default class Storable extends VuexModule implements StoredObjectMethods {
    STORED_OBJECT_KEY: string = "STORED_OBJECT_KEY_MYDATA";
    StoredObject: StoredObject = new StoredObject();
    get KEY() {
        // console.log(this.StoredObject);
        // return this.StoredObject.toString();
        return this.StoredObject.players.toString() + this.StoredObject.selectedPlayers.toString() + this.StoredObject.games.toString() + this.StoredObject.histories.toString();
        // return this.StoredObject.getKeys();
    }
    @Mutation
    SET_STORED_OBJECT(StoredObject: StoredObject) {
        this.StoredObject = StoredObject;
    }
    @Mutation
    SET_PLAYERS_SELECTED(players: Player[]) {
        this.StoredObject.selectedPlayers = players;
    }

    @Action({ rawError: true })
    updatePlayer(update: Player) {
        var index = this.StoredObject.players.findIndex(e => {
            return e.id == update.id;
        })
        this.StoredObject.players.splice(index, 1, update);
        this.save();
    }

    @Action
    refresh() {
        this.delete();
        this.load();
    }
    @Action
    delete() {
        localStorage.removeItem(this.STORED_OBJECT_KEY);
        this.SET_STORED_OBJECT(new StoredObject());
    }
    @Action
    save() {
        console.log("start save.");
        var storedObject = JSON.stringify(this.StoredObject);
        localStorage.setItem(this.STORED_OBJECT_KEY, storedObject);
    }
    @Action
    load() {
        console.log("start load.");
        let storedObject = localStorage.getItem(this.STORED_OBJECT_KEY);
        var so: StoredObject = new StoredObject();
        if (storedObject != null) {
            so = JSON.parse(storedObject) as StoredObject;
        }
        this.SET_STORED_OBJECT(so);
        this.save();
    }
    @Action
    addPlayer(player: Player) {
        this.StoredObject.players.push(player);
    }
    @Action
    removePlayer(player: Player) {
        this.StoredObject.players = this.StoredObject.players.filter(e => {
            return e.id != player.id;
        })
        this.StoredObject.selectedPlayers = this.StoredObject.selectedPlayers.filter(e => {
            return e.id != player.id;
        })
    }
    @Action
    addGame(game: Game) {
        this.StoredObject.games.push(game);
    }
}

export const StorableModule = getModule(Storable);
