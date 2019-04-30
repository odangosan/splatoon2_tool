import Vue from 'vue';
import Vuex from 'vuex';
import Axios from 'axios';
import { StoredObjectMethods } from "@/models/StoredObject"
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators'

export class StoredConstantObject {
    timestamp: number = 0;
    ruleRoots: RuleRoot[] = [];
    weaponRoots: WeaponRoot[] = [];
    stageRoots: StageRoot[] = [];
    constructor() { }
}
const STORED_OBJECT_KEY = "STORED_OBJECT_KEY_CONSTANT"
@Module({ name: "Constant", namespaced: true })
export default class Constant extends VuexModule implements StoredObjectMethods {
    storedConstantObject: StoredConstantObject = new StoredConstantObject();
    storedConstantObjectSelected: StoredConstantObject = new StoredConstantObject();
    get KEY() {
        return this.storedConstantObjectSelected.ruleRoots.toString() +
            this.storedConstantObjectSelected.weaponRoots.toString() +
            this.storedConstantObjectSelected.stageRoots.toString();
    }
    @Mutation
    SET_STORED(value: StoredConstantObject) {
        console.log(value);
        this.storedConstantObject = value;
    }

    @Action
    async fetchRules() {
        let url = "https://stat.ink/api/v2/rule";
        let result = await Axios.get(url);
        this.storedConstantObject.ruleRoots = [];
        if (result.status = 200) {
            this.storedConstantObject.ruleRoots = result.data as RuleRoot[];
        }
    } @Action
    async fetchWeapons() {
        let url = "https://stat.ink/api/v2/weapon";
        let result = await Axios.get(url);
        this.storedConstantObject.weaponRoots = [];
        if (result.status = 200) {
            this.storedConstantObject.weaponRoots = result.data as WeaponRoot[];
        }
    } @Action
    async fetchStages() {
        let url = "https://stat.ink/api/v2/stage";
        let result = await Axios.get(url);
        this.storedConstantObject.stageRoots = [];
        if (result.status = 200) {
            this.storedConstantObject.stageRoots = result.data as StageRoot[];
        }
    }
    @Action
    async load() {
        console.log("start load.");
        let storedObject = localStorage.getItem(STORED_OBJECT_KEY);
        const loading = async () => {
            console.log("new.");
            await this.fetchRules();
            await this.fetchWeapons();
            await this.fetchStages();
        }
        if (storedObject != null) {
            console.log("already.");
            this.SET_STORED(JSON.parse(storedObject) as StoredConstantObject)
            if (this.storedConstantObject.timestamp > new Date().getTime() + 1000 * 60 * 60 * 24) {
                await loading();
            }
        } else {
            await loading();
        }
        console.log("rules", this.storedConstantObject.ruleRoots);
        console.log("weapons", this.storedConstantObject.weaponRoots);
        this.storedConstantObject.weaponRoots.filter(e => {
            return e.reskin_of != null;
        }).forEach(e => {
            // console.log(e.key);
        })
        this.storedConstantObject.weaponRoots = this.storedConstantObject.weaponRoots.filter(e => {
            return e.reskin_of == null;
        })

        this.storedConstantObject.weaponRoots.filter(e => {
            return e.key.includes("scope");
        }).forEach(e => {
            // console.log(e.key);
        })
        this.storedConstantObject.weaponRoots = this.storedConstantObject.weaponRoots.filter(e => {
            return !e.key.includes("scope");
        })
        console.log("remove duplicate weapons", this.storedConstantObject.weaponRoots);
        console.log("stages", this.storedConstantObject.stageRoots);
        this.save();
    }
    @Action
    async save() {
        console.log("start save.");
        this.storedConstantObject.timestamp = new Date().getTime();
        var storedObject = JSON.stringify(this.storedConstantObject);
        localStorage.setItem(STORED_OBJECT_KEY, storedObject);
    }
}

export const ConstantModule = getModule(Constant);

export interface Name {
    de_DE: string;
    en_GB: string;
    en_US: string;
    es_ES: string;
    es_MX: string;
    fr_CA: string;
    fr_FR: string;
    it_IT: string;
    ja_JP: string;
    nl_NL: string;
    ru_RU: string;
}

export interface Name2 {
    de_DE: string;
    en_GB: string;
    en_US: string;
    es_ES: string;
    es_MX: string;
    fr_CA: string;
    fr_FR: string;
    it_IT: string;
    ja_JP: string;
    nl_NL: string;
    ru_RU: string;
}

export class Rule {
    key!: string;
    name!: Name2;
}

export interface RuleRoot {
    key: string;
    name: Name;
    rules: Rule[];
}



export interface Category {
    key: string;
    name: Name2;
}

export interface Type {
    key: string;
    name: Name;
    category: Category;
}

export interface Name3 {
    de_DE: string;
    en_GB: string;
    en_US: string;
    es_ES: string;
    es_MX: string;
    fr_CA: string;
    fr_FR: string;
    it_IT: string;
    ja_JP: string;
    nl_NL: string;
    ru_RU: string;
}

export interface Name4 {
    de_DE: string;
    en_GB: string;
    en_US: string;
    es_ES: string;
    es_MX: string;
    fr_CA: string;
    fr_FR: string;
    it_IT: string;
    ja_JP: string;
    nl_NL: string;
    ru_RU: string;
}

export interface Sub {
    key: string;
    name: Name4;
}

export interface Name5 {
    de_DE: string;
    en_GB: string;
    en_US: string;
    es_ES: string;
    es_MX: string;
    fr_CA: string;
    fr_FR: string;
    it_IT: string;
    ja_JP: string;
    nl_NL: string;
    ru_RU: string;
}

export interface Special {
    key: string;
    name: Name5;
}

export class WeaponRoot {
    key!: string;
    splatnet!: number;
    type!: Type;
    name!: Name3;
    sub!: Sub;
    special!: Special;
    reskin_of!: string;
    main_ref!: string;
}



export interface ShortName {
    de_DE: string;
    en_GB: string;
    en_US: string;
    es_ES: string;
    es_MX: string;
    fr_CA: string;
    fr_FR: string;
    it_IT: string;
    ja_JP: string;
    nl_NL: string;
    ru_RU: string;
}

export interface ReleaseAt {
    time: number;
    iso8601: Date;
}

export class StageRoot {
    key!: string;
    splatnet!: number;
    name!: Name;
    short_name!: ShortName;
    area?: number;
    release_at!: ReleaseAt;
}
