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
     * Test that a list with generated columns generates the correct number of column headers
     */
    testColumnsPresentListWithGeneratedColumns: {
        test: function(app){
            var component = app.find("test-list-generated-columns");
            var expected = this.getMapSize(component.get("v.items")[0]);
            var actual = this.getHeaderRowComponentAt(component, 0).get("v.body").length;

            $A.test.assertEquals(expected, actual,
                    "List did not contain expected number of columns");
        }
    },

    /**
     * Test that an empty list with specified columns generates the correct number of column headers
     */
    testColumnsPresentEmptyListWithSpecifiedColumns: {
        test: function(app) {
            var component = app.find("test-empty-list-specified-columns");
            var expected = component.get("v.body").length;
            var actual = this.getHeaderRowComponentAt(component, 0).get("v.body").length;
            $A.test.assertEquals(expected, actual,
                    "Empty List did not contain expected number of columns");
        }
    },

    /**
     * Test that a list with specified columns generates the correct number of column headers
     */
    testColumnsPresentListWithSpecifiedColumns: {
        test:function(app) {
            var component = app.find("test-list-specified-columns");
            var expected = component.get("v.body").length;
            var actual = this.getHeaderRowComponentAt(component, 0).get("v.body").length;
            $A.test.assertEquals(expected, actual,
                    "Non-empty List did not contain expected number of columns");
        }
    },

    /**
     * Test that a list with generated columns generates the correct column header titles
     */
    testColumnAttributesListWithGeneratedColumns: {
        test: function(app){

            var component = app.find("test-list-generated-columns");

            // Generate expected, whose fieldName + title attrs will be the keys from the first row in items
            var expectedColumnTitles = [];
            var expectedColumnFieldNames = [];
            var expectedColumnTypes = [];
            var firstRowInItems = component.get("v.items")[0];
            for (var key in firstRowInItems) {
                if (firstRowInItems.hasOwnProperty(key)) {
                    expectedColumnTitles.push(key);
                    expectedColumnFieldNames.push(key);
                    expectedColumnTypes.push(undefined);
                }
            }
            // Need to sort these, since iterating over a map does not guarantee any ordering
            expectedColumnTitles.sort();
            expectedColumnFieldNames.sort();
            expectedColumnTypes.sort();

            var actualColumnComponents = this.getHeaderRowComponentAt(component, 0).get("v.body");
            var actualColumnTitles = [];
            var actualColumnFieldNames = [];
            var actualColumnTypes = [];
            for (var i = 0; i < actualColumnComponents.length; ++i) {
                actualColumnTitles[i] = actualColumnComponents[i].get("v.title");
                actualColumnFieldNames[i] = actualColumnComponents[i].get("v.fieldName");
                actualColumnTypes[i] = actualColumnComponents[i].get("v.type");
            }

            // Need to sort these, since the actual order columns appear in is not deterministic
            actualColumnTitles.sort();
            actualColumnFieldNames.sort();
            actualColumnTypes.sort();

            $A.test.assertEquals(expectedColumnTitles.length, actualColumnTitles.length,
                    "Expected number of column titles should match actual number.");

            for (var i = 0; i < expectedColumnTitles.length; ++i) {
                $A.test.assertEquals(expectedColumnTitles[i], actualColumnTitles[i],
                        "Expected column title did not match actual");
                $A.test.assertEquals(expectedColumnFieldNames[i], actualColumnFieldNames[i],
                        "Expected column fieldName did not match actual");
                $A.test.assertEquals(expectedColumnFieldNames[i], actualColumnFieldNames[i],
                        "Expected column type did not match actual");
            }
        }
    },

    /**
     * Test that a list with specified columns generates the correct column header titles
     */
    testColumnAttributesListWithSpecifiedColumns: {
        test: function(app){
            var component = app.find("test-list-specified-columns");

            // Find expected column titles, which are the title attribute from each column component
            var expectedColumnTitles = [];
            var expectedColumnFieldNames = [];
            var expectedColumnTypes = [];

            var columnComponents = component.get("v.body");
            for (var i = 0; i < columnComponents.length; ++i) {
                expectedColumnTypes[i] = columnComponents[i].get("v.type");
                expectedColumnTitles[i] = columnComponents[i].get("v.title");
                expectedColumnFieldNames[i] = columnComponents[i].get("v.fieldName");
            }

            $A.test.assertEquals(expectedColumnTitles.length, this.getHeaderRowComponentAt(component, 0).get("v.body").length,
                    "Expected number of columns did not match actual");

            // Compare expected column attributes against actual column attributes
            for (var i = 0; i < expectedColumnTitles.length; ++i) {
                $A.test.assertEquals(expectedColumnTypes[i], this.getHeaderCellComponentAt(component, 0, i).get("v.type"),
                        "Expected column type did not match actual.");
                $A.test.assertEquals(expectedColumnTitles[i], this.getHeaderCellComponentAt(component, 0, i).get("v.title"),
                        "Expected column title did not match actual.");
                $A.test.assertEquals(expectedColumnFieldNames[i],  this.getHeaderCellComponentAt(component, 0, i).get("v.fieldName"),
                        "Expected column title did not match actual.");
            }
        }
    },

    /**
     * Tests that a column's title attribute is used to set the column header's body attribute
     */
    testColumnTitleIsBodyOfColumnComponentBody: {
        test: function(app) {

            var component = app.find("test-list-specified-columns");
            var expected = component.get("v.body")[0].get("v.title");
            var actual = this.getHeaderCellComponentAt(component, 0, 0).get("v.body");

            $A.test.assertEquals(expected, actual,
                    "Column title is not set as the value of the column component's body attribute");
        }
    },

    /**
     * Tests that defining a column component with an unknown column type will result in an exception
     */
    testUnknownColumnTypeThrowsException: {
        test: function(component){
            var expected = "Text";
            try {
                var attributes =
                    {
                        type:"notarealcolumntype",
                        title:"Column",
                        fieldName: "column"
                    }
                var column = $A.componentService.newComponent({
                    "componentDef": "markup://ui:column",
                    "attributes": {
                        "values": attributes
                    }
                });
                $A.test.fail("Exception should have been thrown");
            }
            catch(e) {
                $A.test.assertTrue(e.toString().indexOf("Unknown type attribute specified") > -1,
                        "Expected exception was not thrown for an invalid column type");
            }
        }
    },

    /**
     * Test that a list with generated columns builds rows
     */
    testListBuildsRowsForGeneratedColumns: {
        test: function(app){
            var component = app.find("test-list-generated-columns");
            var expected = component.get("v.items").length;
            var actual = this.getTableBodyRowComponents(component).length;

            $A.test.assertEquals(expected, actual,
                    "Expected number of rows did not match actual.");
        }
    },

    /**
     * Test that a list with specified columns builds rows
     */
    testListBuildsRowsForSpecifiedColumns: {
        test: function(app){
            var component = app.find("test-list-specified-columns");
            var expected = component.get("v.items").length;
            var actual = this.getTableBodyRowComponents(component).length;

            $A.test.assertEquals(expected, actual,
                    "Expected number of rows did not match actual.");
        }
    },

    /**
     * Test that a list still builds rows when its list data does not map to any specified columns.
     */
    testListBuildsRowsWhenDataDoesntMapToSpecifiedColumns: {
        test:function(app) {
            var component = app.find("test-list-data-does-not-map-to-specified-columns");
            var expected = component.get("v.items").length;
            var actual = this.getTableBodyRowComponents(component).length;

            $A.test.assertEquals(expected, actual,
                    "Expected number of rows did not match actual.");
        }
    },

    /**
     * Test that a list with generated columns builds the fields in each row using list data set in the
     * items attribute.
     */
    testListBuildsFieldsInRowsFromGeneratedColumns: {
        test: function(app){
            var component = app.find("test-list-generated-columns");
            var items = component.get("v.items");

            for (var i = 0; i < items.length; ++i) {
                var expectedNumFieldsInRow = this.getMapSize(items[i]);
                var actualNumFieldsInRow = this.getTableBodyRowComponentAt(component, i).get("v.body").length;

                $A.test.assertEquals(expectedNumFieldsInRow, actualNumFieldsInRow,
                        "Expected number of fields in row did not match actual");

                for (var j = 0; j < expectedNumFieldsInRow; ++j) {
                    var headerCellTitle = this.getHeaderCellComponentAt(component, 0, j).get("v.body");
                    var expected = items[i][headerCellTitle];
                    var actual = this.getTableBodyCellComponentAt(component, i, j).get("v.body");
                    $A.test.assertEquals(expected, actual,
                            "Expected cell value did not match actual cell value");
                }
            }
        }
    },

    /**
     * Test that a list with specified columns builds the fields in each row using list data set in the
     * items attribute.
     */
    testListBuildsFieldsInRowsForSpecifiedColumns: {
        test: function(app){
            var component = app.find("test-list-specified-columns");
            var items = component.get("v.items");
            var columns = component.get("v.body");

            for (var i = 0; i < items.length; ++i) {
                var actualNumFieldsInRow = this.getTableBodyRowComponentAt(component, i).get("v.body").length;
                $A.test.assertEquals(columns.length, actualNumFieldsInRow,
                        "Expected number of fields in row did not match actual");

                for (var j = 0; j < columns.length; ++j) {
                    var expected, actual;
                    switch(columns[j].get("v.type")) {
                        case "Index":
                            expected = (i + 1) + "";
                            var actual = $A.test.getText(
                                    this.getTableBodyCellComponentAt(component, i, j).getElement());
                            break;
                        case "Checkbox":
                            expected = false;
                            var actual = this.getTableBodyCellComponentAt(component, i, j).getElement().getElementsByTagName('input')[0].checked;
                            break;
                        default:
                            expected = items[i][columns[j].get("v.fieldName")];
                            actual = this.getTableBodyCellComponentAt(component, i, j).get("v.body");
                    }
                    $A.test.assertEquals(expected, actual,
                            "Expected cell value did not match actual cell value");
                }
            }
        }
    },

    /**
     * Test that fields are populated correctly in a list whose data does not fully match specified columns
     */
    testListBuildsFieldsInRowsForPartiallyMatchingSpecifiedColumns: {
        test: function(app){
            var component = app.find("test-list-data-partially-maps-to-specified-columns");
            var items = component.get("v.items");
            var columns = component.get("v.body");

            for (var i = 0; i < items.length; ++i) {
                var actualNumFieldsInRow = this.getTableBodyRowComponentAt(component, i).get("v.body").length;
                $A.test.assertEquals(columns.length, actualNumFieldsInRow,
                        "Expected number of fields in row did not match actual");

                for (var j = 0; j < columns.length; ++j) {
                    var expected;
                    var actual;
                    if (items[i][columns[j].get("v.fieldName")]) {
                        expected = items[i][columns[j].get("v.fieldName")];
                        actual = this.getTableBodyCellComponentAt(component, i, j).get("v.body");
                    }
                    else {
                        expected = '';
                        actual = ($A.test.getText(this.getTableBodyCellComponentAt(component, i, j).getElement()));
                    }

                    $A.test.assertEquals(expected, actual,
                            "Expected cell value did not match actual cell value");
                }
            }
        }
    },

    /**
     * Tests that a list with nested columns builds columns and titles correctly
     */
    testListBuildsColumnsWithTitlesListWithNestedColumns: {
        test : function(app) {

            var component = app.find("test-list-nested-columns");

            var firstRowColumnTitles = ["First Row 0", "First Row 1, Leaf 4"];
            var secondRowColumnTitles = ["Second Row 0", "Second Row 1", "Second Row 2, Leaf 3"];
            var thirdRowColumnTitles = ["Third Row 0, Leaf 0", "Third Row 1, Leaf 1", "Third Row 2, Leaf 2"];

            // Check first row
            var firstHeaderRowComponent = this.getHeaderRowComponentAt(component, 0);
            $A.test.assertEquals(firstRowColumnTitles.length, firstHeaderRowComponent.get("v.body").length,
                    "Expected number of first row columns did not match actual");
            for (var i = 0; i < firstRowColumnTitles.length; ++i) {
                var actualColumnTitle = this.getHeaderCellComponentAt(component, 0, i).get("v.title");
                $A.test.assertEquals(firstRowColumnTitles[i], actualColumnTitle);
            }

            // Check second row
            var secondHeaderRowComponent = this.getHeaderRowComponentAt(component, 1);
            $A.test.assertEquals(secondRowColumnTitles.length, secondHeaderRowComponent.get("v.body").length,
                    "Expected number of first row columns did not match actual");
            for (var i = 0; i < secondRowColumnTitles.length; ++i) {
                var actualColumnTitle = this.getHeaderCellComponentAt(component, 1, i).get("v.title");
                $A.test.assertEquals(secondRowColumnTitles[i], actualColumnTitle);
            }

            // Check third row
            var thirdHeaderRowComponent = this.getHeaderRowComponentAt(component, 2);
            $A.test.assertEquals(thirdRowColumnTitles.length, thirdHeaderRowComponent.get("v.body").length,
                    "Expected number of first row columns did not match actual");
            for (var i = 0; i < thirdRowColumnTitles.length; ++i) {
                var actualColumnTitle = this.getHeaderCellComponentAt(component, 2, i).get("v.title");
                $A.test.assertEquals(thirdRowColumnTitles[i], actualColumnTitle);
            }
        }
    },

    /**
     * Test that a list with nested columns builds fields for leaf-node columns
     */
    testListBuildsCorrectFieldsListWithNestedColumns : {
        test : function(app) {
            var component = app.find("test-list-nested-columns");
            var items = component.get("v.items");
            var leafNodeColumns = this.getLeafNodeColumns(component);

            // Look at each field in list and verify that it was mapped from a fieldName
            for (var i = 0; i < items.length; ++i) {
                for (var j = 0; j < leafNodeColumns.length; ++j) {
                    var columnFieldName = leafNodeColumns[j].get("v.fieldName");
                    var expected = items[i][columnFieldName];
                    var actual = this.getTableBodyCellComponentAt(component,i, j).get("v.body");
                    $A.test.assertEquals(expected, actual,
                            "Expected table cell contents did not match actual.");
                }
            }
        }
    },

    /**
     * Test that a list with nested columns where the data maps from non-leaf-node columns contains only empty fields.
     */
    testListDoesNotBuildFieldsMappingFromNonLeafNodeColumns : {
        test : function(app) {
            var component = app.find("test-list-nested-columns-fields-map-from-non-leaf-columns");
            var items = component.get("v.items");

            var expected = '';

            // Look at each field in list and verify that each is an empty string
            for (var i = 0; i < items.length; ++i) {
                var numCols = this.getTableBodyRowComponentAt(component, i).get("v.body").length;
                for (var j = 0; j < numCols; ++j) {
                    actual = ($A.test.getText(this.getTableBodyCellComponentAt(component, i, j).getElement()));
                    $A.test.assertEquals(expected, actual,
                            "Expected table cell contents did not match actual.");
                }
            }
        }
    },

    /**
     * Test that correct number of aura events given a dom event fired from a table element
     */
    testFireEventsSourceNumber: {
        test:function(app) {

            var component = app.find("test-list-generated-columns");

            var expected = 3;
            var actual = 0;

            var helper = component.getDef().getHelper();

            // Mock fireEvent to do something we can use to test logic in fireEvents (its caller)
            $A.test.overrideFunction(helper, helper.fireEvent,
                function (component, target, eventType, listViewEventType, rawEvent, data) {
                    ++actual;
                });

            var cell = this.getTableBodyCellComponentAt(component, 0, 0);
            var listbody = component.find("listView:body");
            var mockDomEvent = { target:cell.getElement() };

            helper.fireEvents(component, "click", mockDomEvent);

            $A.test.assertEquals(expected, actual,
                    "Expected number of fired events did not match actual.");
        }
    },

    /**
     * Test that the correct listview events are fired in the correct order after a dom event is fired from each header
     * cell in a list
     */
    testFireEventsSourceComponentsHeaderCells: {
        test:function(app) {
            var component = app.find("test-list-generated-columns");

            var headerRowComponent = this.getHeaderRowComponentAt(component, 0);
            var numCols = headerRowComponent.get("v.body").length;
            for (var i = 0; i < numCols; ++i) {
                var expectedComponents = [];
                var targetCell = this.getHeaderCellComponentAt(component, 0, i);
                expectedComponents.push(targetCell)
                expectedComponents.push(headerRowComponent);
                expectedComponents.push(component.find("listView:header"));
                var mockDomEvent = { target:targetCell.getElement() };
                this.verifyListViewEventSourceComponents(component, expectedComponents, mockDomEvent,
                        $A.test.assertEquals, "Expected event source component did not match actual");
            }
        }
    },

    /**
     * Test that the correct listview events are fired in the correct order after dom event firing is simulated from
     * each table body cell in a list
     */
    testFireEventsSourceComponentsBodyCells: {
        test:function(app) {
            var component = app.find("test-list-generated-columns");
            var numRows = this.getTableBodyRowComponents(component).length;
            var numCols = this.getTableBodyRowComponentAt(component, 0).get("v.body").length;

            for (var i = 0; i < numRows; ++i) {
                var expectedRow = this.getTableBodyRowComponentAt(component, i);
                for (var j = 0; j < numCols; ++j) {
                    var expectedComponents = [];
                    var targetCell = this.getTableBodyCellComponentAt(component, i, j);
                    expectedComponents.push(targetCell);
                    expectedComponents.push(expectedRow);
                    expectedComponents.push(component.find("listView:body"));

                    var mockDomEvent = { target:targetCell.getElement() };
                    this.verifyListViewEventSourceComponents(component, expectedComponents, mockDomEvent,
                            $A.test.assertEquals, "Expected event source component did not match actual");
                }
            }
        }
    },

    /**
     * Test that simulating a DOM-level click event on the table results in a call to helper-fireEvents()
     */
    testClickEventFired: {
        test: function(app) {
            this.verifyDomEventFiresListViewEvents(app.find("test-list-generated-columns"), "click", $A.test.assertTrue,
                    "DOM event firing did not result in call to helper->fireEvents");
        }
    },

    /**
     * Test that simulating a DOM-level double click event on the table results in a call to helper-fireEvents()
     */
    testDoubleClickEventFired: {
        test: function(app) {
            this.verifyDomEventFiresListViewEvents(app.find("test-list-generated-columns"), "dblclick", $A.test.assertTrue,
                    "DOM event firing did not result in call to helper->fireEvents");
        }
    },

    /**
     * Test that simulating a DOM-level mousedown event on the table results in a call to helper-fireEvents()
     */
    testMouseDownEventFired: {
        test: function(app) {
            this.verifyDomEventFiresListViewEvents(app.find("test-list-generated-columns"), "mousedown", $A.test.assertTrue,
                    "DOM event firing did not result in call to helper->fireEvents");
        }
    },

    /**
     * Test that simulating a DOM-level mouseup event on the table results in a call to helper-fireEvents()
     */
    testMouseUpEventFired: {
        test: function(app) {
            this.verifyDomEventFiresListViewEvents(app.find("test-list-generated-columns"), "mouseup", $A.test.assertTrue,
                    "DOM event firing did not result in call to helper->fireEvents");
        }
    },

    /**
     * Test that simulating a DOM-level mouseover event on the table results in a call to helper-fireEvents()
     */
    testMouseOverEventFired: {
        test: function(app) {
            this.verifyDomEventFiresListViewEvents(app.find("test-list-generated-columns"), "mouseover", $A.test.assertTrue,
                    "DOM event firing did not result in call to helper->fireEvents");
        }
    },

    /**
     * Test that simulating a DOM-level mouseout event on the table results in a call to helper-fireEvents()
     */
    testMouseOutEventFired: {
        test: function(app) {
            this.verifyDomEventFiresListViewEvents(app.find("test-list-generated-columns"), "mouseout", $A.test.assertTrue,
                    "DOM event firing did not result in call to helper->fireEvents");
        }
    },

    /**
     * Test that simulating a DOM-level keydown event on the table results in a call to helper-fireEvents()
     */
    testKeyDownEventFired: {
        test: function(app) {
            this.verifyDomEventFiresListViewEvents(app.find("test-list-generated-columns"), "keydown", $A.test.assertTrue,
                    "DOM event firing did not result in call to helper->fireEvents");
        }
    },

    /**
     * Test that simulating a DOM-level keyup event on the table results in a call to helper-fireEvents()
     */
    testKeyUpEventFired: {
        test: function(app) {
            this.verifyDomEventFiresListViewEvents(app.find("test-list-generated-columns"), "keyup", $A.test.assertTrue,
                    "DOM event firing did not result in call to helper->fireEvents");
        }
    },

    /**
     * Test that simulating a DOM-level keypress event on the table results in a call to helper-fireEvents()
     */
    testKeyPressEventFired: {
        test: function(app) {
            this.verifyDomEventFiresListViewEvents(app.find("test-list-generated-columns"), "keypress", $A.test.assertTrue,
                    "DOM event firing did not result in call to helper->fireEvents");
        }
    },

    /**
     * Test that simulating a DOM-level touchstart event on the table results in a call to helper-fireEvents()
     */
    testTouchStartEventFired: {
        test: function(app) {
            this.verifyDomEventFiresListViewEvents(app.find("test-list-generated-columns"), "touchstart", $A.test.assertTrue,
                    "DOM event firing did not result in call to helper->fireEvents");
        }
    },

    /**
     * Test that simulating a DOM-level touchend event on the table results in a call to helper-fireEvents()
     */
    testTouchEndEventFired: {
        test: function(app) {
            this.verifyDomEventFiresListViewEvents(app.find("test-list-generated-columns"), "touchend", $A.test.assertTrue,
                    "DOM event firing did not result in call to helper->fireEvents");
        }
    },

    /**
     * Test that simulating a DOM-level touchmove event on the table results in a call to helper-fireEvents()
     */
    testTouchMoveEventFired: {
        test: function(app) {
            this.verifyDomEventFiresListViewEvents(app.find("test-list-generated-columns"), "touchmove", $A.test.assertTrue,
                    "DOM event firing did not result in call to helper->fireEvents");
        }
    },

    /**
     * Verifier method for tests that validate DOM-level triggering a call to helper-fireEvents()
     */
    verifyDomEventFiresListViewEvents: function(component, eventName, truthVerifier, failureMessage) {
        var helper = component.getDef().getHelper();
        var fireEventsCalled = false;

        $A.test.overrideFunction(helper, helper.fireEvents,
                function (component, target, eventType, listViewEventType, rawEvent, data) {
                    fireEventsCalled = true;
                });

        var element = this.getTableBodyCellComponentAt(component, 0, 0).getElement();
        this.fireDomEvent(element, eventName);

        truthVerifier(fireEventsCalled, failureMessage + ": " + eventName);
    },

    /**
     * Given an HTML element and an eventName, fire the corresponding DOM event. Code adapted from a stack overflow
     * question's answer.
     */
    fireDomEvent: function (element, eventName) {
        var event;
        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent(eventName, true, true);
        } else {
            event = document.createEventObject();
            event.eventType = eventName;
        }

        if (document.createEvent) {
            element.dispatchEvent(event);
        } else {
            element.fireEvent("on" + event.eventType, event);
        }
    },

    /**
     * Verify that firing a dom event results in list view events fired targetting expected components.
     */
    verifyListViewEventSourceComponents : function(component, expectedComponents, mockDomEvent, equalsVerifier, failureMessage) {
        var actualComponents = [];
        var helper = component.getDef().getHelper();

        // Mock fireEvent to do something we can use to test logic in fireEvents (its caller)
        $A.test.overrideFunction(helper, helper.fireEvent,
            function (list, target, eventType, listViewEventType, rawEvent, data) {
                actualComponents.push(target);
            });

        helper.fireEvents(component, "click", mockDomEvent);
        $A.assert("expected and actual should be equal in length",
                expectedComponents.length === actualComponents.length);

        for (var i = 0; i < expectedComponents.length; ++i) {
            var expected = expectedComponents[i];
            var actual = actualComponents[i];
            equalsVerifier(expected, actual, failureMessage)
        }
    },

    /**
     * Get the number of 'own properties' in a javascript object... aka the size of a map
     */
    getMapSize: function(map) {
        var keyCount = 0;
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                ++keyCount;
            }
        }
        return keyCount;
    },

    /**
     * Gets a table cell component. Don't use this - use getHeaderCellComponentAt or getTableBodyCellComponentAt
     */
    getCellComponentAt: function(listViewComponent, rowComponent, colNumber) {
        var cellComponents = rowComponent.get("v.body");
        $A.assert(cellComponents.length !== undefined, cellComponents + " should be an array");
        $A.assert(cellComponents.length > colNumber, cellComponents + " does not contain a column numbered " + colNumber)
        return cellComponents[colNumber];
    },

    /**
     * Gets the header cell component located at a particular header row & column numbers
     */
    getHeaderCellComponentAt: function(listViewComponent, rowNumber, colNumber) {
        var rowComponent = this.getHeaderRowComponentAt(listViewComponent, rowNumber);
        return this.getCellComponentAt(listViewComponent, rowComponent, colNumber)
    },

    /**
     * Gets the table body cell component located at a particular table body row & column numbers
     */
    getTableBodyCellComponentAt: function(listViewComponent, rowNumber, colNumber) {
        var rowComponent = this.getTableBodyRowComponentAt(listViewComponent, rowNumber);
        return this.getCellComponentAt(listViewComponent, rowComponent, colNumber)
    },

    /**
     * Gets a table row component. Don't use this - use getHeaderRowComponentAt or getTableBodyRowComponentAt
     */
    getRowComponentAt: function(listViewComponent, rowNumber, parentContainerAuraId) {
        var rowComponents = this.getRowComponents(listViewComponent, parentContainerAuraId);
        $A.assert(rowComponents.length > rowNumber, rowComponents + " does not contain a row numbered " + rowNumber);
        return rowComponents[rowNumber];
    },

    /**
     * Gets the header row component located at a particular header row number
     */
    getHeaderRowComponentAt: function(listViewComponent, rowNumber) {
        return this.getRowComponentAt(listViewComponent, rowNumber, "listView:header");
    },

    /**
     * Gets the table body row component located at a particular table body row number
     */
    getTableBodyRowComponentAt: function(listViewComponent, rowNumber) {
        return this.getRowComponentAt(listViewComponent, rowNumber, "listView:body");
    },

    /**
     * Gets all the row components of a parent container - don't use this, use getHeaderRowComponents or
     * getTableBodyRowComponents
     */
    getRowComponents: function(listViewComponent, parentContainerAuraId) {
        var rowComponents = listViewComponent.find(parentContainerAuraId).get("v.body");
        $A.assert(rowComponents.length !== undefined, rowComponents + " should be an array");
        return rowComponents;
    },

    /**
     * Gets all the header row components
     */
    getHeaderRowComponents: function(listViewComponent) {
        return this.getRowComponents(listViewComponent, "listView:header");
    },

    /**
     * Gets all the table body row components
     */
    getTableBodyRowComponents: function(listViewComponent) {
        return this.getRowComponents(listViewComponent, "listView:body");
    },

    /**
     * Recursively find all of the leaf-node column headers in a list
     */
    getLeafNodeColumns: function(component) {
        var leafNodeColumns = [];
        var columns = component.get("v.body");
        var accumulator = [];
        this.getLeafNodeColumnHelper(columns, accumulator);
        return accumulator;
    },

    /**
     * Helper for function that gets all of the leaf node column headers in a list
     */
    getLeafNodeColumnHelper: function(node, accumulator) {
        for (var i = 0; i < node.length; ++i) {
            // If node is a leaf node, return it.
            if (node[i].get("v.body").length === 0) {
                accumulator.push(node[i]);
            }
            // Else it has other, children nodes in its body attribute; recurse for each.
            else {
                this.getLeafNodeColumnHelper(node[i].get("v.body"), accumulator);
            }
        }
    }
})
