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
     */
    testOverridingDefSelectedOptionsBehaviour: {
        test: function(component){
        	var option1 = component.find("option1").getAttributes().get('value');
        	var option2 = component.find("option2").getAttributes().get('value');
            var option3 = component.find("option3").getAttributes().get('value');
            $A.test.assertFalse(option1,"Option1 should not be selected by default")
            $A.test.assertTrue(option2,"Option2 should be selected by default");
            $A.test.assertTrue(option3,"Option3 should be selected by default");
        }
    }
})