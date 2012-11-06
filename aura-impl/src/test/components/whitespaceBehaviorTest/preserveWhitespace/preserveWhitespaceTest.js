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
    isWhitespace : function(text) {
        return text.replace(/\s/g, '').length < 1;
    },

    testPreserveWhitespace : {
        test : function(cmp) {
            var cmpElems = cmp.getElements();
            var divText = cmp.find("divText").getElement().innerHTML;

            // check component elements, verify whitespace included
            $A.test.assertTrue(this.isWhitespace(cmpElems[0].textContent), "First element in body of component should be whitespace.");
            $A.test.assertEquals("true", cmpElems[1].textContent, "Second element in body of component should be 'true'.");
            $A.test.assertTrue(this.isWhitespace(cmpElems[2].textContent), "Third element in body of component should be whitespace.");
            $A.test.assertEquals("false", cmpElems[3].textContent, "Fourth element in body of component should be 'false'.");
            $A.test.assertTrue(this.isWhitespace(cmpElems[4].textContent), "Fifth element in body of component should be whitespace.");
            $A.test.assertTrue(cmpElems[5] instanceof HTMLDivElement, "Sixth element in body of component should be div.");
            $A.test.assertTrue(this.isWhitespace(cmpElems[6].textContent, "Newline should be present after div."));

            // check whitespace within div
            $A.test.assertEquals("\n        true     false\n    ", divText, "Div text does not contain proper whitespace.");
        },
    }
})