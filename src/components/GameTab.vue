<template>
  <div>
    <v-toolbar flat color="white">
      <v-btn color="success" @click="create()">新しいゲーム</v-btn>
      <v-btn color="success" @click="assignAll()">ｽﾍﾞﾃﾗﾝﾀﾞﾑ</v-btn>
      <v-btn color="success" @click="assignRandomWeapons()">ﾗﾝﾀﾞﾑﾌﾞｷ</v-btn>
      <v-btn color="success" @click="assignRandomStage()">ﾗﾝﾗﾑｽﾃｰｼﾞ</v-btn>
      <v-btn color="success" @click="assignRandomRule()">ﾗﾝﾀﾞﾑﾙｰﾙ</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="error" @click="record('A')">A勝利</v-btn>
      <v-btn color="info" @click="record('B')">B勝利</v-btn>
    </v-toolbar>
    <div>
      <span>
        {{temporaryGame.createdAt.format("MM/DD hh:mm:ss")}}:
        {{temporaryGame.stage.name.ja_JP}}:
        {{temporaryGame.rule.name.ja_JP}}
      </span>
    </div>
    <v-data-table
      :headers="headers"
      :items="temporaryGame.teamA"
      class="elevation-1"
      item-key="id"
      hide-headers
      hide-actions
    >
      <template v-slot:items="props">
        <tr>
          <td class="team">A</td>
          <td class="name">{{ props.item.player.name }}</td>
          <td class="weaponName">{{ props.item.weapon!=null?props.item.weapon.name.ja_JP:""}}</td>
        </tr>
      </template>
    </v-data-table>
    <v-data-table
      :headers="headers"
      :items="temporaryGame.teamB"
      class="elevation-1"
      item-key="id"
      hide-headers
      hide-actions
    >
      <template v-slot:items="props">
        <tr>
          <td class="team">B</td>
          <td class="name">{{ props.item.player.name }}</td>
          <td class="weaponName">{{ props.item.weapon!=null?props.item.weapon.name.ja_JP:""}}</td>
        </tr>
      </template>
    </v-data-table>
    <v-data-table
      :headers="headers"
      :items="temporaryGame.spector"
      class="elevation-1"
      item-key="id"
      hide-headers
      hide-actions
    >
      <template v-slot:items="props">
        <tr>
          <td class="team">--</td>
          <td class="name">{{ props.item.player.name }}</td>
          <td class="weaponName">----------</td>
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
      ],
      temporaryGame: new Game()
    };
  },
  methods: {
    create() {
      let game = new Game();
      game.assignPlayers();
      this.temporaryGame = game;
    },
    assignRandomWeapons() {
      this.temporaryGame.assignRandomWeapons();
    },
    assignRandomStage() {
      this.temporaryGame.assignRandomStage();
    },
    assignRandomRule() {
      this.temporaryGame.assignRandomRule();
    },
    assignAll() {
      this.assignRandomWeapons();
      this.assignRandomStage();
      this.assignRandomRule();
    },
    record(team) {
      if (team == "A") {
        console.log("win A");
      } else {
        console.log("win B");
      }
    },
    save() {
      StorableModule.addGame(this.temporaryGame);
    }
  },
  watch: {
    watchedStore(newValue, oldValue) {
      StorableModule.save();
    },
    deep: true
  },
  computed: {
    watchedStore() {
      return StorableModule.KEY;
    },
    players() {
      return StorableModule.StoredObject.players;
    },
    selectedPlayers: {
      set: function(newValue) {
        StorableModule.SET_PLAYERS_SELECTED(newValue);
      },
      get: function() {
        return StorableModule.StoredObject.selectedPlayers;
      }
    }
  },
  created() {},
  destroyed() {
    StorableModule.save();
  },
  components: {}
});
</script>

 <style lang="scss" scoped>
table.v-table tbody td,
table.v-table tbody th,
table.v-datatable {
  padding: 0px 4px;
  height: 18px;
  .name {
    width: 90px;
  }
  .weaponName {
    width: 250px;
  }
  .team {
    width: 18px;
  }
}
</style>
