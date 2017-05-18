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
     * Format without tokens does not use substitutions.
     */
    testNoTokens: {
        attributes : {value: "just text"},
        test: [function(component){
            $A.test.assertEquals("just text", $A.test.getText(component.find("bodyEmpty").getElement()), "value not expected for no body");
            $A.test.assertEquals("just text", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            $A.test.assertEquals("just text", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            $A.test.assertEquals("testjust text", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function format");
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
            $A.test.assertEquals("one test two", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            $A.test.assertEquals("one testfalse20 two", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            $A.test.assertEquals("testone test two", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function format");
        }]
    },

    /**
     * Format updated to use less substitutions is rendered properly.
     */
    testSubtractTokens: {
        attributes : {value: "A{0}B{1}C{2}D{3}E"},
        test: [function(component){
            $A.test.assertEquals("A{0}B{1}C{2}D{3}E", $A.test.getText(component.find("bodyEmpty").getElement()), "value not expected for no body");
            $A.test.assertEquals("AtestBfalseC20DspannedE", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            $A.test.assertEquals("Atestfalse20B{1}C{2}D{3}E", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            $A.test.assertEquals("testAtestBfalseC20D{3}E", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function format");
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
            $A.test.assertEquals("{first}{-1}{0.1}{0day}{00}{0}", $A.test.getText(component.find("bodyText").getElement()), "value not expected for text node substitution");
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
     * Format is updated if substitution values are updated. -- same as testSubtractTokens??
     */
    testMoreSubThanExpected: {
        attributes : {value: "{0}{1}{2}{3}{4}{5}"},
        test: function(component){
            $A.test.assertEquals("{1}{2}{3}{4}{5}", $A.test.getText(component.find("bodyUndefined").getElement()), "value not expected for undefined substitution");
            $A.test.assertEquals("{1}{2}{3}{4}{5}", $A.test.getText(component.find("bodyNull").getElement()), "value not expected for null substitution");
            $A.test.assertEquals("testfalse20spannedlogin{5}", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            $A.test.assertEquals("testfalse20{1}{2}{3}{4}{5}", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            $A.test.assertEquals("testtestfalse20{3}{4}{5}", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function format");
        }
    },

    /**
     * Undefined Format substitutions are output as "".
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
        },	function(component){
            $A.test.assertEquals("blah 60 meh", $A.test.getText(component.find("bodyWithString").getElement()), "value not expected for text node substitution");
        }]
    },
    
    /**
     * Test updating token and rerendering
     */
    testUpdateToken: {
    	 attributes : {
             value: "blah {0} meh",
             string: "-"
         },
         test: [function(component){
             $A.test.assertEquals("blah - meh", $A.test.getText(component.find("bodyWithString").getElement()), "value not expected for text node substitution");
         	component.set("v.value", "Zzzz {0} zzzZ");
         },	function(component){
             $A.test.assertEquals("Zzzz - zzzZ", $A.test.getText(component.find("bodyWithString").getElement()), "value not expected for text node substitution");
         }]
    },
    
    /**
     * List substitution works
     */
    testList: {
    	attributes : {
            value: "This is a list: {0};"
        },
        test: [function(component){
            $A.test.assertEquals("This is a list: 1,2,3,4,5;", $A.test.getText(component.find("bodyList").getElement()), "value not expected for list value substitution");
        }]
    }
})
