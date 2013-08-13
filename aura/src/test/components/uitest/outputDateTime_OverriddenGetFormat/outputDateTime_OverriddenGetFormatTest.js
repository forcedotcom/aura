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
    testFormatDateTime:{
		attributes: {value : '2004-09-23T16:30:00.000Z'},
        test:function(cmp){
            aura.test.addWaitFor(true, function(){return $A.test.getText(cmp.getSuper().find('span').getElement()).length > 0;},function(){
                aura.test.assertEquals("+00:00 00:30:16 09 23 2004", $A.test.getText(cmp.getSuper().find('span').getElement()), "Format should be the one specified in the overridden method");
            });
        }
    }
})
