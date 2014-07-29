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
    addTab: function(cmp, evt) {
        if (!cmp._counter) cmp._counter = 0;
        var title = "Dynamic";
        var content = "Dynamically generated";
        var closable = true;
        var active = true;
        var e = cmp.find('tabset2').get("e.addTab");
        
        e.setParams({tab: {
            "title": title,
            "closable": closable,
            "active": active,
            "body": [{
                "componentDef": { descriptor:"markup://aura:text" },
                "attributes": {
                    "values": {
                        "value": content
                    }
            }
        }]}, index: -1});
        e.fire();
        cmp._counter++;
    },
    
    updateTab: function(cmp) {
        cmp.find("icon").set("v.value", "new Title");
    },
    
    activateTabByName: function(cmp) {
        var name = cmp.find("campaigns").get('v.name');
        var e = cmp.find('tabset2').get("e.activateTab");
        e.setParams({"name": name}).fire();
    },
    
    activateTabByIndex: function(cmp) {
        var e = cmp.find('tabset2').get("e.activateTab");
        e.setParams({"index": 6}).fire();
    }
    
})