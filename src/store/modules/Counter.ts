import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators'
import { Counter2Module } from "@/store/modules/Counter2";

interface StoreType {
    Counter: Counter
}
const COUNT_KEY: string = "COUNT_KEY";
let aa = 333;
// Declare empty store first
const store = new Vuex.Store<StoreType>({})
@Module({ dynamic: true, store: store, name: "Counter", namespaced: true })
export default class Counter extends VuexModule {
    count: number = 0;

    @Mutation
    SET_VALUE(value: number) {
        this.count = value;
    }
    @Mutation
    increment(delta: number) {
        this.count += delta;
        // Counter2Module.increment(delta);
    }
    @Mutation
    decrement(delta: number) {
        this.count -= delta;
        // Counter2Module.decrement(delta);
    }

    // action 'incr' commits mutation 'increment' when done with return value as payload
    @Action
    incr() {
        this.increment(5);
        this.save();
    }
    // action 'decr' commits mutation 'decrement' when done with return value as payload
    @Action
    decr() {
        this.decrement(5);
        this.save();
    }
    @Action
    save() {
        localStorage.setItem(COUNT_KEY, this.count.toString());
        console.log("count", this.count);
    }
    @Action
    load() {
        let value = localStorage.getItem(COUNT_KEY);
        let valueNum = Number(value);
        this.SET_VALUE(valueNum);
    }
}

export const CounterModule = getModule(Counter);
