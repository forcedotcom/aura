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
    testBackRefsAreCorrect:{
        testLabels: ["auraSanity"],
        test:function(cmp){
            var element = document.getElementById("ifDiv");
            var component = $A.services.component.getRenderingComponentForElement(element).getAttributes().getValueProvider();
            $A.test.assertEquals(cmp, component, "call to $A.services.component.getRenderingComponentForElement(elm) should have returned this component");


            element = document.getElementById("elseDiv");
            component = $A.services.component.getRenderingComponentForElement(element).getAttributes().getValueProvider();
            $A.test.assertEquals(cmp, component, "call to $A.services.component.getRenderingComponentForElement(elm) should have returned this component");

            element = document.getElementById("burriedDiv");
            component = $A.services.component.getRenderingComponentForElement(element).getAttributes().getValueProvider();
            $A.test.assertEquals(cmp, component, "call to $A.services.component.getRenderingComponentForElement(elm) should have returned this component");

            var burriedOutputTextCmp = cmp.find("burriedOutputText");
            component = $A.services.component.getRenderingComponentForElement(burriedOutputTextCmp.getElement()).getAttributes().getValueProvider();

            $A.test.assertEquals(burriedOutputTextCmp, component, "call to $A.services.component.getRenderingComponentForElement(elm) should have returned outputText component");

            element = document.getElementById("leftBlockDiv");
            component = $A.services.component.getRenderingComponentForElement(element).getAttributes().getValueProvider();
            $A.test.assertEquals(cmp, component, "call to $A.services.component.getRenderingComponentForElement(elm) should have returned this component");

            element = document.getElementById("bodyBlockDiv");
            component = $A.services.component.getRenderingComponentForElement(element).getAttributes().getValueProvider();
            $A.test.assertEquals(cmp, component, "call to $A.services.component.getComponentForElement(elm) should have returned this component");

        }
    }
})
