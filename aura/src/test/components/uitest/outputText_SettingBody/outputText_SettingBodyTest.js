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
     * Verify that setting body of outputText component does not change the display.
     * OutputText only displays the value contained in its 'value' attribute
     */
    testSettingBodyDoesNotAffectDisplay:{
        test:function(cmp){
            var testOutputTextCmp = cmp.find('settingBody');
            aura.test.assertEquals('foo', $A.test.getText(testOutputTextCmp.find('span').getElement()), "outputText should display only text initialized in value attribute.");
        }
    }
})
