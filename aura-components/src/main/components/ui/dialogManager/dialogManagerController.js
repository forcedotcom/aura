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

        var atts         = cmp.getAttributes(),
            activeDialog = atts.get("_activeDialog"),
            triggerEvent = evt.getParam("triggerEvent"),
            dialog       = evt.getParam("dialog");

        // kill the "click" event generated from ui:press so it doesn't bubble
        // up to the document and immediately close the dialog.
        if (triggerEvent && triggerEvent.getName() === "press") {
            $A.util.squash(triggerEvent.getParam("domEvent"));
        }

        // only one open dialog is allowed at a time ... if there's one
        // already open, close that one first.
        if (activeDialog) {
            hlp.deactivateDialog(activeDialog, cmp);
        }

        hlp.activateDialog(dialog, cmp);

    },


    /**
     * Handler for the ui:closeDialog application-level event. Deactivates a
     * single ui:dialog component.
     */
    closeDialog : function(cmp, evt, hlp) {

        var dialog       = evt.getParam("dialog"),
            triggerEvent = evt.getParam("triggerEvent");

        hlp.deactivateDialog(dialog, cmp);

    }


})