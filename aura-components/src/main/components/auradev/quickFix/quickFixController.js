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
    fix : function(cmp, evt){
        var values = aura.util.formToMap(cmp.find("form").getElement());
        var a = cmp.get("c.doFix");
        var quickFix = cmp.getAttributes().getValue("quickFix");
        a.setParams({
            name: quickFix.getValue("name").getValue(),
            attributes: values
        });

        a.setCallback(cmp, function(action){
            var state = action.getState();
            if(state === "ERROR"){
                alert(action.getError().message);
            }else{
                location.reload();
            }
        });

        this.runAfter(a);
    }
})
