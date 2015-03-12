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
	//Test for static labels. 
	testStaticLabels: {
		test: [
			function(component) {
			    var actual = $A.test.getText(component.find("staticLabelContainer").getElement());
			    $A.test.assertEquals("2007 Members", actual, "label value did not match attribute.");
			    //change attribute
			    component.set("v.intByReference",2015);
			}, 
			function(component) {
				   $A.test.assertEquals(2015, component.get("v.intByReference"), "v.intByReference wasn't updated");
			     var actual = $A.test.getText(component.find("staticLabelContainer").getElement());
			     $A.test.assertEquals("2015 Members", actual, "Label should get updated");
			}
		]
	},
	
	//Test for dynamic labels. 
	testDynamicLabels: {
		test: [
			function(component) {
			    var actual = $A.test.getText(component.find("dynamicLabelContainer").getElement());
			    $A.test.assertEquals("we have 2007 members", actual, "label value did not match attribute.");
			    //change attribute
			    component.set("v.intByReference",2015);
			}, 
			function(component) {
				   $A.test.assertEquals(2015, component.get("v.intByReference"), "v.numerValue wasn't updated");
			     var actual = $A.test.getText(component.find("dynamicLabelContainer").getElement());
			     $A.test.assertEquals("we have 2015 members", actual, "Label should get updated");
			}
		]
	},
	
	testHtmlAttributesPrv : {
		test: function(component) {
			var item = component.find("liWithPrv");
			var newValue = 999;
			item.set("v.HTMLAttributes.prv", newValue);

			var expected = "999";
			$A.test.addWaitForWithFailureMessage(true, function() {
				actual = $A.util.getText(item.getElement());
				return expected	=== actual;
			}, "Updating the PRV to the passthrough value never caused a markDirty and rerender.");
		}
	},
	
    testPassingIntToFacet: {
        test: [function(cmp) {
            $A.test.assertEquals(2007, cmp.get("v.intByReference"));
            $A.test.assertEquals(2007, cmp.find("innerCmp").get("v.intAttribute"));
            $A.test.assertEquals("2007", this.getTextNoWhitespaces(cmp.find("intOutput")));
            $A.test.assertEquals("2007", this.getTextNoWhitespaces(cmp.find("innerCmp").find("intOutput")));

            $A.test.clickOrTouch(cmp.find("changeIntOuterButton").getElement());
        }, function(cmp){
            $A.test.assertEquals(9999, cmp.get("v.intByReference"));
            $A.test.assertEquals(9999, cmp.find("innerCmp").get("v.intAttribute"));
            $A.test.assertEquals("9999", this.getTextNoWhitespaces(cmp.find("intOutput")));
            $A.test.assertEquals("9999", this.getTextNoWhitespaces(cmp.find("innerCmp").find("intOutput")));

            $A.test.clickOrTouch(cmp.find("changeIntFacetButton").getElement());
        }, function(cmp){
            $A.test.assertEquals(5565, cmp.get("v.intByReference"));
            $A.test.assertEquals(5565, cmp.find("innerCmp").get("v.intAttribute"));
            $A.test.assertEquals("5565", this.getTextNoWhitespaces(cmp.find("intOutput")));
            $A.test.assertEquals("5565", this.getTextNoWhitespaces(cmp.find("innerCmp").find("intOutput")));
        }]
    },

    testPassingFunctionCall: {
        test: [function(cmp) {
            var expected = "default string FCV CONCAT";
            var element = cmp.find("functionCallOutput").getElement();
            var actual = $A.test.getText(element);
            $A.test.assertEquals(expected,actual,"FunctionCallValue did not match attribute.");
            //change attribute
            cmp.set("v.stringByReference","CHANGED string value");
        }, function(cmp) {
            //what it evaluate to also get changed
            var expected = "CHANGED string value FCV CONCAT";
            var element = cmp.find("functionCallOutput").getElement()
            var actual = $A.test.getText(element);
            $A.test.assertEquals(expected,actual,"FunctionCallValue did not match attribute.");
        }
        ]
    },

    verifyInitialList: function(cmp) {
        var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c'];
        this.assertListItems(expected, cmp.get("v.listByReference"));
        this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));

        var expected2 = "level1alevel1blevel2alevel3alevel2blevel1c";
        $A.test.assertEquals(expected2, this.getTextNoWhitespaces(cmp.find("listOutput")));
        $A.test.assertEquals(expected2, this.getTextNoWhitespaces(cmp.find("innerCmp").find("listOutput")));
    },

    testPassingListToFacet_ModifyOuter: {
        test: [function(cmp) {
            this.verifyInitialList(cmp);
            $A.test.clickOrTouch(cmp.find("changeListOuterButton").getElement());
        }, function(cmp){
            // Modify list on outer component, verify facet list has also changed
            var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'changedOuter2b'], 'level1c'];
            
            this.assertListItems(expected, cmp.get("v.listByReference"));
            this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
            $A.test.assertEquals("level1alevel1blevel2alevel3achangedOuter2blevel1c",
                    this.getTextNoWhitespaces(cmp.find("listOutput")));
            $A.test.assertEquals("level1alevel1blevel2alevel3achangedOuter2blevel1c",
                    this.getTextNoWhitespaces(cmp.find("innerCmp").find("listOutput")));
        }]
    },

    testPassingListToFacet_ModifyFacet: {
        test: [function(cmp) {
            this.verifyInitialList(cmp);
            $A.test.clickOrTouch(cmp.find("changeListFacetButton").getElement());
        }, function(cmp){
            // Modify list on facet, verify outer cmp list has also changed
            var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'changedFacet2b'], 'level1c'];
           
            this.assertListItems(expected, cmp.get("v.listByReference")); 
            this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
            $A.test.assertEquals("level1alevel1blevel2alevel3achangedFacet2blevel1c",
                    this.getTextNoWhitespaces(cmp.find("listOutput")));
            $A.test.assertEquals("level1alevel1blevel2alevel3achangedFacet2blevel1c",
                    this.getTextNoWhitespaces(cmp.find("innerCmp").find("listOutput")));
        }]
    },

    testPassingListToFacet_AppendOuter: {
        test: [function(cmp) {
            this.verifyInitialList(cmp);
            $A.test.clickOrTouch(cmp.find("appendListOuterButton").getElement());
        }, function(cmp){
            // Modify list on outer component, verify facet list has also changed
            var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c', 'addedOuter1d'];
           
            this.assertListItems(expected, cmp.get("v.listByReference"));
            this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
            $A.test.assertEquals("level1alevel1blevel2alevel3alevel2blevel1caddedOuter1d",
                    this.getTextNoWhitespaces(cmp.find("listOutput")));
            $A.test.assertEquals("level1alevel1blevel2alevel3alevel2blevel1caddedOuter1d",
                    this.getTextNoWhitespaces(cmp.find("innerCmp").find("listOutput")));
        }]
    },

    testPassingListToFacet_AppendFacet: {
        test: [function(cmp) {
            this.verifyInitialList(cmp);                 
            $A.test.clickOrTouch(cmp.find("appendListFacetButton").getElement());
        }, function(cmp) {
        	// Modify list on outer component, verify facet list has also changed   
        	var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c', 'addedFacet1d'];
            this.assertListItems(expected, cmp.get("v.listByReference"));
            this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
            $A.test.assertEquals("level1alevel1blevel2alevel3alevel2blevel1caddedFacet1d",
                    this.getTextNoWhitespaces(cmp.find("listOutput")));
            $A.test.assertEquals("level1alevel1blevel2alevel3alevel2blevel1caddedFacet1d",
                    this.getTextNoWhitespaces(cmp.find("innerCmp").find("listOutput")));
        }]
    },

    testPassingListToFacet_DeleteItemOuter: {
        test: [function(cmp) {
            this.verifyInitialList(cmp);
            $A.test.clickOrTouch(cmp.find("removeListOuterButton").getElement());
        }, function(cmp) {

            // Modify list on outer component, verify facet list has also changed
            var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], undefined];
            this.assertListItems(expected, cmp.get("v.listByReference"));
            this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
            $A.test.assertEquals("level1alevel1blevel2alevel3alevel2b",
                    this.getTextNoWhitespaces(cmp.find("listOutput")));
            $A.test.assertEquals("level1alevel1blevel2alevel3alevel2b",
                    this.getTextNoWhitespaces(cmp.find("innerCmp").find("listOutput")));
        }]
    },

    testPassingListToFacet_DeleteItemFacet: {
        test: [function(cmp) {
            this.verifyInitialList(cmp);
            $A.test.clickOrTouch(cmp.find("removeListFacetButton").getElement());
        }, function(cmp) {
        	// Modify list on outer component, verify facet list has also changed
            var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], undefined];
            this.assertListItems(expected, cmp.get("v.listByReference"));
            this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
            $A.test.assertEquals("level1alevel1blevel2alevel3alevel2b",
                    this.getTextNoWhitespaces(cmp.find("listOutput")));
            $A.test.assertEquals("level1alevel1blevel2alevel3alevel2b",
                    this.getTextNoWhitespaces(cmp.find("innerCmp").find("listOutput")));
        }]
    },

    verifyInitialMap: function(cmp) {
        var expected = {
                layer1: "initial1",
                oneDeeper: {
                    layer2: "initial2",
                    evenOneDeeper: {
                        layer3: "initial3"
                    }
                }
            };
        this.assertMapItems(expected, cmp.get("v.mapByReference"));
        this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));

        var expected2 = "initial1initial2initial3";
        $A.test.assertEquals(expected2, this.getTextNoWhitespaces(cmp.find("mapOutput")));
        $A.test.assertEquals(expected2, this.getTextNoWhitespaces(cmp.find("innerCmp").find("mapOutput")));
    },

    testPassingMapToFacet_ModifyOuter: {
        test: [function(cmp) {
            this.verifyInitialMap(cmp);
            $A.test.clickOrTouch(cmp.find("changeMapOuterButton").getElement());
        }, function(cmp) {

            var expected = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: "changedOuter3"
                        }
                    }
                };

           
            this.assertMapItems(expected, cmp.get("v.mapByReference"));
            this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));
            $A.test.assertEquals("initial1initial2changedOuter3",
                    this.getTextNoWhitespaces(cmp.find("mapOutput")));
            $A.test.assertEquals("initial1initial2changedOuter3",
                    this.getTextNoWhitespaces(cmp.find("innerCmp").find("mapOutput")));
        }]

    },

    testPassingMapToFacet_ModifyFacet: {
        test: [function(cmp) {
            this.verifyInitialMap(cmp);
            $A.test.clickOrTouch(cmp.find("changeMapFacetButton").getElement());
        }, function(cmp) {

            var expected = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: "changedFacet3"
                        }
                    }
                };
           
            this.assertMapItems(expected, cmp.get("v.mapByReference"));
            this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));
            $A.test.assertEquals("initial1initial2changedFacet3",
                    this.getTextNoWhitespaces(cmp.find("mapOutput")));
            $A.test.assertEquals("initial1initial2changedFacet3",
                    this.getTextNoWhitespaces(cmp.find("innerCmp").find("mapOutput")));
        }]
    },

    testPassingMapToFacet_AppendOuter: {
        test: [function(cmp) {
            this.verifyInitialMap(cmp);
            $A.test.clickOrTouch(cmp.find("appendMapOuterButton").getElement());
        }, function(cmp) {
            var expected = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: "initial3",
                            layer3b: "addedOuter3"
                        },
                        newEntry: {
                            newLayer: "addedOuter4"
                        }
                    }
                };
           
            this.assertMapItems(expected, cmp.get("v.mapByReference"));
            this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));
            $A.test.assertEquals("initial1initial2\initial3addedOuter3addedOuter4",
                    this.getTextNoWhitespaces(cmp.find("mapOutput")));
            $A.test.assertEquals("initial1initial2\initial3addedOuter3addedOuter4",
                    this.getTextNoWhitespaces(cmp.find("innerCmp").find("mapOutput")));
        }]
    },

    testPassingMapToFacet_AppendFacet: {
        test: [function(cmp) {
            this.verifyInitialMap(cmp);
            $A.test.clickOrTouch(cmp.find("appendMapFacetButton").getElement());
        }, function(cmp) {
            var expected = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: "initial3",
                            layer3b: "addedFacet3"
                        },
                        newEntry: {
                            newLayer: "addedFacet4"
                        }
                    }
                };  
            this.assertMapItems(expected, cmp.get("v.mapByReference"));
            this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));
            $A.test.assertEquals("initial1initial2\initial3addedFacet3addedFacet4",
                    this.getTextNoWhitespaces(cmp.find("mapOutput")));
            $A.test.assertEquals("initial1initial2\initial3addedFacet3addedFacet4",
                    this.getTextNoWhitespaces(cmp.find("innerCmp").find("mapOutput")));
        }]
    },

    testPassingMapToFacet_DeleteItemOuter: {
        test: [function(cmp) {
            this.verifyInitialMap(cmp);
            $A.test.clickOrTouch(cmp.find("removeMapOuterButton").getElement());
        }, function(cmp){           
            var expected = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: undefined
                        }
                    }
                };
            this.assertMapItems(expected, cmp.get("v.mapByReference"));
            this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));
            
            $A.test.assertEquals("initial1initial2",
                    this.getTextNoWhitespaces(cmp.find("mapOutput")));
            $A.test.assertEquals("initial1initial2",
                    this.getTextNoWhitespaces(cmp.find("innerCmp").find("mapOutput")));
        }]
    },

    testPassingMapToFacet_DeleteItemFacet: {
        test: [function(cmp) {
            this.verifyInitialMap(cmp);
            $A.test.clickOrTouch(cmp.find("removeMapFacetButton").getElement());
        }, function(cmp){
            var expected = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: undefined
                        }
                    }
                };
            
            this.assertMapItems(expected, cmp.get("v.mapByReference"));
            this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));
            
            $A.test.assertEquals("initial1initial2",
                    this.getTextNoWhitespaces(cmp.find("mapOutput")));
            $A.test.assertEquals("initial1initial2",
                    this.getTextNoWhitespaces(cmp.find("innerCmp").find("mapOutput")));
        }]
    },

    testFacetDestroy: {
        test: function(cmp) {
            cmp.find("innerCmp").destroy(false);
            $A.test.assertUndefined(cmp.find("innerCmp"));

            var expectedList = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c'];
            this.assertListItems(expectedList, cmp.get("v.listByReference"));

            var expectedMap = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: "initial3"
                        }
                    }
                };
            this.assertMapItems(expectedMap, cmp.get("v.mapByReference"));

            var expectedList2 = "level1alevel1blevel2alevel3alevel2blevel1c";
            $A.test.assertEquals(expectedList2, this.getTextNoWhitespaces(cmp.find("listOutput")));

            var expectedMap2 = "initial1initial2initial3";
            $A.test.assertEquals(expectedMap2, this.getTextNoWhitespaces(cmp.find("mapOutput")));
        }
    },

    testNestedMapValuesMarkedDirty: {
        test: function(cmp) {
            $A.test.assertFalse(cmp.isDirty("v.mapByReference"), "Map should not be dirty before any changes");
            $A.test.assertFalse(cmp.isDirty("v.mapAttribute"), "Facet's Map should not be dirty before any changes");

            cmp.set("v.mapByReference.oneDeeper.layer2", "newValue");
// JBUCH: HALO: TODO: THIS TEST IS NOW INVALID. DIRTY THINGS ARE CLEANED UP TOO FAST
//            $A.test.assertTrue(cmp.isDirty("v.mapByReference"), "Map was not marked dirty after a direct member value change");
//            $A.test.assertTrue(cmp.find("innerCmp").isDirty("v.mapAttribute"), "Facet's Map not marked dirty after a direct member value change");

            $A.rerender(cmp);
            $A.test.assertFalse(cmp.isDirty("v.mapByReference"), "Map should not be dirty after rerender");
            $A.test.assertFalse(cmp.isDirty("v.mapAttribute"), "Facet's Map should not be dirty after rerender");

            var map = cmp.get("v.mapByReference");
            map.oneDeeper.layer2 = "newValue";
            cmp.set("v.mapByReference", map);

// JBUCH: HALO: TODO: THIS TEST IS NOW INVALID. DIRTY THINGS ARE CLEANED UP TOO FAST
//            $A.test.assertTrue(cmp.isDirty("v.mapByReference"), "Map was not marked dirty after value change");
//            $A.test.assertTrue(cmp.find("innerCmp").isDirty("v.mapAttribute"), "Facet's Map not marked dirty after value change");

            $A.rerender(cmp);
            $A.test.assertFalse(cmp.isDirty("v.mapByReference"), "Map should not be dirty after rerender");
            $A.test.assertFalse(cmp.isDirty("v.mapAttribute"), "Facet's Map should not be dirty after rerender");
        }
    },

    testNestedListValuesMarkedDirty: {
        test: function(cmp) {
            $A.test.assertFalse(cmp.isDirty("v.listByReference"), "List should not be dirty before any changes");
            $A.test.assertFalse(cmp.isDirty("v.listAttribute"), "Facet's List should not be dirty before any changes");

            cmp.set("v.listByReference[2][0]", "newValue");
// JBUCH: HALO: TODO: THIS TEST IS NOW INVALID. DIRTY THINGS ARE CLEANED UP TOO FAST
//            $A.test.assertTrue(cmp.isDirty("v.listByReference"), "List was not marked dirty after a direct member value change");
//            $A.test.assertTrue(cmp.find("innerCmp").isDirty("v.listAttribute"), "Facet's List not marked dirty after a direct member value change");

            $A.rerender(cmp);
            $A.test.assertFalse(cmp.isDirty("v.listByReference"), "List should not be dirty after rerender");
            $A.test.assertFalse(cmp.isDirty("v.listAttribute"), "Facet's List should not be dirty after rerender");

            var list = cmp.get("v.listByReference");
            list[2][0] = "newValue";
            cmp.set("v.listByReference", list);
// JBUCH: HALO: TODO: THIS TEST IS NOW INVALID. DIRTY THINGS ARE CLEANED UP TOO FAST
//            $A.test.assertTrue(cmp.isDirty("v.listByReference"), "List was not marked dirty after value change");
//            $A.test.assertTrue(cmp.find("innerCmp").isDirty("v.listAttribute"), "Facet's List not marked dirty after value change");

            $A.rerender(cmp);
            $A.test.assertFalse(cmp.isDirty("v.listByReference"), "List should not be dirty after rerender");
            $A.test.assertFalse(cmp.isDirty("v.listAttribute"), "Facet's List should not be dirty after rerender");
        }
    },

    // TODO: W-2406307: remaining Halo test failure
    _testIterationListInsideMap: {
        test: [function(cmp) {
            $A.test.assertEquals("FirstSecondThird", this.getTextNoWhitespaces(cmp.find("iterOutput")));
            $A.test.assertEquals("FirstSecondThird", this.getTextNoWhitespaces(cmp.find("innerCmp").find("iterOutput")));

            var list = cmp.get("v.objectWithList.listEntry");
            list[1] = "New!";
            cmp.set("v.objectWithList.listEntry", list);
        }, function(cmp){
            $A.test.assertEquals("FirstNew!Third", this.getTextNoWhitespaces(cmp.find("iterOutput")));
            $A.test.assertEquals("FirstNew!Third", this.getTextNoWhitespaces(cmp.find("innerCmp").find("iterOutput")));

            var facetList = cmp.find("innerCmp").get("v.objectAttribute.listEntry");
            facetList[1] = "Again!";
            cmp.find("innerCmp").set("v.objectAttribute.listEntry", facetList);
        }, function(cmp){
            $A.test.assertEquals("FirstAgain!Third", this.getTextNoWhitespaces(cmp.find("iterOutput")));
            $A.test.assertEquals("FirstAgain!Third", this.getTextNoWhitespaces(cmp.find("innerCmp").find("iterOutput")));

            // Shift elements to right, adding new element to 0 index and removing last element
            var list = cmp.get("v.objectWithList.listEntry");
            list.unshift("Zero");
            list.splice(list.length - 1, 1);
            cmp.set("v.objectWithList.listEntry", list);
        }, function(cmp){
            $A.test.assertEquals("ZeroFirstAgain!", this.getTextNoWhitespaces(cmp.find("iterOutput")));
            $A.test.assertEquals("ZeroFirstAgain!", this.getTextNoWhitespaces(cmp.find("innerCmp").find("iterOutput")));

            // Remove last element in list, verify output updated
            var list = cmp.get("v.objectWithList.listEntry");
            list.splice(list.length - 1, 1);
            cmp.set("v.objectWithList.listEntry", list);
        }, function(cmp){
            $A.test.assertEquals("ZeroFirst", this.getTextNoWhitespaces(cmp.find("iterOutput")));
            $A.test.assertEquals("ZeroFirst", this.getTextNoWhitespaces(cmp.find("innerCmp").find("iterOutput")));
        }]
    },

    /**
     * Dynamically create a component, passing the attributes to the new component by value and verify changing the
     * parent and child attributes do not affect each other.
     */
    testClientSideComponentCreation_byValue: {
        test: [function(cmp) {
            $A.test.clickOrTouch(cmp.find("createCmpByValueButton").getElement());
        }, function(cmp){
            var createdCmp = cmp.find("createdCmp").get("v.body.0");
            var initialList = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c'];
            var initialMap = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: "initial3"
                        }
                    }
                };
            // Verify initial values
            $A.test.assertEquals(2007, createdCmp.get("v.intAttribute"));
            this.assertListItems(initialList, createdCmp.get("v.listAttribute"));
            this.assertMapItems(initialMap, createdCmp.get("v.mapAttribute"));

            // Change parent component attribute, verify does not change client-created cmp
            cmp.set("v.intByReference", 9999);
            cmp.set("v.listByReference", ['one', 'two']);
            cmp.set("v.mapByReference", { layer1: "hi", layer1b: "bye"});
        }, function(cmp){
            var createdCmp = cmp.find("createdCmp").get("v.body.0");
            var initialList = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c'];
            var initialMap = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: "initial3"
                        }
                    }
                };
            $A.test.assertEquals(2007, createdCmp.get("v.intAttribute"));
            this.assertListItems(initialList, createdCmp.get("v.listAttribute"));
            this.assertMapItems(initialMap, createdCmp.get("v.mapAttribute"));

            // Change attribute on created component, verify does not change parent component
            createdCmp.set("v.intAttribute", 1111);
            createdCmp.set("v.listAttribute", ['three', 'four']);
            createdCmp.set("v.mapAttribute", { layer2: "roy", layer2b: "rogers" });
        }, function(cmp){
            $A.test.assertEquals(9999, cmp.get("v.intByReference"));
            this.assertListItems(['one', 'two'], cmp.get("v.listByReference"));
            this.assertMapItems({ layer1: "hi", layer1b: "bye"}, cmp.get("v.mapByReference"));
        }]
    },

    /**
     * Dynamically create a component, passing the attribute to the new component by reference and verify changing the
     * parent attribute also changes the child and vice versa.
     */
    testClientSideComponentCreation_byReference: {
        test: [function(cmp) {
            $A.test.clickOrTouch(cmp.find("createCmpByReferenceButton").getElement());
        }, function(cmp){
            var createdCmp = cmp.find("createdCmp").get("v.body.0");
            var initialList = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c'];
            var initialMap = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: "initial3"
                        }
                    }
                };
            // Verify initial values
            $A.test.assertEquals(2007, createdCmp.get("v.intAttribute"));
            this.assertListItems(initialList, createdCmp.get("v.listAttribute"));
            this.assertMapItems(initialMap, createdCmp.get("v.mapAttribute"));

            // Change parent component attribute, verify *does* change client-created cmp
            cmp.set("v.intByReference", 9999);
            cmp.set("v.listByReference", ['one', 'two']);
            cmp.set("v.mapByReference", { layer1: "hi", layer1b: "bye"});
        }, function(cmp){
            var createdCmp = cmp.find("createdCmp").get("v.body.0");
            $A.test.assertEquals(9999, createdCmp.get("v.intAttribute"));
            this.assertListItems(['one', 'two'], createdCmp.get("v.listAttribute"));
            this.assertMapItems({ layer1: "hi", layer1b: "bye"}, createdCmp.get("v.mapAttribute"));

            // Change attribute on created component, verify *does* change parent component
            createdCmp.set("v.intAttribute", 1111);
            createdCmp.set("v.listAttribute", ['three', 'four']);
            createdCmp.set("v.mapAttribute", { layer2: "roy", layer2b: "rogers" });
        }, function(cmp){
            $A.test.assertEquals(1111, cmp.get("v.intByReference"));
            this.assertListItems(['three', 'four'], cmp.get("v.listByReference"));
            this.assertMapItems({ layer2: "roy", layer2b: "rogers" }, cmp.get("v.mapByReference"));
        }]
    },

    assertMapItems: function(expected, actual) {
        if (this.keyCount(expected) !== this.keyCount(actual)) {
            $A.test.fail("Maps do not contain same key count. Expected '" + expected + "', but received: '" + actual + "'");
        }

        for (var key in expected) {
            if (!actual.hasOwnProperty(key)) {
                $A.test.fail("Map did not have expected key '" + key + "'");
            }
            if (expected[key] instanceof Array) {
                this.assertListItems(expected[key], actual[key]);
            } else if (expected[key] instanceof Object) {
                this.assertMapItems(expected[key], actual[key]);
            } else if (expected[key] !== actual[key]) {
                $A.test.fail("Unexpect map value for key '" + key + "'. Expected '" + expected[key] + "' but got '" + actual[key] + "'");
            }
        }
    },

    keyCount: function(map) {
        var count = 0;
        for (key in map) {
            if (map.hasOwnProperty(key)) {
                count++;
            }
        }
        return count;
    },

    assertListItems: function(expected, actual) {
        if (expected.length !== actual.length) {
            $A.test.fail("Did not receive expected list. Expected length '" + expected.length + "', but found length '" + actual.length + "'");
        }

        for (var i = 0; i < expected.length; i++) {
            if (expected[i] && expected[i] instanceof Array) {
                this.assertListItems(expected[i], actual[i]);
            } else if (expected[i] !== actual[i]) {
                $A.test.fail("Did not receive expected list. Expected '" + expected[i] + "', but found '" + actual[i] + "'");
            }
        }
    },

    /**
     * Convenience method to get text of a component. Strip out all whitespce for browser compatability.
     */
    getTextNoWhitespaces: function(cmp) {
        return $A.test.getText(cmp.getElement()).replace(/\s/g, "");
    },
})
