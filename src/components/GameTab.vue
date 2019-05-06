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
        })
      ]
    };
  },
  methods: {
    assignRandomWeapons() {
      StorableModule.assignRandomWeapons();
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
    },
    create() {
      StorableModule.initGame();
    },
    registering() {
      StorableModule.registering();
    },
    isContinuousPlayer(player) {
      if (this.aggregatesResultLatest) {
        let result = this.aggregatesResultLatest.player.find(e => {
          return e.name == player.name;
        });
        if (result) return true;
      }
      return false;
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
    aggregatesResult() {
      const group = StorableModule.flatResults.reduce((result, current) => {
        const element = result.find(p => p.gameId === current.gameId);
        if (element) {
          element.player.push(current.player);
        } else {
          let a = new aggregatesResultPlayer();
          a.gameId = current.gameId;
          a.createdAt = current.createdAt;
          a.player.push(current.player);
          result.push(a);
        }
        return result;
      }, []);
      return group;
    },
    aggregatesResultLatest() {
      let result = this.aggregatesResult.slice().sort((a, b) => {
        return moment(b.createdAt).diff(moment(a.createdAt));
      })[0];
      return result;
    }
  },
  created() {},
  destroyed() {
    StorableModule.save();
  },
  components: {}
});

class aggregatesResultPlayer {
  constructor(gameId = "", createdAt = "") {
    this.gameId = gameId;
    this.createdAt = createdAt;
    this.player = [];
  }
}
</script>


