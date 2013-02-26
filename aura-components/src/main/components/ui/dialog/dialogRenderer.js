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
     * Moves modal windows to the bottom of the DOM so they display properly,
     * ties the <h2> tag in the dialog header to the dialog container using
     * aria-labelledby, and ties the double-confirmation label to its corresponding
     * checkbox.
     */
    afterRender : function(cmp, hlp) {

        var atts          = cmp.getAttributes(),
            type          = atts.get("type"),
            doubleConfirm = atts.get("doubleConfirm"),
            isModal       = type === "alert" || type === "modal",
            ariaId        = atts.get("_ariaId"),
            mask          = cmp.find("mask"),
            dialog        = cmp.find("dialog"),
            title         = cmp.find("title"),
            content       = cmp.find("content"),
            confirmBoxCmp = doubleConfirm ? cmp.find("confirmBox") : null,
            confirmBox    = doubleConfirm ? confirmBoxCmp.getElement() : null,
            confirmLabel  = doubleConfirm ? cmp.find("confirmBoxLabel").getElement() : null,
            maxHeight;

        this.superAfterRender(cmp);

        if (isModal) {
            maxHeight = Math.min(hlp.getWindowHeight(), 1000) - 150;
            content.getElement().style.maxHeight = maxHeight + "px";
            document.body.appendChild(mask.getElement());
            document.body.appendChild(dialog.getElement());
        }

        atts.setValue("_ariaId", title.getGlobalId());
        if (doubleConfirm) {
            confirmBox.id = confirmBoxCmp.getGlobalId();
            confirmLabel.htmlFor = confirmBox.id;
        }

    },


    /**
     * Applies/removes event handlers to/from various DOM elements for
     * proper interaction semantics. Handlers are applied upon dialog
     * activation, and removed upon dialog deactivation.
     */
    rerender : function(cmp, hlp) {

        var atts      = cmp.getAttributes(),
            isVisible = atts.get("_isVisible"),
            config    = atts.get("_handlerConfig"),
            autoFocus = atts.get("autoFocus"),
            type      = atts.get("type"),
            isModal   = type === "alert" || type === "modal",
            maskCmp   = cmp.find("mask"),
            mask      = maskCmp ? maskCmp.getElement() : null,
            dialog    = cmp.find("dialog").getElement();

        this.superRerender(cmp, hlp);

        if (config && dialog) {
            // if the dialog is active, add the appropriate handlers
            if (isVisible) {
                $A.util.on(document, "keydown", config.keydownHandler, false);
                $A.util.on(document, "click", config.clickHandler, false);
                $A.util.on(window, "resize", config.resizeHandler, false);
            // else, remove them
            } else {
                $A.util.removeOn(document, "keydown", config.keydownHandler, false);
                $A.util.removeOn(document, "click", config.clickHandler, false);
                $A.util.removeOn(window, "resize", config.resizeHandler, false);
            }
            // apply/remove the appropriate css classes and focus the right element
            hlp.doAnimation(isVisible, mask, dialog, autoFocus, isModal, config);
       }

    }


})
