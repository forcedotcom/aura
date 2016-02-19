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
    buildBody: function (cmp, shouldClearBody) {
        var anchorElement = cmp.find("anchor").getElement();

        if (!anchorElement.onclick) {
            anchorElement.onclick = this.select.bind(this, cmp);
        }

        var label = cmp.get("v.label");
        var isDisabled = cmp.get("v.disabled");

        anchorElement.setAttribute("aria-disabled", isDisabled);
        anchorElement.setAttribute("tabindex", isDisabled ? "-1" : "0");
        anchorElement.setAttribute("title", label);

        var bodyAttribute = cmp.get("v.body");
        var hasBodyAttribute = bodyAttribute !== null && bodyAttribute.length > 0;

        if (shouldClearBody) {
            $A.util.clearNode(anchorElement);

            if (hasBodyAttribute) {
                $A.renderingService.renderFacet(cmp, bodyAttribute, anchorElement);
            } else {
                anchorElement.appendChild(document.createTextNode(label));
            }
        } else {
            if (hasBodyAttribute) {
                $A.renderingService.rerenderFacet(cmp, bodyAttribute);
            }
        }
    },

    // Since there's no way to specify that the concrete implementation of a method should be called, this is
    // a workaround that achieves this functionality.
    select: function(cmp) {
        if (cmp.isValid()) {
            cmp.getConcreteComponent().select();
        }
    }

})// eslint-disable-line semi
