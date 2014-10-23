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
            this.listSorter = cmp.find("defaultListSorter");
            this.trigger = cmp.find("defaultListSorterTrigger");
            //check sorter not visible
            this.assertUISorterPresent(this.listSorter, false);
        }, function(cmp) {
            //open List Sorter
            this.openListSorter(this.trigger, this.listSorter);
        }, function(cmp) {
            //Use cancel button to close the sorter
            this.closeSorter(this.listSorter);
        }, function(cmp) {
            this.assertCancelEventFired(cmp);

            delete this.listSorter;
            delete this.trigger;
        }]
    },

    /**
      *  Test Apply button.
      */
    testApplyButton : {
        test: [function(cmp) {
            this.listSorter = cmp.find("defaultListSorter");
            this.trigger = cmp.find("defaultListSorterTrigger");
            //check sorter not visible
            this.assertUISorterPresent(this.listSorter, false);
        }, function(cmp) {
            //open List Sorter
            this.openListSorter(this.trigger, this.listSorter);
        }, function(cmp) {
            //click on Apply button
            this.pressApply(this.listSorter);
            var defaultSortOrder = this.defaultSortOrder(this.listSorter);
            var sortApplied = this.getSortOrderApplied(cmp, "defaultListSorter");
            $A.test.assertEquals(defaultSortOrder, sortApplied, "Sort not applied correctly after apply button was pressed.");

            delete this.listSorter;
            delete this.trigger;
        }]
    },

    /**
     * Test title of Sort modal
     */
    testTitleOfSortPanel: {
        attributes : {title: 'Sort Panel'},
        test: function(cmp){
            this.listSorter = cmp.find("defaultListSorter");
            $A.test.assertEquals("Sort Panel", $A.test.getText(this.listSorter.find("title").getElement()));
        }
    },

    /**
      *  Test sortOrderPicker and output(selectedItemOutput,selectedSortOrderOutput) of listSort dialog
      */
    testSortOrderPickerAndSelectedSortOutput : {
        test: [function(cmp) {
            this.listSorter = cmp.find("defaultListSorter");
            this.trigger = cmp.find("defaultListSorterTrigger");
            //check sorter not visible
            this.assertUISorterPresent(this.listSorter, false);
        }, function(cmp) {
            //open List Sorter
            this.openListSorter(this.trigger,this.listSorter);
        }, function(cmp) {
            this.selectSortByColumnAndAssert(this.listSorter, 1, "asc");
        }, function(cmp) {
            this.selectSortByColumnAndAssert(this.listSorter, 2, "desc");
        }, function(cmp) {
            this.selectSortByColumnAndAssert(this.listSorter, 4, "asc");
        }, function(cmp) {
            //click on Apply button
            this.pressApply(this.listSorter);
            var expectedSortOrder = "Column4 : A-Z";
            var sortApplied = this.getSortOrderApplied(cmp,"defaultListSorter");
            $A.test.assertEquals(expectedSortOrder, sortApplied, "Sort not applied correctly after apply button was pressed.");

            delete this.listSorter;
            delete this.trigger;
        }]
    },

    /**
     * Test to verify all sortable columns present in the Sort dialog
     * and none of the hidden column visible
     */
    testAllSortableColumnsPresent : {
        test: [function(cmp) {
            this.listSorter = cmp.find("defaultListSorter");
            this.trigger = cmp.find("defaultListSorterTrigger");
            //check sorter not visible
            this.assertUISorterPresent(this.listSorter, false);
        }, function(cmp) {
            //open List Sorter
            this.openListSorter(this.trigger,this.listSorter);
        }, function(cmp) {
            //verify all sortable fields present on the dialog
            this.verifyAllColumnsPresent(this.listSorter);
        }, function(cmp) {
            //Use cancel button to close the sorter
            this.closeSorter(this.listSorter);
            this.assertCancelEventFired(cmp);

            delete this.listSorter;
            delete this.trigger;
        }]
    },

    /**
     * Test to check after pressing cancel and reopening list sorter resets
     * sorter state to default behavior.
     *
     */
    testPressCancelResetsSorterToDefaultState : {
        test: [function(cmp) {
            this.listSorter = cmp.find("defaultListSorter");
            this.trigger = cmp.find("defaultListSorterTrigger");

            //check sorter not visible
            this.assertUISorterPresent(this.listSorter, false);
        }, function(cmp) {
            //open List Sorter
            this.openListSorter(this.trigger,this.listSorter);
        }, function(cmp) {
            //Select column 4
            this.selectSortByColumnAndAssert(this.listSorter, 4, "desc");
        }, function(cmp) {
            //Use cancel button to close the sorter
            this.closeSorter(this.listSorter);
            this.assertCancelEventFired(cmp);
        }, function(cmp) {
            //open List Sorter
            this.openListSorter(this.trigger,this.listSorter);
        }, function(cmp) {
            //make sure the selected Column and order reset's to default selected column from model
            this.verifyDefaultBehviour(this.listSorter);
        }, function(cmp) {
            //Use cancel button to close the sorter
            this.closeSorter(this.listSorter);
            this.assertCancelEventFired(cmp);

            delete this.listSorter;
            delete this.trigger;
        }]
    },

    /**
     * Verify default Sort order and default Column is selected when
     * List Sorter is opened
     * Also make sure column selected is the active element on the page
     */
    testDefaultSortOrderSelection : {
        test: [function(cmp) {
            this.listSorter = cmp.find("defaultListSorter");
            this.trigger = cmp.find("defaultListSorterTrigger");

            //check sorter not visible
            this.assertUISorterPresent(this.listSorter, false);
        }, function(cmp) {
            //open List Sorter
            this.openListSorter(this.trigger,this.listSorter);
        }, function(cmp) {
            this.verifyDefaultBehviour(this.listSorter);
        }, function(cmp) {
            //Use cancel button to close the sorter
            this.closeSorter(this.listSorter);
            this.assertCancelEventFired(cmp);

            delete this.listSorter;
            delete this.trigger;
        }]
    },

    /**
     * Verify default Sort order and default Column is selected when
     * List Sorter is opened
     * Also make sure column selected is the active element on the page
     */
    verifyDefaultBehviour: function(listSorter){
        var menuItems =  this.getDisplayedColumns(listSorter);
        var selectedColumnAndSortOrder = this.getSelectedColumnsAndSortOrder(menuItems);
        var selectedColumn = selectedColumnAndSortOrder.split(":")[0];
        var selectedSortOrder = selectedColumnAndSortOrder.split(":")[1];
        var defaultCoumn = "Column 2";
        var defaultOrder = "Z-A";

        //verify by default column2 Z-A is selected
        $A.test.assertEquals(defaultCoumn, selectedColumn, "Default Column selected is not correct");
        $A.test.assertEquals(defaultOrder, selectedSortOrder, "Default Sort Order selected is not correct");
        //active element should be column 2
        var activeElement = $A.test.getActiveElementText();
        $A.test.assertTrue(activeElement.indexOf(defaultCoumn) >= 0, "By Default column 2 should be active element");
    },

    /**
     * select sortBy column and Sort order and make sure its checked on the sort menu
     * pass in sortOrder ="asc" for A-Z and "desc" for Z-A
     */
    selectSortByColumnAndAssert: function(listSorter, columnNumber, sortOrder){
        var menuItem = this.getMenuItemByColumnNumber(listSorter,columnNumber);
        menuItem.get('e.click').fire();

        var menuItems =  this.getDisplayedColumns(listSorter);
        var selectedColumnAndSortOrder = this.getSelectedColumnsAndSortOrder(menuItems);

        var expectedColumn = "Column " + columnNumber;
        $A.test.addWaitForWithFailureMessage(expectedColumn, function(){
            var selectedColumn = selectedColumnAndSortOrder.split(":")[0];
            return selectedColumn;
        }, "Wrong Selected field displayed on Dialog");

        var expectedSortOrder;
        var isAscending = $A.util.getBooleanValue(menuItem.get("v.isAscending"));
        if(sortOrder.indexOf("desc") >= 0){
            if(isAscending){
                //fire event so that it would change it to descending
                menuItem.get('e.click').fire();
            }
            expectedSortOrder = "Z-A";
        }else{
            if(!isAscending){
                //fire event on the item so that it will change it to ascending
                menuItem.get('e.click').fire();
            }
            expectedSortOrder = "A-Z";
        }
        menuItems =  this.getDisplayedColumns(listSorter);
        selectedColumnAndSortOrder = this.getSelectedColumnsAndSortOrder(menuItems);
        //verify sort order is selected properly
        $A.test.addWaitForWithFailureMessage(expectedSortOrder, function(){
            var actualSortOrder = selectedColumnAndSortOrder.split(":")[1];
            return actualSortOrder;
        }, "Sort Order selected is not correct");
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
    assertCancelEventFired : function(cmp)    {
        $A.test.assertTrue(cmp.get('v.cancelEventFired'),"Cancel event did not get fired");
    },

    /**
     * check if sorter is visible on the page
     */
    assertUISorterPresent : function(listSorter, isPresent)    {
        if(isPresent){
            $A.test.addWaitForWithFailureMessage(isPresent, function(){return $A.util.hasClass(listSorter.find("sorterContainer").getElement(),"open");}, "List Sorter should be visible");
        }
        else{
            $A.test.addWaitForWithFailureMessage(isPresent, function(){return $A.util.hasClass(listSorter.find("sorterContainer").getElement(),"open");}, "List Sorter should not be visible");
        }
    },

    /**
     * Get all display columns including hidden one from the model
     */
    getColumnsFromModel: function(listSorter){
        return listSorter.get("v.dataProvider")[0].get("m.columns");
    },

    getDefaultOrderByListFromModel: function(listSorter){
        return listSorter.get("v.dataProvider")[0].get("m.defaultOrderByList");
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
        var menuItems = menuCmp.get("v.childMenuItems");
        return menuItems;
    },

    getSelectedColumnsAndSortOrder: function(menuItems){
        var values = [];
        for (var i = 0; i < menuItems.length; i++) {
            var item = menuItems[i];
            if (item.get("v.selected") === true) {
                var label = item.get("v.label");
                var selectedSortOrder = item.get("v.isAscending") ? "A-Z" : "Z-A";
                values.push(label + ":" + selectedSortOrder);
            }
        }
        return values.join(",");
    },

    getAllColumnsLabel: function(menuItems){
        var values = [];
        for (var i = 0; i < menuItems.length; i++) {
            var item = menuItems[i];
            values.push(item.get("v.label"));
        }
        return values;
    },

    /**
     * Get menuItem component given columnNumber
     * First column = 1, 2nd Column = 2..
     */
    getMenuItemByColumnNumber: function(listSorter, columnNumber){
        var menuItems = this.getDisplayedColumns(listSorter);
        if (!$A.util.isUndefinedOrNull(menuItems[columnNumber - 1])) {
                return menuItems[columnNumber - 1];
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
        $A.test.assertEquals(sortableColumnsFromModel.join(","), columnsFromUI.join(","),
            "Some columns are missing in UI Sorter which are sortable");
        $A.test.assertFalse(hiddenColumnLabel.indexOf(columnsFromUI.join(",")) >= 0,
            "Hidden Column should not be displayed on the page, list of columns diplayed:" + columnsFromUI.join(","));
    }
})