<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Vuetify</span>
        <span class="font-weight-light">MATERIAL DESIGN {{count}}</span>
      <v-btn outline color="primary" dark  @click="add()">add</v-btn>
      <v-btn outline color="primary" dark  @click="desc()">desc</v-btn>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        flat
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
      >
        <span class="mr-2">Latest Release</span>
      </v-btn>
    </v-toolbar>

    <v-content>
      <HelloWorld />
    </v-content>
  </v-app>
</template>

<script>
import HelloWorld from "./components/HelloWorld";
import { Component, Vue } from "vue-property-decorator";
import { CounterModule } from "@/store/modules/Counter";
import { Counter2Module } from "@/store/modules/Counter2";

@Component({
  components: {
    HelloWorld
  }
})
export default class App extends Vue {
  add() {
    CounterModule.increment(1);
  }
  desc() {
    CounterModule.decrement(1);
  }
  get count() {
    return Counter2Module.count;
  }
}
</script>
