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
    /**
     * Initializes columns.
     * Action instances are not ready at provide invocation.
     */
    init: function (cmp, evt, helper) {
        helper.setRowData(cmp);
    },

    toggleClasses: function(cmp) {
        var target = cmp.find("rowClasses").getElement();
        var cmpList = cmp.get("v.classes");

        //Empty class list to begin with
        target.className = "";
        if(cmpList) {
            $A.util.addClass(target, cmpList.join(" "));
        }
    },

    toggleDisabled: function(cmp) {
        var vp = cmp.get("v.vp");
        vp.set("disabled", cmp.get("v.disabled"));
        cmp.set("v.vp", vp);
    },

    toggleSelected: function(cmp) {
        var vp = cmp.get("v.vp");
        vp.set("selected", cmp.get("v.selected"));
        cmp.set("v.vp", vp);
    },

    updateRowData: function(cmp, evt, helper) {
        helper.setRowData(cmp);
    }
})// eslint-disable-line semi