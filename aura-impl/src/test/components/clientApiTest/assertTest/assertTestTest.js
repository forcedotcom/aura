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
            try {
                $A.error("Simple text");
                $A.test.fail("Test setup failure, no use of the test if an exception was not thrown.");
            } catch(e) {
                var message = $A.util.getElement("auraErrorMessage");
                $A.test.assertStartsWith("Simple text", $A.test.getText(message));
                $A.test.assertEquals(1, message.childNodes.length);
                $A.test.assertEquals("#text", message.childNodes[0].nodeName);
                $A.test.assertStartsWith("Simple text", $A.test.getText(message.childNodes[0]),
                     "$A.error failed to display simple error text");
            }
        },function(cmp) {
            try {
                $A.error("<div>Run away, house on fire!</div>");
                $A.test.fail("Test setup failure, $A.error doesn't like html markup.");
            } catch(e) {
                var message = $A.util.getElement("auraErrorMessage");
                $A.test.assertStartsWith("<div>Run away, house on fire!</div>", $A.test.getText(message));
                $A.test.assertEquals(1, message.childNodes.length);
                $A.test.assertEquals("#text", message.childNodes[0].nodeName);
                $A.test.assertStartsWith("<div>Run away, house on fire!</div>", $A.test.getText(message.childNodes[0]),
                    "$A.error failed to display html markup as error text");
            }
        },function(cmp) {
            try {
                $A.error("&lt;div&gt; Run forrest, run. &lt;/div&gt;")
                $A.test.fail("Test setup failure, $A.error doesn't like escaped html markup.");
            } catch(e) {
                var message = $A.util.getElement("auraErrorMessage");
                $A.test.assertStartsWith("&lt;div&gt; Run forrest, run. &lt;/div&gt;", $A.test.getText(message));
                $A.test.assertEquals(1, message.childNodes.length);
                $A.test.assertEquals("#text", message.childNodes[0].nodeName);
                $A.test.assertStartsWith("&lt;div&gt; Run forrest, run. &lt;/div&gt;", $A.test.getText(message.childNodes[0]),
                    "$A.error failed to display escaped html markup as error text");
            }
        }]
    },
    testAuraErrorStackTrace : {
        test : function(cmp) {
            try {
                $A.error("Verifying stack trace present");
                $A.test.fail("Test setup failure, $A.error failed to throw exception.");
            } catch(e) {
                var message = $A.util.getElement("auraErrorMessage");
                $A.test.assertStartsWith("Verifying stack trace present\nError: stack\n    at Error (<anonymous>)",
                    $A.test.getText(message));
            }
        }
    }
})
