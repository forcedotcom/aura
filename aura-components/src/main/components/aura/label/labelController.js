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
    updateTemplate:function(cmp){
        if(!cmp.get("v.updating")){
            var bodyTemplate=cmp.get("v.body");
            for(var i=0;i<bodyTemplate.length;i++){
                if (bodyTemplate[i].isInstanceOf("aura:text")) {
                    bodyTemplate.splice(i--,1);
                }
            }
            cmp.set("v.template", bodyTemplate);
        }
        cmp.set("v.updating",false);
    },

    update:function(cmp){
        var value=cmp.get("v.value")||'';
        // No value, clear out body
        if(!value||!$A.util.isString(value)){
            cmp.set("v.updating",true);
            return cmp.getSuper().set("v.body",[]);
        }

        // No template, or no format index in value, use value as is
        var formatRegex=/\{(\d+)\}/gm;
        var template=cmp.get("v.template");
        if(!template||!template.length||!formatRegex.test(value)){
            // JBUCH: CHANGE TO $A.createComponent ONCE COMPONENTCONFIGS ARE AVAILABLE
            var valueText=$A.createComponentFromConfig({descriptor:"markup://aura:text",attributes:{value:value}});
            cmp.set("v.updating",true);
            return cmp.getSuper().set("v.body",[valueText]);
        }

        // Replace as many indexes as we can find, or as many body components, whichever comes first
        var body=[];
        var startIndex=0;
        value.replace(formatRegex, function(match, position, index) {
            var substitution = template[position];
            if (substitution !== undefined) {
                // JBUCH: CHANGE TO $A.createComponent ONCE COMPONENTCONFIGS ARE AVAILABLE
                body.push($A.createComponentFromConfig({descriptor:"markup://aura:text",attributes:{value:value.substring(startIndex,index)}}));
                body.push(substitution);
                startIndex=index+match.length;
            }
        });
        // Append the tail of the string
        if(startIndex<value.length){
            body.push($A.createComponentFromConfig({descriptor:"markup://aura:text",attributes:{value:value.substring(startIndex)}}));
        }
        cmp.set("v.updating",true);
        cmp.getSuper().set("v.body",body);
    }
})// eslint-disable-line semi
