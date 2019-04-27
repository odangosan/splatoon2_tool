import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators'
interface StoreType {
    Counter2: Counter2
}
// Declare empty store first
const store = new Vuex.Store<StoreType>({})
@Module({ dynamic: true, store: store, name: "Counter2", namespaced: true })
export default class Counter2 extends VuexModule {
    count: number = 0;

    @Mutation
    increment(delta: number) {
        this.count += delta;
        console.log(this.count);

    }
    @Mutation
    decrement(delta: number) {
        this.count -= delta
        console.log(this.count);
    }

    // action 'incr' commits mutation 'increment' when done with return value as payload
    @Action({ commit: 'increment' })
    incr() {
        return 5
    }
    // action 'decr' commits mutation 'decrement' when done with return value as payload
    @Action({ commit: 'decrement' })
    decr() {
        return 5
    }
}

export const Counter2Module = getModule(Counter2);