import { LightningElement, track } from "lwc";
export default class Foo extends LightningElement {
    @track title = 'recursive test';
    @track items;

    constructor() {
        super();
        this.items = [
            {
                id: "k1",
                label: 'item1',
                items: [
                    { id: "k1.1", label: 'item1.1', items: [] },
                    { id: "k1.2", label: 'item1.2', items: [] }
                ]
            },
            { id: "k2", label: 'item2', items: [] }
        ];
    }
}