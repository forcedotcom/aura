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

        setTimeout(function(){$A.log(managerCmp.get("v._dialogs"));}, 5000)

    },


    activateDialog : function(dialogCmp, managerCmp) {

        var atts            = dialogCmp.getAttributes(),
            isModal         = atts.getRawValue("isModal"),
            clickOutToClose = atts.getRawValue("clickOutToClose"),
            handlerConfig   = this.getHandlerConfig(dialogCmp, isModal, clickOutToClose, managerCmp);

        atts.setValue("_handlerConfig", handlerConfig);
        atts.setValue("_isVisible", true);

    },


    getHandlerConfig : function(dialogCmp, isModal, clickOutToClose, managerCmp) {

        var self     = this,
            oldFocus = document.activeElement,
            newFocus = this.getFocusElement(dialogCmp),
            keydown  = function(event) { self.getKeydownHandler(dialogCmp, managerCmp, isModal, newFocus, event) },
            click    = function(event) { self.getClickHandler(dialogCmp, managerCmp, isModal, clickOutToClose, event) },
            resize   = function(event) { self.getResizeHandler(dialogCmp, managerCmp, isModal, event)};

        return {
            oldFocus       : oldFocus,
            newFocus       : newFocus,
            keydownHandler : keydown,
            clickHandler   : click,
            resizeHandler  : resize,
        };

    },


    getFocusElement : function(dialogCmp) {

        var container    = dialogCmp.find("dialog").getElement(),
            formElements = [],
            length       = 0,
            element      = null;

        if (!container) {
            $A.assert(false, "You must specify a container element in which to search for a focusable element.");
        } else if (document.querySelectorAll) {
            /* NOTE: will not work in IE7, as it does not support querySelectorAll() */
            formElements = container.querySelectorAll("input,button,a,textarea,select");
            length = formElements.length;
            if (length > 0) {
                for (var i=0; i<length; i++) {
                    if (!formElements[i].disabled && formElements[i].type != "hidden") {
                        element = formElements[i];
                        break;
                    }
                }
            } else {
                /* we should never get here - at a minimum, the "close" link should always be present */
                $A.assert(false, "No focusable element found, which is super effed up.");
            }
        }

        return element;

    },


    getKeydownHandler : function(dialogCmp, managerCmp, isModal, focusElement, event) {

        event            = event || window.event;
        var close        = dialogCmp.find("close").getElement(),
            shiftPressed = event.shiftKey,
            active       = document.activeElement,
            auraEvent;

        switch (event.keyCode) {
            case 27: // esc key - close dialog
                auraEvent = $A.get("e.ui:closeDialog");
                auraEvent.setParams({ dialog : dialogCmp });
                auraEvent.fire();
                break;
            case 9: // tab key - if modal, keep focus inside the dialog
                if (isModal) {
                    if (active === close && !shiftPressed) {
                        this.cancelEvent(event);
                        focusElement.focus();
                    } else if (active === focusElement && shiftPressed) {
                        this.cancelEvent(event);
                        close.focus();
                    }
                }
                break;
        }

    },


    cancelEvent : function(event) {
        event.stopPropagation();
        event.cancelBubble = true;
        event.preventDefault();
    },


    getClickHandler : function(dialogCmp, managerCmp, isModal, clickOutToClose, event) {
        // TODO: need to figure out how to deal w/ ui:press firing AFTER ui:openDialog first
    },


    getResizeHandler : function(dialogCmp, managerCmp, isModal, event) {
        if (isModal) {
            
        }
    },


    deactivateDialog : function(dialogCmp, managerCmp) {
        dialogCmp.getAttributes().setValue("_isVisible", false);
    }


})
