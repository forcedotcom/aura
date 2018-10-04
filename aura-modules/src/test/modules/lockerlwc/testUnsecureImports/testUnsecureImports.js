import { processData, getData } from 'securemoduletest/nonLockerizedLib';
import { LightningElement, api } from 'lwc';
import * as testUtils from 'securemoduletest/testUtil';

export default class TestSecureImports extends LightningElement {
    get data() {
        return {
            object: {
                foo: 'bar',
                bar: {
                    baz: 'foo'
                }
            },
            array: [0, 1, 2],
            string: 'foobar',
            number: 1,
            boolean: true,
            domElement: this.template.querySelector('#div-in-unsecure-cmp'),
            win: window,
            doc: document,
            body: document.body,
            head: document.head,
            func: function(cb) {
                if (cb) {
                    cb();
                }
            }
        };
    }

    @api
    testUnsecureToUnsecureLib() {
        const returnValue = processData(this.data);
        testUtils.assertTrue(returnValue, 'Unexpected return value from lib');
    }

    @api
    testReturnValueFromUnsecureLibToUnSecureCmp() {
        const returnValue = getData();
        assertReturnedDataIsUnwrapped(returnValue);
    }
}

function assertReturnedDataIsUnwrapped(data) {
    const { object, array, string, number, boolean, win, doc, body, head } = data;
    testUtils.assertEqualsValue({
        foo: 'bar',
        bar: {
            baz: 'foo'
        }
    }, object, 'Mismatch in object parameter');
    testUtils.assertEqualsValue([90, 91, 92], array, 'Mismatch in array parameter');
    testUtils.assertEquals('foobar', string, 'Expected string was not received in function argument');
    testUtils.assertEquals(1, number, 'Expected number was not received in function argument');
    testUtils.assertEquals(true, boolean, 'Expected boolean was not received in function argument');

    testUtils.assertEquals(
        '[object Window]',
        win.toString(),
        'Mismatch in window parameter'
    );

    testUtils.assertEquals(
        '[object HTMLDocument]',
        doc.toString(),
        'Mismatch in document parameter'
    );

    testUtils.assertEquals(
        '[object HTMLBodyElement]',
        body.toString(),
        'Mismatch in body parameter'
    );

    testUtils.assertEquals(
        '[object HTMLHeadElement]',
        head.toString(),
        'Mismatch in head parameter'
    );
}