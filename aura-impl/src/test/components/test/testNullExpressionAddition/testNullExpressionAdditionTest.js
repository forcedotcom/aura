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
     * Verify the divs have the right classes set
     */
    testNullExpressionAddition: {
        test: function(component){
            var elements = component.getElements();
            var divs = [];
            for (var e in elements) {
                var div = elements[e];
                if(div.nodeType !== 8 /*COMMENT_NODE*/){
                    divs.push(div);
                }
            }
            aura.test.assertEquals(4, divs.length, "Incorrect number of child elements created");
            aura.test.assertEquals("", divs[0].className, "should be no added class to first div");
            aura.test.assertEquals("aClass", divs[1].className, "second div should have aClass");
            aura.test.assertEquals("aClass2", divs[2].className, "third div should have aClass2");
            aura.test.assertEquals("", divs[3].className, "fourth div should have no extra class");
        }
    }
})
