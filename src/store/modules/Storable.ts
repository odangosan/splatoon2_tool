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

    get createdAtSt() {
        return this.formattedCreatedAt();
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
class AggregatePlayerCount {
    playerId: string = "";
    playerName: string = "";
    battleCount: number = 0;
    winCount: number = 0;
    constructor(init: Partial<AggregatePlayerCount>) {
        Object.assign(this, init);
    }
    player!: Player;
    winRate() {
        if (this.winCount == 0 || this.battleCount == 0) return 0;
        return this.winCount / this.battleCount;
    }
}

enum SHUFFLE {
    RANDOM, RATING
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
    private random(array: any[]) {
        for (var i = array.length - 1; i > 0; i--) {
            var r = Math.floor(Math.random() * (i + 1));
            var tmp = array[i];
            array[i] = array[r];
            array[r] = tmp;
        }
        return array;
    }
    private rating(array: AggregatePlayerCount[]) {
        array.sort((a, b) => {
            return a.winRate() - b.winRate();
        })
        return array;
    }
    assignPlayers(shuffle: SHUFFLE) {
        // StorableModule.StoredObject.players
        //playersから参戦数の低い順番に10人まで選出
        //resultに割り当てる、チーム分けをする
        let tmpPlayers = StorableModule.StoredObject.selectedPlayers.slice();

        //参加数集計
        const group = StorableModule.StoredObject.gameManager.flatResults().reduce((result: AggregatePlayerCount[], current) => {
            const element = result.find((p) => p.playerName === current.player.name);
            if (element) {
                if (!current.isSpector()) {
                    element.battleCount++; // count
                    element.winCount += current.isWin() ? 1 : 0; // sum
                }
            } else {
                let find = tmpPlayers.find(e => {
                    return e.name == current.player.name;
                })
                if (find) {
                    result.push(new AggregatePlayerCount({
                        player: current.player,
                        playerName: current.player.name,
                        battleCount: current.isSpector() ? 0 : 1,
                        winCount: current.isWin() ? 1 : 0
                    }));
                }
            }
            return result;
        }, []);

        tmpPlayers.forEach(e => {
            let find = group.find(g => {
                return g.playerName == e.name;
            })
            if (find == undefined) {
                let aggregate = new AggregatePlayerCount({ player: e, playerId: e.id, playerName: e.name })
                group.push(aggregate);
            }
        })

        group.sort((a, b) => {
            return a.battleCount - b.battleCount;
        })
        let assignablePlayer = group.slice(0, 10);

        let playablePlayer = [];
        if (assignablePlayer.length <= 8) {
            if (shuffle == SHUFFLE.RANDOM) {
                playablePlayer = this.random(assignablePlayer);
            } else if (shuffle == SHUFFLE.RATING) {
                playablePlayer = this.rating(assignablePlayer);
            } else {
                playablePlayer = this.random(assignablePlayer);
            }
        } else {
            if (shuffle == SHUFFLE.RANDOM) {
                playablePlayer = this.random(assignablePlayer.slice(0, 8));
            } else if (shuffle == SHUFFLE.RATING) {
                playablePlayer = this.rating(assignablePlayer.slice(0, 8));
            } else {
                playablePlayer = this.random(assignablePlayer.slice(0, 8));
            }
            let spectorPlayer = assignablePlayer.slice(8, 10);
            playablePlayer = playablePlayer.concat(spectorPlayer);
        }
        let maxPlayer = playablePlayer.length > 10 ? 10 : playablePlayer.length;
        for (let index = 0; index < maxPlayer; index++) {
            let result = new Result({ gameId: this.id });
            result.player = playablePlayer[index].player;
            if (index > 7)
                result.team = TEAM.WATCHING;
            else if (index % 2 == 0)
                result.team = TEAM.A;
            else if (index % 2 == 1)
                result.team = TEAM.B;
            this.results.push(result);
        }
        this.results.sort((a, b) => {
            return a.team - b.team;
        })
    }

    /**
    * TODO:履歴を参照して重複を避ける
    */
    assignRandomWeapons() {
        this.results.forEach(e => {
            if (e.team != TEAM.WATCHING) {
                let array = ConstantModule.storedObject.selected.weaponRoots.length == 0 ? ConstantModule.storedObject.constant.weaponRoots.slice() : ConstantModule.storedObject.selected.weaponRoots.slice();

                array = this.random(array);
                array = this.random(array);
                // let index = Math.floor(Math.random() * array.length);
                // let weapon = array[index];
                let weapon = array[0];
                e.weapon = weapon;
            }
        })
    }
    /**
     * TODO:履歴を参照して重複を避ける
     */
    assignRandomStage() {
        let array = ConstantModule.storedObject.selected.stageRoots.length == 0 ? ConstantModule.storedObject.constant.stageRoots.slice() : ConstantModule.storedObject.selected.stageRoots.slice();
        array = this.random(array);
        array = this.random(array);
        // let index = Math.floor(Math.random() * array.length);
        // let stage = array[index];
        let stage = array[0];
        this.stage = stage;
        this.results.forEach(e => {
            e.stage = stage;
        })
    }
    /**
    * TODO:履歴を参照して重複を避ける
    */
    assignRandomRule() {
        let array = ConstantModule.storedObject.selected.rules.length == 0 ? ConstantModule.storedObject.constant.rules.slice() : ConstantModule.storedObject.selected.rules.slice();
        console.log(array);

        array = this.random(array);
        array = this.random(array);
        // let index = Math.floor(Math.random() * array.length);
        // let rule = array[index];
        let rule = array[0];
        this.rule = rule;
        this.results.forEach(e => {
            e.rule = rule;
        })
        // StorableModule.StoredObject.gameManager.games.
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
    // assignPlayers() {
    //     this.newGame.assignPlayers();
    // }
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
        this.games.forEach(e => {
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
        return this.StoredObject
    }
    @Mutation
    SET_STORED_OBJECT(StoredObject: StoredObject) {
        this.StoredObject = StoredObject;
    }
    @Action
    SET_PLAYERS_SELECTED(players: Player[]) {
        this.StoredObject.selectedPlayers = players;
        this.save();
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
        this.deleteAll();
        this.load();
    }
    @Action
    initGame(shuffle: SHUFFLE = SHUFFLE.RANDOM) {
        this.StoredObject.gameManager.initGame();
        this.StoredObject.gameManager.newGame.assignPlayers(shuffle);
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
        } else {
            winning = TEAM.B;
        }
        this.StoredObject.gameManager.newGame.assignWinning(winning);
        this.save();
    }
    @Action
    registering() {
        this.StoredObject.gameManager.registering();
        this.save();
    }
    @Action
    deleteAll() {
        localStorage.removeItem(this.STORED_OBJECT_KEY);
        this.SET_STORED_OBJECT(new StoredObject());
        this.save();
    }
    @Mutation
    deleteResult() {
        localStorage.removeItem(this.STORED_OBJECT_KEY);
        this.StoredObject.gameManager = new GameManager();
        this.save();
    }
    @Mutation
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

        this.SET_STORED_OBJECT(newSO);
        this.save();
    }
    @Action
    addPlayer(player: Player) {
        this.StoredObject.players.push(player);
        this.StoredObject.selectedPlayers.push(player);
        this.save();
    }
    @Action
    removePlayer(player: Player) {
        this.StoredObject.players = this.StoredObject.players.filter(e => {
            return e.id != player.id;
        })
        this.StoredObject.selectedPlayers = this.StoredObject.selectedPlayers.filter(e => {
            return e.id != player.id;
        })
        this.save();
    }
    @Action
    removeGame(gameId: string) {
        this.StoredObject.gameManager.games = this.StoredObject.gameManager.games.filter(e => {
            return e.id != gameId
        });
        this.save();
    }
    get flatResults() {
        return this.StoredObject.gameManager.flatResults();
    }

    get AggregateStageAndRules() {
        let results: AggregateStageAndRule[] = [];
        ConstantModule.storedObject.selected.rules.forEach(r => {
            ConstantModule.storedObject.selected.stageRoots.forEach(s => {
                results.push(new AggregateStageAndRule({ rule: r, stage: s }))
            })
        })
        const group = this.flatResults.reduce((result, current) => {
            const find = result.find(p => {
                return p.rule.key === current.rule.key && p.stage.key === current.stage.key
            });
            if (find) {
                find.count++; // count
            } else {
                // let a = new AggregateStageAndRule({ stage: current.stage, rule: current.rule });
                // a.stage = current.stage;
                // a.rule = current.rule
                // a.count = 1;
                // result.push(a);
            }
            return result;
        }, results);
        return group;
    }
}

export class AggregateStageAndRule {
    stage: StageRoot = new StageRoot();
    rule: Rule = new Rule();
    count = 0;
    constructor(init?: Partial<AggregateStageAndRule>) {
        if (init)
            Object.assign(this, init);
    }
}

export const StorableModule = getModule(Storable);
