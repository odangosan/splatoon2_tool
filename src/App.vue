<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>SPLATOON2 UTILITY TOOL</span>
      </v-toolbar-title>
      <v-divider class="mx-2" inset vertical></v-divider>
      <v-spacer></v-spacer>
      <v-btn color="warning" @click="refreshHistory()">戦績を消す</v-btn>
      <v-btn color="warning" @click="refresh()">データを全て消す</v-btn>
    </v-toolbar>

    <v-content>
      <v-tabs dark color="cyan" show-arrows>
        <v-tabs-slider color="red"></v-tabs-slider>
        <v-tab :href="'#tab-game'">ゲーム作成</v-tab>
        <v-tab :href="'#tab-result'">戦績一覧</v-tab>
        <v-tab :href="'#tab-stage'">ステージ一覧</v-tab>
        <v-tab :href="'#tab-rule'">ルール一覧</v-tab>
        <v-tab :href="'#tab-weapon'">ブキ一覧</v-tab>
        <v-tab :href="'#tab-main'">プレイヤー一覧</v-tab>
        <v-tab :href="'#tab-about'">使い方</v-tab>
        <!-- <v-tab v-for="i in selected" :key="i.name" :href="'#tab-' + i.name">{{ i.name }}</v-tab> -->

        <v-tabs-items>
          <v-tab-item :value="'tab-game'">
            <game-tab></game-tab>
          </v-tab-item>
          <v-tab-item :value="'tab-result'">
            <result-tab></result-tab>
          </v-tab-item>
          <v-tab-item :value="'tab-stage'">
            <stage-tab></stage-tab>
          </v-tab-item>
          <v-tab-item :value="'tab-rule'">
            <rule-tab></rule-tab>
          </v-tab-item>
          <v-tab-item :value="'tab-weapon'">
            <weapon-tab></weapon-tab>
          </v-tab-item>
          <v-tab-item :value="'tab-main'">
            <player-tab></player-tab>
          </v-tab-item>
          <v-tab-item :value="'tab-about'">
            <v-card>
              <v-card-title>使い方</v-card-title>
              <v-card-text>「プレイヤー一覧」でプレイヤーを登録</v-card-text>
              <v-card-text>下のテキストエリアにタブ区切りのデータを入力して登録することも可能</v-card-text>
              <v-card-text>ステージなど、使いたいものを選択</v-card-text>
              <v-card-text>「ゲーム作成」の「新しいゲームを作成」、もしくは「ｽﾍﾞﾃﾗﾝﾀﾞﾑ」を押す</v-card-text>
              <v-card-text>「新しいゲームを作成」→プレイヤーの割り振りだけ</v-card-text>
              <v-card-text>結果が出たら「A勝利」「B勝利」のいずれかを押す</v-card-text>
              <v-card-text>戦績一覧に追加される</v-card-text>
              <v-card-text>※ランダム計算は過去の履歴を参照していないため重複有</v-card-text>
            </v-card>
          </v-tab-item>
          <!-- <v-tab-item v-for="i in selected" :key="i.name" :value="'tab-' + i.name">
            <div>{{selected}}</div>
          </v-tab-item>-->
        </v-tabs-items>
      </v-tabs>
    </v-content>
  </v-app>
</template>

 <script>
import Vue from "vue";
import PlayerTab from "@/components/PlayerTab";
import GameTab from "@/components/GameTab";
import WeaponTab from "@/components/Weapon";
import RuleTab from "@/components/Rule";
import StageTab from "@/components/Stage";
import ResultTab from "@/components/ResultTab";
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
    return {};
  },
  methods: {
    async refreshHistory() {
      confirm("戦績を削除しますか？") && (await StorableModule.deleteResult());
    },
    async refresh() {
      confirm("削除しますか？") &&
        ((await StorableModule.refresh()) && (await ConstantModule.refresh()));
    }
  },
  created() {
    StorableModule.load();
    ConstantModule.load();
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
    }
  },
  components: { PlayerTab, WeaponTab, RuleTab, StageTab, GameTab, ResultTab }
});
</script>
 <style lang="scss" >
table.v-table tbody td,
table.v-table tbody th,
table.v-datatable {
  height: 18px;
  .name {
    width: 75px;
    padding: 0px 4px !important;
  }
  .weaponName {
    width: 250px;
    padding: 0px 4px !important;
  }
  .team {
    width: 10px;
    padding: 0px 4px !important;
  }
}
</style>