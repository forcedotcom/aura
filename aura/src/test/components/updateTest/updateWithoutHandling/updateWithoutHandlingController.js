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
{
    updateText:function(c,e,h){
        c.getValue("v.text").setValue("modified");
        var div = document.createElement("div");
        div.className = "reloadMarker";
        $A.util.appendChild(div, c.getElement());
    },

    sendOutdatedRequest:function(c,e,h){
        var ctx = $A.getContext();
        for(var p in ctx){
            var val = ctx[p];
            if($A.util.isString(val) && !isNaN(val*1)){
                ctx[p] = "" + (val - 1);
            }
        }
        c.getValue("v.text").setValue("i was updated");
        var a = c.get("c.noArgs");
        a.runAfter(a);
    }
}
