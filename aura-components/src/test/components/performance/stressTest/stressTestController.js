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
	run: function(cmp, event, helper) {
	    var runProfile = cmp.find("profileCheckbox").get("v.value");
		var components = [];
        for(var c=0;c<50000;c++) {
            components.push(["markup://aura:html", {}]);
            components.push(["markup://aura:text", {}]);
        }

        var start = performance.now();
        if(runProfile) {
            console.profile("Simple Component Creation");
        }
        $A.createComponents(components, function(components) {
            if(runProfile) {
                console.profileEnd("Simple Component Creation");
            }
            var end = performance.now();
            console.log("stressTest.app Component Creation: ", end - start);

             for(var c=0;c<components.length;c++) {
                 components[c].destroy(false);
             }
        });
	}
})