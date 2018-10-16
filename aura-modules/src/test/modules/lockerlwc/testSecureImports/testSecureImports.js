import { processData, getData } from 'securemoduletest/nonLockerizedLib';
import { LightningElement, api } from 'lwc';
import * as testUtils from 'securemoduletest/testUtil';
import * as sameNamespaceUtil from 'lockerlwc/sameNamespaceUtil';
import * as sameNamespaceUnsecureUtil from 'lockerlwc/sameNamespaceUnsecureUtil';

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
            domElement: this.template.querySelector('.div-in-secure-cmp'),
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

    @api
    testSameNamespaceLib() {
        testUtils.assertTrue(
            sameNamespaceUtil.toString().indexOf('SecureLib') === -1,
            'Expect same namespace lockerized lib to be not wrapped in SecureLib'
        );
        testUtils.assertTrue(
            sameNamespaceUnsecureUtil.toString().indexOf('SecureLib') === 0,
            'Expect same namespace non-lockerized lib to be wrapped in SecureLib'
        );
    }

    @api
    testClassImportFromSameNamespace() {
        testUtils.assertDefined(sameNamespaceUtil.Dog);
        const instance = new sameNamespaceUtil.Dog();
        testUtils.assertDefined(instance, 'Failed to instantiate new instance of an imported class');
        testUtils.assertEquals('Dog', instance.name);
        testUtils.assertEquals('woof', instance.bark().sound); // mixin
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
