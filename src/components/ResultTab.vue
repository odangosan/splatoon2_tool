<template>
  <div>
    <v-toolbar flat color="white">
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="results"
      class="elevation-1"
      item-key="id"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
    >
      <template v-slot:items="props">
        <tr>
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
          value: "createdAt"
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
      ]
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
    }
  },
  created() {},
  destroyed() {},
  components: {}
});
</script>


