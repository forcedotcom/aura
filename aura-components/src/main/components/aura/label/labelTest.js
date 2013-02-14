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
     * Label with empty string value.
     */
    testValueEmpty: {
        attributes : {value: ""},
        test: function(component){
            aura.test.assertEquals("", $A.test.getText(component.getElement()), "value not expected");
//            component.getAttributes().setValue("value", "newness");
//            $A.renderingService.rerender(component);
//            aura.test.assertEquals("newness", $A.test.getText(component.getElement()), "value not expected");
        }
    },

    /**
     * Label without tokens.
     */
    testValueString: {
        attributes : {value: "easy peasy"},
        test: function(component){
            aura.test.assertEquals("easy peasy", $A.test.getText(component.getElement()), "value not expected");
//            component.getAttributes().setValue("value", "");
//            $A.renderingService.rerender(component);
//            aura.test.assertEquals("", $A.test.getText(component.getElement()), "value not expected");
        }
    },

    /**
     * Label with tokens, but no substitutions.
     */
    testValueWithTokens: {
        attributes : {value: "In a galaxy {0} {0} away..."},
        test: function(component){
            aura.test.assertEquals("In a galaxy {0} {0} away...", $A.test.getText(component.getElement()), "value not expected");
        }
    },

    /**
     * Label with just a token, but no substitutions.
     */
    testValueOfTokenOnly: {
        attributes : {value: "{0}"},
        test: function(component){
            aura.test.assertEquals("{0}", $A.test.getText(component.getElement()), "value not expected");
        }
    }
})
