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
    init : function(cmp, event, helper) {
        $A.logger.info(cmp.getGlobalId() + ":" + helper.getDelimiter(cmp) + 'OuterInit');
    },
    
    clientAction : function(cmp, event, helper) {
        $A.logger.info(cmp.getGlobalId() + ":" + helper.getDelimiter(cmp) + 'OuterAction');
        var action = cmp.get("c.echo");
        action.setParams({
            input : helper.getDelimiter(cmp) + 'OuterParam'
        });
        action.setCallback(this, function(a){
            var val = a.getReturnValue();
            $A.logger.info(cmp.getGlobalId() + ":" + val);
            cmp.set("v.valueOuter", val);
        });
        $A.enqueueAction(action);
    },
    
    valueChange : function(cmp, event, helper) {
        $A.logger.info(cmp.getGlobalId() + ":" + helper.getDelimiter(cmp) + 'OuterValuechange');
    },
    
    setValue : function(cmp, event, helper) {
        var val = helper.getDelimiter(cmp) + 'Outer' + event.getParam("arguments").value;
        $A.logger.info(cmp.getGlobalId() + ":" + val);
        cmp.set("v.valueOuter", val);
    }
    
})
