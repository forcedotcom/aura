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
    /*
     * Action can be passed as component attribute.
     */
    testAfterRenderTopLevel: {
        test: function(component){
            var fixture = component.find("fixture");

            var button = fixture.find("theButton");
            button.get("e.press").fire();

            var results = component.find("resultsGoHere");
            $A.test.assertEquals("Chained press action ran", results.getElement().innerHTML);
        }
    },

    /*
     * Html action can be passed as component attribute.
     */
    testAfterRenderTopLevelHtmlElement: {
        test: function(component){
            var fixture = component.find("fixture");
            var div = fixture.find("theDiv");

            var evt = document.createEvent("Events");
            evt.initEvent("click",true,true);
            div.getElement().dispatchEvent(evt);

            var results = component.find("resultsGoHere");
            $A.test.assertEquals("Chained press action ran", results.getElement().innerHTML);
        }
    },

    /*
     * Action can be passed as component attribute function.
     */
    testAfterRenderTopLevelFunctionEvaluation: {
        attributes: { push:true },
        test: function(component){
            var fixture = component.find("function");

            var button = fixture.find("theButton");
            button.get("e.press").fire();

            var results = component.find("resultsGoHere");
            $A.test.assertEquals("Chained push action ran", results.getElement().innerHTML);
        }
    },

    /*
     * Html action can be passed as component attribute function.
     */
    testAfterRenderTopLevelHtmlElementFunctionEvaluation: {
        attributes: { push:true },
        test: function(component){
            var fixture = component.find("function");
            var div = fixture.find("theDiv");

            var evt = document.createEvent("Events");
            evt.initEvent("click",true,true);
            div.getElement().dispatchEvent(evt);

            var results = component.find("resultsGoHere");
            $A.test.assertEquals("Chained push action ran", results.getElement().innerHTML);
        }
    },
})
