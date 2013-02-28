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
     * aria-labelledby, ties the double-confirmation label to its corresponding
     * checkbox, and makes sure modal windows with tons of content don't extend
     * outside the viewport.
     */
    initialize : function(cmp, evt, hlp) {

        var atts             = cmp.getAttributes(),
            type             = atts.get("type"),
            doubleConfirm    = atts.get("doubleConfirm"),
            isModal          = type === "alert" || type === "modal",
            title            = cmp.find("title"),
            confirmBox       = cmp.find("confirmBox"),
            attributeMap     = {};

        if (isModal) {
            // this gets applied as "style=max-height:{!v._maxHeight}" on the content <div>
            attributeMap["_maxHeight"] = hlp.getContentMaxHeight();
        }

        if (doubleConfirm) {
            // this gets applied to the checkbox 'id' and the label 'for'
            attributeMap["_checkboxId"] = confirmBox.getGlobalId();
        }

        attributeMap["_ariaId"] = title.getGlobalId();

        // set all the attributes at once
        for (var name in attributeMap) {
            atts.setValue(name, attributeMap[name]);
        }

    },


    /*
     * Handles the click of the "x" (close) button, or the default cancel button of
     * the dialog (present when type='alert'). Fires the application-level
     * event ui:closeDialog, setting the 'confirmClicked' attribute to false.
     */
    cancel : function(cmp, evt, hlp) {

        hlp.confirmOrCancel(cmp, false);

    },


    /*
     * Handles the click of default confirm button of the dialog (present when
     * type='alert'). Fires the application-level event ui:closeDialog, setting
     * the 'confirmClicked' attribute to true.
     */
    confirm : function(cmp, evt, hlp) {

        hlp.confirmOrCancel(cmp, true);

    },


    /**
     * For alert dialogs where the "doubleConfirm" attribute is true, this method
     * enables the confirm button only when the confirm checkbox is checked.
     */
    setConfirmButtonState : function(cmp, evt) {

        if (cmp.find("confirmBox").getElement().checked) {
            cmp.find("confirmButton").getAttributes().setValue("disabled", false);
        } else {
            cmp.find("confirmButton").getAttributes().setValue("disabled", true);
        }

    }


})
