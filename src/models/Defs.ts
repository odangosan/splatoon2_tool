export class DataTableHeader {
    text?: string;
    value?: string;
    align?: "left" | "center" | "right";
    sortable?: boolean;
    class?: string[] | string;
    width?: string;
    constructor(value: Partial<DataTableHeader>) {
        Object.assign(this, value);
    }
}