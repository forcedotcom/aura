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
     * Verify that a component's provider does not inteferer with the iteration component's provider.
     */
    testChildrenWithJSProvider:{
        attributes:{start:0, end:2},
        test:function(cmp){
            var items = cmp.find("childWithJSProvider");
            for(var i = 0, n = items.length; i < n; i++){
                var item = items[i];
                $A.test.assertEquals("markup://iterationTest:iterationChildWJSProvider", item.getDef().getDescriptor().toString());
                //Verify that provided attribute value is the same as expected
                $A.test.assertEquals("TextAppend"+cmp.get('m.innerData')[i],
                        item.get("v.newStrAttribute"));
                $A.test.assertEquals("TextAppend"+cmp.get('m.innerData')[i],
                        $A.test.getTextByComponent(item));
            }
        }
    }
})
