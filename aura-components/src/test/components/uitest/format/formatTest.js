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
     * ui:outputDate formatDate in its afterRender, if ui:label's afterRender is not called, we won't see any date.
     */
    testAfterRenderCalled : {
        attributes : {value: "{0}"},
        test: [
            function(cmp) {
                var outputDateElementInFormatCmp = cmp.find("outputDateInFormat").getElement();
                var expected = "Sep 8, 2015";
                var actual;

                $A.test.addWaitForWithFailureMessage(true,
                    function() {
                        actual = $A.test.getText(outputDateElementInFormatCmp);
                        return !!actual;
                    },
                    "ui:label's afterRender may not get called.",
                    function() {
                        $A.test.assertEquals(expected, actual, "Failed to find expected date.");
                    }
                );
            }
        ]
    },

    testValueEmpty: {
        attributes : {value: ""},
        test: function(component){
            var actual = $A.test.getText(component.find("bodyEmpty").getElement());
            $A.test.assertEquals("", actual);
        }
    },

    /**
     * Format without tokens does not use substitutions.
     */
    testNoTokens: {
        attributes : {value: "just text"},
        test: [function(component){
            $A.test.assertEquals("just text", $A.test.getText(component.find("bodyEmpty").getElement()), "value not expected for no body");
            $A.test.assertEquals("just text", $A.test.getText(component.find("bodyHtml").getElement()), "value not expected for HtmlElement substitution");
            $A.test.assertEquals("just text", $A.test.getText(component.find("bodyComponent").getElement()), "value not expected for component substitution");
            $A.test.assertEquals("just text", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            $A.test.assertEquals("just text", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            $A.test.assertEquals("testjust text", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function Format");
        }, function checkFormatInsideIf(component) {
             $A.test.assertEquals("just text", $A.test.getText(component.find("testBodyEmptyWithIf").getElement()), "value not expected for testBodyEmptyWithIf");
        }, function toggleIf(component) {
             component.set("v.valueElse", "just text else");
             component.set("v.booleanForIf", false);
        }, function verifyValueChange(component) {
             $A.test.assertEquals("just text else", $A.test.getText(component.find("testBodyEmptyWithIf").getElement()), "value not expected for testBodyEmptyWithIf after toggle If");
        }
        ]
    },

    /**
     * Format updated to use more substitutions is rendered properly.
     */
    testAddTokens: {
        attributes : {value: "one {0} two"},
        test: [function(component){
            $A.test.assertEquals("one {0} two", $A.test.getText(component.find("bodyEmpty").getElement()), "value not expected for no body");
            $A.test.assertNotNull($A.test.getText(component.find("bodyHtml").getElement()).match(/one\s*logout\s*two/), "value not expected for HtmlElement substitution");
            $A.test.assertEquals("one home two", $A.test.getText(component.find("bodyComponent").getElement()), "value not expected for component substitution");
            $A.test.assertEquals("one test two", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            $A.test.assertEquals("one testfalse20 two", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            $A.test.assertEquals("testone test two", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function format");
        }]
    },

    /**
     * Format updated to use less substitutions is rendered properly.
     */
    testSubtractTokens: {
        attributes : {value: "A{0}B{1}C{2}D{3}E{4}F"},
        test: [function(component){
            $A.test.assertEquals("A{0}B{1}C{2}D{3}E{4}F", $A.test.getText(component.find("bodyEmpty").getElement()), "value not expected for no body");
            $A.test.assertNotNull($A.test.getText(component.find("bodyHtml").getElement()).match(/A\s*logout\s*B\{1\}C\{2\}D\{3\}E\{4\}F/), "value not expected for HtmlElement substitution");
            $A.test.assertEquals("AhomeB{1}C{2}D{3}E{4}F", $A.test.getText(component.find("bodyComponent").getElement()), "value not expected for component substitution");
            $A.test.assertEquals("AtestBfalseC20DselfEspannedF", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            $A.test.assertEquals("Atestfalse20B{1}C{2}D{3}E{4}F", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            $A.test.assertEquals("testAtestBfalseC20D{3}E{4}F", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function format");
        }]
    },

    /**
     * Format substitutions can be used multiple times.
     */
    testRepeatedTokens: {
        attributes : {value: "go {0} go {0} again"},
        test: [function(component){
            $A.test.assertEquals("go test go test again", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            $A.test.assertEquals("go testfalse20 go testfalse20 again", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            $A.test.assertEquals("testgo test go test again", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function format");
        }]
    },

    /**
     * Format tokens must be integers.
     */
    testTokenFormat: {
        attributes : {value: "{first}{-1}{0.1}{0day}{00}{0}"},
        test: function(component){
            $A.test.assertEquals("{first}{-1}{0.1}{0day}{00}inner", $A.test.getText(component.find("bodyText").getElement()), "value not expected for text node substitution");
            $A.test.assertNotNull($A.test.getText(component.find("bodyHtml").getElement()).match(/\{first\}\{\-1\}\{0\.1\}\{0day\}\{00\}\s*logout/), "value not expected for HtmlElement substitution");
            $A.test.assertEquals("{first}{-1}{0.1}{0day}{00}home", $A.test.getText(component.find("bodyComponent").getElement()), "value not expected for component substitution");
            $A.test.assertEquals("{first}{-1}{0.1}{0day}{00}test", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            $A.test.assertEquals("{first}{-1}{0.1}{0day}{00}testfalse20", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            $A.test.assertEquals("test{first}{-1}{0.1}{0day}{00}test", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function format");
        }
    },

    /**
     * Format tokens can have arbitrary index.
     */
    testOffsetIndex: {
        attributes : {value: "{2}"},
        test: function(component){
            $A.test.assertEquals("20", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            $A.test.assertEquals("{2}", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            $A.test.assertEquals("test20", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function format");
        }
    },

    /**
     * Format is updated if substitution values are updated.
     */
    testUpdateBody: {
        attributes : {value: "{0}{1}{2}{3}{4}{5}"},
        test: function(component){
            $A.test.assertEquals("{1}{2}{3}{4}{5}", $A.test.getText(component.find("bodyUndefined").getElement()), "value not expected for undefined substitution");
            $A.test.assertEquals("{1}{2}{3}{4}{5}", $A.test.getText(component.find("bodyNull").getElement()), "value not expected for null substitution");
            $A.test.assertEquals("testfalse20selfspannedlogin", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            $A.test.assertEquals("testfalse20{1}{2}{3}{4}{5}", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            $A.test.assertEquals("testtestfalse20{3}{4}{5}", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function format");
        }
    },

    /**
     * Undefined format substitutions are output as "".
     */
    testUndefined: {
        attributes : {value: "one {0}{1} two"},
        test: function(component){
            $A.test.assertEquals("one {1} two", $A.test.getText(component.find("bodyUndefined").getElement()), "value not expected for undefined substitution");
            $A.test.assertEquals("one test two", $A.test.getText(component.find("bodyWithUndefined").getElement()), "value not expected for undefined substitution");
        }
    },

    /**
     * Null format substitutions are output as an empty string.
     */
    testNull: {
        attributes : {value: "one {0}{1} two"},
        test: function(component){
            $A.test.assertEquals("one {1} two", $A.test.getText(component.find("bodyNull").getElement()), "value not expected for null substitution");
            $A.test.assertEquals("one test two", $A.test.getText(component.find("bodyWithNull").getElement()), "value not expected for null substitution");
        }
    },

    /**
     * Text node format substitutions are NOT ignored.
     */
    testDoesNotIgnoreTextNode: {
        attributes : {value: "{0}"},
        test: function(component){
            $A.test.assertEquals("inner", $A.test.getText(component.find("bodyText").getElement()), "value not expected for text node substitution");
            $A.test.assertEquals("inner", $A.test.getText(component.find("bodyWithText").getElement()), "value not expected for substitution with text");
        }
    },

    /**
     * Test updating substitutions and rerendering
     */
    testUpdateSubstitution: {
        attributes : {
            value: "blah {0} meh",
            string: "-"
        },
        test: [function(component){
            $A.test.assertEquals("blah - meh", $A.test.getText(component.find("bodyWithString").getElement()), "value not expected for text node substitution");
            component.set("v.string", "60");
        },  function(component){
            $A.test.assertEquals("blah 60 meh", $A.test.getText(component.find("bodyWithString").getElement()), "value not expected for text node substitution");
        }]
    }

})
