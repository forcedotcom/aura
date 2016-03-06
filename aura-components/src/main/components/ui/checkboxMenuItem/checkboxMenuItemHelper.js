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
    buildBody: function (cmp) {
        var anchorElement = cmp.find("anchor").getElement();

        var label = cmp.get("v.label");
        var isDisabled = cmp.get("v.disabled");
        var isSelected = cmp.get("v.selected");

        anchorElement.setAttribute("aria-disabled", isDisabled);
        anchorElement.setAttribute("tabindex", isDisabled ? "-1" : "0");
        anchorElement.setAttribute("title", label);
        anchorElement.setAttribute("aria-checked", isSelected);

        var bodyAttribute = cmp.get("v.body");
        var hasBodyAttribute = bodyAttribute !== null && bodyAttribute.length > 0;

        $A.util.clearNode(anchorElement);

        anchorElement.appendChild(document.createElement("b"));

        if (hasBodyAttribute) {
            $A.renderingService.renderFacet(cmp, bodyAttribute, anchorElement);
        } else {
            anchorElement.appendChild(document.createTextNode(label));
        }

        if (isSelected === true) {
            $A.util.addClass(anchorElement, "selected");
        } else {
            $A.util.removeClass(anchorElement, "selected");
        }
    }

})// eslint-disable-line semi
