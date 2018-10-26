import { LightningElement, api } from 'lwc';
import * as testUtil from 'securemoduletest/testUtil';

export default class GrandChildReceivesData extends LightningElement {
    @api valueFromParent;

    @api
    verifyPublicPropertyDataIsReadOnly() {
        try {
            this.valueFromParent.title = 'Grand Child mutated the value';
        } catch (e) {
            testUtil.assertEquals(
                'Invalid mutation: Cannot set "title" on "[object Object]". "[object Object]" is read-only.',
                e.message
            );
        }
    }

    @api
    receiveDataAndMutateValue(data) {
        // Mutate received value in grand child
        data.title = '[Updated by grand child]' + data.title;
        data.headings.item1 = '[Updated by grand child]' + data.headings.item1;
        return data;
    }
}