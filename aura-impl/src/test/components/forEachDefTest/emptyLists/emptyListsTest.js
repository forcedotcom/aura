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
    /*
     * Make sure that forEach defs with items of null or empty lists render nothing and don't cause js errors
     */
    testEmptyLists:{
        test:function(cmp){
        	var children = cmp.getSuper().get("v.body");
            $A.test.assertEquals(8, children.length);
            $A.test.assertEquals("start", children[0].getLocalId());
            $A.test.assertEquals("0", $A.test.getTextByComponent(children[0]));
            $A.test.assertEquals("end", children[7].getLocalId());
            $A.test.assertEquals("1", $A.test.getTextByComponent(children[7]));
            for(var i =1; i<7;i++){
            	$A.test.assertEquals("", $A.test.getTextByComponent(children[i]));
            }
        }
    }
})
