<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>SPLATOON2 UTILITY TOOL</span>
      </v-toolbar-title>
      <v-divider class="mx-2" inset vertical></v-divider>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content>
      <v-tabs dark color="cyan" show-arrows>
        <v-tabs-slider color="red"></v-tabs-slider>
        <v-tab :href="'#tab-stage'">ステージ一覧</v-tab>
        <v-tab :href="'#tab-rule'">ルール一覧</v-tab>
        <v-tab :href="'#tab-weapon'">ブキ一覧</v-tab>
        <v-tab :href="'#tab-main'">プレイヤー一覧</v-tab>
        <!-- <v-tab v-for="i in selected" :key="i.name" :href="'#tab-' + i.name">{{ i.name }}</v-tab> -->

        <v-tabs-items>
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
import WeaponTab from "@/components/Weapon";
import RuleTab from "@/components/Rule";
import StageTab from "@/components/Stage";
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
  created() {
    StorableModule.load();
    ConstantModule.load();
  },
  components: { PlayerTab, WeaponTab, RuleTab, StageTab }
});
</script>
