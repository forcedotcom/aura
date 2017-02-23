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
    // TODO: Refactor test component
    like: function (cmp, evt, helper) {
    	var itemClicked = {};
    	itemClicked["_id"] = cmp.get('v.id');
    	itemClicked["index"] = cmp.get('v.index');
    	itemClicked["balance"] = cmp.get('v.balance');
    	itemClicked["name"] = cmp.get('v.name');
    	itemClicked["friends"] = cmp.get('v.friends');
        /*alert([
            'Hey! you click in the item with id:' + cmp.get('v.id'),
            'Name: ' + cmp.get('v.name'),
            'Salary: ' + cmp.get('v.balance'),
            'Counter: ' + cmp.get('v.counter'),
            'Friends: \n\t' + cmp.get('v.friends').map(function(i){return i.name;}).join('\n\t')
        ].join('\n'));*/

    	cmp.find("outputItemInfo").set("v.value", JSON.stringify(itemClicked));
    },
    count: function (cmp, evt, helper) {
        var elmt = cmp.getElement();
        var counter = cmp.get('v.counter');
        cmp.set('v.counter', counter + 1);
    },
    salary: function (cmp) {
        alert('$' + cmp.get('v.balance'));
    },
    
    menuTrigger: function(cmp, evt) {
        console.log("Hello Trigger");
        console.log(evt);
    },
    
    menuSelect: function(cmp, evt) {
        console.log("Selected: ");
        console.log(evt.getParam("selectedItem").get("v.label"));
    }
})