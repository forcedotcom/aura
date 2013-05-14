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
{
    updateAuraAssist : function(cmp, event){
        var a = cmp.get("c.updateAuraAssistServer");

        a.setCallback(cmp, function(action){
            if (action.getState() === "SUCCESS") {
               alert('Done! Content written to:'+ action.getReturnValue());
            } else {
               alert('Ooops! Something went wrong check your console.');
            }
        });

        $A.enqueueAction(a);
    },

    waiting : function(cmp, event, helper){
        helper.showWaiting(cmp);
    },

    doneWaiting : function(cmp, event, helper){
        helper.hideWaiting(cmp);
    },

    refreshBegin : function(cmp, event, helper){
        helper.showRefreshing(cmp);
    },

    refreshEnd : function(cmp, event, helper){
        helper.hideRefreshing(cmp);
    }
}
