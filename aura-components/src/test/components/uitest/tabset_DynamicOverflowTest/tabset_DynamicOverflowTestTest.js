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
	browsers : ["-IE7","-IE8"],

	EXPECTED_TAB_HEADER_LABELS: ["tabTitle 1", "tabTitle 2", "tabTitle 3", "tabTitle 4 Long title here because i'm odd",
	                             "tabTitle 5", "tabTitle 6", "tabTitle 7", "tabTitle 8 Long title here because i'm odd",
	                             "tabTitle 9", "tabTitle 10", "tabTitle 11", "tabTitle 12 Long title here because i'm odd",
	                             "tabTitle 13", "tabTitle 14", "tabTitle 15", "tabTitle 16 Long title here because i'm odd",
	                             "tabTitle 17", "tabTitle 18", "tabTitle 19", "tabTitle 20 Long title here because i'm odd"],

     /**
 	 * Test tabs show up in overflow.
 	 */
 	testTabsInOverflow : {
 		attributes : {"numTabs" : 10, "headerWidth" : 200},
 		test: [function(cmp) {
            this.testContainer = "testTabContainerForAutomation";
 			this.pressCreateTabsForAutomation(cmp);
 			this.waitForTabsetPresent(cmp, this.testContainer);
        }, function(cmp) {
            // make sure overflow items are loaded
            this.waitForOverflowTabsLoaded(cmp, this.testContainer);
 		}, function(cmp) {
 			var expectedTabs = this.EXPECTED_TAB_HEADER_LABELS.slice(0,10);
 			var expectedTabsInOverflow = this.EXPECTED_TAB_HEADER_LABELS.slice(2,10);
 			this.verifyTabHeaders(cmp, this.testContainer, expectedTabs);
 			this.verifyTabsInOverflow(cmp, this.testContainer, expectedTabsInOverflow);
 		}]
     },

     /**
  	 * Test select a tab that is in the overflow
  	 */
  	testSelectTabInOverflow : {
  		test: [function(cmp) {
            this.testContainer = "testTabContainerForAutomation";
 			this.pressCreateTabsForAutomation(cmp);
 			this.waitForTabsetPresent(cmp, this.testContainer);
        }, function(cmp) {
            // make sure overflow items are loaded
            this.waitForOverflowTabsLoaded(cmp, this.testContainer);
 		}, function(cmp) {
 			// select 2rd tab in overflow (4th tab overall)
 			this.selectTabFromOverflow(cmp, this.testContainer, 2);
 			this.waitForTabVisible(cmp, this.testContainer, this.EXPECTED_TAB_HEADER_LABELS[3]);
 		}, function(cmp) {
 			// 4th tab overall is now in visible section while rest are in overflow
 			var expectedSelectedTab = this.EXPECTED_TAB_HEADER_LABELS[3];

 			// tabs in overflow are now ordered differently tabs 1-3 then 5-20
 			var expectedTabsInOverflow = this.EXPECTED_TAB_HEADER_LABELS.slice(0,3).concat(
 					this.EXPECTED_TAB_HEADER_LABELS.slice(4));

 			// overall order of tabs is tabs 4,1,2,3 followed by tabs 5-20
 			var expectedTabs = [expectedSelectedTab].concat(expectedTabsInOverflow);

 			// verify tabs and order
 			this.verifyTabHeaders(cmp, this.testContainer, expectedTabs);
 			this.verifyTabsInOverflow(cmp, this.testContainer, expectedTabsInOverflow);
 		}]
    },

    /**
     * Test single tab visible with rest in overflow
     */
    testSingleTabVislbe : {
    	test: [function(cmp) {
            this.testContainer = "testTabContainerFixed";
 			this.pressCreateMultipleTabs(cmp);
 			this.waitForTabsetPresent(cmp, this.testContainer);
        }, function(cmp) {
            // make sure overflow items are loaded
            this.waitForOverflowTabsLoaded(cmp, this.testContainer);
 		}, function(cmp) {
 			var expectedTabsInOverflow = this.EXPECTED_TAB_HEADER_LABELS.slice(1,20);
 			this.verifyTabHeaders(cmp, this.testContainer, this.EXPECTED_TAB_HEADER_LABELS);
 			this.verifyTabsInOverflow(cmp, this.testContainer, expectedTabsInOverflow);
 		}]
    },

    /**
     * Test single tab in overflow
     */
    testZeroTabInOverflow : {
    	attributes : {"numTabs" : 2},
    	test: [function(cmp) {
            this.testContainer = "testTabContainerFixed";
    		this.pressCreateMultipleTabs(cmp);
  			this.waitForTabsetPresent(cmp, this.testContainer);
  		}, function(cmp) {
  			var expectedTabs = this.EXPECTED_TAB_HEADER_LABELS.slice(0,2);
  			var expectedTabsInOverflow = [];
  			this.verifyTabHeaders(cmp, this.testContainer, expectedTabs);
  			this.verifyTabsInOverflow(cmp, this.testContainer, expectedTabsInOverflow);
  		}]
    },

	pressCreateTabs: function(cmp) {
		cmp.find("btnCreateTabs").get("e.press").fire();
	},

	pressCreateMultipleTabs: function(cmp) {
		cmp.find("btnCreateMultiTabsets").get("e.press").fire();
	},

	pressCreateTabsForAutomation: function(cmp) {
		cmp.find("btnCreateTabsetsForAutomation").get("e.press").fire();
	},

	pressAddTab: function(cmp) {
		cmp.find("btnAddTab").get("e.press").fire();
	},

	pressRemoveTab: function(cmp) {
		cmp.find("btnRemoveTab").get("e.press").fire();
	},

	pressChangeHeaderTitle: function(cmp) {
		cmp.find("btnChangeHeaderTitle").get("e.press").fire();
	},

    getOverflowMenu: function(cmp, containerName) {
        var tabset = this.getTabset(cmp, containerName);
        return tabset.find("tabBar").find("overflowMenu");
    },

	selectTabFromOverflow: function(cmp, containerName, tabNumInOverflow) {
        var overflowMenu = this.getOverflowMenu(cmp, containerName);
		var overflowItems = overflowMenu.find("menuList").get("v.childMenuItems");
		overflowItems[tabNumInOverflow-1].get("e.click").fire();
	},

	getTabset: function(cmp, containerName) {
		 return cmp.find(containerName).get("v.body")[0];
	},

	getTabs: function(cmp, containerName) {
		var tabset = this.getTabset(cmp, containerName);
		return tabset.get("v.tabs");
	},

	waitForTabsetPresent: function(cmp, containerName) {
		$A.test.addWaitForWithFailureMessage(true, function(){
    		return cmp.find(containerName).getElement().style.display === "block";
    	}, "Test tabset(s) were not loaded: " + containerName);
	},

	waitForTabVisible: function(cmp, containerName, targetTabLabel) {
		var that = this;
		var visibleTabs = [];
		$A.test.addWaitForWithFailureMessage(true, function(){
			visibleTabs = that.getTabHeadersVisible(cmp, containerName);
			for (var i=0; i<visibleTabs.length; i++) {
				if (targetTabLabel === visibleTabs[i]) {
					return true;
				}
			}
			return false;
		}, "Tab '" + targetTabLabel + "' was not selected and/or is not in visible area of tabset. " +
			"Visible tabs are:" + visibleTabs);
	},

	// verify tabs from CMP is same as tabs from DOM as well as verify the order of tabs in DOM
	verifyTabHeaders: function(cmp, containerName, expectedTabs) {
		var tabsFromCmp = this.getTabHeadersFromCmp(cmp, containerName);
		var tabsFromDom = this.getTabHeadersFromDom(cmp, containerName);

		$A.test.assertEquals(expectedTabs.length, tabsFromCmp.length, "Incorrect number of tabs retrieved from CMP");
		$A.test.assertEquals(expectedTabs.length, tabsFromDom.length, "Incorrect number of tabs retrieved from DOM");

		this.verifyTabHeadersOrder(expectedTabs, tabsFromDom);
	},

	verifyTabHeadersOrder: function(expectedTabs, actualTabs) {
		for (var i=1; i<=expectedTabs.length; i++) {
			var expectedLabel = expectedTabs[i];
			var actualLabel = actualTabs[i];
			$A.test.assertEquals(expectedLabel, actualLabel, "Label is incorrect at position " + i);
		}
	},

	getTabHeadersFromCmp: function(cmp, containerName) {
		var tabs = this.getTabs(cmp, containerName);
		var tabLabels = [];

		for (var i=0; i<tabs.length; i++) {
			tabLabels.push(tabs[i].title);
		}

		return tabLabels;
	},

	getTabHeadersFromDom: function(cmp, containerName) {
		var visibleTabs = this.getTabHeadersVisible(cmp, containerName);
		var overflowTabs = this.getTabHeadersInOverflow(cmp, containerName);
		return visibleTabs.concat(overflowTabs);
	},

	getTabHeadersVisible: function(cmp, containerName) {
		var containerEl = cmp.find(containerName).getElement();
		var tabs = containerEl.getElementsByTagName("ul");
		var tabsVisible = [];
		var tabLabelsVisible = [];

		// tabs not in overflow
		if (tabs.length > 0) {
			var allTabs = tabs[0].getElementsByTagName("li");
			for (var i=0; i<allTabs.length; i++) {
				var tab = allTabs[i]
				if ($A.util.hasClass(tab,"uiTabItem")
						&& !$A.util.hasClass(tab, "hidden")) {
					tabLabelsVisible.push($A.util.getText(tab));
				}
			}
		}

		return tabLabelsVisible;
	},

	getTabHeadersInOverflow: function(cmp, containerName) {
		var containerEl = cmp.find(containerName).getElement();
		var tabs = containerEl.getElementsByTagName("ul");
		var tabsOverflow = [];
		var tabLabelsInOverflow = [];

		if (tabs.length > 1) {
			tabsOverflow = tabs[1].getElementsByTagName("li");
		}

		for (var i=0; i<tabsOverflow.length; i++) {
			tabLabelsInOverflow.push($A.util.getText(tabsOverflow[i]));
		}

		return tabLabelsInOverflow;
	},

	verifyTabsInOverflow: function(cmp, containerName, expectedTabsInOverflow) {
		var actualTabsInOverflow =  this.getTabHeadersInOverflow(cmp, containerName);

		$A.test.assertEquals(expectedTabsInOverflow.length, actualTabsInOverflow.length, "Incorrect number of tabs in overflow");

		for (var i=1; i<=expectedTabsInOverflow.length; i++) {
			var expectedLabel = expectedTabsInOverflow[i];
			var actualLabel = actualTabsInOverflow[i];
			$A.test.assertEquals(expectedLabel, actualLabel, "Incorret tab at position " + i);
		}
	},

    waitForOverflowTabsLoaded: function(cmp, containerName) {
        var overflowMenu = this.getOverflowMenu(cmp, containerName);
        // Open the menu, so that the elements get rendered
        overflowMenu.getElement().getElementsByTagName("a")[0].click();
        $A.test.addWaitForWithFailureMessage(true, function() {
            return overflowMenu.getElement().getElementsByTagName("li").length > 0;
        }, "No tabs in overflow are loaded!");
    }
})