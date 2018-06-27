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

            var customEvent = new CustomEvent('testAuraLWCCustomEventOnHostElement', {
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

            module.testAuraLWCApiMethodOnHostElement(data, cb);

            $A.test.addWaitForWithFailureMessage(true, function () {
                return fnParamTriggered;
            }, "Function in Object parameter was not triggered");

            $A.test.addWaitForWithFailureMessage(true, function () {
                return triggered;
            }, "API method on SecureLWC element was not called");
        }
    },
    // TODO: Due to a bug in how LWC engine patches target and currentTarget properties on event
    _testAuraLWCDomEventOnHostElement: {
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
            var returned = module.testSLWC2AuraApiReturnValue();
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
    // TODO: Due to a bug in how LWC engine patches target and currentTarget properties on event
    _testSecureLWC2SecureLWCDomEvent: {
        test: function (cmp) {
            var module = cmp.find('parentSecure').getElement();
            return module.testSecureLWC2SecureLWCDomEvent();
        }
    },
    // User Story: W-5058590
    testSecureLWC2UnsecureLWCCustomEvent: {
        test: function (cmp) {
            var module = cmp.find('parentSecure').getElement();
            return module.testSecureLWC2UnsecureLWCCustomEvent();
        }
    },
    // User Story: W-4808252
    _testSecureLWC2UnsecureLWCDOMEvent: {
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
    }
})