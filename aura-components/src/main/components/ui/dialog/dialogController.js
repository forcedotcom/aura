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
     * Ties the <h2> tag in the dialog header to the dialog container using
     * aria-labelledby. also makes sure modal windows with tons of content
     * don't extend outside the viewport by setting a max-height CSS property.
     */
    initialize : function(cmp, evt, hlp) {

        var atts             = cmp.getAttributes(),
            type             = atts.get("type"),
            isModal          = type === "alert" || type === "modal",
            title            = cmp.find("title");

        atts.setValue("_ariaId", title.getGlobalId());

        if (isModal) {
            atts.setValue("_maxHeight", hlp.getContentMaxHeight());
        }

    },


    /*
     * Handles the click of the "x" (close) button, or the default cancel button of
     * the dialog. Fires the application-level event ui:closeDialog, setting the
     * 'confirmClicked' attribute to false.
     */
    cancel : function(cmp, evt, hlp) {

        hlp.confirmOrCancel(cmp, evt, false);

    },


    /*
     * Handles the click of default confirm button of the dialog. Fires the
     * application-level event ui:closeDialog, setting the 'confirmClicked'
     * attribute to true.
     */
    confirm : function(cmp, evt, hlp) {

        hlp.confirmOrCancel(cmp, evt, true);

    }


})
