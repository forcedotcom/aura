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
    // TODO(W-3674741): FF browser versions in autobuilds is too far behind
    // TODO W-4363273: Bug in BrowserCompatibilityServiceImpl, serving compat version of aura fw js in Safari 11
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],
    testAuraLWCCustomEventOnHostElement: {
        test: function (cmp, event, helper) {
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
                        head: document.head
                    }
                }
            });

            module.dispatchEvent(customEvent);
            $A.test.addWaitForWithFailureMessage(true, function () {
                return triggered;
            }, "Custom event handler was not triggered on component");
        }
    },
    testAura2SLWCCustomEventReceive: {
        test: function(cmp) {
            var module = cmp.find('parentSecure').getElement();
            var div = cmp.find('capturingDiv').getElement();
            var triggered = false;
            div.addEventListener('foo', function(ev) {
                $A.test.assertEquals('bar', ev.detail.object.foo, 'Mismatch in object parameter');
                $A.test.assertEquals(3, ev.detail.array.length, 'Mismatch in array length');
                $A.test.assertEquals(0, ev.detail.array[0], 'Mismatch in array parameter');
                $A.test.assertEquals(1, ev.detail.array[1], 'Mismatch in array parameter');
                $A.test.assertEquals(2, ev.detail.array[2], 'Mismatch in array parameter');
                $A.test.assertEquals(
                    '[object HTMLDivElement]', 
                    ev.detail.domElement.toString(), 
                    'Mismatch in domElement parameter'
                );
                $A.test.assertEquals(
                    '[object Window]', 
                    ev.detail.win.toString(), 
                    'Mismatch in shared object window parameter'
                );
                $A.test.assertEquals(
                    '[object HTMLDocument]', 
                    ev.detail.doc.toString(), 
                    'Mismatch in shared object document parameter'
                );
                $A.test.assertEquals(
                    '[object HTMLBodyElement]', 
                    ev.detail.body.toString(), 
                    'Mismatch in shared object body parameter'
                );
                $A.test.assertEquals(
                    '[object HTMLHeadElement]', 
                    ev.detail.head.toString(), 
                    'Mismatch in shared object head parameter'
                );
                triggered = true;
            });
            module.triggerCustomEvent();
            $A.test.addWaitForWithFailureMessage(
                true,
                function() {
                    return triggered;
                },
                'Event handler in Aura component should have been triggered by event in LWC child component'
            );

        }
    },
    testAuraLWCApiMethodOnHostElement: {
        test: function (cmp, event, helper) {
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
                head: document.head
            };

            var cb = function () { triggered = true; };

            module.testAura2SLWCApiMethodSend(data, cb);

            $A.test.addWaitForWithFailureMessage(true, function () {
                return fnParamTriggered;
            }, "Function in Object parameter was not triggered");

            $A.test.addWaitForWithFailureMessage(true, function () {
                return triggered;
            }, "API method on SecureLWC element was not called");
        }
    },

    testAuraLWCDomEventOnHostElement: {
        test: function (cmp) {
            var module = cmp.find('parentSecure').getElement();
            var triggered = false;
            var cb = function () {
                triggered = true;
            }

            module.callback = cb;
            module.click();

            $A.test.addWaitForWithFailureMessage(true, function () {
                return triggered;
            }, "DOM Event was not triggered on LWC host element");
        }
    },
    testSLWC2AuraApiReturnValue: {
        test: function (cmp) {
            var module = cmp.find('parentSecure').getElement();
            var returned = module.testAura2SLWCApiMethodReceive();
            var complete = false;
            $A.test.assertEquals('bar', returned.object.foo, 'Expected object value mismatched');
            $A.test.assertEquals(3, returned.array.length, 'Expected array length mismatched');
            $A.test.assertEquals(0, returned.array[0], 'Expected array value mismatched');
            $A.test.assertEquals(1, returned.array[1], 'Expected array value mismatched');
            $A.test.assertEquals(2, returned.array[2], 'Expected array value mismatched');
            $A.test.assertEquals('foobar', returned.string, 'Expected string value mismatched');
            $A.test.assertEquals(1, returned.number, 'Expected number value mismatched');
            $A.test.assertEquals(true, returned.boolean, 'Expected boolean value mismatched');
            $A.test.assertEquals('[object HTMLDivElement]', returned.domElement.toString(), 'Expected DOMElement value mismatched');
            $A.test.assertEquals('[object Window]', returned.win.toString(), 'Expected Window value mismatched');
            $A.test.assertEquals('[object HTMLDocument]', returned.doc.toString(), 'Expected Document value mismatched');
            $A.test.assertEquals('[object HTMLBodyElement]', returned.body.toString(), 'Expected body value mismatched');
            $A.test.assertEquals('[object HTMLHeadElement]', returned.head.toString(), 'Expected head value mismatched');
            $A.test.assertEquals(
                true,
                returned.func instanceof Function,
                'Expected function type mismatched'
            );
            returned.func(function () {
                complete = true;
            });

            $A.test.addWaitForWithFailureMessage(
                true,
                function () {
                    return complete;
                },
                'Test did not complete in timely manner'
            )
        }
    },
    testSLWC2AuraApiPropValueIsReadOnly: {
        test: function(cmp) {
            var expectedErrorMessage = 'Invalid mutation: Cannot set "object" on "[object Object]". "[object Object]" is read-only.';
            var module = cmp.find('parentSecure').getElement();
            var propValue = module.testAura2SLWCApiProp;
            $A.test.assertTrue(typeof propValue === 'object');
            $A.test.assertEquals('bar', propValue.object.foo);
            $A.test.assertEquals('foo', propValue.object.bar.baz);
            try {
                propValue.object = {};
                $A.test.fail('Api property value should be readonly');
            }catch (e) {
                $A.test.contains(expectedErrorMessage, e.message);
            }
            try {
                // Modify inner values
                propValue.object.foo = 'barred';
                $A.test.fail('Api property value should be readonly');
            }catch(e) {
                $A.test.contains(expectedErrorMessage, e.message);
            }
        }
    },
    testTemplateQuerySelectorReturnsSecureElement: {
        test: function (cmp, event, helper) {
            var module = cmp.find('parentSecure').getElement();
            module.testTemplateQuerySelectorReturnsSecureElement();
        }
    },
    testLWCCustomEventOnSelf: {
        test: function (cmp, event, helper) {
            var module = cmp.find('parentSecure').getElement();
            return module.testLWCCustomEventOnSelf();
        }
    },
    testSecureLWC2SecureLWCCustomEvent: {
        test: function (cmp) {
            var module = cmp.find('parentSecure').getElement();
            return module.testSecureLWC2SecureLWCCustomEvent();
        }
    },

    testSecureLWC2SecureLWCDomEvent: {
        test: function (cmp) {
            var module = cmp.find('parentSecure').getElement();
            return module.testSecureLWC2SecureLWCDomEvent();
        }
    },
    testSecureLWC2UnsecureLWCCustomEvent: {
        test: function (cmp) {
            var module = cmp.find('parentSecure').getElement();
            return module.testSecureLWC2UnsecureLWCCustomEvent();
        }
    },
    testSecureLWC2UnsecureLWCDOMEvent: {
        test: function (cmp) {
            var module = cmp.find('parentSecure').getElement();
            var triggered = false;
            module.testSecureLWC2UnsecureLWCDOMEvent(function () {
                triggered = true;
            });

            $A.test.addWaitForWithFailureMessage(
                true,
                function () {
                    return triggered;
                },
                'Event handler was not triggered by the LWC component'
            );
        }
    },
    testSecureLWC2SecureLWCCustomEventCrossNamespace: {
        test: function (cmp) {
            var module = cmp.find('parentSecure').getElement();
            return module.testSecureLWC2SecureLWCCustomEventCrossNamespace();
        }
    },
    testUnsecureLWC2SecureLWCCustomEventCrossNamespace: {
        test: function (cmp) {
            var module = cmp.find('parentUnsecure').getElement();
            return module.testUnsecureLWC2SecureLWCCustomEventCrossNamespace();
        }
    },
    testUnsecureLWC2SecureLWCCustomEvent: {
        test: function (cmp) {
            var module = cmp.find('parentUnsecure').getElement();
            return module.testUnsecureLWC2SecureLWCCustomEvent();
        }
    },
    testPlatformEventsOnSelf: {
        test: function (cmp) {
            var module = cmp.find('parentSecure').getElement();
            var doneObj = {};
            module.testPlatformEventsOnSelf(doneObj);
            $A.test.addWaitForWithFailureMessage(
                true,
                function() {
                    return doneObj.triggered;
                },
                'Platform event was not triggered'
            )
        }
    },
    testPlatformEventsOnChild: {
        test: function (cmp) {
            var module = cmp.find('parentSecure').getElement();
            var doneObj = {};
            module.testPlatformEventsOnChild(doneObj);
            $A.test.addWaitForWithFailureMessage(
                true,
                function() {
                    return doneObj.triggered;
                },
                'Platform event was not triggered'
            )
        }
    },
    testPlatformEventsOnChildCrossNamespace: {
        test: function (cmp) {
            var module = cmp.find('parentSecure').getElement();
            var doneObj = {};
            module.testPlatformEventsOnChildCrossNamespace(doneObj);
            $A.test.addWaitForWithFailureMessage(
                true,
                function() {
                    return doneObj.triggered;
                },
                'Platform event was not triggered'
            )
        }
    },
    testAuraUnsecureLWCEventOnHostElement: {
        test: function(cmp) {
            var module = cmp.find('parentUnsecure').getElement();
            var triggered = false;
            var ev = new CustomEvent('secureAura', {
                bubbles: true,
                cancelable: true,
                detail: {
                    object: {foo: 'bar'},
                    array: [1],
                    domElement: cmp.find('capturingDiv').getElement(),
                    sharedObjects: {
                        window: window,
                        document: document,
                        body: document.body,
                        head: document.head
                    },
                    callback: function() {
                        triggered = true;
                    }
                }
            });

            module.dispatchEvent(ev);
            $A.test.addWaitForWithFailureMessage(
                true,
                function() {
                    return triggered;
                },
                'CustomEvent handler on child unsecured LWC component was not triggered'
            );
        }
    },
    // Test an unsecure parent accessing the api property value of a secure child
    testUnsecureLWCParent2SLWCApiPropIsReadOnly: {
        test: function(cmp) {
            var module = cmp.find('parentUnsecure').getElement();
            module.testUnsecureLWCParent2SLWCApiPropIsReadOnly();
        }
    }
})