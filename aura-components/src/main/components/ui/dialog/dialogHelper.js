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
    confirmOrCancel : function(cmp, evt, confirmClicked) {

        var closeEvent = $A.get("e.ui:closeDialog");

        closeEvent.setParams({
            dialog : cmp,
            triggerEvent : evt,
            confirmClicked : confirmClicked
        });
        closeEvent.fire();

    },


    /**
     * Calculates the max-height of the content <div> in a modal window so
     * it doesn't extend outside the viewport.
     * 
     * @param {Aura.Component} contentCmp the content box component
     * @return {void}
     */
    getContentMaxHeight : function() {

        return Math.min(this.getWindowHeight(), 1250) - 150;

    },


    /**
     * Simple cross-browser function to get the height of the client viewport
     * 
     * @return {Integer} the height of the client viewport
     */
    getWindowHeight : function() {

        return window.innerHeight || document.body.clientHeight;

    }


})
