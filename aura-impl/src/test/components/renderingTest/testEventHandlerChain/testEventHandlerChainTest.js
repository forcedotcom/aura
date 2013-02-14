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
    testRerenderingThroughActionChaining:{
        test:[function(cmp){
            //Verify initial value
            this.verifyTextContent(cmp,"London");
            //Fire a event, that would go through handler1, fire another event, invoke handler3, come back and finish handler2
            $A.get("e.handleEventTest:applicationEvent").fire();
            this.verifyTextContent(cmp,"LondonParisMercuryTokyo");
        }
        ]
    },
    verifyTextContent:function(cmp, expectedText){
        $A.test.assertEquals(expectedText, $A.test.getText(cmp.find('divOnBody').getElement()),
                "Value not rendered in elements on top level component's body.");
        //Make sure CSS selector for elements also get updated
        $A.test.assertEquals(expectedText+' input insideFacet', cmp.find('input').getElement().className,
        "ClassName for element not udpated through value changes.");

        $A.test.assertEquals(expectedText, cmp.find('input').getElement().value,
                "Value not rerenderer in component array of facet");
        $A.test.assertEquals(expectedText, $A.test.getText(cmp.find('div').getElement()),
                "Value not rerenderer in component array of facet");
    }
})
