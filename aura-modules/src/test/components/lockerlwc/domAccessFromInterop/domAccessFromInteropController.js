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
    documentQuerySelector: function (cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var accessibleElementSelectors = [
            '.container-samenamespace-child',
            '.sameNamespaceChild',
            '.container-crossnamespace-child'
        ];
        accessibleElementSelectors.forEach(function(selector){
            helper.assertIsSecureElement(
                testUtils, 
                document.querySelector(selector), 
                'Expected element with class ' + selector + ' to be accessible from interop'
            );
        });
        var elementsFromShadowDom = [
            '.lockerlwc-rootnode-section', // standard html element in template
            '.lockerlwc-rootnode-child-node', // child component in template
            '.lockerlwc-rootnode-slot-content-receiver',
            '.lockerlwc-rootnode-span', // nested html element in template
            '.lockerlwc-rootnode-div',
            '.lockerlwc-rootnode-lightdom-p', // lightdom content
            '.lockerlwc-rootnode-js-div', // div inserted using javascript
            '.lockerlwc-childnode-section', // Grand child wrt interop component
            '.lockerlwc-childnode-span'
        ];
        elementsFromShadowDom.forEach(function(selector) {
            testUtils.assertNull(
                document.querySelector(selector),
                'Expected element with class ' + selector + ' to not be accessible from interop, breaking shadow dom semantics'
            );
        });
        testUtils.assertNull(
            document.querySelector('.inTheShadow'),
            'Expected element with class "inTheShadow" to not be accessible from interop, breaking shadow dom semantics'
        );
        // Basic assertion in the LWC module as well
        document.querySelector('.container-samenamespace-child').documentQuerySelector();
    },

    documentQuerySelectorAll: function(cmp) {
        // Arrange
        var testUtils = cmp.get("v.testUtils");
        var actualElements = [];
        var expectedElementsByClass = [
            'container-samenamespace-child',
            'sameNamespaceChild',
            'container-crossnamespace-child'
        ];

        // Act
        var nodeList = document.querySelectorAll('*');
        var listLength = nodeList.length;
        var notExpectedButFound = [];
        for(var i = 0; i < listLength; i++) {
            var node = nodeList.item(i);
            if (node.className !== '' && node.className !== 'null') {
                // Collect all elements from query result
                Array.prototype.push.apply(actualElements, node.className.split(' '));
                // Collect any elements from shadow dom
                if(node.className.indexOf('inTheShadow') !== -1) {
                    notExpectedButFound.push(node.id);
                }
            }
        }
        var expectedButNotFound = expectedElementsByClass.filter(function(expectedElement) {
            return actualElements.indexOf(expectedElement) == -1;
        });
        // Assert
        testUtils.assertEquals(0, expectedButNotFound.length, 'Failed to find these elements:'+expectedButNotFound.join(','));
        testUtils.assertEquals(0, notExpectedButFound.length, 'Not expected to find these elements:'+notExpectedButFound.join(','));
        testUtils.assertEquals(
            0,
            document.querySelectorAll('.lockerlwc-rootnode-child-node').length,
            'Expected to see no elements inside shadow root of child'
        );
        testUtils.assertEquals(
            0,
            document.querySelectorAll('.inTheShadow').length,
            'Expected to see no elements from shadow'
        );
        // Basic assertion in the LWC module as well
        document.querySelector('.container-samenamespace-child').documentQuerySelectorAll();
    },

    nodeQuerySelector: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var child = document.querySelector('.container-samenamespace-child');
        helper.assertIsSecureElement(testUtils, child.querySelector('.sameNamespaceChild'),
            'Expected child element to be accessible from aura dom element');
        // child represents a DOM element belonging to aura, it is not patched by LWC
        testUtils.assertNull(child.querySelector('.lockerlwc-rootnode-section'),
            'Expected shadow element to not be accessible from aura dom element');
        testUtils.assertNull(child.querySelector('.lockerlwc-rootnode-lightdom-p'),
            'Expected light dom element to not be accessible from aura dom element');

        var interopNode = document.querySelector('.sameNamespaceChild');
        testUtils.assertNull(interopNode.querySelector('.lockerlwc-rootnode-section'),
            'Expected shadow element to not be accessible from interop node');
        testUtils.assertNull(interopNode.querySelector('.lockerlwc-rootnode-lightdom-p'),
            'Expected light dom element to not be accessible from interop node');
    },

    nodeQuerySelectorAll: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var child = document.querySelector('.container-samenamespace-child');
        var nodeList = child.querySelectorAll('*');
        testUtils.assertEquals(1, nodeList.length, 'Expected to receive 1 child element');
        helper.assertIsSecureElement(testUtils, nodeList[0],
            'Expected child element to be accessible from aura dom element');
        testUtils.assertTrue(nodeList[0].className.indexOf('sameNamespaceChild') !== -1, 'Expected to find root node');

        var interopNode = document.querySelector('.sameNamespaceChild');
        testUtils.assertEquals(0, interopNode.querySelectorAll('*').length, 'querySelectorAll("*") on interop node should return empty result');
    },

    nodeTraverse_firstChild: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var lwcChild = document.querySelector('.sameNamespaceChild');
        testUtils.assertNull(lwcChild.firstChild, 'Expected firstChild of interop node to be null');
        // Assert behavior inside an LWC component
        lwcChild.nodeTraverse_firstChild();
    },

    nodeTraverse_lastChild: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var lwcChild = document.querySelector('.sameNamespaceChild');
        testUtils.assertNull(lwcChild.lastChild, 'Expected lastChild of interop node to be null');
        // Assert behavior inside an LWC component
        lwcChild.nodeTraverse_lastChild();
    },

    nodeTraverse_childNodes: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var lwcChild = document.querySelector('.sameNamespaceChild');
        testUtils.assertEquals(0, lwcChild.childNodes.length, 'Expected childNodes list of interop node to be empty');
        // Assert behavior inside an LWC component
        lwcChild.nodeTraverse_childNodes();
    },

    node_innerText: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var child = document.querySelector('.container-samenamespace-child');
        testUtils.assertEquals("", child.innerText);

        var lwcChild = document.querySelector('.sameNamespaceChild');
        testUtils.assertEquals("", lwcChild.innerText, 'Expected innerText property of interop node to return empty string');
        // Assert behavior inside an LWC component also
        lwcChild.node_innerText();
    },

    element_children: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var lwcChild = document.querySelector('.sameNamespaceChild');
        testUtils.assertEquals(0, lwcChild.children.length, 'Expected children list of interop node to be empty');
        // Assert behavior inside an LWC component
        lwcChild.element_children();
    },

    element_firstElementChild: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var lwcChild = document.querySelector('.sameNamespaceChild');
        testUtils.assertNull(lwcChild.firstElementChild, 'Expected firstElementChild of interop node to be null');
        // Assert behavior inside an LWC component
        lwcChild.element_firstElementChild();
    },

    element_lastElementChild: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var lwcChild = document.querySelector('.sameNamespaceChild');
        testUtils.assertNull(lwcChild.lastElementChild, 'Expected lastElementChild of interop node to be null');
        // Assert behavior inside an LWC component
        lwcChild.element_lastElementChild();
    },

    element_innerHTML: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var child = document.querySelector('.container-samenamespace-child');
        var expectedElmRegex = /^<lockerlwc-dom-access-root-node(.*)class="sameNamespaceChild" id="sameNamespaceChild"(.*)><\/lockerlwc-dom-access-root-node>$/
        testUtils.assertTrue(expectedElmRegex.test(child.innerHTML), 'Expected only host element under container');

        var lwcChild = document.querySelector('.sameNamespaceChild');
        testUtils.assertEquals("", lwcChild.innerHTML, 'Expected innerHTML property of interop node to return empty string');
        // Assert behavior inside an LWC component also
        lwcChild.element_innerHTML();
    },

    element_insertAdjacentHTML: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var lwcChild = document.querySelector('.sameNamespaceChild');
        lwcChild.element_insertAdjacentHTML();
        testUtils.assertNull(document.querySelector('.insertAdjacentHTML'), 'Expected manually inject elements in shadow tree to not be accessible');
    }
})
