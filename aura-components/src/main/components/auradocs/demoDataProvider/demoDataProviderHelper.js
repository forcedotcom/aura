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
    provide: function(component, event, controller) {
        var dataProvider = component.getConcreteComponent();
        if (!dataProvider._loadedOnce) {
            // it is assumed this dataProvider will come fully equipped with an initial data payload in its model.
            dataProvider._loadedOnce = true;
        } else {
           // var keyword = event.getParam("parameters").keyword;
            var action = dataProvider.get("c.getItems");
            action.setParams({
                //"keyword": keyword
            });
            action.setCallback(this, function(action) {
                if (action.getState() === "SUCCESS") {
                    var result = action.getReturnValue();                    
                    this.fireDataChangeEvent(dataProvider, result); 
                }
            });
            $A.enqueueAction(action);
        }
    }
})
