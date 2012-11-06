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
     * Return the given node's children as an array. If the node is a leaf, then
     * return an empty array.
     * 
     * @param node
     *            the ui:treeNode to inspect for children
     */
    getChildren : function(node) {
        // Start with the model nodes.
        var ret = [].concat(node.find('modelNode') || []);
        var children = node.get("v.body") || [];
        for (var i = 0, n = children.length; i < n; i++) {
            var child = children[i];
            // Is it possible to simply make it an error to put anything but
            // treenodes in the body at component validation time?
            if (child.isInstanceOf("ui:treeNode")) {
                ret.push(child);
            }
        }
        
        return ret;
    },

    /**
     * All of the init* methods in this helper can be accessed by clients by
     * passing the latter portion (sans init) of the name as the appropriate
     * string argument to makeVisitor for the visitor or the traverser.
     * 
     * Meta-comment: This construction shows that the helper definition syntax
     * has some awkwardness:
     * 
     * 1) We have to jump through hoops to define real objects and resort to a
     * flyweight attachment of the object definition to the helper.
     * 
     * 2) Ideally we could expose these objects as part of the public API.
     * Instead, we rely here on a manual string based API to expose the provided
     * traversers and visitors.
     */

    /**
     * Return a new instance of a PostOrderTraverser.
     */
    initPostOrderTraverser : function() {
        var helper = this;
        if (!helper.PostOrderTraverser) {

            /**
             * The PostOrderTraverser will walk the tree by accepting all of
             * this node's children before accepting this node.
             */
            helper.PostOrderTraverser = function() {
                this.visitor = null;
            };

            helper.PostOrderTraverser.prototype.traverse = function(node) {
                // pre visit
                if (!this.visitor.visit(node)) {
                    return;
                }

                // traverse
                var children = helper.getChildren(node);
                for ( var i = 0, n = children.length; i < n; i++) {
                    var child = children[i];
                    child.getEvent("traverse").setParams({
                        "traverser" : this,
                        "visitor" : this.visitor
                    }).fire();
                }

                // accept this node
                this.visitor.accept(node);
                this.visitor.endVisit(node);
            };
        }
        return new helper.PostOrderTraverser();
    },

    /**
     * Return a new instance of a PreOrderTraverser.
     */
    initPreOrderTraverser : function() {
        var helper = this;
        if (!helper.PreOrderTraverser) {
            helper.PreOrderTraverser = function() {
                this.visitor = null;
            };

            /**
             * The PreOrderTraverser will first accept this node and then accept
             * all of this node's children.
             */
            helper.PreOrderTraverser.prototype.traverse = function(node) {
                // pre visit
                if (!this.visitor.visit(node)) {
                    return;
                }

                // accept this node
                this.visitor.accept(node);

                // traverse the children
                var children = helper.getChildren(node);
                for (var i = 0, n = children.length; i < n; i++) {
                    var child = children[i];
                    child.getEvent("traverse").setParams({
                        "traverser" : this,
                        "visitor" : this.visitor
                    }).fire();
                }

                this.visitor.endVisit(node);
            };
        }
        return new helper.PreOrderTraverser();
    },

    /**
     * Return a new instance of a PrintVisitor.
     */
    initPrintVisitor : function() {
        var helper = this;
        if (!helper.PrintVisitor) {
            /**
             * The PrintVisitor is a dummy visitor for debugging purposes: it
             * simply prints the title of the node and its level in the tree.
             */
            helper.PrintVisitor = function() {
                this.level = 0;
            };

            helper.PrintVisitor.prototype.accept = function(node) {
                console.log(node.get('v.title') + " - " + this.level);
            };

            helper.PrintVisitor.prototype.visit = function(node) {
                this.level += 1;
                return true;
            };

            helper.PrintVisitor.prototype.endVisit = function(node) {
                this.level -= 1;
            };
        }

        return new helper.PrintVisitor();
    },

    /**
     * Return a new instance of an ApplyVisitor.
     */
    initApplyVisitor : function(funcToApply) {
        var helper = this;
        if (!helper.ApplyVisitor) {

            /**
             * The ApplyVisitor applies the given function to every node
             * accepted by the traverser.
             * 
             * Use this visitor when the visitation need not be stateful or
             * conditional.
             */
            helper.ApplyVisitor = function(funcToApply) {
                this.funcToApply = funcToApply;
            };

            helper.ApplyVisitor.prototype.visit = function(node) {
                return true;
            };

            helper.ApplyVisitor.prototype.accept = function(node) {
                this.funcToApply(node)
            };

            helper.ApplyVisitor.prototype.endVisit = function(node) {
            };
        }
        return new helper.ApplyVisitor(funcToApply);
    },

    initCollapseVisitor : function() {
        var helper = this;
        if (!helper.CollapseVisitor) {
            /**
             * The CollapseVisitor intelligently collapses the tree: if we
             * encounter a collapsed node, then there is no need to visit any of
             * its children.
             */
            helper.CollapseVisitor = function() {
            };

            helper.CollapseVisitor.prototype.visit = function(node) {
                var expanded = node.get('v.expanded');
                // we only need to visit expanded nodes.
                return expanded;
            };

            helper.CollapseVisitor.prototype.accept = function(node) {
                node.getAttributes().setValue("expanded", false);
            };

            helper.CollapseVisitor.prototype.endVisit = function(node) {
            }
        }
        return new helper.CollapseVisitor();
    },
})