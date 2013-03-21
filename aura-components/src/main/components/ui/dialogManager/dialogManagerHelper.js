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
     * Activates a single ui:dialog component by:
     *     1. setting a reference to it on the dialogManager's model.
     *     2. applying event handlers for proper interaction.
     *     3. setting a reference to those event handlers on the dialog's model (for removal later).
     *     4. applying CSS classes to display the dialog.
     *
     * @param {Aura.Component} dialog the ui:dialog component to activate
     * @param {Aura.Component} manager the ui:dialogManager component
     * @return {void}
     */
    activateDialog : function(dialog, manager) {

        var atts            = dialog.getAttributes(),
            isModal         = atts.get("isModal"),
            clickOutToClose = atts.get("clickOutToClose"),
            autoFocus       = atts.get("autoFocus"),
            content         = dialog.find("dialog"),
            mask            = dialog.find("mask"),
            handlerConfig   = this.getHandlerConfig(dialog, manager, isModal, clickOutToClose);

        this.applyHandlers(handlerConfig);
        this.doAnimation(true, mask, content, autoFocus, isModal, handlerConfig);
        manager.get("m.activeDialog").setValue(dialog);
        dialog.get("m.handlerConfig").setValue(handlerConfig);

    },


    /**
     * Deactivates a single ui:dialog component by:
     *     1. removing the reference to it from the dialogManager's model.
     *     2. removing event handlers.
     *     3. removing the reference to those event handlers from the dialog's model.
     *     4. removing CSS classes to hide the dialog.
     *
     * @param {Aura.Component} dialog the ui:dialog component to deactivate
     * @param {Aura.Component} manager the ui:dialogManager component
     * @return {void}
     */
    deactivateDialog : function(dialog, manager) {

        var atts          = dialog.getAttributes(),
            isModal       = atts.get("isModal"),
            autoFocus     = atts.get("autoFocus"),
            handlerConfig = dialog.get("m.handlerConfig"),
            mask          = dialog.find("mask"),
            content       = dialog.find("dialog");

        /* TODO: remove manager's activeDialog and dialog's handlerConfig from their respective models */
        this.removeHandlers(handlerConfig);
        this.doAnimation(false, mask, content, autoFocus, isModal, handlerConfig);
        manager.get("m.activeDialog").setValue(null);
        dialog.get("m.handlerConfig").setValue(null);

    },


    /**
     * Applies the appropriate event handlers for proper interaction.
     * 
     * @param {Object} config JS object that contains all the necessary event handlers
     * @return {void}
     */
    applyHandlers : function(config) {

        $A.util.on(document, "keydown", config.keydownHandler, false);
        $A.util.on(document, "click", config.clickHandler, false);
        $A.util.on(window, "resize", config.resizeHandler, false);

    },


    /**
     * Removes the appropriate event handlers to keep the DOM tidy.
     * 
     * @param {Object} config JS object that contains all the necessary event handlers
     * @return {void}
     */
    removeHandlers : function(config) {

        $A.util.removeOn(document, "keydown", config.keydownHandler, false);
        $A.util.removeOn(document, "click", config.clickHandler, false);
        $A.util.removeOn(window, "resize", config.resizeHandler, false);

    },


    /**
     * Builds the appropriate DOM event handlers necessary to interact with the
     * active ui:dialog component, as well as references to the document's previously
     * focused element (before the dialog opens), and the first focusable element
     * inside the dialog.
     * 
     * @param {Aura.Component} dialog the active ui:dialog comonent
     * @param {Boolean} isModal specifies if the active dialog is modal
     * @param {Boolean} clickOutToClose specifies if clicking outside the dialog should close it
     * @param {Aura.Component} manager the ui:dialogManager component
     * @return {Object} references to event handlers, and elements to remove or apply focus
     */
    getHandlerConfig : function(dialog, manager, isModal, clickOutToClose) {

        var self          = this,
            oldFocus      = document.activeElement,
            newFocus      = this.getFirstFocusableElement(dialog),
            keydown       = function(event) { self.getKeydownHandler(dialog, manager, isModal, newFocus, event) },
            click         = function(event) { self.getClickHandler(dialog, manager, clickOutToClose, event) },
            resize        = function() { self.getResizeHandler(dialog, isModal) };

        return {
            oldFocus       : oldFocus,
            newFocus       : newFocus,
            keydownHandler : keydown,
            clickHandler   : click,
            resizeHandler  : resize
        };

    },


    /**
     * Constructs the handler for the DOM keydown event. Includes handlers for 1) escape key,
     * and 2) tab key (including shift+tab).
     * 
     * @param {Aura.Component} dialog the active ui:dialog component
     * @param {Aura.Component} manager the ui:dialogManager component
     * @param {Boolean} isModal specifies if the dialog is modal
     * @param {HTMLElement} firstFocusable the first focusable element inside the dialog
     * @param {UIEvent} event DOM keydown event
     * @return {void}
     */
    getKeydownHandler : function(dialog, manager, isModal, firstFocusable, event) {

        if (!event) { var event = window.event; }

        var closeButton  = dialog.find("closeButton").getElement(),
            shiftPressed = event.shiftKey,
            currentFocus = document.activeElement,
            closeEvent   = $A.get("e.ui:closeDialog");

        closeEvent.setParams({ dialog : dialog, confirmClicked : false });

        switch (event.keyCode) {
            case 27: // escape key - always closes all dialogs
                $A.util.squash(event, true);
                closeEvent.fire();
                break;
            case 9: // tab key - if modal, keep focus inside the dialog
                if (isModal) {
                    if (currentFocus === closeButton && !shiftPressed) {
                        $A.util.squash(event, true);
                        firstFocusable.focus();
                    } else if (currentFocus === firstFocusable && shiftPressed) {
                        $A.util.squash(event, true);
                        closeButton.focus();
                    }
                // if not modal, close the dialog when you tab out of it
                } else {
                    if ((currentFocus === closeButton && !shiftPressed) ||
                        (currentFocus === firstFocusable && shiftPressed)) {
                        $A.util.squash(event, true);
                        closeEvent.fire();
                    }
                }
                break;
        }

    },


    /**
     * Constructs the handler for the DOM click event.
     * 
     * @param {Aura.Component} dialog the ui:dialog component
     * @param {Aura.Component} manager the ui:dialogManager component
     * @param {Boolean} clickOutToClose whether the dialog should be closed on click outside the dialog
     * @param {UIEvent} event the DOM click event
     * @return {void}
     */
    getClickHandler : function(dialog, manager, clickOutToClose, event) {

        if (!event) { var event = window.event; }

        var target        = event.target || event.srcElement,
            container     = dialog.find("dialog").getElement(),
            clickedInside = $A.util.contains(container, target),
            closeEvent;

        if (clickedInside) {
            return;
        } else {
            if (clickOutToClose) {
                closeEvent = $A.get("e.ui:closeDialog");
                closeEvent.setParams({
                    dialog : dialog,
                    confirmClicked : false
                });
                closeEvent.fire();
            }
        }

    },


    /**
     * Constructs the handler for the window.resize DOM event.
     * 
     * @param {Aura.Component} dialog the ui:dialog component
     * @param {Boolean} isModal whether the dialog is modal or not
     * @return {void}
     */
    getResizeHandler : function(dialog, isModal) {

        var max,
            element;

        if (isModal) {
            max = dialog.getDef().getHelper().getContentMaxHeight(),
            element = dialog.find("content").getElement();
            element.style.maxHeight = max + "px";
        }

    },


    /**
     * Retrieves the first focusable element inside the dialog component. Should
     * ALWAYS return a non-null value, as the "x" (i.e. dialog close) link should always
     * be visible and positioned as the very last element in the dialog window.
     * (Having a known element as the last item in the dialog makes keyboard management
     * much easier.)
     *
     * NOTE: This method uses querySelectorAll(), which IE7 doesn't like, so IE7 will
     * always focus on the "x" link, instead of the first element.
     * 
     * @param {Aura.Component} cmp the ui:dialog component
     * @return {HTMLElement} the first focusable element inside the dialog, or the "x" link for IE7
     */
    getFirstFocusableElement : function(dialog) {

        var container    = dialog.find("dialog").getElement(),
            close        = dialog.find("closeButton").getElement(),
            formElements = [],
            length       = 0,
            element      = null;

        if (!container) {
            $A.assert(false, "Trying to find a focusable element in the dialog, but no container specified.");
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
                $A.assert(false, "No focusable element found.");
            }
        } else {
            element = close;
        }

        return element;

    },


    /**
     * Handles the application and removal of CSS classes that control the visibility of
     * all dialog types, as well as the animation behaviour of modal dialogs. This method
     * also handles focusing on the proper element when a dialog is opened or closed.
     * 
     * @param {Boolean} show specifies if the dialog should be shown (true) or hidden (false)
     * @param {Aura.Component} maskCmp the ui:dialog's "mask" component
     * @param {Aura.Component} dialog the ui:dialog component
     * @param {Boolean} autoFocus specifies if focus should automatically be applied to the first element in the dialog
     * @param {Boolean} isModal specifies if this dialog is modal
     * @param {Object} config JS object that contains references to the elements to focus
     * @return {void}
     */
    doAnimation : function(show, maskCmp, dialog, autoFocus, isModal, config) {

        var maskElement   = maskCmp ? maskCmp.getElement() : null,
            dialogElement = dialog.getElement(),
            flickerDelay  = 50,
            focusDelay    = 300,
            hideDelay     = 500;

        // if the dialog should be opened, remove the 'hidden' classes and apply the animation classes
        if (show) {
            $A.util.removeClass(dialogElement, "hidden");
            if (isModal) {
                $A.util.removeClass(maskElement, "hidden");
                // delay the application of animation classes by just a hair ... webkit + firefox rendering bug
                window.setTimeout(function() { $A.util.addClass(maskElement, "fadeIn"); }, flickerDelay);
                window.setTimeout(function() { $A.util.addClass(dialogElement, "dropIn"); }, flickerDelay);
            }
            // apply proper element focus if necessary
            if ((autoFocus || isModal) && config.newFocus) {
                if (isModal) {
                    // delay focus until the modal slides into place, otherwise the scroll jumps
                    window.setTimeout(function() { config.newFocus.focus(); }, flickerDelay + focusDelay);
                } else {
                    config.newFocus.focus();
                }
            }
        // if the dialog should be closed, add the 'hidden' classes and remove the animation classes
        } else {
            if (isModal) {
                // remove the animation classes immediately, but delay adding 'hidden' back until animation completes
                $A.util.removeClass(maskElement, "fadeIn");
                $A.util.removeClass(dialogElement, "dropIn");
                window.setTimeout(function() { $A.util.addClass(maskElement, "hidden"); }, hideDelay);
                window.setTimeout(function() { $A.util.addClass(dialogElement, "hidden"); }, hideDelay);
            } else {
                // if not a modal, then just hide the dialog immediately
                $A.util.addClass(dialogElement, "hidden");
            }
            // apply proper element focus if necessary
            if (config.oldFocus) {
                config.oldFocus.focus();
            }
        }

    }


})
