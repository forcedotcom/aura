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
     * Fire the searchEvent on the searchFilterTree.
     */
    doSearch : function(cmp, searchTerm) {
        var searchTree = cmp.find('searchTree');
        searchTree.getEvent('search').setParams({
            'searchTerm' : searchTerm
        }).fire();
    },

    /**
     * Convenience method for printing nodes in assertion messages.
     */
    nodeToString : function(node) {
        var string = node.get('v.item.title') || '' + node.get('v.title') || '';
        string += " (" + (node.get('v.expanded') ? 'expanded' : 'collapsed');
        string += ", " + (node.get('v.hidden') ? 'hidden' : 'shown') + ")";
        return string;
    },

    /**
     * @param cmp
     *            the searchFilterTree
     * @param ids
     *            an array of aura:ids
     * @return An array of components correspdonding to the given ids.
     */
    idsToNodes : function(cmp, ids) {
        var nodes = [];
        for ( var i = 0, n = ids.length; i < n; i++) {
            nodes.push(cmp.find(ids[i]));
        }
        return nodes;
    },

    /**
     * Create a visitor to collect and validate the expansion state of a tree.
     */
    initExpansionValidator : function(expectedNodes, expectedState) {
        var self = this;
        if (!self.ExpansionValidator) {
            self.ExpansionValidator = function(expectedNodes, expectedState) {
                this.expected = expectedNodes.sort();
                this.expansion = expectedState;
                this.actual = [];
            }

            self.ExpansionValidator.prototype.visit = function(node) {
                return true;
            }
            self.ExpansionValidator.prototype.accept = function(node) {
                if (node.get('v.expanded') == this.expansion) {
                    this.actual.push(node);
                }
            }
            self.ExpansionValidator.prototype.endVisit = function(node) {
            }

            /**
             * Assert that the only nodes in the given expansion state were the
             * expected nodes.
             */
            self.ExpansionValidator.prototype.validate = function() {
                this.actual = this.actual.sort();
                $A.test.assertEquals(this.expected.length, this.actual.length,
                        "Incorrect # of matching nodes");
                for ( var i = 0, n = this.expected.length; i < n; i++) {
                    $A.test.assertTrue(this.actual[i] === this.expected[i],
                            "Unexpected node "
                                    + self.nodeToString(this.actual[i])
                                    + ", Expecting "
                                    + self.nodeToString(this.expected[i]));
                }
            }
        }

        return new self.ExpansionValidator(expectedNodes, expectedState);
    },

    /**
     * Conveience method to run the expansion visitor and validation.
     */
    validateExpansion : function(root, expectedNodes, expectedState) {
        var expansionVisitor = this.initExpansionValidator(expectedNodes,
                expectedState);
        root.getEvent('makeVisitor').setParams({
            "visitor" : null,
            "traverser" : "PreOrderTraverser",
            "callback" : function(args) {
                args.visitor = expansionVisitor;
                root.getEvent("traverse").setParams(args).fire();
            }
        }).fire();
        expansionVisitor.validate();
    },

    /**
     * Make sure we can do a simple, one level search.
     */
    testOneLevelSearch : {
        test : function(cmp) {
            this.doSearch(cmp, "iota");
            $A.test.assertTrue(cmp.find('root').get('v.expanded'))
            $A.test.assertTrue(!cmp.find('A').get('v.expanded'));
            this.validateExpansion(cmp.find('root'), this.idsToNodes(cmp, [
                    "root", "iota" ]), true);
        }
    },

    /**
     * Make sure we can search over multiple roots (aka the tree as the virtual
     * root).
     */
    testMultipleRoots : {
        test : function(cmp) {
            this.doSearch(cmp, "root");
            $A.test.assertTrue(cmp.find('root').get('v.expanded'));
            $A.test.assertTrue(cmp.find('secondRoot').get('v.expanded'));
            $A.test.assertTrue(!cmp.find('A').get('v.expanded'));
            this.validateExpansion(cmp.find('A'), [], true); // A and all of
                                                                // its
                                                                // descendants
                                                                // should be
                                                                // collapsed.
        }
    },

    /**
     * Make sure that multiple matches are handled correctly.
     */
    testMultipleMatch : {
        test : function(cmp) {
            // Multiple matches under one root.
            this.doSearch(cmp, "beta");
            this.validateExpansion(cmp.find('root'), this.idsToNodes(cmp, [
                    "root", "A", "B", "E", "beta" ]), true);

            // Multiple matches across roots
            this.doSearch(cmp, "bar");
            this.validateExpansion(cmp.find('root'), this.idsToNodes(cmp, [
                    "root", "A", "B", "H", "psi" ]), true);
            this.validateExpansion(cmp.find('secondRoot'), this.idsToNodes(cmp,
                    [ "secondRoot", "bar" ]), true);
        }
    },

    /**
     * Queries that match every node should expand the entire tree, and those
     * that match none should collapse it.
     */
    testAllAndNothing : {
        test : function(cmp) {
            // A query that matches everything expands everything. So, none
            // should be collapsed.
            this.doSearch(cmp, "\\w");
            this.validateExpansion(cmp.find('root'), [], false);
            this.validateExpansion(cmp.find('secondRoot'), [], false);
            // Conversely, a query that matches nothing collapses everything.
            // So, none should be expanded.
            this.doSearch(cmp, "hiybbprqag");
            this.validateExpansion(cmp.find('root'), [], true);
            this.validateExpansion(cmp.find('secondRoot'), [], true);
        }
    },

    /**
     * Exercise the tree with a single model generated node.
     */
    testSingleModelNode : {
        test : function(cmp) {
            cmp.find('searchTree').getAttributes().setValue('nodes', cmp.getValue('m.tree'));
            // TODO(cconroy): sadly this doesn't seem to actually update the tree..
        }
    }
})