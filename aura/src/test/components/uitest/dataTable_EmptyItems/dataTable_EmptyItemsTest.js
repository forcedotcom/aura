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
    testEmptyItems:{
        test:function(cmp){
            var element = cmp.getElement();
            //element.className.indexOf does not work for IE10
            $A.test.assertTrue($A.util.hasClass(element, "uiMessage"), "Expected to see a message to indicate no data.");
            $A.test.assertEquals("No data found.", $A.util.trim($A.test.getText(element)), "Message to indicate no data is absent or incorrect");

        }
    }
})
