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
    render: function (cmp, helper) {
        var url = cmp.get("v.value");
        if ($A.util.getBooleanValue(cmp.get("v.fixURL"))) {
            url = helper.urlLib.urlUtil.makeAbsolute(url);
        }

        cmp.set("v.absoluteURL", url);

        var ret = this.superRender();

        helper.buildLinkBody(cmp);

        helper.handleDisabled(cmp);

        return ret;
    },

    afterRender: function (component, helper) {
        helper.lib.interactive.addDomHandler(component, "mouseover");
        helper.lib.interactive.addDomHandler(component, "mouseout");
    },

    rerender: function (cmp, helper) {
        var url = cmp.get("v.value");
        if (cmp.isDirty("v.value") && $A.util.getBooleanValue(cmp.get("v.fixURL"))) {
            url = helper.urlLib.urlUtil.makeAbsolute(url);
        }

        cmp.set("v.absoluteURL", url);

        this.superRerender();

        if (cmp.isDirty("v.label") || cmp.isDirty("v.iconClass") || cmp.isDirty("v.alt")) {
            helper.buildLinkBody(cmp);
        }

        if (cmp.isDirty("v.disabled")) {
            helper.handleDisabled(cmp);
        }
    },

    unrender: function(component, helper) {
        helper.lib.interactive.removeDomEventsFromMap(component);
        component.superUnrender();
    }
});
