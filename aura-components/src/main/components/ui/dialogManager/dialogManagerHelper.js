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
     * Fires the ui:dialogManagerReady event.
     * 
     * @param {Aura.Component} managerCmp the ui:dialogManager component
     * @return {void}
     */
    initialize : function(managerCmp) {

        var evt = $A.get("e.ui:dialogManagerReady");

        evt.setParams({ manager : managerCmp });
        managerCmp.getAttributes().setValue("_ready", true);
        evt.fire();

    },


    /**
     * Activates a single ui:dialog component by setting its visibility
     * to true and constructs a JS object with references to all the
     * event handlers necessary to interact w/ it. Also adds a reference
     * to the activated dialog to the dialogManager.
     * 
     * NOTE: The ui:dialogManager's job is to just figure out what the
     * event handlers should be. The ui:dialog's renderer actually handles
     * applying those handlers to the various DOM elements.
     * 
     * @param {Aura.Component} dialogCmp the ui:dialog component to activate
     * @param {Aura.Component} managerCmp the ui:dialogManager component
     * @return {void}
     */
    activateDialog : function(dialogCmp, managerCmp) {

        var dialogAtts      = dialogCmp.getAttributes(),
            dialogType      = dialogAtts.get("type"),
            isModal         = dialogType === "alert" || dialogType === "modal",
            clickOutToClose = dialogAtts.getRawValue("clickOutToClose"),
            managerAtts     = managerCmp.getAttributes(),
            currentlyActive = managerAtts.get("_activeDialogs"),
            handlerConfig   = this.getHandlerConfig(dialogCmp, isModal, clickOutToClose, managerCmp);

        dialogAtts.setValue("_handlerConfig", handlerConfig);
        currentlyActive.push(dialogCmp);
        managerAtts.setValue("_activeDialogs", currentlyActive);
        dialogAtts.setValue("_isVisible", true);

    },


    /**
     * Deactivates the currently active ui:dialog component by setting its visibility
     * to false and removes the reference the ui:dialogManager has to it.
     *
     * NOTE: The ui:dialog's renderer handles removing existing event handlers.
     * 
     * @param {Object} dialogCmp the ui:dialog component to deactivate
     * @param {Object} managerCmp the ui:dialogManager component
     * @return {void}
     */
    deactivateDialog : function(dialogCmp, managerCmp) {

        var managerAtts     = managerCmp.getAttributes(),
            currentlyActive = managerAtts.get("_activeDialogs"),
            length          = currentlyActive.length;

        for (var i=0; i<length; i++) {
            if (dialogCmp === currentlyActive[i]) {
                // remove the dialog from the array and re-set the value of the manager's attribute'
                currentlyActive.splice(i,1);
                managerAtts.setValue("_activeDialogs", currentlyActive);
                break;
            }
        }
        dialogCmp.getAttributes().setValue("_isVisible", false);

    },


    /**
     * Builds the appropriate DOM event handlers necessary to interact with the
     * active ui:dialog component, as well as references to the document's previously
     * focused element (before the dialog opens), and the first focusable element
     * inside the dialog.
     * 
     * @param {Aura.Component} dialogCmp the active ui:dialog comonent
     * @param {Boolean} isModal specifies if the active dialog is modal
     * @param {Boolean} clickOutToClose specifies if clicking outside the dialog should close it
     * @param {Aura.Component} managerCmp the ui:dialogManager component
     * @return {Object} references to event handlers, and elements to remove or apply focus
     */
    getHandlerConfig : function(dialogCmp, isModal, clickOutToClose, managerCmp) {

        var self     = this,
            oldFocus = document.activeElement,
            newFocus = this.getFocusElement(dialogCmp),
            keydown  = function(event) { self.getKeydownHandler(dialogCmp, managerCmp, isModal, newFocus, event) },
            click    = function(event) { self.getClickHandler(dialogCmp, managerCmp, isModal, clickOutToClose, event) },
            resize   = function(event) { self.getResizeHandler(dialogCmp, isModal)};

        return {
            oldFocus       : oldFocus,
            newFocus       : newFocus,
            keydownHandler : keydown,
            clickHandler   : click,
            resizeHandler  : resize,
        };

    },


    /**
     * Retrieves the first focusable element inside the active dialog component. Should
     * ALWAYS return a non-null value, as the "x" (i.e. dialog close) link should always
     * be visible and positioned as the very last element in the dialog window.
     * (Having a known element as the last item in the dialog makes keyboard management
     * much easier.)
     *
     * NOTE: This method uses querySelectorAll(), which IE7 doesn't like, so IE7 will
     * always focus on the "x" link, instead of the first element.
     * 
     * @param {Aura.Component} dialogCmp the active ui:dialog component
     * @return {HTMLElement|Object} the first focusable element inside the dialog, or the "x" link for IE7
     */
    getFocusElement : function(dialogCmp) {

        var container    = dialogCmp.find("dialog").getElement(),
            close        = dialogCmp.find("close").getElement(),
            formElements = [],
            length       = 0,
            element      = null;

        if (!container) {
            $A.assert(false, "You must specify a container element in which to search for a focusable element.");
        } else if (document.querySelectorAll) {
            // sorry IE7, you're outta luck
            formElements = container.querySelectorAll("input,button,a,textarea,select");
            length = formElements.length;
            if (length > 0) {
                for (var i=0; i<length; i++) {
                    if (!formElements[i].disabled && formElements[i].type.toLowerCase() !== "hidden") {
                        element = formElements[i];
                        break;
                    }
                }
            } else {
                // we should never get here - at a minimum, the "close" link should always be present
                $A.assert(false, "No focusable element found, which es muy no bueno.");
            }
        } else {
            element = close;
        }

        return element;

    },


    /**
     * Constructs the handler for the DOM keydown event. Includes handlers for 1) escape key,
     * and 2) tab key (including shift+tab).
     * 
     * @param {Aura.Component} dialogCmp the active ui:dialog component
     * @param {Aura.Component} managerCmp the ui:dialogManager component
     * @param {Boolean} isModal specifies if the dialog is modal
     * @param {HTMLElement} firstFocusable the first focusable element inside the dialog
     * @param {UIEvent} event DOM keydown event
     * @return {void}
     */
    getKeydownHandler : function(dialogCmp, managerCmp, isModal, firstFocusable, event) {

        event            = event || window.event;
        var closeLink    = dialogCmp.find("close").getElement(),
            shiftPressed = event.shiftKey,
            currentFocus = document.activeElement,
            closeEvent   = $A.get("e.ui:closeDialog");

        closeEvent.setParams({ dialog : dialogCmp, confirmClicked : false });

        switch (event.keyCode) {
            case 27: // escape key - always closes all dialogs
                this.cancelEvent(event);
                closeEvent.fire();
                break;
            case 9: // tab key - if modal, keep focus inside the dialog
                if (isModal) {
                    if (currentFocus === closeLink && !shiftPressed) {
                        this.cancelEvent(event);
                        firstFocusable.focus();
                    } else if (currentFocus === firstFocusable && shiftPressed) {
                        this.cancelEvent(event);
                        closeLink.focus();
                    }
                // if not modal, close the dialog when you tab out of it (unless you allow multiple active dialogs)
                } else if (!managerCmp.get("v.allowMultipleOpen")) {
                    if ((currentFocus === closeLink && !shiftPressed) ||
                        (currentFocus === firstFocusable && shiftPressed)) {
                        this.cancelEvent(event);
                        closeEvent.fire();
                    }
                }
                break;
        }

    },


    /**
     * Quick helper to cancel event bubbling and default behaviour cross-browser.
     * 
     * @param {UIEvent} event DOM event
     * @return {void}
     */
    cancelEvent : function(event) {
        event.stopPropagation();
        event.cancelBubble = true;
        event.preventDefault();
    },


    /**
     * Constructs the handler for the DOM click event.
     * 
     * @param {Aura.Component} dialogCmp
     * @param {Aura.Component} managerCmp
     * @param {Boolean} isModal
     * @param {Boolean} clickOutToClose
     * @param {UIEvent} event
     * @return {void}
     */
    getClickHandler : function(dialogCmp, managerCmp, isModal, clickOutToClose, event) {
        // TODO: need to figure out how to deal w/ ui:press firing AFTER ui:openDialog first
        // TODO: add z-index management for multiple open dialogs at the same time
    },


    /**
     * Constructs the handler for the DOM window.resize event.
     * 
     * @param {Aura.Component} dialogCmp
     * @param {Boolean} isModal
     * @return {void}
     */
    getResizeHandler : function(dialogCmp, isModal) {

        if (isModal) {
            dialogCmp.getDef().getHelper().setContentMaxHeight(dialogCmp.find("content"));
        }

    },


})
