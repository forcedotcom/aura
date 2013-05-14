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
    fix : function(cmp, evt){

        var quickFix = cmp.getAttributes().getValue("quickFix");
        var ui = quickFix.getValue("ui");
        if (ui) {
            ui = $A.services.component.newComponent({
                componentDef: ui.unwrap(),
                attributes: {
                    values: {
                        quickFix: quickFix.unwrap()
                    }
                }
            });
            var show = cmp.getEvent("showUI");
            show.setParams({
                ui : ui
            });
            show.fire();
        } else {
            var a = cmp.get("c.doFix");
            a.setParams({
                name: quickFix.getValue("name").getValue(),
                attributes: quickFix.getValue("attributes").getValue()
            });

            a.setCallback(cmp, function(action){
                alert("woohoo");
            });


            $A.enqueueAction(a);
        }
    }
})
