<template>
  <div>
    <v-toolbar flat color="white">
      <v-text-field v-model="search" append-icon="search" label="Search" hide-details></v-text-field>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-data-table
      v-model="selected"
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
        </tr>
      </template>
    </v-data-table>
    <v-data-table
      :headers="headersSelected"
      :items="aggregates"
      class="elevation-1"
      item-key="playerName"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
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
      rowsPerPageItems: [
        10,
        20,
        50,
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
      selected: [],
      search: ""
    };
  },
  methods: {},
  watch: {},
  computed: {
    watchedStore() {
      return StorableModule.KEY;
    },
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
      let results = [];
      StorableModule.StoredObject.gameManager.games.forEach(e => {
        results = results.concat(e.results);
      });
      return results;
    },
    aggregates() {
      const group = this.selected.reduce((result, current) => {
        const element = result.find(p => p.playerName === current.player.name);
        if (element) {
          if (!current.isSpector()) {
            element.battleCount++; // count
            element.winCount += current.isWin() ? 1 : 0; // sum
          }
        } else {
          let a = new Aggregate();
          a.playerName = current.player.name;
          a.battleCount = 1;
          a.winCount = current.isWin() ? 1 : 0;
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

class Aggregate {
  playerName = "";
  battleCount = 0;
  winCount = 0;
  get winRate() {
    try {
      return this.winCount / this.battleCount;
    } catch (e) {
      return 0;
    }
  }
}
</script>


