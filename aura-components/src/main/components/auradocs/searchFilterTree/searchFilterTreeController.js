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

{   
    /**
     * Perform a search on the tree.
     * 
     * The user's query is matched case-insensitvely as a javascript regular
     * expression against the nodes' titles.
     * 
     * For all nodes with matching titles, show them and expand their ancestry.
     * 
     * FIXME: The intention is to hide at least the non-matching leaf nodes (if
     * not all non-matching nodes). However, this is not currently possible
     * because the tree model is dyanmic because the rendering is dynamic: the
     * iteration underneath the renderIf means that changing the value of hidden
     * for a model node results in some strange behavior. Failing that, we may
     * want to add some sort of match highlighting.
     * 
     * If the search is empty, then unhide all nodes.
     */
    handleSearch : function(cmp, event, helper) {
        var tree = cmp.get('v.tree');
        $A.assert(tree.isInstanceOf("ui:tree"), "Tree must be a ui:tree");
        
        tree.getEvent('getChildren').setParams({'callback' : function(nodes) {
            // e.ui:searchEvent does not get populated properly by
            // inputSearch. So, grab the value out of the DOM.
            var searchTerm = event.getParam('searchTerm') || event.getSource().getElement().value;
            
            for (var i = 0, n = nodes.length; i < n; i++) {
                // The cmp is the 'virtual' root. Iterate over all of its
                // directly descended ui:treeNode instances to search.
                var root = nodes[i];
                var searchVisitor = helper.initSearchFilterVisitor(searchTerm);
                
                if (searchTerm != '') {
                    var callback = function(args) {
                        args.visitor = searchVisitor;
                        var event = root.getEvent("traverse");
                        event.setParams(args);
                        event.fire();
                    };
                    root.getEvent("makeVisitor").setParams({
                        "visitor" : null,
                        "traverser" : "PostOrderTraverser",
                        "callback" : callback 
                    }).fire();
                } else {
                    // On an empty search, unhide all elements in the tree.
                    // As a future optimization, if the visitor did minimal
                    // hiding,
                    // we could unhide intelligently like the CollapseVisitor.
                    root.getEvent("makeVisitor").setParams({
                        "visitor" : "ApplyVisitor",
                        "traverser" : "PostOrderTraverser",
                        "callback" : function(args) {
                            args.visitor.funcToApply = function(node) {
                                node.getAttributes().setValue('hidden', false)
                            };
                            root.getEvent("traverse").setParams(args).fire();
                        }
                    }).fire();
                }
            }
        }}).fire();
    }
}
