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
    needsCleaning : false,

    cleanComponent : function(id) {
        var a = this.dirtyComponents[id];
        if (a) {
            for ( var i = 0; i < a.length; i++) {
                a[i].commit(true);
            }

            delete this.dirtyComponents[id];
        }
    },

    getArray : function(things) {
        if (!aura.util.isArray(things)) {
            if (!things) {
                return [];
            }

            if (things.auraType === "Value"
                    && things.toString() === "ArrayValue") {
                return things.getArray();
            } else {
                return [ things ];
            }
        }

        return things;
    },

    /**
     * Applies the appropriate css classes for this component to each element.
     *
     * @private
     */
    applyClasses : function(cmp, elements) {
        var className = cmp.getDef().getThemeClassName();
        if (className) {
            var len = elements.length;
            for ( var i = 0; i < len; i++) {
                var element = elements[i];

                aura.util.addClass(element, className);
                if (element["tagName"]) {
                    var lc = element["auraClass"] || "";
                    element["auraClass"] = lc + className;
                }
            }
        }
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
            var tmpNode = document.createElement("span");
            tmpNode.innerHTML = elements;
            var nodes = tmpNode.childNodes;

            elements = [];
            for (var j = 0; j < nodes.length; j++) {
                var node = nodes[j];
                elements.push({
                    "name" : j,
                    "element" : node
                });
            }
        }

        return elements || [];
    },

    finishRender : function(cmp, elements, ret) {
        elements = this.evalStrings(elements);

        var bareElements = this.associateElements(cmp, elements);

        this.applyClasses(cmp, bareElements);

        var len = bareElements.length;
        for (var i = 0; i < len; i++) {
            ret.push(bareElements[i]);
        }

        cmp.setRendered(true);
        priv.cleanComponent(cmp.getGlobalId());
    },

    insertElements : function(elements, refNode, afterRefNode) {
        if (refNode) {
            var len = elements.length;
            var toAppend = [];
            for (var i = 0; i < len; i++) {
                var element = elements[i];
                if (refNode) {
                    if (element["tagName"] && element["tagName"] == "SCRIPT") {
                        aura.util.style.getHead().appendChild(element);
                    } else {
                        toAppend.push(element);
                    }
                }
            }

            if (toAppend.length > 0) {
                if (afterRefNode) {
                    $A.util.insertAfter(toAppend, refNode);
                } else {
                    $A.util.appendChild(toAppend, refNode);
                }
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
        var bareElements = [];

        if (!aura.util.isArray(elements)) {
            elements = [ elements ];
        }

        var len = elements.length;
        var single = (len === 1);
        for (var i = 0; i < len; i++) {
            var element = elements[i];
            if (element["name"] !== undefined && element["element"]) {
                cmp.associateElement(element);
                element = element["element"];
            } else if (single) {
                cmp.associateElement({
                    "name" : "element",
                    "element" : element
                });
            }

            cmp.associateElement({
                "name" : i,
                "element" : element
            });

            bareElements.push(element);
        }

        return bareElements;
    }
};
