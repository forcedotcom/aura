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
    getAction: function(cmp, name, msg) {
        var a = cmp.get(name);
        a.setParams({
            inVar: msg
        });
        a.setCallback(cmp, function(action){
                var retValue;

                if (action.getState() === "SUCCESS") {
                    retValue = action.getReturnValue();
                } else {
                    $A.error("Action failed: " + name);
                }
                //var output =  cmp.find("outputValue").getAttributes().getValue("value").getValue();
                var output =  cmp.find("outputValue").get("v.value");
                cmp.find("outputValue").getAttributes().setValue("value", output + retValue);
        });
        return a;
    }
})