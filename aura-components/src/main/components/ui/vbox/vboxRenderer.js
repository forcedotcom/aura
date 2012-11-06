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
    render: function(component, helper) {
        var ret = [];

        var north = $A.render(component.get("v.north"));
        if (north) {
            ret = ret.concat(north);
        }
        var center = helper.filterEmptyTextNodes($A.render(component.getValue("v.body")));

        if (center && center.length > 0) {

            var onlyOne = true;
            var foundNonComment = false;
            for(var i=0;i<center.length;i++){
                var el = center[i];
                if(el.nodeType !== 8 && (el.nodeType !== 3 || el.nodeValue.trim().length > 0)){
                    if(foundNonComment){
                        onlyOne = false;
                    }
                    foundNonComment = el;
                }
            }

            if(foundNonComment){
                if (!onlyOne) {
                    // Wrap elements in a single DIV to giv us a place to style with flex box layout
                    var centerWrapper = document.createElement("DIV");
                    $A.util.appendChild(center, centerWrapper);

                    center = centerWrapper;

                    $A.util.addClass(center, "dynamicCenterWrapperAddedByVBox bContainer bVerticalContainer");
                } else {
                    center = foundNonComment;
                }

                $A.util.addClass(center, "centerAddedByVBox uiVbox bCenter");

                var centerClass = component.get("v.centerClass");
                if (centerClass) {
                    $A.util.addClass(center, centerClass);
                }

                ret = ret.concat(center);
            }
        }

        var south = $A.render(component.get("v.south"));
        if (south) {
            ret = ret.concat(south);
        }

        return ret;
    },

    afterRender: function(component, helper) {
        $A.afterRender(component.get("v.north"));
        $A.afterRender(component.get("v.body"));
        $A.afterRender(component.get("v.south"));

        helper.updateContainer(component);
    },

    rerender: function(component, helper) {
        $A.rerender(component.get("v.north"));
        $A.rerender(component.get("v.body"));
        $A.rerender(component.get("v.south"));

        helper.updateContainer(component);
    },

    unrender: function(component, helper) {
        $A.unrender(component.get("v.north"));
        $A.unrender(component.get("v.body"));
        $A.unrender(component.get("v.south"));
    }
})
