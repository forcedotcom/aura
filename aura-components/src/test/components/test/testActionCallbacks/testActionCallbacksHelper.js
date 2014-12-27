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
    runTest: function(component, action, callback, expected) {
        component.set("v.cbState", "NONE");
        component.set("v.cbExpected", expected);
        component.set("v.cbComplete", "No");
        component.set("v.cbResult", "NONE");
        var action = component.get(action);
        action.setCallback(this, function(a) {
            component.set("v.cbComplete", "Broken");
            component.set("v.cbState", a.getState());
        }, "ALL");
        action.setCallback(this, function(a) {
            component.set("v.cbComplete", "Yes");
            component.set("v.cbState", a.getState());
            component.set("v.cbResult", a.getState());
        }, callback);
        $A.enqueueAction(action);
    }
})

