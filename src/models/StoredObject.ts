export interface StoredObjectMethods {
    load(): void;
    save(): void;
    STORED_OBJECT_KEY: string;
}