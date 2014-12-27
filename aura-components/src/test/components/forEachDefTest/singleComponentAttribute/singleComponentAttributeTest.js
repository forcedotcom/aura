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
    testForEach: {
        test: function(cmp) {
            var el = cmp.getElement();
            aura.test.assertEquals(el.tagName, "UL");
            var children = [];
            for (var i = 0; i < el.childNodes.length; i++) {
                if(8 !== el.childNodes[i].nodeType) {
                    children.push(el.childNodes[i]);
                }
            }
            aura.test.assertEquals(children.length, 3);
            aura.test.assertEquals($A.test.getText(children[0]), "for");
            aura.test.assertEquals($A.test.getText(children[1]), "each");
            aura.test.assertEquals($A.test.getText(children[2]), "hooray");
        }
    }
})
