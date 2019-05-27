<template>
  <div>
    <v-toolbar flat color="white">
      <v-btn color="success" @click="create()">新しいゲーム</v-btn>
      <v-btn color="success" @click="assignAll()">ｽﾍﾞﾃﾗﾝﾀﾞﾑ</v-btn>
      <v-btn
        color="success"
        :disabled="newGame.results.length==0"
        @click="assignRandomWeapons"
      >ﾗﾝﾀﾞﾑﾌﾞｷ</v-btn>
      <v-btn
        color="warning"
        :disabled="newGame.results.length==0"
        @click="assignRandomWeaponsOperation"
      >ﾁｬｰｼﾞｬｰﾀﾞｹｶｸﾘﾂﾊﾝﾌﾞﾝ</v-btn>
    </v-toolbar>
    <v-toolbar flat color="white">
      <v-btn
        color="success"
        :disabled="newGame.results.length==0"
        @click="assignRandomStage"
      >ﾗﾝﾗﾑｽﾃｰｼﾞ</v-btn>
      <v-btn
        color="success"
        :disabled="newGame.results.length==0"
        @click="assignRandomRule"
      >ﾗﾝﾀﾞﾑﾙｰﾙ</v-btn>
    </v-toolbar>
    <v-toolbar flat color="white">
      <v-btn color="error" :disabled="newGame.results.length==0" @click="record('A')">A勝利</v-btn>
      <v-btn color="info" :disabled="newGame.results.length==0" @click="record('B')">B勝利</v-btn>
    </v-toolbar>

    <span class="cyan lighten-4">色付きは継続</span>
    <div>
      <div>
        GAMEID:{{newGame.id|short}} |
        DATE:{{newGame.createdAt|formatted}}
      </div>
      <div>
        STAGE:{{newGame.stage.name.ja_JP}} |
        RULE:{{newGame.rule.name.ja_JP}}
      </div>
    </div>
    <v-data-table
      :headers="headers"
      :items="newGame.results"
      class="elevation-1"
      item-key="id"
      hide-headers
      hide-actions
    >
      <template v-slot:items="props">
        <tr>
          <td class="team">{{ props.item.getTeamName()}}</td>
          <td
            class="name"
            :class="{'cyan lighten-4':isContinuousPlayer( props.item.player)}"
          >{{ props.item.player.name }}</td>
          <td class="weaponName">{{ props.item.weapon!=null?props.item.weapon.name.ja_JP:""}}</td>
          <!-- <td class>{{ getAggregateGameCountAndWinRates(props.item.player).gameCount}}</td>
          <td class>{{ getAggregateGameCountAndWinRates(props.item.player).winRate}}</td>-->
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { DataTableHeader } from "@/models/Defs";
import { ConstantModule } from "@/store/modules/Constant";
import {
  StorableModule,
  Player,
  Game,
  History
} from "@/store/modules/Storable";
export default Vue.extend({
  data() {
    return {
      pagination: {
        rowsPerPage: 15
      },
      rowsPerPageItems: [
        5,
        10,
        15,
        25,
        { text: "$vuetify.dataIterator.rowsPerPageAll", value: -1 }
      ],
      newPlayerDialog: false,
      headers: [
        new DataTableHeader({
          text: "チーム",
          align: "left"
        }),
        new DataTableHeader({
          text: "名前",
          align: "left",
          value: "name"
        }),
        new DataTableHeader({
          text: "ブキ",
          value: "weapon",
          align: "left"
          // }),
          // new DataTableHeader({
          //   text: "参戦数",
          //   value: "gameCount",
          //   align: "left"
          // }),
          // new DataTableHeader({
          //   text: "勝率",
          //   value: "winRate",
          //   align: "left"
        })
      ]
    };
  },
  methods: {
    assignRandomWeapons() {
      StorableModule.assignRandomWeapons();
    },
    assignRandomWeaponsOperation() {
      StorableModule.assignRandomWeaponsOperation();
    },
    assignRandomStage() {
      StorableModule.assignRandomStage();
    },
    assignRandomRule() {
      StorableModule.assignRandomRule();
    },
    assignAll() {
      this.create();
      this.assignRandomWeapons();
      this.assignRandomStage();
      this.assignRandomRule();
    },
    record(team) {
      StorableModule.assignWinning(team);
      confirm("結果を保存しますか？") && this.registering();
      console.log(StorableModule.StoredObject.gameManager.games);
    },
    create() {
      StorableModule.initGame();
    },
    registering() {
      StorableModule.registering();
    },
    isContinuousPlayer(player) {
      let result = this.aggregatesResultLatest.results.find(e => {
        return e.player.name == player.name;
      });
      if (result)
        if (
          result.team == TEAM_A ||
          result.team == TEAM_B ||
          result.team == TEAM_WATHCING
        )
          if (result) return true;
      return false;
    },
    getAggregateGameCountAndWinRates(player) {
      let find = this.aggregateGameCountAndWinRates.find(e => {
        return e.playerName == player.name;
      });
      if (find)
        return new AggregateGameCountAndWinRates(find.gameCount, find.winCount);
      return new AggregateGameCountAndWinRates();
    }
  },
  watch: {},
  computed: {
    newGame() {
      return StorableModule.StoredObject.gameManager.newGame;
    },
    gameManager() {
      return StorableModule.StoredObject.gameManager;
    },

    aggregateGameCountAndWinRates() {
      const group = StorableModule.latestDateflatResults.reduce(
        (result, current) => {
          const element = result.find(
            p => p.playerName === current.player.name
          );
          if (element) {
            if (!current.isSpector()) {
              element.gameCount++; // count
              element.winCount += current.isWin() ? 1 : 0; // sum
            }
          } else {
            let a = new AggregateGameCountAndWinRates();
            a.playerName = current.player.name;
            a.gameCount = current.isSpector() ? 0 : 1;
            a.winCount = current.isWin() ? 1 : 0;
            result.push(a);
          }
          return result;
        },
        []
      );
      return group;
    },
    aggregatesResult() {
      const group = StorableModule.todayResults.reduce((result, current) => {
        const element = result.find(p => p.gameId === current.gameId);
        if (element) {
          element.results.push(current);
        } else {
          let a = new AggregatesResultPlayer();
          a.gameId = current.gameId;
          a.createdAt = current.createdAt;
          a.results.push(current);
          result.push(a);
        }
        return result;
      }, []);
      return group;
    },
    aggregatesResultLatest() {
      let result = this.aggregatesResult.slice().sort((a, b) => {
        return moment(b.createdAt).diff(moment(a.createdAt));
      });
      return result.length > 0 ? result[0] : new AggregatesResultPlayer();
    }
  },
  created() {},
  destroyed() {
    StorableModule.save();
  },
  components: {}
});

class AggregatesResultPlayer {
  constructor(gameId = "", createdAt = "") {
    this.gameId = gameId;
    this.createdAt = createdAt;
    this.results = [];
  }
}

class AggregateGameCountAndWinRates {
  constructor(playerName = "", gameCount = 0, winCount = 0) {
    this.playerName = playerName;
    this.gameCount = gameCount;
    this.winCount = winCount;
  }
  get winRate() {
    if (this.winCount == 0 || this.gameCount == 0) return 0;
    return this.winCount / this.gameCount;
  }
}

const TEAM_A = 0;
const TEAM_B = 1;
const TEAM_WATHCING = 2;
</script>