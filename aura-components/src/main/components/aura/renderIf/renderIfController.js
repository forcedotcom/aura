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
    init: function(cmp) {
        var isTrue        = $A.util.getBooleanValue(cmp.get("v.isTrue"));
        var bodyTemplate  = cmp.get("v.body");
        var elseTemplate  = cmp.get("v.else");
        var template      = cmp.get("v.template");

        if (bodyTemplate.length && !template.length) {
            template=bodyTemplate;
        }
        var facets=[template,elseTemplate];
        for(var i=0;i<facets.length;i++){
            for(var j=0;j<facets[i].length;j++){
                facets[i][j].autoDestroy(false);
            }
        }

        cmp.set("v.template", template, true);
        cmp.set("v.body", isTrue?template:elseTemplate, true);
    },

    destroy:function(cmp){
        var facets=[cmp.get("v.template"),cmp.get("v.else")];
        for(var i=0;i<facets.length;i++){
            for(var j=0;j<facets[i].length;j++){
                facets[i][j].destroy();
            }
        }
    },

    facetChange: function(cmp, event) {
        if(this.updating){
            return;
        }
        var j;
        var i;
        var facets=[event.getParam("value"), event.getParam("oldValue")];
        for(i=0;i<facets.length;i++){
            if (!$A.util.isArray(facets[i])) {
                facets[i]=[facets[i]];
            }
            for(j=0;j<facets[i].length;j++){
                facets[i][j].autoDestroy(true);
            }
        }
        var isTrue = $A.util.getBooleanValue(cmp.get("v.isTrue"));
        var bodyTemplate=cmp.get("v.body");
        var elseTemplate=cmp.get("v.else");
        var template=cmp.get("v.template");
        if(bodyTemplate!==template){
            template=bodyTemplate;
        }
        facets=[template,elseTemplate];
        for(i=0;i<facets.length;i++){
            for(j=0;j<facets[i].length;j++){
                facets[i][j].autoDestroy(false);
            }
        }
        this.updating=true;
        cmp.set("v.body", isTrue?template:elseTemplate);
        this.updating=false;
    },

    updateBody:function(cmp){
        var isTrue = $A.util.getBooleanValue(cmp.get("v.isTrue"));
        this.updating=true;
        cmp.set("v.body", isTrue?cmp.get("v.template"):cmp.get("v.else"));
        this.updating=false;
    }

})// eslint-disable-line semi
