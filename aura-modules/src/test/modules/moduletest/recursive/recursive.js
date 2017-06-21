import { Element } from 'engine';
export default class Foo extends Element {
    constructor() {
        super();
        this.state.title = 'recursive test';
        this.state.items = [
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