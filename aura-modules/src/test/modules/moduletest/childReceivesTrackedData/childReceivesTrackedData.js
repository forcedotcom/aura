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
    childVerifyPublicPropertyDataTypes() {
        assertIsNotSecureElement(this.valueFromParent.domElement);
        assertIsNotSecureWindow(this.valueFromParent.win);
        assertIsNotSecureDocument(this.valueFromParent.doc);
        assertIsNotSecureBody(this.valueFromParent.body);
        testUtil.assertEquals('foobar', this.valueFromParent.string);
        testUtil.assertEquals(1, this.valueFromParent.number);
        testUtil.assertEquals(true, this.valueFromParent.boolean);
    }
    
    @api
    verifyPublicPropertyDataIsLive(field, expected) {
        testUtil.assertEquals(expected, this.valueFromParent[field]);
    }

    @api
    receiveDataAndMutateValue(data) {
        // Verify that the data is not leaking secure wrappers in the unsecure child
        assertIsNotSecureElement(data.domElement);
        assertIsNotSecureWindow(data.win);
        assertIsNotSecureDocument(data.doc);
        assertIsNotSecureBody(data.body);

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
}

function assertIsNotSecureElement(el) {
    testUtil.assertEquals(
        false,
        `${el}`.startsWith('SecureElement:'),
        'Expected a raw element in unlockerized component'
    );
}

function assertIsNotSecureWindow(win) {
    testUtil.assertEquals(window, win, "Expected to see raw window");
    testUtil.assertEquals(
        false,
        `${win}`.startsWith('SecureWindow'),
        'Expected value to not be a SecureWindow'
    );
}

function assertIsNotSecureDocument(doc) {
    testUtil.assertEquals(document, doc, "Expected to see raw document object");
    testUtil.assertEquals(
        false,
        `${doc}`.startsWith('SecureDocument'),
        'Expected document to not be a SecureDocument'
    );
}

function assertIsNotSecureBody(body) {
    testUtil.assertEquals(document.body, body, "Expected to see raw document.body");
    testUtil.assertEquals(
        false,
        `${body}`.startsWith('SecureElement'),
        'Expected body to not be a SecureElement: [object HTMLBodyElement]'
    );
}