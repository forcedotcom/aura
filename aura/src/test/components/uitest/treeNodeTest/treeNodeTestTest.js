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
     * Testing utility to easily invoke an ApplyVisitor.
     */
    applyVisit : function(node, traverser, funcToApply) {
        node.getEvent('makeVisitor').setParams({
            "visitor" : "ApplyVisitor",
            "traverser" : traverser,
            "callback" : function(args) {
                args.visitor.funcToApply = funcToApply;
                node.getEvent('traverse').setParams(args).fire();
            }
        }).fire();
    },

    /**
     * Verify that applyVisit is behaving as expected on a very simple case.
     */
    testApplySanity : {
        test : function(cmp) {
            var iota = cmp.find('iota');
            var called = '';
            this.applyVisit(iota, 'PostOrderTraverser', function(node) {
                called = node.get('v.title');
            })
            aura.test.assertEquals('iota', called,
                    "ApplyVisitor is not being called");
            called = '';
            this.applyVisit(iota, 'PreOrderTraverser', function(node) {
                called = node.get('v.title');
            })
            aura.test.assertEquals('iota', called,
                    "ApplyVisitor is not being called");
        }
    },

    /**
     * Verify that the PostOrderTraverser accepts nodes in the proper order.
     */
    testPostOrderAcceptOrder : {
        test : function(cmp) {
            // Populate our list of expected nodes
            var expectedIds = [ "iota", "mu", "lambda", "gamma", "pi", "rho",
                    "tau", "G", "D", "alpha", "beta", "E", "F", "chi", "psi",
                    "omega", "H", "B", "C", "A", "root" ];
            var expected = [];
            expectedIds.forEach(function(id) {
                expected.push(cmp.find(id));
            });
            var nodes = [];
            var root = cmp.find('root');
            var collect = function(node) {
                nodes.push(node);
            };
            this.applyVisit(root, "PostOrderTraverser", collect);
            aura.test.assertEquals(21, nodes.length,
                    "Greek tree should have 21 nodes");
            for ( var i = 0, n = nodes.length; i < n; i++) {
                aura.test.assertEquals(expected[i], nodes[i], "Node " + i
                        + " out of sequence");
            }
        }
    },

    /**
     * Verify that the PreOrderTraverser accepts nodes in the proper order.
     */
    testPreOrderAcceptOrder : {
        test : function(cmp) {
            // Populate our list of expected nodes
            var expectedIds = [ "root", "iota", "A", "mu", "B", "lambda", "D",
                    "gamma", "G", "pi", "rho", "tau", "E", "alpha", "beta",
                    "F", "H", "chi", "psi", "omega", "C" ];
            var expected = [];
            
            for(var id in expectedIds){
            	expected.push(cmp.find(expectedIds[id]));
            }
           
            var nodes = [];
            var root = cmp.find('root');
            var collect = function(node) {
                nodes.push(node);
            };
            this.applyVisit(root, "PreOrderTraverser", collect);
            aura.test.assertEquals(21, nodes.length,
                    "Greek tree should have 21 nodes");
            for ( var i = 0, n = nodes.length; i < n; i++) {
                aura.test.assertEquals(expected[i], nodes[i], "Node " + i
                        + " out of sequence");
            }
        }
    },
    
    /**
     * Make sure that visitation properly short circuits if visit() returns false.
     */
    testVisitShortCircuit : {
        test : function(cmp) {
            cmp.find('B').getAttributes().setValue('expanded', true);
            cmp.find('D').getAttributes().setValue('expanded', true);
            cmp.find('F').getAttributes().setValue('expanded', true);

            var ExpandedOnlyVisitor = function() {
                this.nodes = [];
            }
            
            ExpandedOnlyVisitor.prototype.visit = function(node) {
                return node.get('v.expanded');
            }
            ExpandedOnlyVisitor.prototype.accept = function(node) {
                this.nodes.push(node);
            }
            ExpandedOnlyVisitor.prototype.endVisit = function(node) {
                return;
            }
            var visitor = new ExpandedOnlyVisitor();
            
            var B = cmp.find('B');
            B.getEvent('makeVisitor').setParams({
                "visitor" : null,
                "traverser" : "PreOrderTraverser",
                "callback" : function(args) {
                    args.visitor = visitor;
                    B.getEvent('traverse').setParams(args).fire();
                }
            }).fire();
            
            aura.test.assertEquals(3, visitor.nodes.length);
            aura.test.assertEquals(cmp.find('B'), visitor.nodes[0]);
            aura.test.assertEquals(cmp.find('D'), visitor.nodes[1]);
            aura.test.assertEquals(cmp.find('F'), visitor.nodes[2]);
        }
    },
    
    /**
     * Make sure that clicking a non-leaf node updates the expansion state.
     */
    testClickExpandCollapse : {
        test : function(cmp) {
            // Get our initial state.
            var A = cmp.find('A');
            debugger;
            aura.test.assertFalse(A.get('v.expanded'));
            // First click expands.
            var elemA = document.getElementById('node_' + A.getGlobalId());
            elemA.click();
            aura.test.assertTrue(A.get('v.expanded'));
            // Second one collapses.
            elemA.click();
            aura.test.assertFalse(A.get('v.expanded'));
            
            // Clicking other elements below doesn't actually affect our expansion state.
            aura.test.assertFalse(cmp.find('C').get('v.expanded'));
            document.getElementById('node_' + cmp.find('C').getGlobalId()).click();
            aura.test.assertFalse(A.get('v.expanded'));
            aura.test.assertTrue(cmp.find('C').get('v.expanded'));
            
            // Likewise, clicking elements above do not affect the local state.
            aura.test.assertTrue(cmp.find('root').get('v.expanded'));
            document.getElementById('node_' + cmp.find('root').getGlobalId()).click();
            aura.test.assertFalse(A.get('v.expanded'));
            aura.test.assertFalse(cmp.find('root').get('v.expanded'));
        }
    },
})