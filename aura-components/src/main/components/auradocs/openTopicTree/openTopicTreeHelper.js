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
     * Create a new instance of the ActiveTopicVisitor
     */
    initActiveTopicVisitor : function(topicMap, parentMap) {
        var helper = this;
        if (!helper.ActiveTopicVisitor) {
            /**
             * Populate the given topicMap with a mapping from href => node.
             * 
             * We assert that this is a unique mapping when we build it, and we
             * assume that no outside actors are changing the tree out from
             * underneath us afterwards.
             * 
             * This requires a PostOrderTraversal
             * 
             * @param {Object} topicMap a map to populate with a {string} href => {ui:treeNode} node mapping
             * @param {Object} parentMap a map to populate with a {string} globalId => {ui:treeNode} node mapping
             */
            helper.ActiveTopicVisitor = function(topicMap, parentMap) {
                // Maintain the current stack in order to build parent uplinks.
                this.stack = [];
                this.topicMap = topicMap;
                this.parentMap = parentMap;
            };

            /**
             * Visit all nodes and maintain a stack to represent the current traversal path from the root to the node.
             */
            helper.ActiveTopicVisitor.prototype.visit = function(node) {
                this.stack.push(node);
                return true;
            };

            /**
             * Populate the parent and topic maps, if applicable, for this node.
             */
            helper.ActiveTopicVisitor.prototype.accept = function(node) {
                // We're at a leaf if we have a link, as currently specified by ui:treeNode.
                var href = null;
                if (node.get('v.item')) {
                    href = node.get('v.item.href');
                } else {
                    href = node.get('v.href');
                }
              
                if (href) {
                    if (this.topicMap[href]) {
                        throw new Error("auradocs:openTopicTree got a topic collision at " + href);
                    } 
                    this.topicMap[href] = node;
                }
                
                // We're at an interior node if the index to our parent in the stack is non-zero.
                var parentIndex = this.stack.length - 2;
                $A.assert(parentIndex >= -1);
                if (parentIndex > -1) {
                    this.parentMap[node.getGlobalId()] = this.stack[parentIndex];
                }
            };

            helper.ActiveTopicVisitor.prototype.endVisit = function(node) {
                this.stack.pop();
            }
        }
        return new helper.ActiveTopicVisitor(topicMap, parentMap);
    },
    
    /**
     * In order to highlight active topics and expand ancestry, we need to build some extra client model state.
     * 
     * Any time the tree changes (including when it is first instantiated), we run this process.
     * 
     * Note this assumes (but lacks the ability to enforce) that the tree's node model does not change once
     * instantiated for correctness.
     * 
     * @return {boolean} false if there was no tree to process.
     */
    preprocessTree : function(cmp, evt) {
        cmp._topicMap = {};
        cmp._parentMap = {};
        cmp._activeCmp = null;
        // retain a reference to this helper so we can reference it in the event chain below.
        var helper = this;
        
        // Handle layered composition of tree objects.
        var tree = cmp.get('v.tree');
        if (tree == null) {
            return false;
        }
        $A.assert(tree.isInstanceOf("ui:tree"), "Tree must be a ui:tree");
     
        tree.getEvent('getChildren').setParams({'callback' : function (nodes) {
            for (var i = 0, n = nodes.length; i < n; i++) {
                var root = nodes[i];
                root.getEvent("makeVisitor").setParams({
                    "traverser" : "PostOrderTraverser",
                    "callback" : function(args) {
                        args.visitor = helper.initActiveTopicVisitor(cmp._topicMap, cmp._parentMap);
                        root.getEvent("traverse").setParams(args).fire();
                    }
                }).fire(); // Make the visitor.
            }
        }}).fire(); // Get the tree's children.
        
        return true;
    },

    /**
     * Set all of the active node's ancestors to be expanded.
     */
    expandActiveAncestry : function(cmp) {
        var toExpand = cmp._parentMap[cmp._activeCmp.getGlobalId()];
        // Follow parent uplinks and expand until we reach the root.
        while (toExpand) {
            toExpand.getAttributes().setValue('expanded', true);
            toExpand = cmp._parentMap[toExpand.getGlobalId()];
        }
    },

    /**
     * Add the active class to the active node and scroll it into view if
     * necessary.
     */
    highlightActive : function(cmp) {
        cmp._activeCmp.getAttributes().setValue('active', 'true');
    },

    /**
     * Determine the new active component based on the window location. If
     * necessary, unhighlight the previously active component.
     */
    setActive : function(cmp) {        
        // Unhighlight the old if we had one.
        if (cmp._activeCmp && cmp._activeCmp.getElement()) {
            cmp._activeCmp.getElement().setAttribute('active', false);
        }

        // Set the new active component.
        var newLocation = window.location.hash;
        cmp._activeCmp = cmp._topicMap[newLocation];
        if (!cmp._activeCmp) {
            // get the catchall topic
            cmp._activeCmp = cmp._topicMap[cmp.get("v.catchAllHref")];
        }
        $A.assert(!$A.util.isUndefinedOrNull(cmp._activeCmp), "no activeCmp");
    },
    
    /**
     * Update the active node and perform the highlighting and expansion.
     */
    doUpdate : function(cmp) {
        this.setActive(cmp);
        this.expandActiveAncestry(cmp);
        this.highlightActive(cmp);
    },
})