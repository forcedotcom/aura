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
    insertDeleteNode: function(cmp, event, helper) {
        var insertDeleteDiv = cmp.find("insertDeleteDiv").getElement();
        if (insertDeleteDiv.children && insertDeleteDiv.children.length > 0) {
            insertDeleteDiv.removeChild(insertDeleteDiv.children[0]);
        } else {
            var div = helper.createTextDiv(cmp.get("v.content[0]"));
            insertDeleteDiv.appendChild(div);
        }
    },
    showHideNode: function(cmp) {
        var showHideDiv = cmp.find("showHideDiv").getElement();
        $A.util.toggleClass(showHideDiv, "hidden");
    },
    changeContent: function(cmp, event, helper) {
        helper.toggleAttribute(cmp, "v.showContent0");
    },
    changeHeight: function(cmp, event, helper) {
        helper.toggleAttribute(cmp, "v.heightClass", "smallHeight", "largeHeight");
    },
    changeWidth: function(cmp, event, helper) {
        helper.toggleAttribute(cmp, "v.widthClass", "smallWidth", "largeWidth");
    }
})//eslint-disable-line semi
