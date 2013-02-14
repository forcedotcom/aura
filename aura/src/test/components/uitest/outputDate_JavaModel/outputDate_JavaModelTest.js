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
     * Verify that outputDate can accept Date object from java model and display it.
     */
    testDateValueFromJavaModel:{
        test:function(cmp){
            var testCmp = cmp.find('dateFromJava');
            aura.test.assertNotNull(testCmp);
            aura.test.assertEquals('9/23/04', $A.test.getText(testCmp.find('span').getElement()), "Failed to display Date from Java model");
        }
    }
})
