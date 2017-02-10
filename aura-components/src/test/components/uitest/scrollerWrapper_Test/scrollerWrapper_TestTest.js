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
    /**
     * When using scrollerWrapper, subelements should have a transform CSS
     * property set to translate3d(0,0,0)
     */
    testTransform : {
        browsers : [ "IPHONE", "IPAD" ],
        test : function(component) {
            var divSty1 = this.getTransformValue(component, "div1.1"),
                divSty2 = this.getTransformValue(component, "div1.2");

            $A.test.assertEquals("matrix(1, 0, 0, 1, 0, 0)", divSty1, "There should be a transform CSS property");
            $A.test.assertEquals("none", divSty2, "There should not be a transform CSS property");
        }
    },

    /**
     * When using scrollerWrapper, elements with the skipTransform class should
     * not have a transform CSS property set
     */
    testSkipTransform : {
        browsers : [ "IPHONE", "IPAD" ],
        test : function(component) {
            var divSty1 = this.getTransformValue(component, "div2.1"),
                divSty2 = this.getTransformValue(component, "div2.2");

            $A.test.assertEquals("none", divSty1, "There should not be a transform CSS property");
            $A.test.assertEquals("none", divSty2, "There should not be a transform CSS property");
        }
    },

    /**
     * Use scrollerWrapper's scrollTo API method to scroll to the top and bottom
     * scrollerWrapper's container element's scrollTop should change accordingly
     */
    testScrollToBottomTop : {
        test : [function(component) {
            var wrapper = component.find("outerWrapper");
            wrapper.scrollTo("bottom");

            var wrapperElement = wrapper.getElement();
            var expectedScrollPos = wrapperElement.scrollHeight - wrapperElement.clientHeight;
            var epsilon = 5;
            $A.test.addWaitForWithFailureMessage(true, function () {
                return wrapperElement.scrollTop <= expectedScrollPos + epsilon
                    && wrapperElement.scrollTop >= expectedScrollPos - epsilon;
            }, "Scroll container should scroll to the bottom.");
        }, function(component) {
            var wrapper = component.find("outerWrapper");
            wrapper.scrollTo("top");

            var wrapperElement = wrapper.getElement();
            $A.test.addWaitForWithFailureMessage(0, function () {
                return wrapperElement.scrollTop;
            }, "Scroll container should scroll to the top.");
        }]
    },

    /**
     * Use scrollerWrapper's scrollTo API method to scroll to the left and right
     * scrollerWrapper's container element's scrollLeft should change accordingly
     */
    testScrollToRightLeft : {
        test : [function(component) {
            var wrapper = component.find("innerWrapper");
            wrapper.scrollTo("right");

            var wrapperElement = wrapper.getElement();
            var expectedScrollPos = wrapperElement.scrollWidth - wrapperElement.clientWidth;
            var epsilon = 5;
            $A.test.addWaitForWithFailureMessage(true, function () {
                return wrapperElement.scrollLeft <= expectedScrollPos + epsilon
                    && wrapperElement.scrollLeft >= expectedScrollPos - epsilon;
            }, "Scroll container should scroll to the right.");
        }, function(component) {
            var wrapper = component.find("innerWrapper");
            wrapper.scrollTo("left");

            var wrapperElement = wrapper.getElement();
            $A.test.addWaitForWithFailureMessage(0, function () {
                return wrapperElement.scrollLeft;
            }, "Scroll container should scroll to the left.");
        }]
    },

    /**
     * Use scrollerWrapper's scrollTo API method to scroll to a custom position
     * scrollerWrapper's container element's scrollLeft and scrollTop should
     * change accordingly
     */
    testScrollToCustom : {
        test : function(component) {
            var expectedScrollLeft = 50;
            var expectedScrollTop = 50;
            var wrapper = component.find("innerWrapper");
            wrapper.scrollTo("custom", expectedScrollLeft, expectedScrollTop);

            var wrapperElement = wrapper.getElement();
            $A.test.addWaitForWithFailureMessage(true, function () {
                return wrapperElement.scrollLeft === expectedScrollLeft
                    && wrapperElement.scrollTop === expectedScrollTop;
            }, "Scroller container should scroll to x: " + expectedScrollLeft + " y: " + expectedScrollTop);
        }
    },

    /**
     * Utility function for retrieving the transform CSS property
     *
     * @param the component
     * @param auraid of the element being observed
     * @return the computed value of the transform CSS property
     */
    getTransformValue : function(component, auraId) {
        var targetElement = component.find(auraId).getElement();
        return $A.test.getStyle(targetElement, "transform");
    }
})//eslint-disable-line semi
