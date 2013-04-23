/*
 * Copyright (C) 2013 salesforce.com, inc.
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
    render : function(component, helper) {
        // Performance Marker
        $A.mark("FullRender" + component);
        $A.mark("AfterRender" + component);
        $A.mark("SuperRender" + component);

        // Add AOP to common attributes
        helper.addObservers(component, helper.buildList, ["body", "items", "emptyText", "id", "class"]);

        // Build list columns and data
        helper.buildList(component);

        // Render the chain
        var bodyElements = this.superRender();

        // Performance Marker
        $A.endMark("SuperRender" + component);

        // And away we go!,
        return bodyElements;
    },

    rerender : function(component,helper){
        // Performance Marker
        $A.mark("SuperRerender" + component);

        // Rerender the chain
        this.superRerender();

        // Performance Marker
        $A.endMark("SuperRerender" + component);
    },

    afterRender: function(component) {
        // Required call to complete render chain
        this.superAfterRender();

        // DEBUG: Performance Marker
        $A.endMark("AfterRender" + component);
    }

})
