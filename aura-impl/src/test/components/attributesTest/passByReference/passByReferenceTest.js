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
    testPassingIntToFacet: {
        test: function(cmp) {
            $A.test.assertEquals(2007, cmp.get("v.intByReference"));
            $A.test.assertEquals(2007, cmp.find("innerCmp").get("v.intAttribute"));
            $A.test.assertEquals("2007", $A.test.getText(cmp.find("intOutput").getElement()));
            $A.test.assertEquals("2007", $A.test.getText(cmp.find("innerCmp").find("intOutput").getElement()));

            $A.test.clickOrTouch(cmp.find("changeIntOuterButton").getElement());
            $A.test.assertEquals(9999, cmp.get("v.intByReference"));
            $A.test.assertEquals(9999, cmp.find("innerCmp").get("v.intAttribute"));
            $A.test.assertEquals("9999", $A.test.getText(cmp.find("intOutput").getElement()));
            $A.test.assertEquals("9999", $A.test.getText(cmp.find("innerCmp").find("intOutput").getElement()));

            $A.test.clickOrTouch(cmp.find("changeIntFacetButton").getElement());
            $A.test.assertEquals(5565, cmp.get("v.intByReference"));
            $A.test.assertEquals(5565, cmp.find("innerCmp").get("v.intAttribute"));
            $A.test.assertEquals("5565", $A.test.getText(cmp.find("intOutput").getElement()));
            $A.test.assertEquals("5565", $A.test.getText(cmp.find("innerCmp").find("intOutput").getElement()));
        }
    },

    verifyInitialList: function(cmp) {
        var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c'];
        this.assertListItems(expected, cmp.get("v.listByReference"));
        this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
        $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nlevel2b\nlevel1c",
                $A.test.getText(cmp.find("listOutput").getElement()));
        $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nlevel2b\nlevel1c",
                $A.test.getText(cmp.find("innerCmp").find("listOutput").getElement()));
    },
    
    testPassingListToFacet_ModifyOuter: {
        test: function(cmp) {
            this.verifyInitialList(cmp);

            // Modify list on outer component, verify facet list has also changed
            var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'changedOuter2b'], 'level1c'];
            $A.test.clickOrTouch(cmp.find("changeListOuterButton").getElement());
            this.assertListItems(expected, cmp.get("v.listByReference"));
            this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nchangedOuter2b\nlevel1c",
                    $A.test.getText(cmp.find("listOutput").getElement()));
            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nchangedOuter2b\nlevel1c",
                    $A.test.getText(cmp.find("innerCmp").find("listOutput").getElement()));
        }
    },

    testPassingListToFacet_ModifyFacet: {
        test: function(cmp) {
            this.verifyInitialList(cmp);
            
            // Modify list on facet, verify outer cmp list has also changed
            var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'changedFacet2b'], 'level1c'];
            $A.test.clickOrTouch(cmp.find("changeListFacetButton").getElement());
            this.assertListItems(expected, cmp.get("v.listByReference")); 
            this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nchangedFacet2b\nlevel1c",
                    $A.test.getText(cmp.find("listOutput").getElement()));
            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nchangedFacet2b\nlevel1c",
                    $A.test.getText(cmp.find("innerCmp").find("listOutput").getElement()));
        }
    },

    testPassingListToFacet_AppendOuter: {
        test: function(cmp) {
            this.verifyInitialList(cmp);

            // Modify list on outer component, verify facet list has also changed
            var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c', 'addedOuter1d'];
            $A.test.clickOrTouch(cmp.find("appendListOuterButton").getElement());
            this.assertListItems(expected, cmp.get("v.listByReference"));
            this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nlevel2b\nlevel1c\naddedOuter1d",
                    $A.test.getText(cmp.find("listOutput").getElement()));
            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nlevel2b\nlevel1c\naddedOuter1d",
                    $A.test.getText(cmp.find("innerCmp").find("listOutput").getElement()));
        }
    },

    testPassingListToFacet_AppendFacet: {
        test: function(cmp) {
            this.verifyInitialList(cmp);

            // Modify list on outer component, verify facet list has also changed
            var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c', 'addedFacet1d'];
            $A.test.clickOrTouch(cmp.find("appendListFacetButton").getElement());
            this.assertListItems(expected, cmp.get("v.listByReference"));
            this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nlevel2b\nlevel1c\naddedFacet1d",
                    $A.test.getText(cmp.find("listOutput").getElement()));
            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nlevel2b\nlevel1c\naddedFacet1d",
                    $A.test.getText(cmp.find("innerCmp").find("listOutput").getElement()));
        }
    },
    
    // TODO(W-2338909): removing an item does not mark dirty/rerender properly
    _testPassingListToFacet_DeleteItemOuter: {
        test: function(cmp) {
            this.verifyInitialList(cmp);

            // Modify list on outer component, verify facet list has also changed
            var expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b']];
            $A.test.clickOrTouch(cmp.find("removeListOuterButton").getElement());
            this.assertListItems(expected, cmp.get("v.listByReference"));
            this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nlevel2b",
                    $A.test.getText(cmp.find("listOutput").getElement()));
            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nlevel2b",
                    $A.test.getText(cmp.find("innerCmp").find("listOutput").getElement()));
        }
    },
    
    // TODO(W-2338909): removing an item does not mark dirty/rerender properly
    _testPassingListToFacet_DeleteItemFacet: {
        test: function(cmp) {
            this.verifyInitialList(cmp);

            // Modify list on outer component, verify facet list has also changed
            expected = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b']];
            $A.test.clickOrTouch(cmp.find("removeListFacetButton").getElement());
            this.assertListItems(expected, cmp.get("v.listByReference"));
            this.assertListItems(expected, cmp.find("innerCmp").get("v.listAttribute"));
            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nlevel2b",
                    $A.test.getText(cmp.find("listOutput").getElement()));
            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nlevel2b",
                    $A.test.getText(cmp.find("innerCmp").find("listOutput").getElement()));
        }
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
        $A.test.assertEquals("initial1\ninitial2\n\initial3",
                $A.test.getText(cmp.find("mapOutput").getElement()));
        $A.test.assertEquals("initial1\ninitial2\n\initial3",
                $A.test.getText(cmp.find("innerCmp").find("mapOutput").getElement()));
    },

    testPassingMapToFacet_ModifyOuter: {
        test: function(cmp) {
            this.verifyInitialMap(cmp);

            var expected = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: "changedOuter3"
                        }
                    }
                };
            $A.test.clickOrTouch(cmp.find("changeMapOuterButton").getElement());
            this.assertMapItems(expected, cmp.get("v.mapByReference"));
            this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));
            $A.test.assertEquals("initial1\ninitial2\nchangedOuter3",
                    $A.test.getText(cmp.find("mapOutput").getElement()));
            $A.test.assertEquals("initial1\ninitial2\nchangedOuter3",
                    $A.test.getText(cmp.find("innerCmp").find("mapOutput").getElement()));
        }
    },

    testPassingMapToFacet_ModifyFacet: {
        test: function(cmp) {
            this.verifyInitialMap(cmp);

            var expected = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: "changedFacet3"
                        }
                    }
                };
            $A.test.clickOrTouch(cmp.find("changeMapFacetButton").getElement());
            this.assertMapItems(expected, cmp.get("v.mapByReference"));
            this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));
            $A.test.assertEquals("initial1\ninitial2\nchangedFacet3",
                    $A.test.getText(cmp.find("mapOutput").getElement()));
            $A.test.assertEquals("initial1\ninitial2\nchangedFacet3",
                    $A.test.getText(cmp.find("innerCmp").find("mapOutput").getElement()));
        }
    },
    
    testPassingMapToFacet_AppendOuter: {
        test: function(cmp) {
            this.verifyInitialMap(cmp);

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
            $A.test.clickOrTouch(cmp.find("appendMapOuterButton").getElement());
            this.assertMapItems(expected, cmp.get("v.mapByReference"));
            this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));
            $A.test.assertEquals("initial1\ninitial2\n\initial3\naddedOuter3\naddedOuter4",
                    $A.test.getText(cmp.find("mapOutput").getElement()));
            $A.test.assertEquals("initial1\ninitial2\n\initial3\naddedOuter3\naddedOuter4",
                    $A.test.getText(cmp.find("innerCmp").find("mapOutput").getElement()));
        }
    },
    
    testPassingMapToFacet_AppendFacet: {
        test: function(cmp) {
            this.verifyInitialMap(cmp);

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
            $A.test.clickOrTouch(cmp.find("appendMapFacetButton").getElement());
            this.assertMapItems(expected, cmp.get("v.mapByReference"));
            this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));
            $A.test.assertEquals("initial1\ninitial2\n\initial3\naddedFacet3\naddedFacet4",
                    $A.test.getText(cmp.find("mapOutput").getElement()));
            $A.test.assertEquals("initial1\ninitial2\n\initial3\naddedFacet3\naddedFacet4",
                    $A.test.getText(cmp.find("innerCmp").find("mapOutput").getElement()));
        }
    },

    // TODO(W-2338909): removing an item does not mark dirty/rerender properly
    _testPassingMapToFacet_DeleteItemOuter: {
        test: function(cmp) {
            this.verifyInitialMap(cmp);

            var expected = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                        }
                    }
                };
            $A.test.clickOrTouch(cmp.find("removeMapOuterButton").getElement());
            
            this.assertMapItems(expected, cmp.get("v.mapByReference"));
            this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));
            
            $A.test.assertEquals("initial1\ninitial2",
                    $A.test.getText(cmp.find("mapOutput").getElement()));
            $A.test.assertEquals("initial1\ninitial2",
                    $A.test.getText(cmp.find("innerCmp").find("mapOutput").getElement()));
        }
    },
    
    // TODO(W-2338909): removing an item does not mark dirty/rerender properly
    _testPassingMapToFacet_DeleteItemFacet: {
        test: function(cmp) {
            this.verifyInitialMap(cmp);

            var expected = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: "initial3"
                        }
                    }
                };
            $A.test.clickOrTouch(cmp.find("appendMapFacetButton").getElement());
            $A.test.clickOrTouch(cmp.find("removeMapFacetButton").getElement());
            
            this.assertMapItems(expected, cmp.get("v.mapByReference"));
            this.assertMapItems(expected, cmp.find("innerCmp").get("v.mapAttribute"));
            
            $A.test.assertEquals("initial1\ninitial2\ninitial3",
                    $A.test.getText(cmp.find("mapOutput").getElement()));
            $A.test.assertEquals("initial1\ninitial2\ninitial3",
                    $A.test.getText(cmp.find("innerCmp").find("mapOutput").getElement()));
        }
    },
    
    testFacetDestroy: {
        test: function(cmp) {
            var expectedList = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c'];
            var expectedMap = {
                    layer1: "initial1",
                    oneDeeper: {
                        layer2: "initial2",
                        evenOneDeeper: {
                            layer3: "initial3"
                        }
                    }
                };

            this.assertListItems(expectedList, cmp.get("v.listByReference"));
            this.assertMapItems(expectedMap, cmp.get("v.mapByReference"));

            cmp.find("innerCmp").destroy(false);
            $A.test.assertUndefined(cmp.find("innerCmp"));

            this.assertListItems(expectedList, cmp.get("v.listByReference"));
            this.assertMapItems(expectedMap, cmp.get("v.mapByReference"));

            $A.test.assertEquals("level1a\nlevel1b\nlevel2a\nlevel3a\nlevel2b\nlevel1c",
                    $A.test.getText(cmp.find("listOutput").getElement()));
            $A.test.assertEquals("initial1\ninitial2\ninitial3",
                    $A.test.getText(cmp.find("mapOutput").getElement()));
        }
    },

    testNestedMapValuesMarkedDirty: {
        test: function(cmp) {
            $A.test.assertFalse(cmp.isDirty("v.mapByReference"), "Map should not be dirty before any changes");
            $A.test.assertFalse(cmp.isDirty("v.mapAttribute"), "Facet's Map should not be dirty before any changes");

            var map = cmp.get("v.mapByReference");
            map.oneDeeper.layer2 = "newValue";
            cmp.set("v.mapByReference", map);
            $A.test.assertTrue(cmp.isDirty("v.mapByReference"), "Map was not marked dirty after value change");
            $A.test.assertTrue(cmp.find("innerCmp").isDirty("v.mapAttribute"), "Facet's Map not marked dirty after value change");

            $A.rerender(cmp);
            $A.test.assertFalse(cmp.isDirty("v.mapByReference"), "Map should not be dirty after rerender");
            $A.test.assertFalse(cmp.isDirty("v.mapAttribute"), "Facet's Map should not be dirty after rerender");
        }
    },

    testNestedListValuesMarkedDirty: {
        test: function(cmp) {
            $A.test.assertFalse(cmp.isDirty("v.listByReference"), "List should not be dirty before any changes");
            $A.test.assertFalse(cmp.isDirty("v.listAttribute"), "Facet's List should not be dirty before any changes");

            var list = cmp.get("v.listByReference");
            list[2][0] = "newValue";
            cmp.set("v.listByReference", list);
            $A.test.assertTrue(cmp.isDirty("v.listByReference"), "List was not marked dirty after value change");
            $A.test.assertTrue(cmp.find("innerCmp").isDirty("v.listAttribute"), "Facet's List not marked dirty after value change");

            $A.rerender(cmp);
            $A.test.assertFalse(cmp.isDirty("v.listByReference"), "List should not be dirty after rerender");
            $A.test.assertFalse(cmp.isDirty("v.listAttribute"), "Facet's List should not be dirty after rerender");
        }
    },
    
    // TODO(W-2338914): Cannot iterate over a list within a map attribute
//    _testIterationListInsideMapOnFacet: {
//        test: function(cmp) {
//        }
//    },

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
            $A.test.fail("Did not receive expected list. Expected '" + expected[i] + "', but received '" + actual[i] + "'");
        }

        for (var i = 0; i < expected.length; i++) {
            if (expected[i] instanceof Array) {
                this.assertListItems(expected[i], actual[i]);
            } else if ($A.util.isUndefinedOrNull(actual[i]) || expected[i] !== actual[i]) {
                $A.test.fail("Did not receive expected list. Expected '" + expected[i] + "', but received '" + actual[i] + "'");
            }
        }
    }
})
