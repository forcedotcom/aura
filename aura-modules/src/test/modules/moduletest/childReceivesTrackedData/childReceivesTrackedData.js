import { LightningElement, api } from 'lwc';
import * as testUtil from 'securemoduletest/testUtil';

export default class ChildReceivesTrackedData extends LightningElement {
    @api
    valueFromParent;

    @api
    verifyPublicPropertyDataIsReadOnly() {
        try {
            this.valueFromParent.title = 'Child mutated the value';
        } catch (e) {
            testUtil.assertEquals(
                'Invalid mutation: Cannot set "title" on "[object Object]". "[object Object]" is read-only.',
                e.message
            );
        }
    }

    @api
    verifyPublicPropertyDataIsLive(field, expected) {
        testUtil.assertEquals(expected, this.valueFromParent[field]);
    }

    @api
    receiveDataAndMutateValue(data) {
        // Mutate received value in child
        data.title = '[Updated by child]' + data.title;
        data.headings.item1 = '[Updated by child]' + data.headings.item1;
        return data;
    }
}