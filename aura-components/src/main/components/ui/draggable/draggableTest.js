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
	browsers : [ "GOOGLECHROME", "FIREFOX", "IE11", "SAFARI" ],

    /**
     * Tests the helper method that resets the class attribute for the draggable component
     */
    testResetCssClass : {
        test : function(cmp) {
        	cmp.set("v.class", " someClass someDragClass someDragAccessibilityClass ");
        	cmp.set("v.dragClass", " someDragClass ");
        	cmp.set("v.dragAccessibilityClass", " someDragAccessibilityClass ");
            var helper = cmp.helper;
            helper.resetCssClass(cmp);
            var expected = "someClass";
            var actual = cmp.get("v.class");
            $A.test.assertEquals(expected, actual);
        }
    },
    
    /**
     * Tests the helper method that sets the drag class with accessibility mode on
     */
    testSetDragClassAccessibilityModeOn : {
        test : function(cmp) {
        	cmp.set("v.class", " someClass ");
        	cmp.set("v.dragClass", " someDragClass ");
        	cmp.set("v.dragAccessibilityClass", " someDragAccessibilityClass ");
            var helper = cmp.helper;
            helper.setDragClass(cmp, true);
            var expected = "someClass someDragAccessibilityClass";
            var actual = cmp.get("v.class");
            $A.test.assertEquals(expected, actual);
        }
    },
    
    /**
     * Tests the helper method that sets the drag class with accessibility mode off
     */
    testSetDragClassAccessibilityModeOff : {
        test : function(cmp) {
        	cmp.set("v.class", " someClass ");
        	cmp.set("v.dragClass", " someDragClass ");
        	cmp.set("v.dragAccessibilityClass", " someDragAccessibilityClass ");
            var helper = cmp.helper;
            helper.setDragClass(cmp, false);
            var expected = "someClass someDragClass";
            var actual = cmp.get("v.class");
            $A.test.assertEquals(expected, actual);
        }
    },
    
    /**
     * Tests the helper method that sets the drag class with no dragAccessibility class
     */
    testSetDragClassNoDragAccessibilityClass : {
        test : function(cmp) {
        	cmp.set("v.class", " someClass ");
        	cmp.set("v.dragClass", " someDragClass ");
        	cmp.set("v.dragAccessibilityClass", "");
            var helper = cmp.helper;
            helper.setDragClass(cmp, true);
            var expected = "someClass someDragClass";
            var actual = cmp.get("v.class");
            $A.test.assertEquals(expected, actual);
        }
    }
/*eslint-disable semi*/
})
/*eslint-enable semi*/