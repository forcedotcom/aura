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
     * Return a new instance of the SearchFilterVisitor
     */
    initSearchFilterVisitor : function(query) {
        var helper = this;
        if (!helper.SearchFilterVisitor) {
            /**
             * This visitor requires a PostOrderTraverser.
             * 
             * Show and expand paths to matching nodes. Hide all other nodes.
             * 
             * @param query
             *            the search query to match against
             */
            helper.SearchFilterVisitor = function(query) {
                this.query = query;
                this.queryRe = new RegExp(query, "i");
                // Maintain a stack of {node : <node>, match : boolean} objects
                // to track visitation state.
                this.stack = [];
            };

            /**
             * Record the node's match state.
             */
            helper.SearchFilterVisitor.prototype.accept = function(node) {
                var title = node.get('v.item.title') || '' + node.get('v.title') || '';
                
                if (this.queryRe.test(title)) {
                    // This node is a match.
                    var record = this.stack[this.stack.length - 1];
                    record.match = true;
                }
            };

            /**
             * Add a node to our stack as we start to examine it.
             */
            helper.SearchFilterVisitor.prototype.visit = function(node) {
                // We begin our visit assuming no match.
                this.stack.push({
                    "node" : node,
                    "match" : false
                });
                return true;
            };

            /**
             * When we are done traversing the node, act on its match state and
             * possibly update the match state of its parent.
             */
            helper.SearchFilterVisitor.prototype.endVisit = function(node) {
                var record = this.stack.pop();
                // TODO: this match logic can give a funky UX when we match a
                // dir but not its children.
                $A.assert(node === record.node, "endVisit got an unexpected node");

                if (!record.match) {
                    // Collapse a node if it doesn't match
                    var atts = node.getAttributes();
                    atts.setValue('expanded', false);
                } else {
                    var title = node.get('v.item.title') || '' + node.get('v.title') || '';
                    // If a node matches then expand and show it.
                    var atts = node.getAttributes();
                    atts.setValue('expanded', true);
                    // This is not strictly necessary until we start hiding on non-matches.
                    atts.setValue('hidden', false);

                    // If a child matches, then it's parent also matches.
                    // By induction, the path of nodes from the root to this
                    // node matches as we peel off the stack.
                    var parentIndex = this.stack.length - 1;
                    if (parentIndex >= 0) {
                        var parentRecord = this.stack[parentIndex];
                        parentRecord.match = true;
                    }
                }
            };
        }

        return new helper.SearchFilterVisitor(query);
    }
})