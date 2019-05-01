import Vue from "vue";
import './plugins/vuetify';
import App from "./App.vue";
import store from "@/store/index";
import moment from "moment"

Vue.config.productionTip = false;
Vue.filter('short', function (value: string) {
  return value.substring(0, 8);
})
Vue.filter('formatted', function (value: string) {
  return moment(value).format("MM/DD hh:mm:ss")
})
new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
