import { processData, getData } from "securemoduletest/nonLockerizedLib";
import { LightningElement, api } from "lwc";
import * as testUtils from "securemoduletest/testUtil";

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
            domElement: this.template.querySelector('#div-in-secure-cmp'),
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
    testSecureToUnsecureLib() {
        const returnValue = processData(this.data);
        testUtils.assertTrue(returnValue, 'Unexpected return value from lib');
    }

    @api
    testReturnValueFromUnsecureLibToSecureCmp() {
        const returnValue = getData();
        assertReturnedDataIsWrapped(returnValue);
    }
}

function assertReturnedDataIsWrapped(data) {
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
        'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }',
        `${win}`,
        'Expected window to be a SecureWindow'
    );

    testUtils.assertEquals(
        'SecureDocument: [object HTMLDocument]{ key: {"namespace":"lockerlwc"} }',
        `${doc}`,
        'Expected document to be a SecureDocument'
    );

    testUtils.assertEquals(
        'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"lockerlwc"} }',
        `${body}`,
        'Expected body to be a SecureElement: [object HTMLBodyElement]'
    );

    testUtils.assertEquals(
        'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"lockerlwc"} }',
        `${head}`,
        'Expected head to be a SecureElement: [object HTMLHeadElement]'
    );
}