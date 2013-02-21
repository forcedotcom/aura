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

    initialize : function(managerCmp) {
        var evt = $A.get("e.ui:dialogManagerReady");
        evt.setParams({ manager : managerCmp });
        managerCmp.getAttributes().setValue("_ready", true);
        evt.fire();
    },

    activateDialog : function(dialogCmp, managerCmp) {
        var atts = dialogCmp.getAttributes(),
            isModal = atts.getRawValue("isModal"),
            clickOutToClose = atts.getRawValue("clickOutToClose"),
            autoFocus = atts.getRawValue("autoFocus");
        this.addHandlers(dialogCmp, isModal, clickOutToClose, managerCmp);
        dialogCmp.getAttributes().setValue("_isVisible", true);
        if(autoFocus) {
            // TODO: the dialog isn't displayed yet at this point, so focusing does nothing. need to fix.
            this.setFocusOnFirstField(dialogCmp.find("content").getElement());
        }
    },

    addHandlers : function(dialogCmp, isModal, clickOutToClose, managerCmp) {
        var self          = this,
            keyupHandler  =                   function(event) { self.handleKeyUp(dialogCmp, managerCmp, event) },
            blurHandler   = isModal         ? function(event) { self.handleBlur(dialogCmp, managerCmp, isModal, event)} : null,
            /* ui:press is being fired AFTER ui:openDialog, so the ordering is fucked here. need to fix this */
            clickHandler  = /*clickOutToClose ? function(event) { self.handleClick(dialogCmp, managerCmp, clickOutToClose, event) } :*/ null,
            resizeHandler = isModal         ? function(event) { self.handleResize(dialogCmp, managerCmp, event)} : null,
            allHandlers   = {
                keyup  : keyupHandler,
                blur   : blurHandler,
                click  : clickHandler,
                resize : resizeHandler
            };
        managerCmp.getAttributes().setValue("_activeHandlers", allHandlers);
        $A.log(managerCmp.get("v._activeHandlers"));
        $A.util.on(dialogCmp.find("dialog").getElement(), "keyup", keyupHandler, false);
        $A.util.on(dialogCmp.find("close").getElement(), "blur", blurHandler, false);
        $A.util.on(document, "click", clickHandler, false);
        $A.util.on(window, "resize", resizeHandler, false);
    },

    handleKeyUp : function(dialogCmp, managerCmp, event) {
        
    },

    handleBlur : function(dialogCmp, managerCmp, isModal, event) {
        
    },

    /* ui:press is being fired AFTER ui:openDialog, so the ordering is fucked here. need to fix this */
    handleClick : function(dialogCmp, managerCmp, clickOutToClose, event) {
        var e = event || window.event,
            target = e.target || e.srcElement,
            dialog = dialogCmp.find("dialog").getElement(),
            auraEvent;
        $A.log(target);
        var clickedInsideDialog = $A.util.contains(dialog, target);
        if(clickOutToClose && !clickedInsideDialog) {
            auraEvent = $A.get("e.ui:closeDialog");
            auraEvent.setParams({
                dialog : dialogCmp
            });
            auraEvent.fire();
        }
    },

    handleResize : function(dialogCmp, managerCmp, event) {
        
    },

    /* won't work in IE7 because of querySelectorAll */
    setFocusOnFirstField : function(container) {
        var formFields = [],
            length = 0;
        if(!container) {
            $A.assert(false, "Tried to set focus on first available field, but no container was specified.");
        } else if(document.querySelectorAll) {
            formFields = container.querySelectorAll("input,button,a,textarea,select");
            length = formFields.length;
            if(length > 0) {
                for(var i=0; i<length; i++) {
                    if(!formFields[i].disabled) {
                        formFields[i].focus();
                        break;
                    }
                }
            }
        }
    },

    deactivateDialog : function(dialogCmp, managerCmp) {
        $A.log("Deactivating " + dialogCmp.toString());
    }

})
