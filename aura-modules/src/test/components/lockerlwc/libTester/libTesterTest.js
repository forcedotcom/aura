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

    // begin Secure LWC Component to UnSecure LWC Lib Communication tests
    testSecureToUnsecureLib: {
        test: function (cmp) {
            cmp.find('test-secure-imports').testSecureToUnsecureLib();
        }
    },

    // BUG: W-5149983
    _testReturnValueFromUnsecureLibToSecureCmp: {
        test: function (cmp) {
            cmp.find('test-secure-imports').testReturnValueFromUnsecureLibToSecureCmp();
        }
    },

    // begin UnSecure LWC Component to UnSecure LWC Lib Communication tests
    testUnsecureToUnsecureLib: {
        test: function (cmp) {
            cmp.find('test-unsecure-imports').testUnsecureToUnsecureLib();
        }
    },

    testReturnValueFromUnsecureLibToUnSecureCmp: {
        test: function (cmp) {
            cmp.find('test-unsecure-imports').testReturnValueFromUnsecureLibToUnSecureCmp();
        }
    },

    testSameNamespaceLib: {
        test: function(cmp) {
            cmp.find('test-secure-imports').testSameNamespaceLib();
        }
    },

    testClassImportFromSameNamespace: {
        test: function(cmp) {
            cmp.find('test-secure-imports').testClassImportFromSameNamespace();
        }
    }
})