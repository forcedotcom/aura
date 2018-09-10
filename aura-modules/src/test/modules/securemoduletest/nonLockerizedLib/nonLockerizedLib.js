import * as testUtils from "securemoduletest/testUtil";

export function testGlobalsAreRaw() {
    testUtils.assertTrue(window.toString().indexOf('SecureWindow') === -1, "Expected window to"
        + " return native window in non-lockerized library");
    testUtils.assertTrue(document.toString().indexOf('SecureDocument') === -1, "Expected document to"
        + " return native document in non-lockerized library");
}

export function processData(...args) {
    assertFunctionArgumentsAreUnwrapped(args[0]);
    return true;
}

export function getData() {
    return {
        object: {
            foo: 'bar',
            bar: {
                baz: 'foo'
            }
        },
        array: [90, 91, 92],
        string: 'foobar',
        number: 1,
        boolean: true,
        win: window,
        doc: document,
        body: document.body,
        head: document.head
    };
}

function assertFunctionArgumentsAreUnwrapped(args) {
    const { object, array, string, number, boolean, domElement, win, doc, body, head } = args;
    testUtils.assertEqualsValue({
        foo: 'bar',
        bar: {
            baz: 'foo'
        }
    }, object, 'Mismatch in object parameter');
    testUtils.assertEqualsValue([0, 1, 2], array, 'Mismatch in array parameter');
    testUtils.assertEquals('foobar', string, 'Expected string was not received in function argument');
    testUtils.assertEquals(1, number, 'Expected number was not received in function argument');
    testUtils.assertEquals(true, boolean, 'Expected boolean was not received in function argument');

    testUtils.assertEquals(
        '[object HTMLDivElement]',
        domElement.toString(),
        'Mismatch in domElement parameter'
    );

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