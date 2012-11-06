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
    createComponent:function(cmp,evt,helper){
        var desc = cmp.get("v.newDescriptor");
        var attStr = cmp.get("v.newAttributes");
        var atts = eval("false||"+attStr);
        var config = { componentDef:desc, attributes:{ values:atts } };
        var newcmp = $A.componentService.newComponent(config, null, true, false);
        cmp.getValue("v.body").insert(0, newcmp);
    }
})
