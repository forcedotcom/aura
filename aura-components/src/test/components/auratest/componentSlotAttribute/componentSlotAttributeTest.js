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
    testSlotInHTMLComponent: {
        test: function(component){
            var e = component.find('first').getElement();
            $A.test.assertEquals("x1", e.slot, "Invalid attribute slot in html element");
        }
    },
    testSlotInPlaceholderComponent: {
        test: function(component){
            var c = component.find('second');
            $A.test.assertEquals("x2", c.get('v.slot'), "Invalid attribute slot in a component");
        }
    }
})
