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
	browsers: ["-IE8"],
	DOM    : 0,
    ITEMS  : 1,
    doNotWrapInAuraRun : true,
    UPDATE_ITEM_TESTCASE : {EMPTY_ITEM: 0, UPDATE: 1, BLANK_DATA: 2, INVALID_DATA: 3, PARTIAL: 4},
    
    /**
     *  Test virtual data grid is loaded with fixed header.
     */
    testFixedHeader : {
        attributes : {"testFixedHeader" : true},
        test : function(cmp) {
            var dataGrid = $A.test.getElementByClass("uiVirtualDataGrid");
            $A.test.assertNotNull(dataGrid, "Data grid was not loaded");

            var fixedHeader = $A.util.hasClass(dataGrid, "fixedHeaderTable");
            $A.test.assertNotNull(fixedHeader, "Header is not fixed");

            var dataRows = cmp.find("grid").getElement().getElementsByTagName("td");
            $A.test.assertNotNull(dataRows, "Data for data grid not rendered");
            var data = $A.test.getText(dataRows[0]);
            $A.test.assertEquals("Krista Arnold", data, "Data for data grid incorrect");
        }
    },

    testRowEventHandlerCalledOnClick: {
        test: [function(cmp) {
    	   cmp._initialText = $A.test.getText(cmp.find("grid").getElement().getElementsByTagName("td")[0]);
           var firstGridRow = cmp.find("grid").getElement().getElementsByTagName("td")[0];
           var div = firstGridRow.getElementsByTagName("div")[0];
           // Event handler defined on div so must click there
           div.focus();
           $A.test.clickOrTouch(div); 
       },
       function(cmp) {
           var actualText = $A.test.getText(cmp.find("grid").getElement().getElementsByTagName("td")[0]);
           // click handler appends exclamation mark to current text
           $A.test.assertEquals(cmp._initialText+"!", actualText, "Click event handler not called for virtualDataGrid row");
       }]
    },
    
    /**
     * Insert item into grid
     */
    testInsertItems : {
        test : [function(cmp){
        	this.getRowElements(cmp, 100);
        	this.setValue(cmp, "index", 1);
            this.setValue(cmp, "count", 2);
            this.pressInsertButton(cmp);
            this.waitForGridUpdated(102);
        }, function(cmp) {
        	var elements = this.getRowElements(cmp, 102);
        	// check dom
        	$A.test.assertEquals("Mary Jane1", $A.test.getText(elements[this.DOM][1].children[0]), "Insert failed (dom check): Element at index 1 incorrect");
            // check items
            $A.test.assertEquals("Mary Jane1", elements[this.ITEMS][1].name, "Insert failed (items check): Element at index 1 incorrect");
        }]
    },
    
    /**
     * Insert a large amount of elements, remove only a portion of it and see how v.items reacts
     */
    testStaggeredInsertionRemove : {
        test : [function(cmp){
            this.setValue(cmp, "index", 50);
            this.setValue(cmp, "count", 20);
            this.pressInsertButton(cmp);
            this.waitForGridUpdated(120);
        }, function(cmp) {
        	var elements = this.getRowElements(cmp, 120);
        	// check dom
            $A.test.assertEquals("Mary Jane50", $A.test.getText(elements[this.DOM][50].children[0]), "Insert failed (dom check): Element at index 50 incorrect");
            // check items
            $A.test.assertEquals("Mary Jane50", elements[this.ITEMS][50].name, "Insert failed (items check): Element at index 50 incorrect");
        }, function(cmp) {
            this.setValue(cmp, "index", 50);
            this.setValue(cmp, "count", 10);
            this.pressRemoveButton(cmp);
            this.waitForGridUpdated(110)
        }, function(cmp) {
        	var elements = this.getRowElements(cmp, 110);
        	// check dom
            $A.test.assertEquals("Mary Jane60", $A.test.getText(elements[this.DOM][50].children[0]), "Insert failed (dom check): Element at index 50 incorrect");
            // check items
            $A.test.assertEquals("Mary Jane60", elements[this.ITEMS][50].name, "Insert failed (items check): Element at index 50 incorrect");
        }]
    },
    
    /**
     * Fire the DataGrid provider to verify that v.items is overwritten. Replace all data in grid
     */
    testVirtualDataGridProviderFire : {
    	test : [function(cmp){
    		// veirfy inital count
        	this.getRowElements(cmp, 100);
        	this.pressFireDataProviderButton(cmp);
            this.waitForGridUpdated(10);
        }, function(cmp) {
        	var elements = this.getRowElements(cmp, 10);
        	// check dom
            $A.test.assertEquals("John Doe 11", $A.test.getText(elements[this.DOM][0].children[0]), "Insert failed (dom check): Element at index 0 incorrect");
            // check items
            $A.test.assertEquals("John Doe 11", elements[this.ITEMS][0].name, "Insert failed (items check): Element at index 0 incorrect");
        }]
    },
    
    /**
     * Append item
     */
    testAppendItem : {
    	test : [function(cmp){
    		// veirfy inital count
        	this.getRowElements(cmp, 100);
        	this.pressAddRowButton(cmp);
            this.waitForGridUpdated(101);
        }, function(cmp) {
        	var elements = this.getRowElements(cmp, 101);
        	// check dom
            $A.test.assertEquals("Peter Parker 1", $A.test.getText(elements[this.DOM][100].children[0]), "Insert failed (dom check): Element at index 0 incorrect");
            // check items
            $A.test.assertEquals("Peter Parker 1", elements[this.ITEMS][100].name, "Insert failed (items check): Element at index 0 incorrect");
            // check cached index
            $A.test.assertEquals(100, elements[this.DOM][100]._index, "Insert failed (index check): Cached index incorrect");
        }]
    },
 
    /**
     * Update item to blank data set
     */
    testUpdateItemToBlankData : {
        attributes : {'index' : 4, 'count' : 2},
        test : function(cmp){
            this.pressUpdateItemButton(cmp);
            this.waitForItemUpdated(cmp, 4, this.UPDATE_ITEM_TESTCASE.BLANK_DATA);
        }
    },
    
    /**
     * Update item to empty object 
     */
    testUpdateItemWithEmptyItemObject : {
        attributes : {'index' : 4, 'count' : 0},
        test : function(cmp){
            this.pressUpdateItemButton(cmp);
            this.waitForItemUpdated(cmp, 4, this.UPDATE_ITEM_TESTCASE.EMPTY_ITEM);
        }
    },
    
    /**
     * Update item to some new value
     */
    testUpdateItem : {
        attributes : {'index' : 4, 'count' : 1},
        test : function(cmp){
            this.pressUpdateItemButton(cmp);
            this.waitForItemUpdated(cmp, 4, this.UPDATE_ITEM_TESTCASE.UPDATE);
        }
    },
    
    /**
     * Update item to invalid data set
     */
    testUpdateItemWithInvalidItemData : {
        attributes : {'index' : 4, 'count' : 3},
        test : function(cmp){
            this.pressUpdateItemButton(cmp);
            this.waitForItemUpdated(cmp, 4, this.UPDATE_ITEM_TESTCASE.INVALID_DATA);
        }
    },

    /**
     * Update with partial data updated
     */
    testUpdateItemWithPartialDataUpdated : {
        attributes : {'index' : 4, 'count' : 4},
        test : function(cmp){
            this.pressUpdateItemButton(cmp);
            this.waitForItemUpdated(cmp, 4, this.UPDATE_ITEM_TESTCASE.PARTIAL);
        }
    },
    
    /**
     * Test to make sure table cells each have exactly one <td> or <th> element
     */
    testCustomTableCell: {
        test: function(cmp) {
            this.validateTableCells(4);
        }
    },
    
    setValue : function(cmp, cmpName, value){
        cmp.find(cmpName).set("v.value", value);
    },
    
    pressInsertButton : function(cmp) {
    	cmp.find("insert").get("e.press").fire();
    },
    
    pressRemoveButton : function(cmp) {
    	cmp.find("remove").get("e.press").fire();
    },
    
    pressAddRowButton : function(cmp) {
    	cmp.find("addRow").get("e.press").fire();
    },
    
    pressUpdateItemButton : function(cmp) {
        cmp.find('update').get('e.press').fire();
    },
    
    pressFireDataProviderButton : function(cmp) {
    	cmp.find("fireDP").get("e.press").fire();
    },
    
    pressRefreshButton : function(cmp) {
    	cmp.find("refreshGrid").get("e.press").fire();
    },
    
    getRowElements : function(cmp, colCount){
        var tbody = document.getElementsByTagName("tbody")[0];
        var trs = this.getOnlyTrs(tbody.children);
        var itemsInBody = this.getGridAttribute(cmp, "items");

        $A.test.assertEquals(colCount, trs.length, "The total amount of items on the page are incorrect");
        $A.test.assertEquals(colCount, itemsInBody.length, "The total amount of elements in v.items is incorrect");

        return [trs, itemsInBody];
    },
    
    getOnlyTrs : function(elements){
    	var elementArray = [];
    	
	     for(var i = 0; i < elements.length; i++){
	        if(elements[i].tagName != "!"){
	        	elementArray.push(elements[i]);
	        }
	     }
    	return elementArray;
    },
    
    getGridAttribute : function( cmp, attributeName){
        return cmp.find("grid").get("v."+attributeName);
    },
    
    waitForGridUpdated : function(itemsCount) {
    	var that = this;
    	$A.test.addWaitForWithFailureMessage(itemsCount, function(){
        	var tbody = document.getElementsByTagName("tbody")[0];
            var trs = that.getOnlyTrs(tbody.children);
    		return trs.length;
		}, "Number of items expected is incorrect.");
    },
    
    waitForItemUpdated : function(cmp, index, testCase) {
        var that = this;
        var expectedName = '';
        var expectedPhone = '';
        var expectedBalance = '';
        
        if (testCase == this.UPDATE_ITEM_TESTCASE.UPDATE) {
            expectedName = 'Updated at ' + index;
            expectedPhone = '555-' + index;
            expectedBalance = '$' + index;
        } else if (testCase == this.UPDATE_ITEM_TESTCASE.PARTIAL) {
            expectedName = '';
            expectedPhone = '000-' + index;
            expectedBalance = '';
        }
        
        $A.test.addWaitForWithFailureMessage(true, function(){
            var tbody = document.getElementsByTagName("tbody")[0];
            var trs = that.getOnlyTrs(tbody.children);
            var cells = trs[index].getElementsByTagName('td');
            var actualName = $A.test.getText(cells[0]);
            var actualPhone = $A.test.getText(cells[1]);
            var actualBalance = $A.test.getText(cells[2]);
            return ((expectedName == actualName) && 
                    (expectedPhone == actualPhone) &&
                    (expectedBalance == actualBalance));
        }, 'Incorrect {name,phone,balance} expected index@' + index + '{' 
            + expectedName + ', ' +
            + expectedPhone + ', ' +
            + expectedBalance + ', ' + '}' 
        );
    },
    
    validateTableCells : function(colCount){
        var tbody = document.getElementsByTagName("tbody")[0];
        var trs = this.getOnlyTrs(tbody.children);
        
        for (var i = 0; i < trs.length; i++) {
            var cells = trs[i].children;
            $A.test.assertEquals(colCount, cells.length, "Row " + (i+1) + " has an incorrect number of columns");
            for (var j = 0; j < cells.length; j++) {
                var cell = cells[j]
                $A.test.assertEquals('TD', cell.tagName, "Table cell should be a <td> element");
                $A.test.assertNotEquals('TD', cell.firstChild.tagName, "Table cell should not be double-wrapped in <td> elements");
            }
        }
    },
})
