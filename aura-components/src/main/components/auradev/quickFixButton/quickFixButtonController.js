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
        var quickFix = cmp.get("v.quickFix");
        var ui = quickFix["ui"];
        if (ui) {
            $A.newCmpAsync(
                this,
                function(newCmp){
                    var show = cmp.getEvent("showUI");
                    show.setParams({
                        ui : newCmp
                    });
                    show.fire();
                },
                {
                    componentDef: ui,
                    attributes: {
                        values: {
                            quickFix: quickFix
                        }
                    }
                }
            );
        } else {
            var a = cmp.get("c.doFix");
            a.setParams({
                name: quickFix["name"],
                attributes: quickFix["attributes"]
            });

            a.setCallback(cmp, function(action){
                alert("woohoo");
            });

            $A.enqueueAction(a);
        }
    }
})
