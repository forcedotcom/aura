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
{
    submit : function(component, event, helper) {
        // find out who clicked submit and display inputed value
        var cmpName = event.source.get("v.buttonTitle");
        var inputCmpName = "in" + cmpName;
        var outputCmpName = "out" + cmpName;
        $A.log("Input Value (" + cmpName + "): ");

        var inputCmpValue = component.find(inputCmpName).get("v.value");
        $A.log(inputCmpValue);

        //component.find(outputCmpName).getAttributes().setValue("value", "**" + inputCmpValue + "**");
        helper.goToServer(this, component, event, cmpName, inputCmpValue);

        helper.incermentSubmitCount(component);
    }
}
