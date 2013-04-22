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
    update : function(cmp, activeTab) {
        var tabs = cmp.find({
            instancesOf : "ui:tab"
        });
        if (tabs && tabs.length) {
            var newActiveTab;
            for ( var i = 0; i < tabs.length; i++) {
                var tab = tabs[i];
                var active = false;
                if (activeTab === undefined) {
                    tab.addHandler("activated", cmp, "c.updateAction");
                    if (tab.get("v.active")) {
                        active = true;
                        newActiveTab = tab;
                    }
                } else if (tab === activeTab) {
                    active = true;
                    newActiveTab = tab;
                } else {
                    active = false;
                }
                tab.getAttributes().setValue("active", active);
            }

            if (!newActiveTab) {
                tabs[0].getAttributes().setValue("active", true);
            }

            setTimeout(function() {
                $A.get("e.ui:updateSize").fire();
            }, 400);
        }
    }
})
