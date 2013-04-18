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
	 * Test top level tree elements are rendered  
	 */
	testTreeElementsPresent : {
		test : function(cmp) {
			aura.test.assertFalse(aura.util.isUndefinedOrNull(cmp.find("automobiles")), "Could not find 'automobiles' tree");
			aura.test.assertFalse(aura.util.isUndefinedOrNull(cmp.find("planes")), "Could not find 'planes' tree");
		}
	},
	
	/**
	 * Test nodes of trees are rendered 
	 */
	testTreeNodesPresent : {
		test : function(cmp) {
			var treeNodeIds = ["toyota", "toyota.sedan", "toyota.coupe", "toyota.truck", "toyota.futuremodel",
				"toyota.camry", "toyota.corolla", "toyota.yaris", "toyota.tacoma", "toyota.secretModel", "toyota.pod",
				"tesla", "tesla.sedan", "tesla.sports", "tesla.suv",
				"tesla.models", "tesla.roadster",
				"ford", "ford.sedan", "ford.truck", "ford.sports",
				"ford.focus", "ford.fusion", "ford.taurus", "ford.f150", "ford.superduty", "ford.mustang",
				"boeing", "boeing.737", "boeing.747", "boeing.777",
				"airbus", "airbus.a380",
				"xflight"
				];
				
			for (var i = 0, treeLength = treeNodeIds.length; i < treeLength; i++ ) {
				var nodeId = treeNodeIds[i];
				aura.test.assertFalse(aura.util.isUndefinedOrNull(cmp.find(nodeId)), "Could not find '" + nodeId + "' node");
			}
		}
	},
	
	/**
	 * Test can expand and collapse nodes of a tree 
	 */
	testExpandCollapseNodesOnTree : {
        test : function(cmp) {
        	// tree 1 expand node
        	var toyota = cmp.find("toyota");
            aura.test.assertFalse(toyota.get("v.expanded"), "Toyota should not be expanded");
            var elemToyota = document.getElementById("node_" + toyota.getGlobalId());
            elemToyota.click();
            aura.test.assertTrue(toyota.get("v.expanded"), "Toyota should be expanded");
            
			// tree 2 expand node
            var airbus = cmp.find("airbus");
            aura.test.assertFalse(airbus.get("v.expanded"), "Airbus should not be expanded");
            var elemAirbus = document.getElementById("node_" + airbus.getGlobalId());
            elemAirbus.click();
            aura.test.assertTrue(airbus.get("v.expanded"), "Airbus should be expanded");
            
            // tree 1 collaspe node
            elemToyota.click();
            aura.test.assertFalse(toyota.get("v.expanded"), "Toyota should not be expanded");
        }
    }
})