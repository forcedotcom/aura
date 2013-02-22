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

    /* handler for application event ui:dialogManagerReady */
    registerDialog : function(cmp, evt, hlp) {
        var manager = evt.getParam("manager"),
            dialogs = manager.get("v._dialogs");
        cmp.getAttributes().setValue("_dialogManager", manager);
        dialogs.push(cmp);
        manager.getAttributes().setValue("_dialogs", dialogs);
    },

    /* local handlers */
    closeDialog : function(cmp) {
        var evt = $A.get("e.ui:closeDialog");
        evt.setParams({
            dialog : cmp
        });
        evt.fire();
    }

})
