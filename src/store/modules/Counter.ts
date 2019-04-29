import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators'

const COUNT_KEY: string = "COUNT_KEY";
let aa = 333;
// Declare empty store first
class A {
    b: B[] = [new B("111"), new B("222")]
}
class B {
    constructor(public name: string) { }
}
const store = new Vuex.Store({})

@Module({ dynamic: true, store: store, name: "Counter", namespaced: true })
export default class Counter extends VuexModule {
    count: number = 0;
    ar: A = new A();

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
    }
    // action 'decr' commits mutation 'decrement' when done with return value as payload
    @Action
    decr() {
        this.decrement(5);
    }
    @Action
    save() {
        console.log("start save.");

        localStorage.setItem(COUNT_KEY, this.count.toString());
        console.log("count", this.count);

        var r = JSON.stringify(this.ar);
        console.log(r);

        localStorage.setItem("OB", r);
    }
    @Action
    load() {
        console.log("start load.");
        let value = localStorage.getItem(COUNT_KEY);
        let valueNum = Number(value);
        this.SET_VALUE(valueNum);

        var r = localStorage.getItem("OB");
        console.log(r);
        if (r != null) {
            var rr = JSON.parse(r) as A;
            console.log(rr);
            console.log(rr.b[1]);
        }
        console.log(this.ge("222"));


    }
    get ge() {
        return (e: string) => {
            return this.ar.b[1].name == e;
        }
    }
}

export const CounterModule = getModule(Counter);

export function MyDecorator(target: Counter, name: string, descriptor: PropertyDescriptor) {
    console.log("Decoratorをつけたメソッドが定義されたときに呼ばれます。");
    const method = descriptor.value;//もともとのメソッドを退避しておきます。
    descriptor.value = function () {
        console.log("メソッド実行前に呼ばれます。");
        //こんなふうに、アノテーションを付けた元のメソッドを実行
        const ret = method.apply(this, arguments);
        target.save();
        console.log("メソッド実行後に呼ばれます");
        return ret;
    }
}