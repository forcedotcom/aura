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
     browsers: ["-IE7","-IE8"],
     colIds: ["id", "name", "grade"],
     
     EDIT_PANEL_CLASS: "slds-popover--edit",
     
     /**
      * Test basic flow:
      *  - triggering an edit moves focus into an inputElement
      *  - changing the value in the input element triggers an onEdit event
      */
     testEditTrigger : {
        test : [function(cmp) {
            this.triggerEditOnCell(cmp, 0, 2);
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return activeElement.tagName === 'INPUT';
            }, "Input element should be focused.");
        }, function(cmp) {
            // Trigger submit on the edit panel with new value
            var input = cmp.find("grid")._panelBody.get("v.inputComponent")[0];
            input.set("v.value", 5);
            input.getEvent("keydown").setParams({
                keyCode : 13,
                domEvent : {
                    type : "keydown",
                    preventDefault : function() {}
                }
            }).fire();
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage(5, function() {
                var lastEdited = cmp.get("v.lastEdited");
                return lastEdited && lastEdited.values[0];
            }, "The lastEdited attribute should be updated with the last edited value");
        }]
     },
     
     /**
       *  Verifies the attribute value shows up correctly after event fired
      */
     testOutputAttribute : {
         test : [function(cmp) {
             this.triggerEditOnCell(cmp, 1, 3);
         }, function(cmp) {
             $A.test.addWaitForWithFailureMessage(true, function() {
                 var activeElement = $A.test.getActiveElement();
                 return activeElement.tagName === 'INPUT';
             }, "Input element should be focused.");
         }, function(cmp) {
             // Trigger submit on the edit panel with new value
             var input = cmp.find("grid")._panelBody.get("v.inputComponent")[0];
             input.set("v.value", "abc");
             input.getEvent("keydown").setParams({
                 keyCode : 13,
                 domEvent : {
                     type : "keydown",
                     preventDefault : function() {}
                 }
             }).fire();
         }, function(cmp) {
             $A.test.addWaitForWithFailureMessage("abc", function() {
                 var lastEdited = cmp.get("v.lastEdited");
                 return lastEdited && lastEdited.values[0];
             }, "Default value of output component is wrong");
         }]
     },
     
     /**
      *  Tests non editable inlineEdit cells
      */
     testNonEditableCells : {
         test : [function(cmp) {
             var editable = cmp.find("grid").get("v.editable");
             cmp.find("grid").set('v.editable', !editable);
         }, function(cmp) {
             this.triggerEditOnCell(cmp, 3, 0);
         }, function(cmp) {
             this.waitForPanelClose(cmp);
             this.triggerEditOnCell(cmp, 3, 1);
         }, function(cmp) {
             this.waitForPanelClose(cmp);
             this.triggerEditOnCell(cmp, 3, 2);
         }, function(cmp) {
             this.waitForPanelClose(cmp);
             this.triggerEditOnCell(cmp, 3, 3);
         }, function(cmp) {
             this.waitForPanelClose(cmp);
             this.triggerEditOnCell(cmp, 3, 4);
         }, function(cmp) {
             this.waitForPanelClose(cmp);
             this.triggerEditOnCell(cmp, 3, 5);
         }, function(cmp) {
             this.waitForPanelClose(cmp);
             this.triggerEditOnCell(cmp, 3, 6);
         }, function(cmp) {
             this.waitForPanelClose(cmp);
             var editable = cmp.find("grid").get("v.editable");
             cmp.find("grid").set('v.editable', !editable);
         }]
     },
     
     /**
      * Test append functionality
      */
     testAppendItems : {
         test : function(cmp) {
             this.triggerAppend(cmp);
             this.waitForRows(11);
         }
     },
     
     /**
      * Test editing multiple cells opens and closes appropriate panel for cell.
      */
     testEditPanelForMulitpleCells : {
         test : [function(cmp) {
             this.triggerEditOnCell(cmp, 0, 2);
         }, function(cmp) {
             this.waitForPanelOpen(cmp);
         }, function(cmp) {
             this.verifyPanelContent(cmp, 0);
             this.triggerEditOnCell(cmp, 6, 0);
         }, function(cmp) {
             this.waitForPanelContent(cmp, 6);
         }] 
     },
     
     /**
      * Test edit cell with empty value to a cell with value.
      */
     testEditEmptyCell : {
         test : [function(cmp) {
             this.triggerEditOnCell(cmp, 5, 2);
         }, function(cmp) {
             this.waitForPanelOpen(cmp);
         }, function(cmp) {
             this.verifyPanelContent(cmp, '');
             this.editPanel(cmp, 555);
         }, function(cmp) {
             this.waitForCellContent(cmp, 5, 2, '555');
         }]
     },
     
     /**
      * Test update item on inline edit.
      */
     testUpdateItem : {
         attributes : {'index': 4},
         test : [function(cmp) {
             cmp.find('updateButton').get('e.press').fire();
             this.waitForCellContent(cmp, 4, 1, 'updated at 4');
         }, function(cmp) {
             this.verifyCellContent(cmp, 4, 0, '999');
             this.verifyCellContent(cmp, 4, 2, '999');
             this.verifyCellContent(cmp, 4, 3, 'new link');
             this.verifyCellContent(cmp, 4, 4, '');
             this.verifyCellContent(cmp, 4, 5, false);
         }]
     },
     
     /**
      * Test update picklist
      */
     // Disabled because enter key event is not being fired and
     // clicking out does not save value
     _testUpdatePicklist : {
         test : [function(cmp) {
             this.triggerEditOnCell(cmp, 0, 8);
         }, function(cmp) {
             this.waitForPanelOpen(cmp);
         }, function(cmp) {
             this.verifyPanelContent(cmp, 'A');
             this.editPanel(cmp, 'O', 0, true);
         }, function(cmp) {
             this.waitForPanelClose(cmp);
         }, function(cmp) {
             this.waitForCellContent(cmp, 0, 8, 'O');
         }]
     },
     
     /**
      * Test update checkbox
      */
     testUpdateCheckbox : {
         test : [function(cmp) {
             this.verifyCellEditStatus(cmp, 0, 5, false);
             this.triggerEditOnCell(cmp, 0, 5);
         }, function(cmp) {
             this.waitForPanelOpen(cmp);
         }, function(cmp) {
             this.verifyPanelContent(cmp, false);
             this.editPanel(cmp, true, 0);
         }, function(cmp) {
             this.waitForPanelClose(cmp);
         }, function(cmp) {
             this.verifyCellContent(cmp, 0, 5, true);
             //this.verifyCellEditStatus(cmp, 0, 5, true);
         }]
     },
     
     /**
      * Test update a cell with percent
      */
     testUpdatePercent : {
         test : [function(cmp) {
             this.triggerEditOnCell(cmp, 0, 9);
         }, function(cmp) {
             this.waitForPanelOpen(cmp);
         }, function(cmp) {
             this.verifyPanelContent(cmp, 0.98);
             this.editPanel(cmp, 1.01, 0);
         }, function(cmp) {
             this.waitForPanelClose(cmp);
         }, function(cmp) {
             this.waitForCellContent(cmp, 0, 9, '101%');
         }]
     },
     
     /**
      * Test update a cell with currency
      */
     testUpdateCurrency : {
         test : [function(cmp) {
             this.verifyCellEditStatus(cmp, 0, 10, false);
             this.triggerEditOnCell(cmp, 0, 10);
         }, function(cmp) {
             this.waitForPanelOpen(cmp);
         }, function(cmp) {
             this.verifyPanelContent(cmp, 1234.56);
             this.editPanel(cmp, 101.99, 0);
         }, function(cmp) {
             this.waitForPanelClose(cmp);
         }, function(cmp) {
             this.waitForCellContent(cmp, 0, 10, '$101.99');
             this.verifyCellEditStatus(cmp, 0, 10, true);
         }]
     },
     
     /**
      * Test column header names.
      */
     testColumnHeaderNames : {
         test : function(cmp) {
             var expectedColNames = ['Id', 'Name', 'Grade', 'Link', 'Issue Date', 'Passing', 
                             'Notes', 'Modified', 'Blood Type', 'Progress', 'Dues'];
             var headers = this.getHeaderRow();
             this.verifyHeaderColumnNames(expectedColNames, headers);
         }
     },
          
     triggerEditOnCell : function(cmp, rowIndex, colIndex) {
         var tbody = document.getElementsByTagName("tbody")[0];
         var trs = this.getOnlyTrs(tbody.children);      
         var trigger = trs[rowIndex].children[colIndex].querySelector('.triggerContainer button');
         $A.test.clickOrTouch(trigger);
     },
     
     getOnlyTrs : function(elements) {
         var elementArray = [];

         for (var i = 0; i < elements.length; i++) {
             if (elements[i].tagName == 'TR') {
                 elementArray.push(elements[i]);
             }
         }
         return elementArray;
     },
     
     waitForRows : function(rowCount) {
         var that = this;
         $A.test.addWaitForWithFailureMessage(rowCount, function() {
             var tbody = document.getElementsByTagName("tbody")[0];
             var trs = that.getOnlyTrs(tbody.children);
             return trs.length;
         }, "Number of rows expected is incorrect.");
     },
     
     triggerAppend : function(cmp) {
         cmp.find("appendButton").get("e.press").fire();
     },
     
     getPanelFromDomElement : function(cmp, panelIndex) {
         panelIndex = panelIndex ? panelIndex : 0;
         var panels = $A.test.getElementByClass(this.EDIT_PANEL_CLASS);
         if (!panels || (0 < panelIndex > panels.length)) {
             return undefined;
         }
         var panel = panels[panelIndex];
         var htmlCmp = $A.componentService.getRenderingComponentForElement(panel);
         return htmlCmp.getAttributeValueProvider ? 
        		 htmlCmp.getAttributeValueProvider() : undefined;
     },
     
     waitForPanelOpen : function(cmp) {
         this.waitForPanel(cmp, true);
     },
     
     waitForPanelClose : function(cmp) {
         this.waitForPanel(cmp, false);
     },
     
     waitForPanel : function(cmp, isOpen) {
         var panelClass = this.EDIT_PANEL_CLASS;
         $A.test.addWaitForWithFailureMessage(isOpen, function() {
             var panel = $A.test.getElementByClass(panelClass);
             return !$A.util.isUndefinedOrNull(panel);
         }, 'Edit panel for cell is supposed to be open="' + isOpen + '" but was not');
     },
     
     getPanelContent : function(cmp, panelIndex) {
         panelIndex = panelIndex ? panelIndex : 0;
         var panel = this.getPanelFromDomElement(cmp, panelIndex);
         
         if (!$A.util.isUndefinedOrNull(panel)) {
             var input = panel.get('v.inputComponent')[0];
         
             if (input.getDef().getDescriptor().getQualifiedName() === 'markup://ui:inputCheckbox') {
                 return input.getElement().checked;
             } else {
                 return input.get('v.value');
             }
         }
         return undefined;
     },
     
     verifyPanelContent : function(cmp, expected, panelIndex) {
         panelIndex = panelIndex ? panelIndex : 0;
         var actual = this.getPanelContent(cmp, panelIndex);
         $A.test.assertEquals(expected, actual, 'Panel content did not match.');
     },
     
     waitForPanelContent : function(cmp, expected, panelIndex) {
         panelIndex = panelIndex ? panelIndex : 0;
         var that = this;
         var actual = '';
         $A.test.addWaitForWithFailureMessage(expected, function() {
             actual = that.getPanelContent(cmp, panelIndex);
             if (actual) {
                 return actual;
             } else {
                 // There is a test flapping issue where 2 panels are open at the same time.
                 // Probably test running too fast? Manually it does not happen. Hack is to
                 // add a second check to look for content in other panel.
                 var newPanelIndex = panelIndex == 0 ? panelIndex+1 : panelIndex-1;
                 actual = that.getPanelContent(cmp, newPanelIndex);
                 if (actual) {
                     return actual;
                 }
             }
             return  'Testing Error: Could not read panel content';
         }, 'Expected text in edit panel for cell is supposed to be "' + expected + '" but was "' + actual + '"');
     },
     
     editPanel : function(cmp, newInput, panelIndex, isClickOut) {
         panelIndex = panelIndex ? panelIndex : 0;
         var panel = this.getPanelFromDomElement(cmp, panelIndex);
         
         if (!$A.util.isUndefinedOrNull(panel)) {
             var input = panel.get('v.inputComponent')[0];
             var inputType = input.getDef().getDescriptor().getQualifiedName();
             
             if (inputType === 'markup://ui:inputCheckbox') {
                 $A.test.clickOrTouch(input.getElement());    
             } else if (inputType === 'markup://ui:inputSelect') {
                 $A.test.clickOrTouch(input.getElement());
                 var options = input.get('v.options');
                 
                 for (var i=0; i<options.length; i++) {
                     var option = options[i];
                     if (option.selected) {
                         option.selected = false;
                     }
                     if (option.value === newInput) {
                         option.selected = true;
                     }
                 }
                 input.set('v.options', options);
             } else {
                 input.set('v.value', newInput);
             }
        
             this.commitCellContent(isClickOut ? cmp : panel, isClickOut);
         }
     },
     
     commitCellContent : function(targetCmp, isClickOut) {
         if (isClickOut) {
             this.clickOutOfEditPanel(targetCmp)
         } else {
             var input = targetCmp.get("v.inputComponent")[0];
             input.getEvent("keydown").setParams({
                 keyCode : 13,
                 domEvent : {
                     type : "keydown",
                     preventDefault : function() {}
                 }
             }).fire();
         }
     },
     
     clickOutOfEditPanel : function(cmp) {
         var input = cmp.find('inputTxt').getElement();
         $A.test.clickOrTouch(input);
     },
     
     getCellElem : function(cmp, rowIndex, colIndex) {
         var tbody = document.getElementsByTagName('tbody')[0];
         var rows = this.getOnlyTrs(tbody.children);
         var col = rows[rowIndex].children[colIndex];
         return col;
     },
     
     getCmpFromElement : function(elem) {
         var htmlCmp = $A.componentService.getRenderingComponentForElement(elem);
         return htmlCmp.getAttributeValueProvider();
     },
     
     verifyCellContent : function(cmp, rowIndex, colIndex, expected) {
         var cell = this.getCellElem(cmp, rowIndex, colIndex);
         var cellCmp = this.getCmpFromElement(cell.children[0]);
         var outputCmp = cellCmp.get('v.body')[0];
         var actual = '';
         
         if (outputCmp.getDef().getDescriptor().getQualifiedName() === 'markup://ui:outputCheckbox') {
             actual = outputCmp.get('v.value');
             actual = actual ? actual : false;
         } else {
             actual = $A.test.getText(cell.querySelector('.cellContainer').firstChild);
         }
         $A.test.assertEquals(expected, actual, 'Cell value is incorrect');
     },
     
     waitForCellContent : function(cmp, rowIndex, colIndex, expected) {
         var that = this;
         var actual = '';
         $A.test.addWaitForWithFailureMessage(expected, function() {
             var cell = that.getCellElem(cmp, rowIndex, colIndex);
             actual = $A.test.getText(cell.querySelector('.cellContainer').firstChild);
             return actual;
         }, 'Cell value was not updated expecting "' + expected + '" but was "' + actual + '"');
     },
     
     verifyCellEditStatus : function(cmp, rowIndex, colIndex, isEdited) {
         var cell = this.getCellElem(cmp, rowIndex, colIndex);
         var cellCmp = this.getCmpFromElement(cell.children[0]);
         var actual = cellCmp.get('v.edited');
         actual = actual ? actual : false;
         $A.test.assertEquals(isEdited, actual, 'Cell\'s editied status is incorrect');
     },
     
     getHeaderRow : function() {
         var thead = document.getElementsByTagName('thead')[0];
         return thead.getElementsByTagName('th');
     },
     
     verifyHeaderColumnNames : function(expected, headers) {
         $A.test.assertEquals(expected.length, headers.length, 'Number of expected columns incorrect');
         for (var i=0; i<headers.length; i++) {
             var colText = $A.test.getText(headers[i]).replace('Sort ', ''); //Ignoring sort assistive text
             $A.test.assertEquals(expected[i], colText, 'Column header label incorrect');
         }
     }
 })
