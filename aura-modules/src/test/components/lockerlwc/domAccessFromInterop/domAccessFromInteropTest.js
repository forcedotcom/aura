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

    // ***
    // Tests disabled here due to a functional gap in shadow dom semantics. Locker and LWC are working on solutions. Locker spike is W-5612756
    // ***
    testDocumentQuerySelector: {
        test: function(cmp) {
            cmp.documentQuerySelector();
        }
    },

    testDocumentQuerySelectorAll: {
        test: function(cmp) {
            cmp.documentQuerySelectorAll();
        }
    },

    _testNodeQuerySelector: {
        test: function(cmp) {
            cmp.nodeQuerySelector();
        }
    },

    _testNodeQuerySelectorAll: {
        test: function(cmp) {
            cmp.nodeQuerySelectorAll();
        }
    },

    _testNodeTraverse_firstChild: {
        test: function(cmp) {
            cmp.nodeTraverse_firstChild();
        }
    },

    _testNodeTraverse_lastChild: {
        test: function(cmp) {
            cmp.nodeTraverse_lastChild();
        }
    },

    testNodeTraverse_childNodes: {
        test: function(cmp) {
            cmp.nodeTraverse_childNodes();
        }
    },

    testNode_innerText: {
        test: function(cmp) {
            cmp.node_innerText();
        }
    },

    _testElement_children: {
        test: function(cmp) {
            cmp.element_children();
        }
    },

    _testElement_firstElementChild: {
        test: function(cmp) {
            cmp.element_firstElementChild();
        }
    },

    _testElement_lastElementChild: {
        test: function(cmp) {
            cmp.element_lastElementChild();
        }
    },

    testElement_innerHTML: {
        test: function(cmp) {
            cmp.element_innerHTML();
        }
    },

    _testElement_insertAdjacentHTML: {
        test: function(cmp) {
            cmp.element_insertAdjacentHTML();
        }
    }
})