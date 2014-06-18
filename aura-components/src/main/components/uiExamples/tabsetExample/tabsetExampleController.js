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
    onPrevious: function(cmp, evt) {
        var tabset = cmp.find("navigationTabset");
        var e = tabset.get("e.getActiveTab");
        e.setParams({callback: function(result) {
            var index = result.index;
            tabset.get("e.activateTab").setParams({"index": --index}).fire();
        }}).fire();
    },
    
    onNext: function(cmp, evt) {
        var tabset = cmp.find("navigationTabset");
        var e = tabset.get("e.getActiveTab");
        e.setParams({callback: function(result) {
            var index = result.index;
            tabset.get("e.activateTab").setParams({"index": ++index}).fire();
        }}).fire();
    },
    
    onActivated: function(cmp, evt) {
        var tab = evt.getParam("tab");
        alert(tab.get("v.title") + " activated");
    },
    
    loadContent: function(cmp, evt) {
        var tab = evt.getParam("tab");
        $A.componentService.newComponentAsync(this, function(newCmp){
            tab.set("v.body", [newCmp]);
        }, {"componentDef": "markup://aura:text", "attributes":{"values": {"value":"New tab content"}}});
    },
    
    addTab: function(cmp, evt) {
        if (!cmp._counter) cmp._counter = 0;
        var title = cmp.find("inputTabTitle").get('v.value') || (" New Tab " + cmp._counter);
        var content = cmp.find("inputTabContent").get("v.value") || ('New Tab \n Content ' + cmp._counter);
        var closable = cmp.find("inputTabClosable").get("v.value") || false;
        var active = cmp.find("inputTabActive").get("v.value") || false;
        var name = cmp.find("inputTabName").get("v.value");
        var e =cmp.find('addableTabset').get("e.addTab");
        
        e.setParams({tab: {
            "title": title,
            "closable": closable,
            "active": active,
            "name": name,
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
    
    onBeforeActivate: function(cmp, evt) {
        var callback = evt.getParam("callback");
        var tab = evt.getParam("tab");
        if (tab.get("v.title") === "Event Tab" && tab.get("v.icon")[0].get("v.value") === "*") {
            //don't activate if it's dirty
            callback(false);
            alert('Event tab is dirty, cannot be activated');
        }
    },
    
    markDirty: function(cmp, evt) {
        cmp.find("dirtyTabTitle").set("v.value", "*");
    },
    
    clearDirty: function(cmp) {
        cmp.find("dirtyTabTitle").set("v.value", "");
    }
})