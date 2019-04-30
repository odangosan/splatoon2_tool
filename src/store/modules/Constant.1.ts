import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators'
const store = new Vuex.Store({})

class Entity {
    private id: string = this.getRandomId();
    getRandomId() {
        return this.randomIdFactory() + "-" + this.randomIdFactory() + "-" + this.randomIdFactory();
    }
    private randomIdFactory() {
        return Math.random().toString(36).substr(2, 9);
    }
}

@Module({ dynamic: true, store: store, name: "Constant", namespaced: true })
export default class Constant extends VuexModule {
    get KEY() {
        // return this.StoredObject.users.toString() + this.StoredObject.games.toString() + this.StoredObject.histories.toString();
        return "";
    }
}

export const StorableModule = getModule(Constant);
