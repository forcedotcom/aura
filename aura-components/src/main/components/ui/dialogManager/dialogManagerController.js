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


    /**
     * Handler for the ui:openDialog application-level event. Activates a
     * single ui:dialog component.
     */
    openDialog : function(cmp, evt, hlp) {

        var atts       = cmp.getAttributes(),
            dialog     = evt.getParam("dialog");

        /* if there's already another dialog active, deactivate it first */
        if (atts.get("_activeDialog")) {
            hlp.deactivateDialog(atts.get("_activeDialog"), cmp);
        }

        hlp.activateDialog(dialog, cmp);

    },


    /**
     * Handler for the ui:closeDialog application-level event. Deactivates a
     * single ui:dialog component.
     */
    closeDialog : function(cmp, evt, hlp) {

        var dialog = evt.getParam("dialog");

        hlp.deactivateDialog(dialog, cmp);

    }


})