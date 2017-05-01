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
  
  selector: {
      vMenuWithTriggerLabel: ".menuWithTriggerLabel.virtualMenuContainer",
      vMenuWithCustomTriggerBody: ".menuWithCustomTriggerBody.virtualMenuContainer",
      menuList: ".uiMenu .uiMenuList"
  },
  
  /**************************************************HELPER FUNCTIONS**************************************************/
  
  compareArray: function(arr1, arr2, errorMessage) {
      $A.test.assertEquals(arr1.length, arr2.length, errorMessage);
      for (var i = 0; i < arr1.length; i++) {
          $A.test.assertEquals(JSON.stringify(arr1[i]), JSON.stringify(arr2[i]),errorMessage)
      }
  },
  
  getRenderedRows : function(cmp) {
      var tbody = this.getRenderedItems();
      var rows = [];
      for (var j = 0; j < tbody.length; j++) {
          var row = {};
          row["_id"] = parseInt(this.getItemRenderedValue(tbody[j], "id"));
          
          row["index"] = parseInt(this.getItemRenderedValue(tbody[j], "index"));
          row["balance"] = parseInt(this.getItemRenderedValue(tbody[j], "balance"));
          row["name"] = this.getItemRenderedValue(tbody[j], "name");
          row["friends"] = [];
          for (var k = 0; k < 3; k++) {
              row["friends"][k] = {};
              row["friends"][k]["id"] = k;
              row["friends"][k]["name"] = $A.test.getText(tbody[j].getElementsByTagName("li")[k]);
          }
          row["counter"] = parseInt(this.getItemRenderedValue(tbody[j], "counter"));
          row["key"] = (row["index"] % 3 === 0) ? 'simple' : 'complex';
          rows.push(row);
      }
      return rows;
  },
  
  getRenderedItems: function(){
      return $A.test.select(".item");
  },
  
  getItemRenderedValue : function(element, columnName){
      return $A.test.getText(element.getElementsByClassName(columnName)[0].getElementsByTagName("span")[0]);
  },
  
  getInfoButton : function(rowNumber){
      return $A.test.select(".showItemInfo")[rowNumber-1];
  },
  
  getChangeNameButton : function(rowNumber){
      return $A.test.select(".changeNameButton")[rowNumber-1];
  },
  
  

  /**************************************************HELPER FUNCTIONS END**************************************************/
  
  testVirtualListRenderedCorrectly : {
      test :function(cmp) {
              // test initial state
              var initialData = cmp.find("list").get("v.items");
              var renderedData = this.getRenderedRows(cmp);
              this.compareArray(initialData, renderedData, "The virtualList rendered data correctly");
          }
  },
  
  /**
   * Switching data provider renders virtualList correctly.
   * Bug: W-2620483
   */
  testSwapRowsOnVirtualListReRendersCorrectly : {
      test : [function(cmp){
          // test initial state
          var initialData = cmp.find("list").get("v.items");
          var renderedData = this.getRenderedRows(cmp);
          this.compareArray(initialData, renderedData, "The virtualList rendered data correctly");
      }, function(cmp) {
          emptyDataButton = $A.test.select(".kitchenButtonEmptyData")[0];
          $A.test.clickOrTouch(emptyDataButton);
      }, function(cmp) {
          $A.test.assertFalsy(this.getRenderedItems().length, "There should be no Items in the virtual List")
      }, function(cmp) {
          emptyDataButton = $A.test.select(".kitchenButton")[0];
          $A.test.clickOrTouch(emptyDataButton);
      }, function(cmp) {
          var initialData = cmp.find("list").get("v.items");
          var renderedData = this.getRenderedRows(cmp);
          this.compareArray(initialData, renderedData, "The virtualList re-rendered data correctly");
      }, function(cmp) {
          emptyDataButton = $A.test.select(".kitchenButtonEmptyData")[0];
          $A.test.clickOrTouch(emptyDataButton);
      }, function(cmp) {
          $A.test.assertFalsy(this.getRenderedItems().length, "There should be no Items in the virtual List")
      }]
  },
  
  /**
   * Verify Virtual List works with large Number of Items
   */
  _testWithLargeData : {
	  labels : ["extended"],
      attributes : {"pageSize" : 3000},
      test : function(cmp){
          var initialData = cmp.find("list").get("v.items");
          var renderedData = this.getRenderedRows(cmp);
          this.compareArray(initialData, renderedData, "The virtualList rendered data correctly");
      }
  },
  
  /**
   * Test verifying that when there is no data present dataGrid does not fail
   */
  testNoDataPresent : {
      attributes : {"pageSize" : 0},
      test : function(cmp){
          $A.test.assertFalsy(this.getRenderedItems().length, "There should be no Items in the virtual List")
      }
  },
  
  /**
   * Test verifying that when there is no data present dataGrid does not fail
   */
  testActionOnItem : {
      test : [function(cmp){
            initialData = cmp.find("list").get("v.items");
            initialRenderedData = this.getRenderedRows(cmp);
            rowNumber = 10;
            var changeNameBtn = this.getChangeNameButton(rowNumber);
            $A.test.clickOrTouch(changeNameBtn);
      }, function(cmp) {
	    	expectedString = "Expected Name Change";
	    	expectedName = $A.test.getText($A.test.select(".expectedNameChange")[rowNumber-1]);
	    	$A.test.addWaitForWithFailureMessage(true, function(){return $A.test.contains(expectedName, expectedString);}, "Name should be changed");
	    	$A.test.assertTrue($A.test.contains(expectedName, initialData[rowNumber-1].name), "Name is not changed correcly for Row "+ rowNumber);
    	  	var renderedData = this.getRenderedRows(cmp);
            this.compareArray(initialData, renderedData, "The virtualList rendered data correctly after Row "+ rowNumber +" was changed");
            initialRenderedData.splice(rowNumber-1, 1);
            renderedData.splice(rowNumber-1, 1);
            this.compareArray(initialRenderedData, renderedData, "The virtualList did not render data correctly  after Row "+ rowNumber +" was changed");
            rowNumber = 25;
            var changeNameBtn = this.getChangeNameButton(rowNumber);
            $A.test.clickOrTouch(changeNameBtn);
      }, function(cmp) {
            expectedName = $A.test.getText($A.test.select(".expectedNameChange")[rowNumber-1]);
	    	$A.test.addWaitForWithFailureMessage(true, function(){return $A.test.contains(expectedName, expectedString);}, "Name should be changed");
	    	$A.test.assertTrue($A.test.contains(expectedName, initialData[rowNumber-1].name), "Name is not changed correcly for Row "+ rowNumber);
    	  	var renderedData = this.getRenderedRows(cmp);
            this.compareArray(initialData, renderedData, "The virtualList rendered data correctly after Row "+ rowNumber +" was changed");
      }]
  },
  
  /**
   * Test verifying that virtualMenuWrapper allows lazily loading menu in virtual list
   */
  testMenuLazyLoaded: {
      attributes: {
          pageSize: 1
      },
      test: function(cmp) {
          var menuListSel = this.selector.vMenuWithTriggerLabel + " " + this.selector.menuList;
          var menu = $A.test.select(menuListSel)[0];
          $A.test.assertUndefinedOrNull(menu);

          var triggerSel = this.selector.vMenuWithTriggerLabel + " a";
          var trigger = $A.test.select(triggerSel)[0];
          $A.test.clickOrTouch(trigger);

          $A.test.addWaitForWithFailureMessage(true, function() {
              return !!$A.test.select(menuListSel)[0];
          }, "Menu list should exist after menu link is triggered.");
      }
  }
})
