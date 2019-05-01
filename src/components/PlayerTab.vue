<template>
  <div>
    <v-toolbar flat color="white">
      <v-text-field v-model="search" append-icon="search" label="Search" hide-details></v-text-field>
      <v-spacer></v-spacer>
      <v-btn color="success" @click="reset">選択をリセット</v-btn>

      <v-dialog v-model="newPlayerDialog" max-width="600px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark class="mb-2" v-on="on">新しいプレイヤーを登録する</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap row>
                <v-flex xs12 sm12>
                  <v-text-field v-model="editedItem.name" label="名前"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-checkbox v-model="editedItem.star" label="★"></v-checkbox>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.rank" type="number" label="ランク"></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field v-model="editedItem.comment" label="コメント"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="save">保存</v-btn>
            <v-btn color="blue darken-1" flat @click="close">キャンセル</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-data-table
      v-model="selectedPlayers"
      :headers="headers"
      :items="players"
      class="elevation-1"
      select-all
      item-key="id"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      :search="search"
    >
      <template v-slot:items="props">
        <td>
          <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
        </td>
        <td>{{ props.item.name }}</td>
        <td class="text-xs-right">{{ props.item.rank }}</td>
        <td>{{ props.item.star?"★":"" }}</td>
        <td class="justify-center layout px-0">
          <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
          <v-icon small @click="deleteItem(props.item)">delete</v-icon>
        </td>
      </template>
    </v-data-table>
    <div>
      <v-container fluid grid-list-md>
        <v-toolbar flat color="white">
          <v-btn color="success" @click="importExcel">Excelから取り込む</v-btn>
        </v-toolbar>
        <v-textarea
          v-model="importText"
          name="input-7-1"
          box
          label="キャラクター名　プレイヤー名　★　ランク　改行"
          auto-grow
        ></v-textarea>
      </v-container>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { DataTableHeader } from "@/models/Defs";
import { ConstantModule } from "@/store/modules/Constant";
import {
  StorableModule,
  Player,
  Game,
  History
} from "@/store/modules/Storable";
const NEW_ENTRY_INDEX = -1;
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
      search: "",
      text: "test",
      newPlayerDialog: false,
      headers: [
        new DataTableHeader({
          text: "名前",
          align: "left",
          value: "name"
        }),
        new DataTableHeader({ text: "ランク", value: "rank" }),
        new DataTableHeader({ text: "☆", value: "star", align: "left" })
      ],
      editedIndex: NEW_ENTRY_INDEX,
      editedItem: new Player(),
      defaultItem: new Player(),
      importText: ""
    };
  },
  methods: {
    save() {
      if (this.editedIndex > NEW_ENTRY_INDEX) {
        StorableModule.updatePlayer(this.editedItem);
      } else {
        StorableModule.addPlayer(this.editedItem);
      }
      this.close();
    },
    editItem(item) {
      console.log(item);
      this.editedIndex = this.players.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.newPlayerDialog = true;
    },
    deleteItem(item) {
      const index = this.players.indexOf(item);
      confirm("削除しますか？") && this.players.splice(index, 1);
    },
    close() {
      this.newPlayerDialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = NEW_ENTRY_INDEX;
      }, 300);
    },
    reset() {
      this.selectedPlayers = [];
    },
    importExcel() {
      this.importText.split("\n").forEach(e => {
        let t = e.split("\t");
        if (t.length != 4) return;
        let p = new Player({
          name: t[1],
          rank: t[3] != "" ? t[3] : 1,
          star: t[2] != ""
        });
        StorableModule.addPlayer(p);
      });
    }
  },
  watch: {
    newPlayerDialog(newValue, oldValue) {
      if (newValue) {
        if (this.editedIndex == NEW_ENTRY_INDEX) {
          this.editedItem = new Player();
        }
      } else {
        this.newPlayerDialog || this.close();
      }
    },
    watchedStore(newValue, oldValue) {
      StorableModule.save();
    },
    deep: true
  },
  computed: {
    watchedStore() {
      return StorableModule.KEY;
    },
    formTitle() {
      return this.editedIndex === NEW_ENTRY_INDEX ? "新規" : "編集";
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

<style>
</style>
