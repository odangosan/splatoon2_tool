<template>
  <div>
    <v-toolbar flat color="white">
      <v-text-field v-model="search" append-icon="search" label="Search" hide-details></v-text-field>
      <v-spacer></v-spacer>
      <v-btn color="success" @click="reset">選択をリセット</v-btn>
    </v-toolbar>
    <v-data-table
      v-model="selectedWeapons"
      :headers="headers"
      :items="weapons"
      class="elevation-1"
      select-all
      item-key="key"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      :search="search"
    >
      <template v-slot:items="props">
        <td>
          <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
        </td>
        <td>{{ props.item.name.ja_JP }}</td>
        <td>{{ props.item.type.category.name.ja_JP }}</td>
        <td>{{ props.item.sub.name.ja_JP }}</td>
        <td>{{ props.item.special.name.ja_JP }}</td>
      </template>
    </v-data-table>
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
        rowsPerPage: -1
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
          value: "name.ja_JP"
        }),
        new DataTableHeader({
          text: "カテゴリー",
          align: "left",
          value: "type.category.name.ja_JP"
        }),
        new DataTableHeader({
          text: "サブ",
          align: "left",
          value: "sub.name.ja_JP"
        }),
        new DataTableHeader({
          text: "スペシャル",
          align: "left",
          value: "special.name.ja_JP"
        })
      ]
    };
  },
  methods: {
    reset() {
      this.selectedWeapons = [];
    }
  },
  watch: {
    watchedStore(newValue, oldValue) {
      ConstantModule.save();
    },
    deep: true
  },
  computed: {
    watchedStore() {
      return ConstantModule.KEY;
    },
    weapons() {
      return ConstantModule.weapons;
    },
    selectedWeapons: {
      set: function(newValue) {
        ConstantModule.SET_CONSTANT_WEAPON_SELECTED(newValue);
      },
      get: function() {
        return ConstantModule.storedObject.selected.weaponRoots;
      }
    }
  },
  created() {},
  destroyed() {
    ConstantModule.save();
  },
  components: {}
});
</script>

<style>
</style>
