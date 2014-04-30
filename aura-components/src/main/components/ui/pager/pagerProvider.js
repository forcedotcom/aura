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
    provide:function(component) {
        var type=component.get("v.type")||'';
        var typeMap=getTypeMap();
        var typeDescriptor=(type.indexOf(':')>-1)?type:typeMap[type];
        if(typeDescriptor!=null)return typeDescriptor;
        var typeList=[]; // Ok to do this at call time because we are in a fatal error
        for(var typeName in typeMap)typeList.push(typeName)
        throw new Error("Unknown type attribute specified for ui:pager '"+type+"'. Remove the type attribute or use one of the following values: '"+typeList.join("', '")+"', or any namespaced component descriptor, e.g. ns:CustomPager.");

        function getTypeMap(){
            var callee=arguments.callee;
            if(!callee.typeMap){
                callee.typeMap={
                    "JumpToPage":   "ui:pagerJumpToPage",
                    "NextPrevious": "ui:pagerNextPrevious",
                    "PageInfo":     "ui:pagerPageInfo",
                    "PageSize":     "ui:pagerPageSize",
                    "":             "ui:pagerNextPrevious"
                };
            }
            return callee.typeMap;
        }
    }
})
