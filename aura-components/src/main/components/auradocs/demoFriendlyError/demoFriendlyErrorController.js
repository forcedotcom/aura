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
    friendlyErrorThrow : function(){
        var afe = new $A.auraFriendlyError();
        afe.data = {"friendlyMessage": "Hello friend, you've encountered an error!"};
        throw afe;
    },

    showErrorDialog: function(cmp, event) {
        var afe = event.getParam('auraError');
        if (afe) {
            afe["handled"] = true;
            var output = cmp.find('errorText');
            var dialog = cmp.find('errorOverlay');
            var open = $A.get("e.ui:openDialog");

            output.set("v.value", afe.data["friendlyMessage"]);

            open.setParams({
                dialog : dialog,
                //triggerEvent is optional, unless when the trigger is a ui:press event
                triggerEvent : event
            });
            open.fire();
        }
    },

    hideErrorDialog: function(cmp){
        var dialog= cmp.find('errorOverlay');
        var close = $A.get("e.ui:closeDialog");
        close.setParams({
            dialog : dialog
        });
        close.fire();
    }
})
