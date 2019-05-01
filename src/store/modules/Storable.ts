import Vue from 'vue';
import Vuex from 'vuex';
import moment from "moment";
moment.locale('ja')
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

    formattedCreatedAt() {
        return this.createdAt.format("MM/DD HH:mm:ss")
    }
    shortId() {
        return this.id.substring(0, 8);
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
    getRankConversion() {
        return this.rank + (this.star ? 99 : 0);
    }
}
enum TEAM {
    A, B, WATCHING, NONE
}

import { StageRoot, Rule, ConstantModule } from "@/store/modules/Constant"

export class Result extends Entity {
    gameId: string = "";
    team: TEAM = TEAM.NONE;
    winning: TEAM = TEAM.NONE;
    stage: StageRoot = new StageRoot();
    rule: Rule = new Rule();
    player: Player = new Player();
    weapon: WeaponRoot = new WeaponRoot();
    constructor(init: Partial<Result>) {
        super();
        Object.assign(this, init);
    }
    getTeamName() {
        switch (this.team) {
            case TEAM.A:
            case TEAM.B:
                return TEAM[this.team];
            default:
                return "観";
        }
    }
    getWinningTeamName() {
        switch (this.winning) {
            case TEAM.A:
            case TEAM.B:
                return TEAM[this.winning];
            default:
                return "観";
        }
    }
    isWin() {
        return this.team == this.winning;
    }
    isSpector() {
        return this.team == TEAM.WATCHING;
    }
    get isWinText() {
        switch (this.team) {
            case TEAM.A:
            case TEAM.B:
                return this.team == this.winning ? "勝" : "負";
            case TEAM.WATCHING:
                return "----";
        }
    }
}
class Aggregate {
    playerId: string = "";
    playerName: string = "";
    battleCount: number = 1;
    winCount: number = 0;
    constructor(init: Partial<Aggregate>) {
        Object.assign(this, init);
    }
}
export class Game extends Entity {
    winning: TEAM = TEAM.NONE;
    stage: StageRoot = new StageRoot();
    rule: Rule = new Rule();
    results: Result[] = [];
    constructor(init?: Partial<Game>) {
        super();
        if (init)
            Object.assign(this, init);
    }
    createResult() {
        let result = new Result({ gameId: this.id });
        this.results.push(result);
    }
    assignPlayers() {
        // StorableModule.StoredObject.players
        //playersから10人まで選出し、resultに割り当てる、チーム分けをする
        let tmpPlayers = StorableModule.StoredObject.selectedPlayers.slice(0, StorableModule.StoredObject.selectedPlayers.length);
        for (var i = tmpPlayers.length - 1; i > 0; i--) {
            var r = Math.floor(Math.random() * (i + 1));
            var tmp = tmpPlayers[i];
            tmpPlayers[i] = tmpPlayers[r];
            tmpPlayers[r] = tmp;
        }
        //参加数集計
        const group = StorableModule.StoredObject.gameManager.flatResults().reduce((result: Aggregate[], current) => {
            const element = result.find((p) => p.playerName === current.player.name);
            if (element) {
                if (!current.isSpector()) {
                    element.battleCount++; // count
                    element.winCount += current.isWin() ? 1 : 0; // sum
                }
            } else {
                result.push(new Aggregate({
                    playerName: current.player.name,
                    winCount: current.isWin() ? 1 : 0
                }));
            }
            return result;
        }, []);
        console.log(group);

        for (let index = 0; index < 10; index++) {
            let result = new Result({ gameId: this.id });
            result.player = tmpPlayers[index];
            if (index > 7)
                result.team = TEAM.WATCHING;
            else if (index % 2 == 0)
                result.team = TEAM.A;
            else if (index % 2 == 1)
                result.team = TEAM.B;
            this.results.push(result);
        }
    }
    /**
    * TODO:履歴を参照して重複を避ける
    */
    assignRandomWeapons() {
        this.results.forEach(e => {
            if (e.team != TEAM.WATCHING) {
                let index = Math.floor(Math.random() * ConstantModule.weapons.length);
                let weapon = ConstantModule.weapons[index];
                e.weapon = weapon;
            }
        })
    }
    /**
     * TODO:履歴を参照して重複を避ける
     */
    assignRandomStage() {
        let index = Math.floor(Math.random() * ConstantModule.stages.length);
        let stage = ConstantModule.stages[index]
        this.stage = stage;
        this.results.forEach(e => {
            e.stage = stage;
        })
    }
    /**
    * TODO:履歴を参照して重複を避ける
    */
    assignRandomRule() {
        let index = Math.floor(Math.random() * ConstantModule.rules.length);
        let rule = ConstantModule.rules[index]
        this.rule = rule;
        this.results.forEach(e => {
            e.rule = rule;
        })
        console.log(this.rule);
    }
    assignWinning(winning: TEAM) {
        this.winning = winning;
        this.results.forEach(e => {
            e.winning = winning;
        })
    }
}

import { WeaponRoot } from "@/store/modules/Constant"

export class GameManager {
    games: Game[] = [];
    newGame: Game = new Game();
    constructor() { }
    initGame() {
        this.newGame = new Game();
    }
    assignPlayers() {
        this.newGame.assignPlayers();
    }
    assignRandomRule() {
        this.newGame.assignRandomRule();
    }
    assignRandomStage() {
        this.newGame.assignRandomStage()
    }
    assignRandomWeapons() {
        this.newGame.assignRandomWeapons()
    }
    registering() {
        this.games.push(this.newGame);
        this.initGame();
    }
    assignWinning(winning: TEAM) {
        this.newGame.assignWinning(winning);
    }

    flatResults() {
        let results: Result[] = [];
        StorableModule.StoredObject.gameManager.games.forEach(e => {
            results = results.concat(e.results);
        });
        return results;
    }
}
export class StoredObject {
    players: Player[] = [];
    selectedPlayers: Player[] = [];
    gameManager: GameManager = new GameManager();
    constructor() { }
}
@Module({ dynamic: true, store: store, name: "Storable", namespaced: true })
export default class Storable extends VuexModule implements StoredObjectMethods {
    STORED_OBJECT_KEY: string = "STORED_OBJECT_KEY_MYDATA";
    StoredObject: StoredObject = new StoredObject();
    get KEY() {
        // console.log(this.StoredObject);
        // return this.StoredObject.toString();
        return this.StoredObject.players.toString() +
            this.StoredObject.selectedPlayers.toString() +
            this.StoredObject.gameManager.toString();
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
    initGame() {
        this.StoredObject.gameManager.initGame();
        this.StoredObject.gameManager.newGame.assignPlayers();
        this.save();
    }

    @Action
    assignRandomWeapons() {
        this.StoredObject.gameManager.newGame.assignRandomWeapons();
        this.save();
    }
    @Action
    assignRandomStage() {
        this.StoredObject.gameManager.newGame.assignRandomStage();
        this.save();
    }
    @Action
    assignRandomRule() {
        this.StoredObject.gameManager.newGame.assignRandomRule();
        this.save();
    }
    @Action
    assignWinning(team: string) {
        let winning = TEAM.NONE;
        if (team == "A") {
            winning = TEAM.A;
            console.log("win A");
        } else {
            winning = TEAM.B;
            console.log("win B");
        }
        this.StoredObject.gameManager.newGame.assignWinning(winning);
    }
    @Action
    registering() {
        this.StoredObject.gameManager.registering();
        this.save();
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
        let newSO: StoredObject = new StoredObject();
        if (storedObject != null) {
            let so = JSON.parse(storedObject) as StoredObject;
            so.players.forEach(e => {
                let p = new Player(e);
                newSO.players.push(p);
            })
            so.selectedPlayers.forEach(e => {
                let p = new Player(e);
                newSO.selectedPlayers.push(p);
            })

            let g = so.gameManager.newGame
            let game = new Game({ id: g.id, winning: g.winning, stage: g.stage, rule: g.rule });
            g.results.forEach(r => {
                let set = {
                    gameId: r.gameId,
                    team: r.team, winning: r.winning, stage: r.stage, rule: r.rule, weapon: r.weapon, player: new Player(r.player)
                }
                let result = new Result(set);
                result.createdAt = moment(r.createdAt);
                game.results.push(result);
            })
            newSO.gameManager.newGame = game;

            so.gameManager.games.forEach(g => {
                let game = new Game({ id: g.id, winning: g.winning, stage: g.stage, rule: g.rule });
                g.results.forEach(r => {
                    let set = {
                        gameId: r.gameId,
                        team: r.team, winning: r.winning, stage: r.stage, rule: r.rule, weapon: r.weapon, player: new Player(r.player)
                    }
                    let result = new Result(set);
                    result.createdAt = moment(r.createdAt);
                    game.results.push(result);
                })
                newSO.gameManager.games.push(game);
            })
        }
        console.log(newSO);

        this.SET_STORED_OBJECT(newSO);
        this.save();
    }
    @Action
    addPlayer(player: Player) {
        this.StoredObject.players.push(player);
        this.StoredObject.selectedPlayers.push(player);
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
}

export const StorableModule = getModule(Storable);
