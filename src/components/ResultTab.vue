<template>
  <div>
    <v-toolbar flat color="white">
      <div>
        <p>検索で日付を指定、全て選択でその期間の戦績を集計可能</p>
      </div>
    </v-toolbar>
    <v-toolbar flat color="white">
      <div>
        <p>選択内対戦数：{{aggregatesResult.length}}</p>
      </div>
    </v-toolbar>
    <v-data-table
      :headers="headersSelected"
      :items="aggregates"
      class="elevation-1"
      item-key="playerName"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="paginationAggregates"
    >
      <template v-slot:items="props">
        <tr>
          <td>{{ props.item.playerName }}</td>
          <td>{{ props.item.battleCount }}</td>
          <td>{{ props.item.winCount }}</td>
          <td>{{ props.item.winRate }}</td>
        </tr>
      </template>
    </v-data-table>
    <v-toolbar flat color="white">
      <v-text-field v-model="search" append-icon="search" label="Search" hide-details></v-text-field>
      <v-spacer></v-spacer>
      <v-btn color="success" @click="reset">選択をリセット</v-btn>
    </v-toolbar>
    <v-data-table
      v-model="selectedResults"
      :headers="headers"
      :items="results"
      class="elevation-1"
      item-key="id"
      select-all
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      :search="search"
    >
      <template v-slot:items="props">
        <tr>
          <td>
            <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
          </td>
          <td>{{props.item.gameId|short}}</td>
          <td>{{props.item.formattedCreatedAt()}}</td>
          <td>{{props.item.stage.name.ja_JP}}</td>
          <td>{{props.item.rule.name.ja_JP}}</td>
          <td>{{props.item.isWinText}}</td>
          <td class="team">{{ props.item.getTeamName()}}</td>
          <td class="name">{{ props.item.player.name }}</td>
          <td class="weaponName">{{ props.item.weapon!=null?props.item.weapon.name.ja_JP:""}}</td>
          <td class="justify-center layout px-0">
            <v-icon class="mr-2" @click="deleteGame(props.item.gameId)">delete</v-icon>
          </td>
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
        rowsPerPage: 50
      },
      paginationAggregates: {
        rowsPerPage: 50
      },
      rowsPerPageItems: [
        10,
        50,
        100,
        200,
        { text: "$vuetify.dataIterator.rowsPerPageAll", value: -1 }
      ],
      newPlayerDialog: false,
      headers: [
        new DataTableHeader({
          text: "GAMEID",
          align: "left",
          value: "gameId"
        }),
        new DataTableHeader({
          text: "時間",
          align: "left",
          value: "createdAtSt"
        }),
        new DataTableHeader({
          text: "ステージ",
          align: "left",
          value: "stage.name.ja_JP"
        }),
        new DataTableHeader({
          text: "ルール",
          align: "left",
          value: "rule.name.ja_JP"
        }),
        new DataTableHeader({
          text: "勝敗",
          align: "left",
          value: "isWinText"
        }),
        new DataTableHeader({
          text: "所属チーム",
          align: "left",
          value: "team"
        }),
        new DataTableHeader({
          text: "名前",
          align: "left",
          value: "player.name"
        }),
        new DataTableHeader({
          text: "ブキ",
          value: "weapon.name.ja_JP",
          align: "left"
        })
      ],
      headersSelected: [
        new DataTableHeader({
          text: "名前",
          align: "left",
          value: "name"
        }),
        new DataTableHeader({
          text: "参戦数",
          value: "battleCount",
          align: "left"
        }),
        new DataTableHeader({
          text: "勝数",
          value: "winCount",
          align: "left"
        }),
        new DataTableHeader({
          text: "勝率",
          value: "winRate",
          align: "left"
        })
      ],
      selectedResults: [],
      search: ""
    };
  },
  methods: {
    reset() {
      this.selectedResults = [];
    },
    deleteGame(gameId) {
      confirm("この行の関連するゲーム戦績を削除しますか？") &&
        StorableModule.removeGame(gameId);
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
    games() {
      return StorableModule.StoredObject.gameManager.games;
    },
    results() {
      return StorableModule.flatResults;
    },
    aggregates() {
      const group = this.selectedResults.reduce((result, current) => {
        const element = result.find(p => p.playerName === current.player.name);
        if (element) {
          if (!current.isSpector()) {
            element.battleCount++; // count
            element.winCount += current.isWin() ? 1 : 0; // sum
          }
        } else {
          let a = new Aggregate();
          a.playerName = current.player.name;
          a.battleCount = current.isSpector() ? 0 : 1;
          a.winCount = current.isWin() ? 1 : 0;
          result.push(a);
        }
        return result;
      }, []);
      return group;
    },
    aggregatesResult() {
      const group = this.selectedResults.reduce((result, current) => {
        const element = result.find(p => p.gameId === current.gameId);
        if (element) {
        } else {
          let a = new aggregatesResultCount();
          a.gameId = current.gameId;
          a.createdAt = current.createdAt;
          result.push(a);
        }
        return result;
      }, []);
      return group;
    }
  },
  created() {},
  destroyed() {},
  components: {}
});
class aggregatesResultCount {
  constructor(gameId = "", createdAt = "") {
    this.gameId = gameId;
    this.createdAt = createdAt;
  }
}
class Aggregate {
  playerName = "";
  battleCount = 0;
  winCount = 0;
  get winRate() {
    if (this.winCount == 0 || this.battleCount == 0) return 0;
    return this.winCount / this.battleCount;
  }
}
</script>


