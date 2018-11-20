import { LightningElement, api } from 'lwc';
import * as testUtil from 'securemoduletest/testUtil';

const NAMESPACE = 'secureModuleTest';
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
        // Verify that the data values are wrapped in the right locker key
        assertIsSecureObject(data.domElement);
        assertIsSecureWindow(data.win);
        assertIsSecureDocument(data.doc);
        assertIsSecureBody(data.body);

        // Mutate received value in grand child
        data.title = '[Updated by grand child]' + data.title;
        data.headings.item1 = '[Updated by grand child]' + data.headings.item1;
        return data;
    }
}

function assertIsSecureObject(el) {
    testUtil.assertEquals(
        true,
        `${el}`.startsWith('SecureObject:'),
        'Expected a SecureObject when accessing cross namespace dom elements'
    );
}

function assertIsSecureWindow(window) {
    testUtil.assertEquals(
        `SecureWindow: [object Window]{ key: {"namespace":"${NAMESPACE}"} }`,
        `${window}`,
        'Expected window to be a SecureWindow'
    );
}

function assertIsSecureDocument(doc) {
    testUtil.assertEquals(
        `SecureDocument: [object HTMLDocument]{ key: {"namespace":"${NAMESPACE}"} }`,
        `${doc}`,
        'Expected document to be a SecureDocument'
    );
}

function assertIsSecureBody(body) {
    testUtil.assertEquals(
        `SecureElement: [object HTMLBodyElement]{ key: {"namespace":"${NAMESPACE}"} }`,
        `${body}`,
        'Expected body to be a SecureElement: [object HTMLBodyElement]'
    );
}