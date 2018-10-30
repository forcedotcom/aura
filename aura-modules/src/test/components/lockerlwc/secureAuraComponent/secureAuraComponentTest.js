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
    setUp: function (cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    // begin Secure Aura to Secure LWC Communication tests
    testAura2SLWCCustomEventSend: {
        test: function (cmp, event, helper) {
            cmp.testAura2SLWCCustomEventSend();
        }
    },
    testAura2SLWCCustomEventReceive: {
        test: function (cmp, event, helper) {
            cmp.testAura2SLWCCustomEventReceive();
        }
    },
    testAura2SLWCCustomEventCNReceive: {
        test: function(cmp) {
            return cmp.testAura2SLWCCustomEventCNReceive();
        }
    },
    testAura2SLWCApiMethodSend: {
        test: function (cmp, event, helper) {
            cmp.testAura2SLWCApiMethodSend();
        }
    },
    testAura2SLWCApiMethodReceive: {
        test: function (cmp, event, helper) {
            cmp.testAura2SLWCApiMethodReceive();
        }
    },
    testAura2SLWCApiMethodCNSend: {
        test: function(cmp) {
            cmp.testAura2SLWCApiMethodCNSend();
        }
    },
    testAura2SLWCApiMethodCNReceive: {
        test: function(cmp) {
            cmp.testAura2SLWCApiMethodCNReceive();
        }
    },
    testAura2SLWCDomEventOnHostElement: {
        test: function (cmp) {
            cmp.testAura2SLWCDomEventOnHostElement();
        }
    },
    // end Secure Aura to Secure LWC Communication tests

    // begin Secure Aura to Unsecure LWC Communication tests
    testAura2ULWCCustomEventReceive: {
        test: function(cmp) {
            cmp.testAura2ULWCCustomEventReceive();
        }
    },
    // end Secure Aura to Unsecure LWC Communication tests

    testTemplateQuerySelectorReturnsSecureElement: {
        test: function (cmp, event, helper) {
            cmp.testTemplateQuerySelectorReturnsSecureElement();
        }
    },
    testLWCCustomEventOnSelf: {
        test: function (cmp, event, helper) {
            cmp.testLWCCustomEventOnSelf();
        }
    },
    testSecureLWC2SecureLWCCustomEvent: {
        test: function (cmp) {
            return cmp.testSecureLWC2SecureLWCCustomEvent();
        }
    },
    testSecureLWC2SecureLWCDomEvent: {
        test: function (cmp) {
            return cmp.testSecureLWC2SecureLWCDomEvent();
        }
    },
    testSecureLWC2UnsecureLWCCustomEvent: {
        test: function (cmp) {
            return cmp.testSecureLWC2UnsecureLWCCustomEvent()
        }
    },
    testSecureLWC2UnsecureLWCDOMEvent: {
        test: function (cmp) {
            cmp.testSecureLWC2UnsecureLWCDOMEvent();
        }
    },
    testSecureLWC2SecureLWCCustomEventCrossNamespace: {
        test: function (cmp) {
            return cmp.testSecureLWC2SecureLWCCustomEventCrossNamespace();
        }
    },
    testUnsecureLWC2SecureLWCCustomEventCrossNamespace: {
        test: function (cmp) {
            return cmp.testUnsecureLWC2SecureLWCCustomEventCrossNamespace();
        }
    },
    testUnsecureLWC2SecureLWCCustomEvent: {
        test: function (cmp) {
            return cmp.testUnsecureLWC2SecureLWCCustomEvent();
        }
    },
    testSLWC2SWLCParentCanCallAPIProp: {
        test: function (cmp) {
            return cmp.testSLWC2SWLCParentCanCallAPIProp();
        }
    },
    testSLWC2SLWCChildApiPropValueIsReadOnly: {
        test: function(cmp) {
            var module = cmp.find('parentSecure');
            module.testSLWC2SLWCChildApiPropValueIsReadOnly();
        }
    },
    testSLWC2UnsecureLWCChildApiPropValueIsReadOnly: {
        test: function(cmp) {
            var module = cmp.find('parentSecure');
            module.testSLWC2UnsecureLWCChildApiPropValueIsReadOnly();
        }
    },
    testAura2SLWCApiMethodCNSend: {
        test: function(cmp) {
            return cmp.testAura2SLWCApiMethodCNSend();
        }
    },
    testAuraUnsecureLWCApiMethodOnHostElement: {
        test: function(cmp) {
            return cmp.testAuraUnsecureLWCApiMethodOnHostElement();
        }
    }
})