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
    toggleAttribute: function(cmp, attr, v1, v2) {
        if (typeof cmp.get(attr) === "boolean") {
            cmp.set(attr, !cmp.get(attr));
        } else {
            cmp.set(attr, cmp.get(attr) === v1 ? v2 : v1);
        }
    },

    createTextDiv: function(content) {
        var div = document.createElement("div");
        var content = document.createTextNode(content);
        div.appendChild(content);
        return div;
    }
})//eslint-disable-line semi
