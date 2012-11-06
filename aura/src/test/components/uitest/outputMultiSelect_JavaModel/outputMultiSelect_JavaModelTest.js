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
     * Verify behavior when value is assigned an Java String.
     */
    testStringFromJavaModel:{
        test:function(cmp){
            var multiSelectCmp= cmp.find('String');
            aura.test.assertNotNull(multiSelectCmp);
            aura.test.assertEquals('Model', multiSelectCmp.find('span').getElement().textContent, "Failed to display String from Java model");
        }
    },
    /**
     * Verify behavior when value is assigned an Java String Array.
     */
    testStringArrayFromJavaModel:{
        test:function(cmp){
            var multiSelectCmp= cmp.find('StringArray');
            aura.test.assertNotNull(multiSelectCmp);
            aura.test.assertEquals('red; green; blue', multiSelectCmp.find('span').getElement().textContent, "Failed to display String array from Java model");
        }
    },
    /**
     * Verify behavior when value is assigned an Java String ArrayList.
     */
    testStringArrayListFromJavaModel:{
        test:function(cmp){
            var multiSelectCmp= cmp.find('StringList');
            aura.test.assertNotNull(multiSelectCmp);
            aura.test.assertEquals('one; two; three', multiSelectCmp.find('span').getElement().textContent, "Failed to display String arraylist from Java model");
        }
    },
    /**
     * Verify behavior when value is assigned an Java Integer Array.
     */
    testNonStringArrayListFromJavaModel:{
        test:function(cmp){
            var multiSelectCmp= cmp.find('IntegerArray');
            aura.test.assertNotNull(multiSelectCmp);
            aura.test.assertEquals('123; 999; 666', multiSelectCmp.find('span').getElement().textContent, "Failed to display String arraylist from Java model");
        }
    }

})
