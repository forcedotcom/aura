/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    testAura2SLWCCustomEventSend: function (cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var module = cmp.find('parentSecure').getElement();
        var triggered = false;

        var customEvent = new CustomEvent('testAura2SLWCCustomEventReceive', {
            detail: {
                data: {
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
                    domElement: document.querySelector('#div-aura-cmp'),
                    func: function () {
                        triggered = true;
                    },
                    win: window,
                    doc: document,
                    body: document.body,
                    head: document.head,
                    isSecure: true,
                }
            }
        });

        module.dispatchEvent(customEvent);
        testUtils.addWaitForWithFailureMessage(true, function () {
            return triggered;
        }, "Custom event handler was not triggered on component");
    },
    testAura2SLWCCustomEventReceive: function(cmp) {
        var module = cmp.find('parentSecure').getElement();
        var testUtils = cmp.get('v.testUtils');
        var triggered = false;
        module.addEventListener('foo', function(ev) {
            testUtils.assertEquals('bar', ev.detail.object.foo, 'Mismatch in object parameter');
            testUtils.assertEquals(3, ev.detail.array.length, 'Mismatch in array length');
            testUtils.assertEquals(0, ev.detail.array[0], 'Mismatch in array parameter');
            testUtils.assertEquals(1, ev.detail.array[1], 'Mismatch in array parameter');
            testUtils.assertEquals(2, ev.detail.array[2], 'Mismatch in array parameter');
            testUtils.assertEquals(
                'SecureElement: [object HTMLDivElement]{ key: {"namespace":"lockerlwc"} }', 
                ev.detail.domElement.toString(), 
                'Mismatch in domElement parameter'
            );
            testUtils.assertEquals(
                'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }', 
                ev.detail.win.toString(), 
                'Mismatch in shared object window parameter'
            );
            testUtils.assertEquals(
                'SecureDocument: [object HTMLDocument]{ key: {"namespace":"lockerlwc"} }', 
                ev.detail.doc.toString(), 
                'Mismatch in shared object document parameter'
            );
            testUtils.assertEquals(
                'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"lockerlwc"} }', 
                ev.detail.body.toString(), 
                'Mismatch in shared object body parameter'
            );
            testUtils.assertEquals(
                'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"lockerlwc"} }', 
                ev.detail.head.toString(), 
                'Mismatch in shared object head parameter'
            );
            triggered = true;
        });

        module.triggerCustomEvent();
        testUtils.addWaitForWithFailureMessage(
            true,
            function() {
                return triggered;
            },
            'Event handler in Aura component should have been triggered by event in LWC child component'
        );

    },
    testAura2SLWCCustomEventCNReceive: function(cmp) {
        var div = cmp.find('capturingDiv').getElement();
        var module = cmp.find('securemoduletestChild');
        var testUtils = cmp.get('v.testUtils');
        var triggered = false;
        div.addEventListener('foo', function(ev) {
            testUtils.assertEquals('bar', ev.detail.object.foo, 'Mismatch in object parameter');
            testUtils.assertEquals(1, ev.detail.array[0], 'Mismatch in array parameter');
            testUtils.assertEquals(1, ev.detail.array.length, 'Mismatch in array length');
            testUtils.assertEquals(
                'SecureElement: [object HTMLParagraphElement]{ key: {"namespace":"lockerlwc"} }',
                ev.detail.domElement.toString(), 
                'Mismatch in domElement parameter'
            );
            testUtils.assertEquals(
                'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }', 
                ev.detail.sharedObjects.window.toString(), 
                'Mismatch in shared object window parameter'
            );
            testUtils.assertEquals(
                'SecureDocument: [object HTMLDocument]{ key: {"namespace":"lockerlwc"} }', 
                ev.detail.sharedObjects.document.toString(), 
                'Mismatch in shared object document parameter'
            );
            testUtils.assertEquals(
                'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"lockerlwc"} }', 
                ev.detail.sharedObjects.body.toString(), 
                'Mismatch in shared object body parameter'
            );
            testUtils.assertEquals(
                'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"lockerlwc"} }', 
                ev.detail.sharedObjects.head.toString(), 
                'Mismatch in shared object head parameter'
            );
            triggered = true;
        });

        module.triggerFooEvent();
        testUtils.addWaitForWithFailureMessage(
            true,
            function() {
                return triggered;
            },
            'Event handler in Aura component should have been triggered by event in LWC child component'
        );

    },
    testAura2SLWCApiMethodSend: function (cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var module = cmp.find('parentSecure').getElement();
        var triggered = false;
        var fnParamTriggered = false;

        var data = {
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
            domElement: document.querySelector('#div-aura-cmp'),
            func: function () {
                fnParamTriggered = true;
            },
            win: window,
            doc: document,
            body: document.body,
            head: document.head,
            isSecure: true
        };

        var cb = function () { triggered = true; };

        module.testAura2SLWCApiMethodSend(data, cb);

        testUtils.addWaitForWithFailureMessage(true, function () {
            return fnParamTriggered;
        }, "Function in Object parameter was not triggered");

        testUtils.addWaitForWithFailureMessage(true, function () {
            return triggered;
        }, "API method on SecureLWC element was not called");
    },
    testAura2SLWCApiMethodReceive: function (cmp) {
        var testUtils = cmp.get("v.testUtils");
        var module = cmp.find('parentSecure');
        var returned = module.testAura2SLWCApiMethodReceive();
        var complete = false;
        testUtils.assertEquals('bar', returned.object.foo, 'Expected object value mismatched');
        testUtils.assertEquals(3, returned.array.length, 'Expected array length mismatched');
        testUtils.assertEquals(0, returned.array[0], 'Expected array value mismatched');
        testUtils.assertEquals(1, returned.array[1], 'Expected array value mismatched');
        testUtils.assertEquals(2, returned.array[2], 'Expected array value mismatched');
        testUtils.assertEquals('foobar', returned.string, 'Expected string value mismatched');
        testUtils.assertEquals(1, returned.number, 'Expected number value mismatched');
        testUtils.assertEquals(true, returned.boolean, 'Expected boolean value mismatched');
        testUtils.assertEquals(
            'SecureElement: [object HTMLDivElement]{ key: {"namespace":"lockerlwc"} }',
            returned.domElement.toString(),
            'Expected DOMElement value mismatched'
        );
        testUtils.assertEquals(
            'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }',
            returned.win.toString(),
            'Expected Window value mismatched'
        );
        testUtils.assertEquals(
            'SecureDocument: [object HTMLDocument]{ key: {"namespace":"lockerlwc"} }',
            returned.doc.toString(),
            'Expected Document value mismatched'
        );
        testUtils.assertEquals(
            'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"lockerlwc"} }',
            returned.body.toString(),
            'Expected body value mismatched'
        );
        testUtils.assertEquals(
            'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"lockerlwc"} }',
            returned.head.toString(),
            'Expected head value mismatched'
        );
        testUtils.assertEquals(
            true,
            returned.func instanceof Function,
            'Expected function type mismatched'
        );
        returned.func(function () {
            complete = true;
        });

        testUtils.addWaitForWithFailureMessage(
            true,
            function () {
                return complete;
            },
            'Test did not complete in timely manner'
        )
    },
    testAura2SLWCApiMethodCNReceive: function(cmp) {
        var testUtils = cmp.get('v.testUtils');
        var module = cmp.find('securemoduletestChild');
        var returned = module.testAura2SLWCApiMethodCNReceive();

        testUtils.assertEquals('bar', returned.object.foo, 'Mismatch in object parameter');
        testUtils.assertEquals(1, returned.array[0], 'Mismatch in array parameter');
        testUtils.assertEquals(1, returned.array.length, 'Mismatch in array length');
        testUtils.assertEquals(
            'SecureElement: [object HTMLParagraphElement]{ key: {"namespace":"lockerlwc"} }',
            returned.domElement.toString(), 
            'Mismatch in domElement parameter'
        );
        testUtils.assertEquals(
            'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }', 
            returned.sharedObjects.window.toString(), 
            'Mismatch in shared object window parameter'
        );
        testUtils.assertEquals(
            'SecureDocument: [object HTMLDocument]{ key: {"namespace":"lockerlwc"} }', 
            returned.sharedObjects.document.toString(), 
            'Mismatch in shared object document parameter'
        );
        testUtils.assertEquals(
            'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"lockerlwc"} }', 
            returned.sharedObjects.body.toString(), 
            'Mismatch in shared object body parameter'
        );
        testUtils.assertEquals(
            'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"lockerlwc"} }', 
            returned.sharedObjects.head.toString(), 
            'Mismatch in shared object head parameter'
        );
    },
    testAura2SLWCApiMethodCNSend: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var module = cmp.find('securemoduletestChild');
        var triggered = false;
        var data = {
            object: {
                foo: 'bar',
            },
            array: [1, 2, 3],
            domElement: document.querySelector('#div-aura-cmp'),
            func: function () {
                triggered = true;
            },
            win: window,
            doc: document,
            body: document.body,
            head: document.head,
        };

        module.testAura2SLWCApiMethodCNSend(data);

        testUtils.addWaitForWithFailureMessage(true, function () {
            return triggered;
        }, "API method on SecureLWC element was not called");
    },
    testAura2SLWCDomEventOnHostElement: function (cmp) {
        var testUtils = cmp.get("v.testUtils");
        var module = cmp.find('parentSecure').getElement();
        var triggered = false;
        var cb = function () {
            triggered = true;
        }

        module.callback = cb;
        module.click();

        testUtils.addWaitForWithFailureMessage(true, function () {
            return triggered;
        }, "DOM Event was not triggered on LWC host element");
    },
    // end Secure Aura to Secure LWC Tests

    // begin Secure Aura to Unsecure LWC Tests
    testAura2ULWCCustomEventReceive: function(cmp) {
        var testUtils = cmp.get('v.testUtils');
        var triggered = false;
        var div = cmp.find('capturingDiv').getElement();
        var module = cmp.find('parentUnsecure');

        div.addEventListener('fromUnsecureLWC', function(ev) {
            testUtils.assertEquals(
                'SecureDOMEvent: [object CustomEvent]{ key: {"namespace":"lockerlwc"} }',
                ev.toString(),
                'Expected a SecureDOMEvent in handler'
            );

            testUtils.assertEquals('bar', ev.detail.object.foo, 'Expected object value mismatched');
            testUtils.assertEquals(3, ev.detail.array.length, 'Expected array length mismatched');
            testUtils.assertEquals(0, ev.detail.array[0], 'Expected array value mismatched');
            testUtils.assertEquals(1, ev.detail.array[1], 'Expected array value mismatched');
            testUtils.assertEquals(2, ev.detail.array[2], 'Expected array value mismatched');
            testUtils.assertEquals('foobar', ev.detail.string, 'Expected string value mismatched');
            testUtils.assertEquals(1, ev.detail.number, 'Expected number value mismatched');
            testUtils.assertEquals(true, ev.detail.boolean, 'Expected boolean value mismatched');
            testUtils.assertEquals(
                'SecureElement: [object HTMLDivElement]{ key: {"namespace":"lockerlwc"} }',
                ev.detail.domElement.toString(),
                'Expected DOMElement value mismatched'
            );
            testUtils.assertEquals(
                'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }',
                ev.detail.win.toString(),
                'Expected Window value mismatched'
            );
            testUtils.assertEquals(
                'SecureDocument: [object HTMLDocument]{ key: {"namespace":"lockerlwc"} }',
                ev.detail.doc.toString(),
                'Expected Document value mismatched'
            );
            testUtils.assertEquals(
                'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"lockerlwc"} }',
                ev.detail.body.toString(),
                'Expected body value mismatched'
            );
            testUtils.assertEquals(
                'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"lockerlwc"} }',
                ev.detail.head.toString(),
                'Expected head value mismatched'
            );
            testUtils.assertEquals(
                true,
                ev.detail.func instanceof Function,
                'Expected function type mismatched'
            );
            ev.detail.func(function () {
                triggered = true;
            });
    
        });

        module.testAura2ULWCCustomEventReceive();

        testUtils.addWaitForWithFailureMessage(
            true,
            function() {
                return triggered;
            },
            'CustomEvent handler on child unsecured LWC component was not triggered'
        );
    },
    testAuraUnsecureLWCApiMethodOnHostElement: function(cmp) {
        var testUtils = cmp.get('v.testUtils');

        var module = cmp.find('parentUnsecure');
        var returned = module.testAuraUnsecureLWCApiMethodOnHostElement();

        testUtils.assertEquals('bar', returned.object.foo, 'Mismatch in object parameter first key');
        testUtils.assertEquals('foo', returned.object.bar.baz, 'Mismatch in object parameter 2nd key');
        testUtils.assertEquals(3, returned.array.length, 'Mismatch in array length');
        testUtils.assertEquals(0, returned.array[0], 'Mismatch in array entry 1');
        testUtils.assertEquals(1, returned.array[1], 'Mismatch in array entry 2');
        testUtils.assertEquals(2, returned.array[2], 'Mismatch in array entry 3');
        testUtils.assertEquals(
            'SecureElement: [object HTMLDivElement]{ key: {"namespace":"lockerlwc"} }',
            returned.domElement.toString(),
            'Mismatch in domElement parameter'
        );
        testUtils.assertEquals(
            'SecureWindow: [object Window]{ key: {"namespace":"lockerlwc"} }', 
            returned.win.toString(), 
            'Mismatch in shared object window parameter'
        );
        testUtils.assertEquals(
            'SecureDocument: [object HTMLDocument]{ key: {"namespace":"lockerlwc"} }', 
            returned.doc.toString(), 
            'Mismatch in shared object document parameter'
        );
        testUtils.assertEquals(
            'SecureElement: [object HTMLBodyElement]{ key: {"namespace":"lockerlwc"} }', 
            returned.body.toString(), 
            'Mismatch in shared object body parameter'
        );
        testUtils.assertEquals(
            'SecureElement: [object HTMLHeadElement]{ key: {"namespace":"lockerlwc"} }', 
            returned.head.toString(), 
            'Mismatch in shared object head parameter'
        );
    },
    // end Secure Aura to Unsecure LWC Tests
    testTemplateQuerySelectorReturnsSecureElement: function (cmp, event, helper) {
        var module = cmp.find('parentSecure').getElement();
        module.testTemplateQuerySelectorReturnsSecureElement();
    },
    testLWCCustomEventOnSelf: function (cmp, event, helper) {
        var module = cmp.find('parentSecure').getElement();
        module.testLWCCustomEventOnSelf();
    },
    testSecureLWC2SecureLWCCustomEvent: function (cmp) {
        var module = cmp.find('parentSecure').getElement();
        return module.testSecureLWC2SecureLWCCustomEvent();
    },
    testSecureLWC2SecureLWCDomEvent: function (cmp) {
        var module = cmp.find('parentSecure').getElement();
        return module.testSecureLWC2SecureLWCDomEvent();
    },
    // User Story: W-5058590
    testSecureLWC2UnsecureLWCCustomEvent: function (cmp) {
        var module = cmp.find('parentSecure').getElement();
        return module.testSecureLWC2UnsecureLWCCustomEvent();
    },
    // User Story: W-4808252
    _testSecureLWC2UnsecureLWCDOMEvent: function (cmp) {
        var testUtils = cmp.get("v.testUtils");
        var module = cmp.find('parentSecure').getElement();
        var triggered = false;
        module.testSecureLWC2UnsecureLWCDOMEvent(function () {
            triggered = true;
        });

        testUtils.addWaitForWithFailureMessage(
            true,
            function () {
                return triggered;
            },
            'Event handler was not triggered by the LWC component'
        );
    },
    testSecureLWC2SecureLWCCustomEventCrossNamespace: function (cmp) {
        var module = cmp.find('parentSecure').getElement();
        return module.testSecureLWC2SecureLWCCustomEventCrossNamespace();

    },
    testUnsecureLWC2SecureLWCCustomEventCrossNamespace: function (cmp) {
        var module = cmp.find('parentUnsecure');
        return module.testUnsecureLWC2SecureLWCCustomEventCrossNamespace();
    },
    testUnsecureLWC2SecureLWCCustomEvent: function (cmp) {
        var module = cmp.find('parentUnsecure');
        return module.testUnsecureLWC2SecureLWCCustomEvent();
    },
    testSLWC2SWLCParentCanCallAPIProp: function(cmp) {
        var module = cmp.find('parentSecure');
        return module.testSLWC2SWLCParentCanCallAPIProp();
    }
})