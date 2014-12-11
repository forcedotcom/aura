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
/*jslint sub: true */
var priv = {
    dirtyComponents : {},
    // KRIS: HALO: HACK:
    // IE11 is not returning the Object.keys() for dirtyComponents in the order they were added.
    // So we rerender dirty out of order.
    // This array assures we rerender in the order that we add keys to the array.
    // Ideally, we shouldn't care what order we rerender in, but that's a more difficult bug to track down in 194/patch
    dirtyComponentIds: [],
    needsCleaning : false,

    cleanComponent : function(id) {
        delete this.dirtyComponents[id];
    },

    getArray : function(things) {
        if (!aura.util.isArray(things)) {
            return things?[things]:[];
        }
        return things;
    },

    /**
     * If a renderer returned a string, create html elements from that string.
     *
     * Returns an elements array, either the original one passed in or a new one
     * if "elements" passed in was a string, not an array.
     *
     * @private
     */
    evalStrings : function(elements) {
        if (aura.util.isString(elements)) {
            elements=$A.util.createElementsFromMarkup(elements);
        }
        return elements || [];
    },

    finishRender : function(cmp, elements) {
        elements = this.evalStrings(elements);

        this.associateElements(cmp, elements);

        cmp.setRendered(true);
        priv.cleanComponent(cmp.getGlobalId());

        return elements;
    },

    /**
     * Insert elements to the DOM, relative to a reference node,
     * by default as its last child.
     *
     * @private
     */
    insertElements : function(elements, refNode, asSibling, asFirst) {
        if (refNode) {
            if (asSibling) {
                if (asFirst) {
                    $A.util.insertBefore(elements, refNode);
                } else {
                    $A.util.insertAfter(elements, refNode);
                }
            } else {
                if (asFirst) {
                    $A.util.insertFirst(elements, refNode);
                } else {
                    $A.util.appendChild(elements, refNode); // Default
                }
            }
        }
    },

    addAuraClass:function(cmp, element){
        var className = cmp.getConcreteComponent().getDef().getStyleClassName();

        if (className) {
            aura.util.addClass(element, className);
            if (element["tagName"]) {
                element["auraClass"] = $A.util.buildClass(element["auraClass"],className);
            }
        }
    },

    /**
     * Associate all of the elements with the component, and return a list of
     * pure elements - with no association objects wrapped around them.
     *
     * @private
     */
    associateElements : function(cmp, elements) {
        elements = this.getArray(elements);

        var len = elements.length;
        for (var i = 0; i < len; i++) {
            var element = elements[i];
            if(this.isMarker(element)){
                continue;
            }
            this.addAuraClass(cmp,element);
            cmp.associateElement(element);
        }
    },

    createMarker:function(target,reason){
        var node = document.createComment(reason);
        node.aura_marker=true;
        if(target){
            $A.util.insertBefore(node, target);
        }
        return node;
    },

    isMarker:function(node){
        return node&&node.aura_marker;
    }
};
