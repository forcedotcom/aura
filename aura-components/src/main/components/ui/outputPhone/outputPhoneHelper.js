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
    updateHref: function(cmp){
        if (cmp.getAttributes().getValue("value")) {
            var value = cmp.getAttributes().getValue("value").getValue();

            if (value) {
                var link = cmp.find("link");
                if (link) {
                    var element = link.getElement();
                    if (value.search("#") != -1 || value.search("\\*") != -1) {
                        element.removeAttribute("href");
                    } else {
                        var tel = this.removeSpaces(value);
                        element.setAttribute("href", "tel:" + tel);
                    }
                }
            }
        }
    },
    /*
     ** Remove spaces (if there is any) in value and return the no-space result. 
     */
    removeSpaces: function(value) {
        return (value || "").replace(/\s/g, "");
    }
})
