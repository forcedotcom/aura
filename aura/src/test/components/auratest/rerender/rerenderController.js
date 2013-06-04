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
{
    pushText : function(cmp) {
        var v = cmp.getValue(cmp.get("v.whichArray"));
        if (!v) { return; }
        var array = v.unwrap();
        array.push($A.componentService.newComponentDeprecated({
            "componentDef": {
                "descriptor": "markup://aura:text"
            },

            "attributes": {
                "values": {
                    "value": "PUSHED."
                }
            }
        }));
        v.setValue(array);
    },

    pushComponent : function(cmp) {
        var v = cmp.getValue(cmp.get("v.whichArray"));
        if (!v) { return; }
        var array = v.unwrap();
        array.push($A.componentService.newComponentDeprecated({
            "componentDef": {
                "descriptor": "markup://auratest:rerenderChild"
            },

            "attributes": {
                "values": {
                    "title": new Date().getTime()
                }
            }
        }));
        v.setValue(array);
    },

    pop : function(cmp) {
        var v = cmp.getValue(cmp.get("v.whichArray"));
        if (!v) { return; }
        var array = v.unwrap();
        array.pop();
        v.setValue(array);
    },

    reverse : function(cmp) {
        var v = cmp.getValue(cmp.get("v.whichArray"));
        if (!v) { return; }
        var array = v.unwrap();
        array.reverse();
        v.setValue(array);
    },

    clear : function(cmp) {
        var v = cmp.getValue(cmp.get("v.whichArray"));
        if (!v) { return; }
        v.clear();
    }
}
