declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}
declare module 'vuetify/lib';
declare module "*.svg" {
  const value: any;
  export = value;
}