import { LightningElement, track, wire } from 'lwc';
import { OBJECT } from 'securemoduletest/moduleLockerizedExports';

export default class SecureDecoratorComponent extends LightningElement {
    @track
    state = {
        boolean: true,
        null: null,
        undefined: undefined,
        internalObject: {
            number: 123,
            string: 'Hello!',
            symbol: Symbol('ABC')
        }
    };

    @wire(OBJECT, { boolean: true, null: null, undefined: undefined, number: 123, string: 'Hello!', array: ['One', 'Two']})
    dataObject;
}
