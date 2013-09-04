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
    afterRender : function(cmp){
        if (cmp.getValue("v.loaded").getBooleanValue()){
            return this.superAfterRender();
        }

        var action = $A.get("c.aura://ComponentController.getComponent");
        var attributes = cmp.getValue("v.attributes");
        var atts = {};
        var avp = cmp.getAttributes().getValueProvider();

        if(attributes.each){
            attributes.each(function(key, value){
                atts[key] = $A.componentService.computeValue(value, avp, true);
            });
        }
        
        action.setCallback(this, function(a){

            var newBody;
            if (a.getState() === "SUCCESS"){
                newBody = $A.newCmpDeprecated(a.getReturnValue(), avp);
                newBody.getAttributes().merge(attributes, true);
            } else {
                var errors = a.getError();
                newBody = $A.newCmpDeprecated("markup://aura:text");
                if (errors) {
                    newBody.getValue("v.value").setValue(errors[0].message);
                } else {
                    newBody.getValue("v.value").setValue('unknown error');
                }
            }
            var body = cmp.getValue("v.body");

            body.destroy();
            body.setValue(newBody);

            $A.rerender(cmp);

            //reindex
            var localId = cmp.getLocalId();
            if(localId){
                var cvp = cmp.getAttributes().getComponentValueProvider();
                cvp.deIndex(localId, cmp.getGlobalId());
                cvp.index(localId, newBody.getGlobalId());
            }
        });
        var desc = cmp.get("v.refDescriptor");
        action.setParams({
            "name" : desc,
            "attributes" : atts
        });

        action.setExclusive(cmp.getValue("v.exclusive").getBooleanValue());
        cmp.getValue("v.loaded").setValue(true);
        $A.enqueueAction(action);

        this.superAfterRender();
    }
})
