/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    // locators used for component elements, passed to querySelectorAll
    selectors : {
        icon : ".uiBlock .bLeft .icon",
        close : ".uiBlock .bRight .close",
        title : ".uiBlock .bBody h4"
    },

    bgColors : {
        message : "rgb(238, 238, 238)",
        confirm : "rgb(237, 255, 241)",
        info : "rgb(245, 252, 255)",
        warning : "rgb(255, 255, 220)",
        error : "rgb(253, 237, 234)"
    },

    assertBasicChecks : function(component, expectedTitle){
        var rootDiv = component.getElement();

        // verify aria attributes
        $A.test.assertEquals("alert", rootDiv.getAttribute("role"),
                "ui:message rendered with wrong aria role attribute");
        $A.test.assertEquals("assertive", rootDiv.getAttribute("aria-live"),
                "ui:message rendered with wrong aria-live attribute");
        $A.test.assertEquals("true", rootDiv.getAttribute("aria-atomic"),
                "ui:message rendered with wrong aria-atomic attribute");

        // verify severity CSS class
        var severity = component.get("v.severity");
        $A.test.assertTrue($A.util.hasClass(rootDiv, severity),
                "ui:message rendered with wrong severity CSS class");

        // verify icon alt text
        var icon = $A.test.select(this.selectors.icon)[0];
        $A.test.assertEquals(severity, icon["alt"],
                "ui:message rendered with wrong icon alt text");

        // verify closable icon is present or not, based on closable attribute
        var closable = component.get("v.closable");
        $A.test.assertEquals(closable, $A.test.select(this.selectors.close).length > 0,
                "ui:message closable attribute is not being respected");

        // verify background color is correct, based on severity attribute
        var backgroundColor = getComputedStyle(rootDiv).getPropertyValue("background-color");
        if ($A.util.isUndefined(this.bgColors[severity])) {
            severity = "message";
        }
        $A.test.assertEquals(this.bgColors[severity], backgroundColor,
                "ui:message rendered with wrong background color for severity '" + component.get("v.severity") + "'");

        // verify title text
        var title = $A.test.select(this.selectors.title)[0];
        if (expectedTitle) {
            $A.test.assertEquals(expectedTitle, $A.test.getText(title),
                "os:message rendered with wrong title text");
        } else {
            $A.test.assertTrue($A.util.isUndefined(title),
                "os:message expecting no title");
        }
    },

    /**
     * Message with no severity value defaults to "message" severity.
     */
    testMessage : {
        attributes : {
            title : "Just a message."
        },
        test : function(component) {
            this.assertBasicChecks(component, "Just a message.");
        }
    },

    /**
     * Error message with no title value is displayed with no title.
     */
    testErrorWithNoTitle:{
        attributes : {
            severity:"error"
        },
        test : function(component){
            this.assertBasicChecks(component, "");
        }
    },

    /**
     * Message with custom severity value is rendered with implied class.
     */
    testMessageWithCustomSeverity:{
        attributes : {
            title:"nooooo!",
            severity:"doordie"
        },
        test : function(component){
            this.assertBasicChecks(component, "nooooo!");
        }
    },

    /**
     * Confirm message with class value is rendered with additional classes.
     */
    testConfirmWithClasses:{
        attributes : {
            title:"yes or no",
            severity : "confirm",
            "class" : "6pence _suffix -able"
        },
        test : function(component) {
            this.assertBasicChecks(component, "yes or no");
            var div = component.getElement();
            $A.test.assertTrue($A.util.hasClass(div, "6pence"),
                    "ui:message rendered without 6pence CSS class");
            $A.test.assertTrue($A.util.hasClass(div, "_suffix"),
                    "ui:message rendered without _suffix CSS class");
            $A.test.assertTrue($A.util.hasClass(div, "-able"),
                    "ui:message rendered without -able CSS class");
        }
    }
})
