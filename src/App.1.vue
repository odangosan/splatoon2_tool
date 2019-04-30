<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Vuetify</span>
        {{aaa}}
        {{aa}}
        <span class="font-weight-light">MATERIAL DESIGN {{count}}</span>
        <v-btn outline color="primary" dark @click="add()">add</v-btn>
        <v-btn outline color="primary" dark @click="desc()">desc</v-btn>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat href="https://github.com/vuetifyjs/vuetify/releases/latest" target="_blank">
        <span class="mr-2">Latest Release</span>
      </v-btn>
    </v-toolbar>

    <v-content>
      <HelloWorld/>
    </v-content>
  </v-app>
</template>

<script>
import Vue from "vue";

export default {
  data() {
    return {
      aa: "gtggg"
    };
  },
  props: {
    aaa: {
      type: String
    }
  },
  methods: {
    add() {
      CounterModule.incr(1);
    },
    desc() {
      CounterModule.decr(1);
    },
    destroyed() {
      CounterModule.save();
    },
    mounted() {
      CounterModule.load();
    }
  },
  computed: {
    count() {
      return CounterModule.count;
    }
  }
};
</script>
