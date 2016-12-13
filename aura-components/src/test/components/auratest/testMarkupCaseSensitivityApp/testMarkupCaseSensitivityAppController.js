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
    //in markup
    tryOutMarkup : function(cmp){
        //we have <componentTEST:hasBody/> as 2nd facet,  <auraTEST:testMarkupCaseSensitivityOuterCmp/>
        //as 3rd facet, both of them get the namespace with wrong case
        //however we only honor the wrong one in the 3rd facet
        //because we have the correct one as 1st facet: <componentTest:HASBody/>, and it get cached, what 2nd one said doesn't matter
        var facetsArray = cmp.getDef().getFacets()[0];
        console.log("facet for <componentTEST:hasBody/>:",facetsArray.value[1].componentDef.descriptor);
        console.log("facet for <auraTEST:TESTMarkupCaseSensitivityOuterCmp/>:",facetsArray.value[2].componentDef.descriptor);

        $A.createComponent("componentTest:hasBody",
                {},
                function(newCmp) {
                    console.log("getting hasBody", newCmp);
                }
        );
        //we will get right case anyway
        $A.createComponent("componentTest:HASBody",
                {},
                function(newCmp) {
                    console.log("getting HASBody:",newCmp);
                }
        );

    },

    //in markup, dependency
    tryOutDependency : function(cmp) {
        //this give us appCache:withpreload
        $A.createComponent("appCache:withpreload",
                {},
                function(newCmp) {
                    console.log("getting appCache:withpreload",newCmp);
                }
        );

        //this error out
        $A.createComponent("appCache:WITHPRELOAD",
                {},
                function(newCmp) {
                    console.log("getting appCache:WITHPRELOAD",newCmp);
                }
        );
    },

    //in markup, lib
    tryOutLibs : function(cmp) {
        var helper = cmp.getDef().getHelper();
        var importED = helper.importED;
        if(importED) {
            var str = "";
            for(var item in importED) {
                if(item) {
                    str=str+item+":";
                    if(importED[item] instanceof Function) {
                        str = str + importED[item]() + ";";
                    } else {
                        str = str + importED[item] + ";";
                    }
                }
            };
            cmp.set("v.output", str);
            cmp.set("v.outputClass", "libs");
        } else {
            cmp.set("v.output", "helper.importED should exsit, what happened?")
        }
    },

    tryOutClientLibs: function(cmp) {
        console.log("CkEditor exist?", window.CKEDITOR);
        //Perf is undefined.
    }
})
