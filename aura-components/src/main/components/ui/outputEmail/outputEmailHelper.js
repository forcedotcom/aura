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
        var body = cmp.find("body");

        if (body) {
            var bodyElement = body.getElement();
            $A.util.clearNode(bodyElement);

            var actionable = $A.util.getBooleanValue(cmp.get("v.actionable"));
            var value = cmp.get("v.value") || '';

            if (!$A.util.isEmpty(value)) {
                var label = cmp.get("v.label") || '';

                var node;
                if (actionable) {
                    node = $A.util.createHtmlElement("a", {"href": "mailto:" + value});
                    var text = label === "" ? value : label;

                    node.appendChild(document.createTextNode(text));
                } else {
                    node = document.createTextNode(value);
                }
                bodyElement.appendChild(node);
            }

        }
    }

})// eslint-disable-line semi
