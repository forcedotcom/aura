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
     * Just sanity check a simple usage.
     */
    testAssertPass : {
        test : function(cmp) {
            $A.userAssert(true, "You shall never see me pass");
        }
    },

    /**
     * Just sanity check an assert fail.
     */
    testAssertFail : {
        test : function(cmp) {
            var orig = "This message will appear";
            var returned = "Assertion Failed!: "+orig + " : false";
            try {
                $A.userAssert(false, orig);
                $A.test.fail("The assertion did not intterupt flow");
            } catch (e) {
                $A.test.assertEquals(returned, e.message);
            }
            $A.test.assertEquals(returned, aura.util.getElement("auraErrorMessage").innerHTML);
        }
    },
    testAuraError : {
        test : [function(cmp) {
                $A.test.expectAuraError("Simple text");
                $A.error("Simple text");
                var message = $A.util.getElement("auraErrorMessage");
                $A.test.assertStartsWith("Simple text", $A.test.getText(message));
                $A.test.assertEquals(1, message.childNodes.length);
                $A.test.assertEquals("#text", message.childNodes[0].nodeName);
                $A.test.assertStartsWith("Simple text", $A.test.getAuraErrorMessage(),
                     "$A.error failed to display simple error text");
        },function(cmp) {
                $A.test.expectAuraError("<div>Run away, house on fire!</div>");
                $A.error("<div>Run away, house on fire!</div>");
                var message = $A.util.getElement("auraErrorMessage");
                $A.test.assertStartsWith("<div>Run away, house on fire!</div>", $A.test.getText(message));
                $A.test.assertEquals(1, message.childNodes.length);
                $A.test.assertEquals("#text", message.childNodes[0].nodeName);
                $A.test.assertStartsWith("<div>Run away, house on fire!</div>", $A.test.getAuraErrorMessage(),
                    "$A.error failed to display html markup as error text");
        },function(cmp) {
                $A.test.expectAuraError("&lt;div&gt; Run forrest, run. &lt;/div&gt;");
                $A.error("&lt;div&gt; Run forrest, run. &lt;/div&gt;")
                var message = $A.util.getElement("auraErrorMessage");
                $A.test.assertStartsWith("&lt;div&gt; Run forrest, run. &lt;/div&gt;", $A.test.getText(message));
                $A.test.assertEquals(1, message.childNodes.length);
                $A.test.assertEquals("#text", message.childNodes[0].nodeName);
                $A.test.assertStartsWith("&lt;div&gt; Run forrest, run. &lt;/div&gt;", $A.test.getAuraErrorMessage(),
                    "$A.error failed to display escaped html markup as error text");
        }]
    },
    testAuraErrorStackTrace : {
        test : function(cmp) {
                $A.test.expectAuraError("Verifying stack trace present");
                $A.error("Verifying stack trace present");
                var message = $A.util.getElement("auraErrorMessage");
                $A.test.assertNotNull(message, "Aura error message box did is not present after $A.error()");
                var msgText = $A.test.getText(message);
                $A.test.assertStartsWith("Verifying stack trace present", msgText, "Unexpected stacktrace message");
                //
                // Stack traces are not consistent enough to look for content... grrr.
                //
                $A.test.assertTrue(msgText.length > 35, "Missing stacktrace");
        }
    }
})
