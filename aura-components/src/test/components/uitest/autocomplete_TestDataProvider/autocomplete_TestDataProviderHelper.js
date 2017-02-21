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
    	var data;

    	$A.log("provide");
        if (component.get("v.dataType") === "largeList") {
            data = component.get("m.listOf500Items");
        } else if (component.get("v.dataType") === "emptyList") {
            data = component.get("m.emptyList");
        } else if (component.get("v.dataType") === "splChar") {
            data = component.get("m.splChar");
        } else {
            data = component.get("m.listOfData");
        }
		$A.log(data);

        var dataProvider = component.getConcreteComponent();
        this.fireDataChangeEvent(dataProvider, data);
    }
})