/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    update508Attrs : function(cmp){
        var a = cmp.find("a");
        var tabBody = cmp.find("tabBody");
        if (a && tabBody) {
            var elementA = a.getElement();
            var elementT = tabBody.getElement();
            var active = cmp.getAttributes().getValue("active").getBooleanValue();
            if (active) {
                elementA.setAttribute("aria-selected", "true");
                elementT.setAttribute("aria-expanded", "true");
            } else {
                elementA.removeAttribute("aria-selected");
                elementT.removeAttribute("aria-expanded");
            }
        }
    }
})
