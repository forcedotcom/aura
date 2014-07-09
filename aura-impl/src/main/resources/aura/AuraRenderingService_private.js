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

    /**
     * Make a shallow copy of any elements, so cmp.priv.elements can mutate.
     * This also changes from the Object-based form returned by getElements to
     * an array, so it can be compared against the return from (re)render calls.
     *
     * @returns {Array} a new array with snapshot of cmp.getElements()
     */ 
    copyElems : function(cmp) {
        var elements = cmp.getElements();
        if (elements === undefined) {
            return undefined;
        }
        // Obnoxiously, elements is an Object (not an array), so we can't use Array.slice, but just
        // have to do it ourselves:
        var retVal = [];
        if (elements !== undefined) {
            if (elements[0]) {
                for (var k = 0; elements[k]; ++k) {
                   retVal[k] = elements[k];
                }
            } else if (elements['elements']) {
                retVal.push(elements['elements']);
            }
        }
        return retVal;
    },

    /**
     * For extra fun, sometimes a rerender of A will do some work (probably in a
     * helper) that causes a different rerenderDirty to be called.  While that
     * second rerender is "in the context of" the deepest component of the first,
     * so I decided not to make context a stack-of-stacks, we don't want the
     * second rerender to think its dirty objects are children of the first.  So
     * we have this piece of ugliness to mark the boundaries, by tagging the last
     * frame of the "old" rerenderDirty:
     */
    setNewRerenderContext : function() {
        $A.componentStack.addNote('rerenderNew', true);
    },

    /**
     * Clear the new bit once the nested rerenderDirty is done.
     */
    clearNewRerenderContext : function() {
        $A.componentStack.clearNote('rerenderNew');
    },

    /**
     * Starts a new context in $A.context for the given component.  We also need to
     * notice, at push, whether the child has existing elements that are in its
     * parent, and if so, where... this is because unrender will (correctly) chase
     * up the containers cleaning things out, but a later RErender might need to
     * reinsert them.
     *
     * @returns old context (i.e. current container) 
     */
    push : function (cmp) {
        var inContainer = false;
        var i;

        // Some rerenderers begin by unrendering themselves, which results in two
        // pushes for the same component (from rerender(), then unrender(), and
        // render() after that)... detect these so they don't confuse parent/prior!
        // (In more perverse cases, rerender can do work triggering a rerender of
        // itself, too!)
        var doublePush = (cmp === $A.componentStack.currentContext() ||
                $A.componentStack.getNote('rerenderNew'));

        // Other rerenderers, this time of a container, unrender and render their
        // child(ren).  Since we annotate the container's context frame with the
        // child (that becomes the prior sibling of the next child), we need the
        // first child in the render pass NOT to make a prior sibling cycle.
        var priorSibling;
        if (doublePush) {
            priorSibling = cmp.getRenderPriorSibling();  // We already figured it out
        } else {
            priorSibling = $A.componentStack.getNote('renderChild');
            if (priorSibling) {
                var walkback = priorSibling;
                while (walkback && walkback.isValid() && walkback !== cmp) {
                    walkback = walkback.getRenderPriorSibling();
                }
                if (walkback === cmp || !priorSibling.isValid()) {
                    // Ensure we break the priorSibling cycle.  This is only true for
                    // the first child, because if it DOESN'T make a loop on the second
                    // iteration, second child's second iteration won't be able to loop. 
                    priorSibling = undefined;
                }
            }
        }

        var container = cmp.getRenderContainer();
        if (doublePush) {
            // We do want the double stack frame so it will pop cleanly.  We don't
            // want its return value; we got the "right" container already above.  Nor
            // are we our own child; don't set renderChild on the earlier frame.
            $A.componentStack.push(cmp);
        } else {
            $A.componentStack.addNote('renderChild', cmp);

            // Check whether this components elements are already in the containers',
            // which is sometimes true during an unrender (e.g. inside body.destroy()),
            // prior to a rerender with different contents for body.
            if (container) {
                // This suggests we're re- or unrendering, or we wouldn't have container
                // (or elements) yet.  Since we do, see if the elements bubbled into the
                // container's elements, in which case we need to splice them later.
                var firstElem = cmp.getElement();
                if (firstElem) {
                    var parentElems = container.getElements();
                    if (parentElems) {
                        for (i = 0; parentElems[i]; ++i) {
                            if (firstElem === parentElems[i]) {
                                inContainer = true;
                                break;
                            }
                        }
                    }
                }
            }
            // Even if we didn't previously have a container, figure it out now as the
            // containing context (assuming there is one).
            container = $A.componentStack.push(cmp);
            cmp.setRenderContainer(container, priorSibling);
        }

        if (inContainer) {
            $A.componentStack.addNote('renderContained', inContainer);
        }
        return container;
    },

    /**
     * Pops the existing $A.context frame, and if oldElems is supplied, checks
     * against its containers' elements and fixes up any that referenced the
     * old values.
     */ 
    pop : function(cmp, oldElems) {
        var i;
        var elemsInContainer = $A.componentStack.getNote('renderContained');
        var top = $A.componentStack.pop(cmp);
        $A.assert(top, "empty component context stack");
        if ($A.componentStack.currentContext()) {
            // Higher stack frames will patch themselves up still.  We need this
            // for the LAST stack frame, to patch dangling references above.
            return;
        }
        var container = top.getRenderContainer();

        if (oldElems && container) {
            // if we have old elements and also a higher containers that might
            // reference them, we need to check if the elements changed and
            // seek-and-destroy the dead refs to them if so.
            var newElems = top.getElements();
            var changed = false;
            for (i in oldElems) {
                if (oldElems[i] !== newElems[i]) {
                    changed = true;
                    break;
                }
            }
            if (!changed) {
                for (i in newElems) {
                    if (oldElems[i] !== newElems[i]) {
                        changed = true;
                        break;
                    }
                }
            }

            if (changed && elemsInContainer) {
                // Because e.g. lazy provider actions must first destory the old body, then create with
                // a new value, even with elemsInContainer==true, we might not have oldElems in the
                // container now.  But we can figure out where it was, because it was after the last
                // element of the prior sibling (if it was in the container at all, that is).  This
                // depends on the fact that either the prior sib is stable, or it has already been done.
                var prevElem = undefined;
                var priorSib = top.getRenderPriorSibling();
                if (priorSib) {
                    var priorElems = priorSib.getElements();
                    if (priorElems[0]) {
                        prevElem = priorElems['element'];
                    } else {
                        for (i = 0; priorElems[i + 1]; ++i) {
                            // count to last elem
                        }
                        prevElem = priorElems[i];
                    }
                }
                for (container; container; container = container.getRenderContainer()) {
                    if (!container.updateElements(prevElem, oldElems, newElems)) {
                        break;   // If we don't adjust it, we're good above here too
                    }
                    // We also need to apply the containers' classes, if the contained components
                    // are also part of the containers elements.
                    var asArray = [];
                    for (i = 0; newElems[i]; ++i) {
                        asArray.push(newElems[i]);
                    }
                    this.applyClasses(container, asArray);
                }
            }
        }
    },

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
     * @private
     * Reorders a list to render containers before contained, which we can then use to skip
     * rerendering children that are rerendered by their parents also.  This can be a big
     * performance win for rerender and unrender, but it isn't automatic, because some
     * component rerenders try to be smart about NOT needlessly rerendering children, while
     * others are more naive.  So we only rearrange, we don't remove.
     *
     * @param list {Array} components to be examined
     * @param allMap {Object} all seen objects, mapped globalId to parent, used to
     *        short circuit known traversals
     * @param itemMap {Object} sorted tree of items from list, globalId to children,
     *        used to emit the tree in parent-first order
     * @returns a resorted list
     */
    reorderForContainment : function(list, allMap, itemMap) {
        if (list.length > 1) {
            // a list of length one or zero doesn't require thought... but longer ones do.
            if (!allMap) {
                allMap = {};
            }
            
            if (!itemMap) {
                itemMap = {};
                for (var i=0; i < list.length; ++i) {
                    this.createGlobalIdMap(list[i], itemMap);
                }
            }
            
            // We now have a map of all our elements.  Walk each thing, using first item for
            // ArrayValues, testing whether its renderContainers are in that allMap.  If they
            // are, defer them (because the container may do the job).  If not, we have a
            // root to address early, and it might do our contained children too.
            var early = [];
            for (i=0; i < list.length; ++i) {
                var item = list[i];
                var test = item;
                if (item instanceof ArrayValue) {
                    var array = list.getArray();
                    if (array.length === 0) {
                        // keep empty arrays early, since we break abstraction to look for owner!
                        early.push(item);
                        continue;
                    }
                    
                    test = array[0];
                }

                // Now, walk up from test until we either fall off the top (a root item) or find
                // it is contained by another thing in item.  Every visited container can be put
                // into allMap, to know what the answer is if we hit another child of that container.
                var parents = [];
                var container = test.getRenderContainer();
                var gid = container ? container.getGlobalId() : undefined;
                while (container && !(gid in allMap) && !itemMap[gid]) {
                     parents.push(container);
                     // Guard against cycles.  Is this max depth sufficiently ridiculous?
                     $A.assert(parents.length < 20000);
                     container = container.getRenderContainer();
                     gid = container ? container.getGlobalId() : undefined;
                }
                
                if (gid in allMap) {
                     // We found a parent we've already seen, and take the answer from it
                     container = allMap[gid];  // this is an item from list
                }
                
                // Now item is the original item,
                //     container is the nearest containing item from list, or undefined if uncontained
                //     parents has all the intermediate containers (not in list)
                if (container) {
                    itemMap[container.getGlobalId()].push(item);
                } else {
                    early.push(item);  // else we walked off the top without finding one
                }
                
                // Any intermediate parents are contained by the same container (or also
                // aren't contained by anything else in items, for container===undefined)
                for (var k=0; k < parents.length; ++k) {
                    allMap[parents[k].getGlobalId()] = container;
                }
            }
            
            this.depthFirstSort(early, itemMap, list);
        }
        
        return list;
    },

    /**
     * @private
     * Makes a map entry for the given item, or children for arrayvalues, into the given map.
     * Map entries are just empty arrays, which will be filled with child items (not just id's).
     */
    createGlobalIdMap : function(item, map) {
        if (item instanceof ArrayValue) {
            // Array values are special; we but need the array elements in allMap.
            var sublist = item.getArray();
            for (var i=0; i < sublist.length; i++) {
                this.createGlobalIdMap(sublist[i], map);
            }
        } else {
            map[item.getGlobalId()] = [];
        }
    },

    /**
     * @private
     * Returns a depth-first ordering starting from the given roots, progressing down through
     * the given tree structure.
     * @param roots {Array} set of start nodes, some of which may be ArrayValues.
     * @param tree {Object} map of globalId to contained components.
     * @param sorted {Array} result list
     * @param start {Integer} optional start index in sorted array
     * @returns number of slots in sorted filled
     */
    depthFirstSort : function (roots, tree, sorted, start) {
        if (start === undefined) {
            start = 0;
        }
        var index = start;
        for (var i = 0; i < roots.length; ++i) {
            var root = roots[i];
            sorted[index++] = root;
            var children = (root instanceof ArrayValue) ? root.getArray() : tree[root.getGlobalId()];
            index += this.depthFirstSort(children, tree, sorted, index);
        }
        return (index - start);
    },

    /**
     * Applies the appropriate css classes for this component to each element.
     *
     * @private
     */
    applyClasses : function(cmp, elements) {
        var className = cmp.getDef().getStyleClassName();
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
        $A.assert(elements, "We think every component must have an element, if only a locator comment");
        elements = this.evalStrings(elements);

        var bareElements = this.associateElements(cmp, elements);

        this.applyClasses(cmp, bareElements);

        if (ret) {
            var len = bareElements.length;
            for (var i = 0; i < len; i++) {
                ret.push(bareElements[i]);
            }
        }

        cmp.setRendered(true);
        priv.cleanComponent(cmp.getGlobalId());
    },

    /**
     * Insert elements to the DOM, relative to a reference node,
     * by default as its last child.
     *
     * @private
     */
    insertElements : function(elements, refNode, asSibbling, asFirst) {
        if (refNode) {
            var len = elements.length;
            var toInsert = [];
            for (var i = 0; i < len; i++) {
                var element = elements[i];
                if (refNode) {
                    if (element["tagName"] && element["tagName"] == "SCRIPT") {
                        aura.util.style.getHead().appendChild(element);
                    } else {
                        toInsert.push(element);
                    }
                }
            }

            if (toInsert.length > 0) {
                if (asSibbling) {
                    if (asFirst) {
                        $A.util.insertBefore(toInsert, refNode);
                    } else {
                        $A.util.insertAfter(toInsert, refNode);
                    }
                } else {
                    if (asFirst) {
                        $A.util.insertFirst(refNode, toInsert); // Different arglist
                    } else {
                        $A.util.appendChild(toInsert, refNode); // Default
                    }
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
            $A.assert(element !== undefined);
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
