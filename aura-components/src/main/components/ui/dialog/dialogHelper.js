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
     * Sets the 'confirmClicked' Boolean on the ui:closeDialog event.
     *
     * @param {Aura.Component} cmp the ui:dialogComponent
     * @param {Boolean} confirmClicked if the 'confirm' or 'cancel' button was clicked
     * @return {void}
     */
    confirmOrCancel : function(cmp, confirmClicked) {

        var closeEvent = $A.get("e.ui:closeDialog");

        closeEvent.setParams({
            dialog : cmp,
            confirmClicked : confirmClicked
        });
        closeEvent.fire();

    },


    /**
     * Handles the application or removal of CSS classes that control the visibility of
     * all dialog types, as well as the animation behaviour of modal dialogs. This method
     * also handles focusing on the proper element when a dialog is opened or closed.
     * 
     * @param {Boolean} isVisible specifies if the dialog should be displayed or hidden
     * @param {HTMLElement} mask the mask <div>
     * @param {HTMLElement} dialog the dialog <div>
     * @param {Boolean} autoFocus specifies if focus should automatically be applied to the first element in the dialog
     * @param {Boolean} isModal specifies if this dialog is modal
     * @param {Object} config JS object that contains references to the elements to focus
     * @return {void}
     */
    doAnimation : function(isVisible, mask, dialog, autoFocus, isModal, config) {

        var flickerDelay = 5,
            focusDelay   = 300,
            hideDelay    = 1000;

        // if the dialog is active, remove the 'hidden' classes and apply the animation classes
        if (isVisible) {
            $A.util.removeClass(dialog, "hidden");
            if (isModal) {
                $A.util.removeClass(mask, "hidden");
                // delay the application of animation classes by just a hair ... webkit rendering bug
                window.setTimeout(function() { $A.util.addClass(mask, "fadeIn"); }, flickerDelay);
                window.setTimeout(function() { $A.util.addClass(dialog, "dropIn"); }, flickerDelay);
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
        // if the dialog is inactive, add the 'hidden' classes and remove the animation classes
        } else {
            if (isModal) {
                // remove the animation classes immediately, but delay adding 'hidden' back until animation completes
                $A.util.removeClass(mask, "fadeIn");
                window.setTimeout(function() { $A.util.addClass(mask, "hidden"); }, hideDelay);
                $A.util.removeClass(dialog, "dropIn");
                window.setTimeout(function() { $A.util.addClass(dialog, "hidden"); }, hideDelay);
            } else {
                // if not a modal, then just hide the dialog immediately
                $A.util.addClass(dialog, "hidden");
            }
            // apply proper element focus if necessary
            if (config.oldFocus) {
                config.oldFocus.focus();
            }
        }

    }


})
