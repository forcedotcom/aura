import { Element } from 'engine';
export default class Foo extends Element {
    @track title = 'recursive test';
    @track items;

    constructor() {
        super();
        this.items = [
            {
                label: 'item1',
                items: [
                    { label: 'item1.1' },
                    { label: 'item1.2' }
                ]
            },
            { label: 'item2' }
        ];
    }
}