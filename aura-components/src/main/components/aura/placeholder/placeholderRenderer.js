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
    render:function(cmp){
        var ret=this.superRender();
        return ret;
    },

    rerender:function(cmp){
        return this.superRerender();
    },

    afterRender : function(cmp){
        if ($A.util.getBooleanValue(cmp.get("v.loaded"))){
            return this.superAfterRender();
        }

        var action = $A.get("c.aura://ComponentController.getComponent");
        var attributes = cmp.get("v.attributes");
        var atts = {};
        for(var x in attributes){
            var value=attributes[x];
            if(value["descriptor"]){
                value=value["value"];
            }
            if($A.util.isExpression(value)){
                value=value.evaluate();
            }
            atts[x]=value;
        }
        var avp = cmp.getAttributeValueProvider();

        action.setCallback(this, function(a){
            var newBody;
            if (a.getState() === "SUCCESS"){
                var config= a.getReturnValue();
                if(!config.hasOwnProperty("attributes")){
                    config["attributes"]={"values":{}};
                }
                $A.util.apply(config["attributes"]["values"],attributes);
                newBody = $A.newCmpDeprecated(config, avp, false, false);
            } else {
                var errors = a.getError();
                newBody = $A.newCmpDeprecated("markup://aura:text", null, false, false);
                if (errors) {
                    newBody.set("v.value", errors[0].message);
//                    throw errors[0].message;
                } else {
                    newBody.set("v.value", 'unknown error');
                }
            }


//            $A.renderingService.rerenderFacet(cmp,cmp.get("v.body"));

            //reindex
            var localId = cmp.getLocalId();
            if(localId){
                var cvp = cmp.getAttributeValueProvider();
                cvp.deIndex(localId, cmp.getGlobalId());
                cvp.index(localId, newBody.getGlobalId());
            }
            cmp.set("v.loaded", true, true);
            cmp.set("v.body", [newBody]);
        });

        var desc = cmp.get("v.refDescriptor");
        action.setParams({
            "name" : desc,
            "attributes" : atts
        });

        action.setExclusive($A.util.getBooleanValue(cmp.get("v.exclusive")));
        $A.enqueueAction(action);

        this.superAfterRender();
    }
})
