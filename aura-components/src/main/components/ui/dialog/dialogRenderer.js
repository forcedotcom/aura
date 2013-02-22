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

    afterRender : function(cmp) {
        // TODO: attach the title to the dialog w/ aria-labelledby
        // TODO: fix the "ariaRole" attribute, if necessary
        var title = cmp.find("title");
        this.superAfterRender(cmp);
        /*cmp.getAttributes().setValue("_ariaId", title.toString());*/
    },

    rerender : function(cmp) {

        var isVisible = cmp.get("v._isVisible"),
            config    = cmp.get("v._handlerConfig"),
            autoFocus = cmp.get("v.autoFocus"),
            isModal   = cmp.get("v.isModal"),
            dialog    = cmp.find("dialog").getElement(),
            close     = cmp.find("close").getElement();

        this.superRerender(cmp);

        if (config && dialog && close) {
            if (isVisible) {
                $A.util.on(document, "keydown", config.keydownHandler, false);
                $A.util.on(document, "click", config.clickHandler, false);
                $A.util.on(window, "resize", config.resizeHandler, false);
                if ((autoFocus || isModal) && config.newFocus) {
                    config.newFocus.focus();
                }
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
