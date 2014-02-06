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
 	 *  Test cancel button closes UISorterList.
 	 */
    testCancelButton : {
    	test: [function(cmp) {
    		listSorter = cmp.find("defaultListSorter");
        	trigger = cmp.find("defaultListSorterTrigger");
        	//check sorter not visible
        	this.assertUISorterPresent(listSorter, false);
        }, function(cmp) {
        	//open List Sorter
        	this.openListSorter(trigger,listSorter);
        }, function(cmp) {
        	//Use cancel button to close the sorter
        	this.closeSorter(listSorter);
        }, function(cmp) {
        	this.assertCancelEventFired(cmp);
    	}]
    },
    
    /**
 	 *  Test Apply button.
 	 */
    testApplyButton : {
    	test: [function(cmp) {
    		listSorter = cmp.find("defaultListSorter");
        	trigger = cmp.find("defaultListSorterTrigger");
        	//check sorter not visible
        	this.assertUISorterPresent(listSorter, false);
        }, function(cmp) {
        	//open List Sorter
        	this.openListSorter(trigger,listSorter);
        }, function(cmp) {
        	//click on Apply button
        	this.pressApply(listSorter);
        	defaultSortOrder = this.defaultSortOrder(listSorter);
        	sortApplied = this.getSortOrderApplied(cmp,"defaultListSorter");
        	$A.test.assertEquals(defaultSortOrder, sortApplied, "Sort not applied correctly after apply button was pressed.");
        }]
    },
    
    /**
     * Test title of Sort modal
     */
    testTitleOfSortPanel: {
        attributes : {title: 'Sort Panel'},
        test: function(cmp){
        	listSorter = cmp.find("defaultListSorter");
            $A.test.assertEquals("Sort Panel", $A.test.getText(listSorter.find("title").getElement()));
        }
    },
    
    /**
 	 *  Test sortOrderPicker and output(selectedItemOutput,selectedSortOrderOutput) of listSort dialog
 	 */
    testSortOrderPickerAndSelectedSortOutput : {
    	test: [function(cmp) {
    		listSorter = cmp.find("defaultListSorter");
        	trigger = cmp.find("defaultListSorterTrigger");
        	//check sorter not visible
        	this.assertUISorterPresent(listSorter, false);
        }, function(cmp) {
        	//open List Sorter
        	this.openListSorter(trigger,listSorter);
        }, function(cmp) {
        	this.pressSortOrderButtonAndAssert(listSorter,"asc");
        }, function(cmp) {
        	this.pressSortOrderButtonAndAssert(listSorter,"dec");
        }, function(cmp) {
        	this.pressSortOrderButtonAndAssert(listSorter,"asc");
        }, function(cmp) {
        	this.selectSortByColumnAndAssert(listSorter, 1);
        }, function(cmp) {
        	this.selectSortByColumnAndAssert(listSorter, 2);
        }, function(cmp) {
        	this.selectSortByColumnAndAssert(listSorter, 4);
        }, function(cmp) {
        	//Use cancel button to close the sorter
        	this.closeSorter(listSorter);
        	this.assertCancelEventFired(cmp);
    	}]
    },
    
    /**
     * Test to verify all sortable columns present in the Sort dialog
     * and none of the hidden column visible
     */
    testAllSortableColumnsPresent : {
    	test: [function(cmp) {
    		listSorter = cmp.find("defaultListSorter");
        	trigger = cmp.find("defaultListSorterTrigger");
        	//check sorter not visible
        	this.assertUISorterPresent(listSorter, false);
        }, function(cmp) {
        	//open List Sorter
        	this.openListSorter(trigger,listSorter);
        }, function(cmp) {
        	//verify all sortable fields present on the dialog
        	this.verifyAllColumnsPresent(listSorter);
        }, function(cmp) {
        	//Use cancel button to close the sorter
        	this.closeSorter(listSorter);
        	this.assertCancelEventFired(cmp);
    	}]
    },
    
    /**
     * Test to check after pressing cancel and reopening list sorter resets 
     * sorter state to default behavior.
     * 
     */
    testPressCancelResetsSorterToDefaultState : {
    	test: [function(cmp) {
    		listSorter = cmp.find("defaultListSorter");
        	trigger = cmp.find("defaultListSorterTrigger");
        	
        	//check sorter not visible
        	this.assertUISorterPresent(listSorter, false);
        }, function(cmp) {
        	//open List Sorter
        	this.openListSorter(trigger,listSorter);
        }, function(cmp) {
        	//Select column 4
        	this.selectSortByColumnAndAssert(listSorter, 4);
        }, function(cmp) {
        	//Sort by order A-Z
        	this.pressSortOrderButtonAndAssert(listSorter,"asc");
        }, function(cmp) {
        	//Use cancel button to close the sorter
        	this.closeSorter(listSorter);
        	this.assertCancelEventFired(cmp);
        }, function(cmp) {
        	//open List Sorter
        	this.openListSorter(trigger,listSorter);
        }, function(cmp) {
        	//make sure the selected Column and order reset's to default selected column from model
        	this.verifyDefaultBehviour(listSorter);
        }, function(cmp) {
        	//Use cancel button to close the sorter
        	this.closeSorter(listSorter);
        	this.assertCancelEventFired(cmp);
    	}]
    },

    /**
     * Verify default Sort order and default Column is selected when
     * List Sorter is opened
     * Also make sure column selected is the active element on the page
     */
    testDefaultSortOrderSelection : {
    	test: [function(cmp) {
    		listSorter = cmp.find("defaultListSorter");
        	trigger = cmp.find("defaultListSorterTrigger");
        	
        	//check sorter not visible
        	this.assertUISorterPresent(listSorter, false);
        }, function(cmp) {
        	//open List Sorter
        	this.openListSorter(trigger,listSorter);
        }, function(cmp) {
        	this.verifyDefaultBehviour(listSorter);
        }, function(cmp) {
        	//Use cancel button to close the sorter
        	this.closeSorter(listSorter);
        	this.assertCancelEventFired(cmp);
    	}]
    },
    
    /**
     * Verify default Sort order and default Column is selected when
     * List Sorter is opened
     * Also make sure column selected is the active element on the page
     */
    verifyDefaultBehviour: function(listSorter){
    	var sortOrderButton = listSorter.find("decBtn").getElement();
    	//Verify Z-A buton selected
    	$A.test.assertTrue($A.util.hasClass(sortOrderButton,"selected"), "By Defauly Z-A Button should be selected");
    	//verify Sort Order label is correct
    	var sortOrderLabelValue = this.getSortOrderLabel(listSorter);
    	var defaultCoumn = "Column 2";
    	var defaultOrder = "Z-A"
    	var defaultSortOrder = defaultCoumn + ":" + defaultOrder;
    	$A.test.assertEquals(defaultSortOrder, sortOrderLabelValue, "Default Sort order Label displayed is not correct");
    	//column2 to should be selected by default
    	var menuItems =  this.getDisplayedColumns(listSorter);
    	var selectedColumn = this.getSelectedColumns(menuItems);
    	$A.test.assertEquals(defaultCoumn, selectedColumn, "Default Selected column is not correct");
    	//active element should be column 2
    	$A.test.assertEquals(defaultCoumn, $A.test.getActiveElementText(), "Default column 2 should be active element");
    },
    
    /**
     * select sortBy column and make sure its checked on the sort menu
     */
    selectSortByColumnAndAssert: function(listSorter, columnNumber){
    	var menuItem = this.getMenuItemByColumnNumber(listSorter,columnNumber);
    	menuItem.get('e.click').fire();
    	var expectedColumn = "Column " + columnNumber;
    	$A.test.addWaitForWithFailureMessage(expectedColumn, function(){
			var actualSelectedItemOutput = $A.test.getText(listSorter.find("selectedItemOutput").getElement());
    		return actualSelectedItemOutput;
			}, "Wrong Selected field displayed on Dialog");
    	//TODO: Uncomment below line after W-1985179 is fix
    	//$A.test.assertEquals(expectedColumn, $A.test.getActiveElementText(), expectedColumn + " should be focused");
    },
    
    /**
     * Click on pressSortOrderButton, pass in sortOrder ="asc" for A-Z and "dec" for Z-A
     */
    pressSortOrderButtonAndAssert : function(listSorter, sortOrder) {
    	var sortOrderButton = listSorter.find(sortOrder + "Btn").getElement();
		$A.test.clickOrTouch(sortOrderButton);
    	this.assertSortOrderOutput(listSorter, sortOrder);
    	$A.test.assertTrue($A.util.hasClass(sortOrderButton,"selected"), sortOrder + "Button should be selected");
    },
	
	/**
	 * Assert correct order is displayed on the page
	 */
	assertSortOrderOutput: function(listSorter, sortOrder){
		var expectedSortOrderOutput = "Z-A";
		if(sortOrder == "asc"){
			expectedSortOrderOutput = "A-Z";
		}
		$A.test.addWaitForWithFailureMessage(expectedSortOrderOutput, function(){
			var actualSortOuput = $A.test.getText(listSorter.find("selectedSortOrderOutput").getElement());
    		return actualSortOuput;
			}, "Wrong Sort Order displayed on Dialog");
	},
	
    /**
     * Return the field name and order which got applied after apply button was pressed
     */
    getSortOrderApplied: function(cmp, resultCmpId){
    	var output = cmp.find(resultCmpId+"Result");
    	return output.get("v.value");
    },
    
    /**
     * Click on trigger so that sorter is visible
     */
    openListSorter : function(trigger, listSorter) {
    	trigger.get("e.click").fire();
    	this.assertUISorterPresent(listSorter, true);
    },
    
    /**
     * Click on Apply
     */
    pressApply : function(listSorter) {
    	var applyButton = listSorter.find("set").getElement();
		$A.test.clickOrTouch(applyButton);
    	this.assertUISorterPresent(listSorter, false);
	},
	
    /**
     * Close the sorter by clicking on cancel
     */
    closeSorter : function(listSorter) {
    	var cancelButton = listSorter.find("cancel").getElement();
		$A.test.clickOrTouch(cancelButton);
    	this.assertUISorterPresent(listSorter, false);
    },
    
    /**
     * Verify cancel event did get fired
     */
    assertCancelEventFired : function(cmp)	{
    	$A.test.assertTrue(cmp.get('v.cancelEventFired'),"Cancel event did not get fired");
    },
    
    /**
     * check if sorter is visible on the page
     */
    assertUISorterPresent : function(listSorter, isPresent)	{
    	if(isPresent){
    		$A.test.addWaitForWithFailureMessage(isPresent, function(){return $A.util.hasClass(listSorter.find("sorterContainer").getElement(),"open");}, "List Sorter should be visible");
        }
    	else{
    		$A.test.addWaitForWithFailureMessage(isPresent, function(){return $A.util.hasClass(listSorter.find("sorterContainer").getElement(),"open");}, "List Sorter should not be visible");
        }
    },
    
    /**
     * Return the sortOrderLabel which is SelectedItem:SortOrder
     */
    getSortOrderLabel: function(listSorter){
    	var selectedField = $A.test.getText(listSorter.find("selectedItemOutput").getElement());
    	var selectedSortOrderOutput = $A.test.getText(listSorter.find("selectedSortOrderOutput").getElement());
    	var sortOrderLabel = selectedField + ":" + selectedSortOrderOutput;
    	return sortOrderLabel;
    },
    
    /**
     * Get all display columns including hidden one from the model
     */
    getColumnsFromModel: function(listSorter){
    	return listSorter.getValue("v.dataProvider").get(0).get("m.columns");
    },
    
    getDefaultOrderByListFromModel: function(listSorter){
    	return listSorter.getValue("v.dataProvider").get(0).get("m.defaultOrderByList");
    },
    
    defaultSortOrder: function(listSorter){
    	var defaultOrderObj = this.getDefaultOrderByListFromModel(listSorter)
    	var defaultOrder = [];
        for (var i = 0; i < defaultOrderObj.length; i++) {
        	var defaultField = defaultOrderObj[i];
        	var fieldName = defaultField.fieldName;
        	var sortOrder = defaultField.ascending ? "A-Z" : "Z-A";
        	defaultOrder.push(defaultField.fieldName + " : " +sortOrder);
        }
        return defaultOrder.join(",");
    },
    
    getDisplayedColumns: function(listSorter){
    	var menuCmp = listSorter.find("sorterMenuList");
        var menuItems = menuCmp.getValue("v.childMenuItems");
        return menuItems;
    },
    
    getSelectedColumns: function(menuItems){
    	var values = [];
        for (var i = 0; i < menuItems.getLength(); i++) {
            var c = menuItems.getValue(i);
            if (c.get("v.selected") === true) {
                values.push(c.get("v.label"));
            }
        }
        return values.join(",");
    },
    
    getAllColumnsLabel: function(menuItems){
    	var values = [];
        for (var i = 0; i < menuItems.getLength(); i++) {
            var c = menuItems.getValue(i);
            values.push(c.get("v.label"));
        }
        return values;
    },
    
    /**
     * Get menuItem component given columnNumber
     * First column = 1, 2nd Column = 2..
     */
    getMenuItemByColumnNumber: function(listSorter, columnNumber){
    	var menuItems = this.getDisplayedColumns(listSorter);
    	if (!$A.util.isUndefinedOrNull(menuItems.getValue(columnNumber - 1))) {
                return menuItems.getValue(columnNumber - 1);
    	}
    	$A.test.fail("Test fail! Column not present in the Sort Menu");    
    },
    
    getOnlySortableColumnsFromModel: function(listSorter){
    	var columns = this.getColumnsFromModel(listSorter);
    	var sortableColumns = [];
        for (var i = 0; i < columns.length; i++) {
        	var column = columns[i];
            var isSortable = column.isSortable;
            if(isSortable === true){
                sortableColumns.push(column.label);
            }
        }
        return sortableColumns;
    },
    
    verifyAllColumnsPresent: function(listSorter){
    	var sortableColumnsFromModel = this.getOnlySortableColumnsFromModel(listSorter);
    	var menuItems = this.getDisplayedColumns(listSorter);
    	var columnsFromUI = this.getAllColumnsLabel(menuItems);
    	var hiddenColumnLabel = "Hidden Column";
    	$A.test.assertEquals(sortableColumnsFromModel.join(","), columnsFromUI.join(","), "Some columns are missing in UI Sorter which are sortable")
    	$A.test.assertFalse(hiddenColumnLabel.indexOf(columnsFromUI.join(",")) != -1, "Hidden Column should not be displayed on the page, list of columns diplayed:" + columnsFromUI.join(","))
//    	this.getMenuItemByColumnNumber(listSorter,1);
//    	this.getDefaultOrderByListFromModel(listSorter);
//    	menuItems=  this.getDisplayedColumns(listSorter);
//    	selectedColumn = this.getSelectedColumns(menuItems);
    }
})