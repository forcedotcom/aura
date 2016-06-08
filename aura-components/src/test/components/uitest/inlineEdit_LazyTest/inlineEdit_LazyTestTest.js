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
    browsers: ["-IE7", "-IE8"],
    COLUMN_IDS: ["id", "name", "id"],
    
    /**
     * Test that changing the columns ends up updating the DOM
     */
    testColumnChange: {
        test: [
            function(cmp) {
                this.verifyColumnCount(cmp, 0);
            }, function(cmp) {
                this.changeAndVerifyColumnCount(cmp, 2);
            }, function(cmp) {
                this.changeAndVerifyColumnCount(cmp, 0);
            }, function(cmp) {
                this.changeAndVerifyColumnCount(cmp, 3);
            }
        ]
    },
    
    /**
     * Tests basic edit flow after triggering a column change
     *
     * All code after the first function copied from inlineEdit_Test
     */
    testEditTriggerWithColumnChange: {
        test: [
            function(cmp) {
                this.changeAndVerifyColumnCount(cmp, 3);
            }, function(cmp) {
                this.triggerEditOnCell(cmp, 1, 1);
            }, function(cmp) {
                $A.test.addWaitForWithFailureMessage(true, function() {
                    var activeElement = $A.test.getActiveElement();
                    return activeElement.tagName === 'INPUT';
                }, "Input element should be focused.");
            }, function(cmp) {
                // Trigger submit on the edit panel with new value
                var input = cmp.find("grid")._panelBody.get("v.inputComponent")[0];
                input.set("v.value", "newString");
                input.getEvent("keydown").setParams({
                    keyCode: 13,
                    domEvent: {
                        type: "keydown",
                        preventDefault: function() {}
                    }
                }).fire();
            }, function(cmp) {
                $A.test.addWaitForWithFailureMessage("newString", function() {
                    var lastEdited = cmp.get("v.lastEdited");
                    return lastEdited && lastEdited.value;
                }, "The lastEdited attribute should be updated with the last edited value");
            }
        ]
    },
    
    /**
     * Checks that the cell's disabled state is properly applied to the button
     */
    testCellStates: {
        test: [
            function(cmp) {
                this.changeAndVerifyColumnCount(cmp, 3);
            }, function(cmp) {
                this.verifyDisabledState(cmp, 0, 1);
            }
        ]
    },
    
    /**
     * Sets the grid to [count] columns and checks that it was updated correctly
     */
    changeAndVerifyColumnCount: function(cmp, count) {
        this.triggerColumnChange(cmp, count);
        this.verifyColumnCount(cmp, count);
    },
    
    /**
     * Sets the grid to [count] columns
     */
    triggerColumnChange: function(cmp, count) {
        cmp.set("v.totalColumns", count);
        cmp.find("changeColsButton").getEvent("press").fire();
    },
    
    /**
     * Checks that the number of columns in the grid is equal to [expected]
     */
    verifyColumnCount: function(cmp, expected) {
        var self = this;
        
        $A.test.addWaitForWithFailureMessage(expected, function() {
            return self.getActualColumnCount();
        }, "Number of columns is incorrect");
    },
    
    /**
     * Verifies that the disabled attribute in v.items is reflected correctly in the
     * class of the trigger button
     */
    verifyDisabledState: function(cmp, rowIndex, columnIndex) {
        var rowItem = cmp.find("grid").get("v.items")[rowIndex];
        var expected = rowItem.status[this.COLUMN_IDS[columnIndex]].disabled;
        
        var cellElement = this.getCell(rowIndex, columnIndex);
        var actual = cellElement.querySelector('button').classList.contains('disabled');
        
        $A.test.assertEquals(expected, actual, "The 'disabled' class was not found at (" + rowIndex + "," + columnIndex + ")");
    },
    
    /**
     * Triggers the edit button on the specified cell
     */
    triggerEditOnCell: function(cmp, rowIndex, colIndex) {
        var cell = this.getCell(rowIndex, colIndex);
        var trigger = cell.querySelector('.triggerContainer button');
        
        $A.test.clickOrTouch(trigger);
    },
    
    /**
     * Counts the number of columns on the table
     */
    getActualColumnCount: function() {
        var tbody = document.querySelector("tbody");
        var tr = tbody.querySelector("tr");
        
        return this.filterElementsByTagName(tr.children, 'TD').length;
    },
    
    /**
     * Gets the <td> element at the specified coordinates
     */
    getCell: function(rowIndex, columnIndex) {
        var tbody = document.getElementsByTagName("tbody")[0];
        var trs = this.filterElementsByTagName(tbody.children, 'TR');

        return trs[rowIndex].children[columnIndex];
    },
    
    /**
     * Filters based on the specified tagName
     */
    filterElementsByTagName : function(elements, tagName) {
         var elementArray = [];

         for (var i = 0; i < elements.length; i++) {
             if (elements[i].tagName == tagName) {
                 elementArray.push(elements[i]);
             }
         }
         return elementArray;
     }
})