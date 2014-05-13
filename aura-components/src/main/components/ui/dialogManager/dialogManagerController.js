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


    /**
     * Handler for the ui:openDialog application-level event. Activates a
     * single ui:dialog component.
     */
    openDialog : function(cmp, evt, hlp) {

        var activeDialog = cmp.get("v._activeDialog"),
            triggerEvent = evt.getParam("triggerEvent"),
            dialog       = evt.getParam("dialog"),
            eventToKill  = triggerEvent;

        // we need to kill all "click" events that open dialogs, so they don't
        // bubble up to the document and immediately close the dialog.
        // the triggerEvent could either be a raw DOM click, or a click generated
        // from ui:press. figure out which one it is, then kill it.
        if (triggerEvent) {
            if (triggerEvent.getName && triggerEvent.getName() === "press") {
                eventToKill = triggerEvent.getParam("domEvent");
            }
            $A.util.squash(eventToKill);
        }

        // only one open dialog is allowed at a time ... if there's one
        // already open, close that one first.
        if (activeDialog && activeDialog!=dialog && activeDialog.isInstanceOf && activeDialog.isInstanceOf("ui:dialog")) {
            hlp.deactivateDialog(activeDialog, cmp);
        }

        hlp.activateDialog(hlp.getDialogRoot(dialog), cmp);

    },


    /**
     * Handler for the ui:closeDialog application-level event. Deactivates a
     * single ui:dialog component.
     */
    closeDialog : function(cmp, evt, hlp) {

        var dialog = hlp.getDialogRoot(evt.getParam("dialog"));
        hlp.deactivateDialog(dialog, cmp);

    }


})