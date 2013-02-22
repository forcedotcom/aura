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
     * Ensures that the proper ARIA role attribute is defined for the
     * dialog component. Also ties the <h2> tag in the dialog header
     * to the dialog container using aria-labelledby.
     */
    afterRender : function(cmp) {

        // TODO: fix the "ariaRole" attribute, if necessary
        // TODO: attach the title to the dialog w/ aria-labelledby
        this.superAfterRender(cmp);

    },


    /**
     * Applies/removes event handlers to/from various DOM elements for
     * proper interaction semantics. Handlers are applied upon dialog
     * activation, and removed upon dialog deactivation.
     */
    rerender : function(cmp) {

        var isVisible = cmp.get("v._isVisible"),
            config    = cmp.get("v._handlerConfig"),
            autoFocus = cmp.get("v.autoFocus"),
            isModal   = cmp.get("v.isModal"),
            dialog    = cmp.find("dialog").getElement(),
            close     = cmp.find("close").getElement();

        this.superRerender(cmp);

        if (config && dialog && close) {
            // if the dialog is active, add the handlers & apply focus to the appropriate element
            if (isVisible) {
                $A.util.on(document, "keydown", config.keydownHandler, false);
                $A.util.on(document, "click", config.clickHandler, false);
                $A.util.on(window, "resize", config.resizeHandler, false);
                if ((autoFocus || isModal) && config.newFocus) {
                    config.newFocus.focus();
                }
            // if the dialog is inactive, remove the handlers & return focus to the previously focused element
            } else {
                $A.util.removeOn(document, "keydown", config.keydownHandler, false);
                $A.util.removeOn(document, "click", config.clickHandler, false);
                $A.util.removeOn(window, "resize", config.resizeHandler, false);
                if (config.oldFocus) {
                    config.oldFocus.focus();
                }
            }
        }

    }


})
