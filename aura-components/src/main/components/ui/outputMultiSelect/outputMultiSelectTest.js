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
     * Verify setting value attribute to '' blank.
     */
    testEmptyValue:{
        attributes : {value: ''},
        test: function(component){
            aura.test.assertEquals('', $A.test.getText(component.find('span').getElement()), "When value is initialized to an empty string, nothing should be shown.");
        }
    },
    testSingleEntry:{
        attributes : {value: 'foo'},
        test: function(component){
            aura.test.assertEquals('foo', $A.test.getText(component.find('span').getElement()), "Multiselect failed to display a single entry.");
        }
    }
})
