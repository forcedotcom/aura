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
    /**
     * Label without tokens does not use substitutions.
     */
    testNoTokens: {
        attributes : {value: "just text"},
        test: function(component){
            aura.test.assertEquals("just text", $A.test.getText(component.find("bodyEmpty").getElement()), "value not expected for no body");
            aura.test.assertEquals("just text", $A.test.getText(component.find("bodyHtml").getElement()), "value not expected for HtmlElement substitution");
            aura.test.assertEquals("just text", $A.test.getText(component.find("bodyComponent").getElement()), "value not expected for component substitution");
            aura.test.assertEquals("just text", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            aura.test.assertEquals("just text", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            aura.test.assertEquals("testjust text", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label");

//            component.getAttributes().setValue("value", "newness");
//            $A.renderingService.rerender(component);
//
//            aura.test.assertEquals("newness", $A.test.getText(component.find("bodyEmpty").getElement()), "value not expected for no body after rerender");
//            aura.test.assertEquals("newness", $A.test.getText(component.find("bodyHtml").getElement()), "value not expected for HtmlElement substitution after rerender");
//            aura.test.assertEquals("newness", $A.test.getText(component.find("bodyComponent").getElement()), "value not expected for component substitution after rerender");
//            aura.test.assertEquals("newness", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution after rerender");
//            aura.test.assertEquals("newness", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution after rerender");
//            aura.test.assertEquals("testnewness", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label after rerender");
        }
    },

    /**
     * Label updated to use more substitutions is rendered properly.
     */
    testAddTokens: {
        attributes : {value: "one {0} two"},
        test: function(component){
            aura.test.assertEquals("one {0} two", $A.test.getText(component.find("bodyEmpty").getElement()), "value not expected for no body");
            aura.test.assertNotNull($A.test.getText(component.find("bodyHtml").getElement()).match(/one\s*logout\s*two/), "value not expected for HtmlElement substitution");
            aura.test.assertEquals("one home two", $A.test.getText(component.find("bodyComponent").getElement()), "value not expected for component substitution");
            aura.test.assertEquals("one test two", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            aura.test.assertEquals("one testfalse20 two", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            aura.test.assertEquals("testone test two", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label");

//            component.getAttributes().setValue("value", "a{0}b{1}c{2}d");
//            $A.renderingService.rerender(component);
//
//            aura.test.assertEquals("a{0}b{1}c{2}d", $A.test.getText(component.find("bodyEmpty").getElement()), "value not expected for no body after rerender");
//            aura.test.assertEquals("alogoutb{1}c{2}d", $A.test.getText(component.find("bodyHtml").getElement()), "value not expected for HtmlElement substitution after rerender");
//            aura.test.assertEquals("ahome{1}c{2}d", $A.test.getText(component.find("bodyComponent").getElement()), "value not expected for component substitution after rerender");
//            aura.test.assertEquals("atestbfalsec20d", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution after rerender");
//            aura.test.assertEquals("atestfalse20b{1}c{2}d", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution after rerender");
//            aura.test.assertEquals("testatestbfalsec20d", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label after rerender");
        }
    },

    /**
     * Label updated to use less substitutions is rendered properly.
     */
    testSubtractTokens: {
        attributes : {value: "A{0}B{1}C{2}D{3}E"},
        test: function(component){
            aura.test.assertEquals("A{0}B{1}C{2}D{3}E", $A.test.getText(component.find("bodyEmpty").getElement()), "value not expected for no body");
            aura.test.assertNotNull($A.test.getText(component.find("bodyHtml").getElement()).match(/A\s*logout\s*B\{1\}C\{2\}D\{3\}E/), "value not expected for HtmlElement substitution");            
            aura.test.assertEquals("AhomeB{1}C{2}D{3}E", $A.test.getText(component.find("bodyComponent").getElement()), "value not expected for component substitution");
            aura.test.assertEquals("AtestBfalseC20DspannedE", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            aura.test.assertEquals("Atestfalse20B{1}C{2}D{3}E", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            aura.test.assertEquals("testAtestBfalseC20D{3}E", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label");

//            component.getAttributes().setValue("value", "${1}${0}$");
//            $A.renderingService.rerender(component);
//
//            aura.test.assertEquals("${1}${0}$", $A.test.getText(component.find("bodyEmpty").getElement()), "value not expected for no body after rerender");
//            aura.test.assertEquals("${1}$logout$", $A.test.getText(component.find("bodyHtml").getElement()), "value not expected for HtmlElement substitution after rerender");
//            aura.test.assertEquals("${1}$home$", $A.test.getText(component.find("bodyComponent").getElement()), "value not expected for component substitution after rerender");
//            aura.test.assertEquals("$false$test$", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution after rerender");
//            aura.test.assertEquals("${1}testfalse20$$", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution after rerender");
//            aura.test.assertEquals("test$false$test$", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label after rerender");
        }
    },

    /**
     * Label substitutions can be used multiple times.
     */
    testRepeatedTokens: {
        attributes : {value: "go {0} go {0} again"},
        test: function(component){
            aura.test.assertEquals("go test go test again", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            aura.test.assertEquals("go testfalse20 go testfalse20 again", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            aura.test.assertEquals("testgo test go test again", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label");
//            component.getAttributes().setValue("value", "8{0}8{0}8");
//            $A.renderingService.rerender(component);
//            aura.test.assertEquals("8test8test8", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution after rerender");
//            aura.test.assertEquals("8testfalse208testfalse208", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution after rerender");
//            aura.test.assertEquals("test8test8test8", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label after rerender");
        }
    },

    /**
     * Label tokens must be integers.
     */
    testTokenFormat: {
        attributes : {value: "{first}{-1}{0.1}{0day}{00}{0}"},
        test: function(component){
            aura.test.assertEquals("{first}{-1}{0.1}{0day}{00}{0}", $A.test.getText(component.find("bodyText").getElement()), "value not expected for text node substitution");
            aura.test.assertNotNull($A.test.getText(component.find("bodyHtml").getElement()).match(/\{first\}\{\-1\}\{0\.1\}\{0day\}\{00\}\s*logout/), "value not expected for HtmlElement substitution");
            aura.test.assertEquals("{first}{-1}{0.1}{0day}{00}home", $A.test.getText(component.find("bodyComponent").getElement()), "value not expected for component substitution");
            aura.test.assertEquals("{first}{-1}{0.1}{0day}{00}test", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            aura.test.assertEquals("{first}{-1}{0.1}{0day}{00}testfalse20", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            aura.test.assertEquals("test{first}{-1}{0.1}{0day}{00}test", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label");
        }
    },

    /**
     * Label tokens can have arbitrary index.
     */
    testOffsetIndex: {
        attributes : {value: "{2}"},
        test: function(component){
            aura.test.assertEquals("20", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            aura.test.assertEquals("{2}", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            aura.test.assertEquals("test20", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label");
//            component.getAttributes().setValue("value", "{1}{3}");
//            $A.renderingService.rerender(component);
//            aura.test.assertEquals("falsespanned", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution after rerender");
//            aura.test.assertEquals("{1}{3}", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution after rerender");
//            aura.test.assertEquals("testfalsespanned", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label after rerender");
        }
    },

    /**
     * Label is updated if substitution values are updated.
     */
    testUpdateBody: {
        attributes : {value: "{0}{1}{2}{3}{4}{5}"},
        test: function(component){
            aura.test.assertEquals("{1}{2}{3}{4}{5}", $A.test.getText(component.find("bodyUndefined").getElement()), "value not expected for undefined substitution");
            aura.test.assertEquals("{1}{2}{3}{4}{5}", $A.test.getText(component.find("bodyNull").getElement()), "value not expected for null substitution");
            aura.test.assertEquals("testfalse20spannedlogin{5}", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution");
            aura.test.assertEquals("testfalse20{1}{2}{3}{4}{5}", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution");
            aura.test.assertEquals("testtestfalse20{3}{4}{5}", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label");

//            component.getAttributes().setValue("string", "live");
//            component.getAttributes().setValue("boolean", true);
//            component.getAttributes().setValue("double", 2.2);
//            component.getAttributes().setValue("noll", "!null");
//            component.getAttributes().setValue("undefined", "!undefined");
//            $A.renderingService.rerender(component);
//
//            aura.test.assertEquals("!undefined{1}{2}{3}{4}{5}", $A.test.getText(component.find("bodyUndefined").getElement()), "value not expected for undefined substitution after rerender");
//            aura.test.assertEquals("!null{1}{2}{3}{4}{5}", $A.test.getText(component.find("bodyNull").getElement()), "value not expected for null substitution after rerender");
//            aura.test.assertEquals("livetrue2.2spannedlogin{5}", $A.test.getText(component.find("bodyProperties").getElement()), "value not expected for property substitution after rerender");
//            aura.test.assertEquals("livetrue2.2{1}{2}{3}{4}{5}", $A.test.getText(component.find("bodyFunction").getElement()), "value not expected for function substitution after rerender");
//            aura.test.assertEquals("testlivetrue2.2{3}{4}{5}", $A.test.getText(component.find("functionValue").getElement()), "value not expected for a function label after rerender");
        }
    },

    /**
     * Undefined label substitutions are output as "".
     */
    testUndefined: {
        attributes : {value: "one {0}{1} two"},
        test: function(component){
            aura.test.assertEquals("one {1} two", $A.test.getText(component.find("bodyUndefined").getElement()), "value not expected for undefined substitution");
            aura.test.assertEquals("one test two", $A.test.getText(component.find("bodyWithUndefined").getElement()), "value not expected for undefined substitution");
//            component.getAttributes().setValue("value", "a{0}b{1}c{2}d");
//            $A.renderingService.rerender(component);
//            aura.test.assertEquals("aundefinedb{1}c{2}d", $A.test.getText(component.find("bodyUndefined").getElement()), "value not expected for undefined substitution after rerender");
//            aura.test.assertEquals("aundefinedbtestc{2}d", $A.test.getText(component.find("bodyWithUndefined").getElement()), "value not expected for undefined substitution after rerender");
        }
    },

    /**
     * Null label substitutions are output as an empty string.
     */
    testNull: {
        attributes : {value: "one {0}{1} two"},
        test: function(component){
            aura.test.assertEquals("one {1} two", $A.test.getText(component.find("bodyNull").getElement()), "value not expected for null substitution");
            aura.test.assertEquals("one test two", $A.test.getText(component.find("bodyWithNull").getElement()), "value not expected for null substitution");
//            component.getAttributes().setValue("value", "a{0}b{1}c{2}d");
//            $A.renderingService.rerender(component);
//            aura.test.assertEquals("ab{1}c{2}d", $A.test.getText(component.find("bodyNull").getElement()), "value not expected for null substitution after rerender");
//            aura.test.assertEquals("abtestc{2}d", $A.test.getText(component.find("bodyWithNull").getElement()), "value not expected for null substitution after rerender");
        }
    },

    /**
     * Text node label substitutions are ignored.
     */
    testIgnoreTextNode: {
        attributes : {value: "{0}"},
        test: function(component){
            aura.test.assertEquals("{0}", $A.test.getText(component.find("bodyText").getElement()), "value not expected for text node substitution");
            aura.test.assertEquals("test", $A.test.getText(component.find("bodyWithText").getElement()), "value not expected for substitution with text");
//            component.getAttributes().setValue("value", "{0} updated");
//            $A.renderingService.rerender(component);
//            aura.test.assertEquals("{0} updated", $A.test.getText(component.find("bodyText").getElement()), "value not expected for text node substitution after rerender");
//            aura.test.assertEquals("test updated", $A.test.getText(component.find("bodyWithText").getElement()), "value not expected for substitution with text after rerender");
        }
    }
})
