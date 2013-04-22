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
    /**
     * When the input selection changes, update the expanded attribute
     * accordingly.
     */
    handleInputChange : function(cmp, event) {
        cmp.getAttributes().setValue('expanded', event.target.checked);
    },

    /**
     * Event handler to construct a visitor/traverser pair.
     * 
     * Both are currently defined as structural types. Visitors have the
     * methods: boolean visit(node), void accept(node), void endVisit(node).
     * 
     * Traversers have the method: void traverse(node).
     *  
     * Meta-Comment: Any way to usefully define & expose real types, especially
     * for client-built visitors?
     * 
     * @param cmp
     *            the treeNode cmp that triggered this action.
     * @param event
     *            the ui:makeVisitor event
     * @param helper
     *            the treeNodeHelper
     */
    makeVisitor : function(cmp, event, helper) {
        var visitor;
        var visitorParam = event.getParam('visitor');
        if ($A.util.isUndefinedOrNull(visitorParam)) {
            visitor = null;
        } else {
            visitor = helper["init" + visitorParam]();
        }

        // For now, we only allow traversers defined in the treeNode bundle.
        var traverser = helper["init" + event.getParam("traverser")]();
        var callback = event.getParam("callback");
        callback({
            'visitor' : visitor,
            'traverser' : traverser
        });
    },

    /**
     * The action handler for ui:traverseEvent.
     * 
     * The event parameters 'visitor' and 'traverser' define the visitation
     * behavior and traversal logic. In general, the given traverser will
     * recursively fire the traverseEvent on this node's children.
     * 
     * @param cmp
     *            the treeNode to traverse
     * @param event
     *            the ui:traverseEvent containing the visitor and traverser pair
     *            to use.
     * @param helper
     *            the treeNodeHelper
     */
    traverse : function(cmp, event, helper) {
        var visitor = event.getParam("visitor");
        var traverser = event.getParam("traverser");
        traverser.visitor = visitor;
        traverser.traverse(cmp);
    },
    
    /**
     * Return an array containing the children nodes of this node to the callback.
     */
    getChildren : function(cmp, event, helper) {
        var ret = helper.getChildren(cmp);
        event.getParam('callback')(ret);
    }
})
