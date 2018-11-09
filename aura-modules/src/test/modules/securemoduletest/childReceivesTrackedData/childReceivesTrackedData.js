import { LightningElement, api } from 'lwc';
import * as testUtil from 'securemoduletest/testUtil';
const NAMESPACE = 'secureModuleTest';
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
    childVerifyPublicPropertyDataTypes() {
        assertIsSecureObject(this.valueFromParent.domElement);
        assertIsSecureWindow(this.valueFromParent.win);
        assertIsSecureDocument(this.valueFromParent.doc);
        assertIsSecureBody(this.valueFromParent.body);
        testUtil.assertEquals('foobar', this.valueFromParent.string);
        testUtil.assertEquals(1, this.valueFromParent.number);
        testUtil.assertEquals(true, this.valueFromParent.boolean);
    }

    @api
    verifyPublicPropertyDataIsReadOnlyInGrandChild() {
        const grandChild = this.template.querySelector('[id^="grand-child"]');
        grandChild.valueFromParent = this.valueFromParent;
        grandChild.verifyPublicPropertyDataIsReadOnly();
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
        data.fromChild = {
            win: window,
            doc: document,
            body: document.body,
            domElement: document.createElement('div')                
        };
        return data;
    }

    @api
    receiveDataAndMutateValueInGrandChild(data) {
        const grandChild = this.template.querySelector('[id^="grand-child"]');
        return grandChild.receiveDataAndMutateValue(data);
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