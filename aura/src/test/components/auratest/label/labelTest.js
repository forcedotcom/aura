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
            aura.test.assertEquals("just text", component.find("bodyEmpty").getElement().textContent, "value not expected for no body");
            aura.test.assertEquals("just text", component.find("bodyHtml").getElement().textContent, "value not expected for HtmlElement substitution");
            aura.test.assertEquals("just text", component.find("bodyComponent").getElement().textContent, "value not expected for component substitution");
            aura.test.assertEquals("just text", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution");
            aura.test.assertEquals("just text", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution");
            aura.test.assertEquals("testjust text", component.find("functionValue").getElement().textContent, "value not expected for a function label");

//            component.getAttributes().setValue("value", "newness");
//            $A.renderingService.rerender(component);
//
//            aura.test.assertEquals("newness", component.find("bodyEmpty").getElement().textContent, "value not expected for no body after rerender");
//            aura.test.assertEquals("newness", component.find("bodyHtml").getElement().textContent, "value not expected for HtmlElement substitution after rerender");
//            aura.test.assertEquals("newness", component.find("bodyComponent").getElement().textContent, "value not expected for component substitution after rerender");
//            aura.test.assertEquals("newness", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution after rerender");
//            aura.test.assertEquals("newness", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution after rerender");
//            aura.test.assertEquals("testnewness", component.find("functionValue").getElement().textContent, "value not expected for a function label after rerender");
        }
    },

    /**
     * Label updated to use more substitutions is rendered properly.
     */
    testAddTokens: {
        attributes : {value: "one {0} two"},
        test: function(component){
            aura.test.assertEquals("one {0} two", component.find("bodyEmpty").getElement().textContent, "value not expected for no body");
            aura.test.assertEquals("one logout two", component.find("bodyHtml").getElement().textContent, "value not expected for HtmlElement substitution");
            aura.test.assertEquals("one home two", component.find("bodyComponent").getElement().textContent, "value not expected for component substitution");
            aura.test.assertEquals("one test two", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution");
            aura.test.assertEquals("one testfalse20 two", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution");
            aura.test.assertEquals("testone test two", component.find("functionValue").getElement().textContent, "value not expected for a function label");

//            component.getAttributes().setValue("value", "a{0}b{1}c{2}d");
//            $A.renderingService.rerender(component);
//
//            aura.test.assertEquals("a{0}b{1}c{2}d", component.find("bodyEmpty").getElement().textContent, "value not expected for no body after rerender");
//            aura.test.assertEquals("alogoutb{1}c{2}d", component.find("bodyHtml").getElement().textContent, "value not expected for HtmlElement substitution after rerender");
//            aura.test.assertEquals("ahome{1}c{2}d", component.find("bodyComponent").getElement().textContent, "value not expected for component substitution after rerender");
//            aura.test.assertEquals("atestbfalsec20d", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution after rerender");
//            aura.test.assertEquals("atestfalse20b{1}c{2}d", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution after rerender");
//            aura.test.assertEquals("testatestbfalsec20d", component.find("functionValue").getElement().textContent, "value not expected for a function label after rerender");
        }
    },

    /**
     * Label updated to use less substitutions is rendered properly.
     */
    testSubtractTokens: {
        attributes : {value: "A{0}B{1}C{2}D{3}E"},
        test: function(component){
            aura.test.assertEquals("A{0}B{1}C{2}D{3}E", component.find("bodyEmpty").getElement().textContent, "value not expected for no body");
            aura.test.assertEquals("AlogoutB{1}C{2}D{3}E", component.find("bodyHtml").getElement().textContent, "value not expected for HtmlElement substitution");
            aura.test.assertEquals("AhomeB{1}C{2}D{3}E", component.find("bodyComponent").getElement().textContent, "value not expected for component substitution");
            aura.test.assertEquals("AtestBfalseC20DspannedE", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution");
            aura.test.assertEquals("Atestfalse20B{1}C{2}D{3}E", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution");
            aura.test.assertEquals("testAtestBfalseC20D{3}E", component.find("functionValue").getElement().textContent, "value not expected for a function label");

//            component.getAttributes().setValue("value", "${1}${0}$");
//            $A.renderingService.rerender(component);
//
//            aura.test.assertEquals("${1}${0}$", component.find("bodyEmpty").getElement().textContent, "value not expected for no body after rerender");
//            aura.test.assertEquals("${1}$logout$", component.find("bodyHtml").getElement().textContent, "value not expected for HtmlElement substitution after rerender");
//            aura.test.assertEquals("${1}$home$", component.find("bodyComponent").getElement().textContent, "value not expected for component substitution after rerender");
//            aura.test.assertEquals("$false$test$", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution after rerender");
//            aura.test.assertEquals("${1}testfalse20$$", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution after rerender");
//            aura.test.assertEquals("test$false$test$", component.find("functionValue").getElement().textContent, "value not expected for a function label after rerender");
        }
    },

    /**
     * Label substitutions can be used multiple times.
     */
    testRepeatedTokens: {
        attributes : {value: "go {0} go {0} again"},
        test: function(component){
            aura.test.assertEquals("go test go test again", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution");
            aura.test.assertEquals("go testfalse20 go testfalse20 again", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution");
            aura.test.assertEquals("testgo test go test again", component.find("functionValue").getElement().textContent, "value not expected for a function label");
//            component.getAttributes().setValue("value", "8{0}8{0}8");
//            $A.renderingService.rerender(component);
//            aura.test.assertEquals("8test8test8", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution after rerender");
//            aura.test.assertEquals("8testfalse208testfalse208", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution after rerender");
//            aura.test.assertEquals("test8test8test8", component.find("functionValue").getElement().textContent, "value not expected for a function label after rerender");
        }
    },

    /**
     * Label tokens must be integers.
     */
    testTokenFormat: {
        attributes : {value: "{first}{-1}{0.1}{0day}{00}{0}"},
        test: function(component){
            aura.test.assertEquals("{first}{-1}{0.1}{0day}{00}{0}", component.find("bodyText").getElement().textContent, "value not expected for text node substitution");
            aura.test.assertEquals("{first}{-1}{0.1}{0day}{00}logout", component.find("bodyHtml").getElement().textContent, "value not expected for HtmlElement substitution");
            aura.test.assertEquals("{first}{-1}{0.1}{0day}{00}home", component.find("bodyComponent").getElement().textContent, "value not expected for component substitution");
            aura.test.assertEquals("{first}{-1}{0.1}{0day}{00}test", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution");
            aura.test.assertEquals("{first}{-1}{0.1}{0day}{00}testfalse20", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution");
            aura.test.assertEquals("test{first}{-1}{0.1}{0day}{00}test", component.find("functionValue").getElement().textContent, "value not expected for a function label");
        }
    },

    /**
     * Label tokens can have arbitrary index.
     */
    testOffsetIndex: {
        attributes : {value: "{2}"},
        test: function(component){
            aura.test.assertEquals("20", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution");
            aura.test.assertEquals("{2}", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution");
            aura.test.assertEquals("test20", component.find("functionValue").getElement().textContent, "value not expected for a function label");
//            component.getAttributes().setValue("value", "{1}{3}");
//            $A.renderingService.rerender(component);
//            aura.test.assertEquals("falsespanned", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution after rerender");
//            aura.test.assertEquals("{1}{3}", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution after rerender");
//            aura.test.assertEquals("testfalsespanned", component.find("functionValue").getElement().textContent, "value not expected for a function label after rerender");
        }
    },

    /**
     * Label is updated if substitution values are updated.
     */
    testUpdateBody: {
        attributes : {value: "{0}{1}{2}{3}{4}{5}"},
        test: function(component){
            aura.test.assertEquals("{1}{2}{3}{4}{5}", component.find("bodyUndefined").getElement().textContent, "value not expected for undefined substitution");
            aura.test.assertEquals("{1}{2}{3}{4}{5}", component.find("bodyNull").getElement().textContent, "value not expected for null substitution");
            aura.test.assertEquals("testfalse20spannedlogin{5}", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution");
            aura.test.assertEquals("testfalse20{1}{2}{3}{4}{5}", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution");
            aura.test.assertEquals("testtestfalse20{3}{4}{5}", component.find("functionValue").getElement().textContent, "value not expected for a function label");

//            component.getAttributes().setValue("string", "live");
//            component.getAttributes().setValue("boolean", true);
//            component.getAttributes().setValue("double", 2.2);
//            component.getAttributes().setValue("noll", "!null");
//            component.getAttributes().setValue("undefined", "!undefined");
//            $A.renderingService.rerender(component);
//
//            aura.test.assertEquals("!undefined{1}{2}{3}{4}{5}", component.find("bodyUndefined").getElement().textContent, "value not expected for undefined substitution after rerender");
//            aura.test.assertEquals("!null{1}{2}{3}{4}{5}", component.find("bodyNull").getElement().textContent, "value not expected for null substitution after rerender");
//            aura.test.assertEquals("livetrue2.2spannedlogin{5}", component.find("bodyProperties").getElement().textContent, "value not expected for property substitution after rerender");
//            aura.test.assertEquals("livetrue2.2{1}{2}{3}{4}{5}", component.find("bodyFunction").getElement().textContent, "value not expected for function substitution after rerender");
//            aura.test.assertEquals("testlivetrue2.2{3}{4}{5}", component.find("functionValue").getElement().textContent, "value not expected for a function label after rerender");
        }
    },

    /**
     * Undefined label substitutions are output as "".
     */
    testUndefined: {
        attributes : {value: "one {0}{1} two"},
        test: function(component){
            aura.test.assertEquals("one {1} two", component.find("bodyUndefined").getElement().textContent, "value not expected for undefined substitution");
            aura.test.assertEquals("one test two", component.find("bodyWithUndefined").getElement().textContent, "value not expected for undefined substitution");
//            component.getAttributes().setValue("value", "a{0}b{1}c{2}d");
//            $A.renderingService.rerender(component);
//            aura.test.assertEquals("aundefinedb{1}c{2}d", component.find("bodyUndefined").getElement().textContent, "value not expected for undefined substitution after rerender");
//            aura.test.assertEquals("aundefinedbtestc{2}d", component.find("bodyWithUndefined").getElement().textContent, "value not expected for undefined substitution after rerender");
        }
    },

    /**
     * Null label substitutions are output as an empty string.
     */
    testNull: {
        attributes : {value: "one {0}{1} two"},
        test: function(component){
            aura.test.assertEquals("one {1} two", component.find("bodyNull").getElement().textContent, "value not expected for null substitution");
            aura.test.assertEquals("one test two", component.find("bodyWithNull").getElement().textContent, "value not expected for null substitution");
//            component.getAttributes().setValue("value", "a{0}b{1}c{2}d");
//            $A.renderingService.rerender(component);
//            aura.test.assertEquals("ab{1}c{2}d", component.find("bodyNull").getElement().textContent, "value not expected for null substitution after rerender");
//            aura.test.assertEquals("abtestc{2}d", component.find("bodyWithNull").getElement().textContent, "value not expected for null substitution after rerender");
        }
    },

    /**
     * Text node label substitutions are ignored.
     */
    testIgnoreTextNode: {
        attributes : {value: "{0}"},
        test: function(component){
            aura.test.assertEquals("{0}", component.find("bodyText").getElement().textContent, "value not expected for text node substitution");
            aura.test.assertEquals("test", component.find("bodyWithText").getElement().textContent, "value not expected for substitution with text");
//            component.getAttributes().setValue("value", "{0} updated");
//            $A.renderingService.rerender(component);
//            aura.test.assertEquals("{0} updated", component.find("bodyText").getElement().textContent, "value not expected for text node substitution after rerender");
//            aura.test.assertEquals("test updated", component.find("bodyWithText").getElement().textContent, "value not expected for substitution with text after rerender");
        }
    }
})
