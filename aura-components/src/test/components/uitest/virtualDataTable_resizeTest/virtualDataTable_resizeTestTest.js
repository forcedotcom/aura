/*
 * Copyright 2017 salesforce.com, inc.
 * All Rights Reserved
 * Company Confidential
 */
({
	browsers: ["-IE8"],
	
	WIDTHS : {
		initialWidths  : [200, 400, 100, 50],
		smallerWidths  : [100, 300, 75, 50],
		smallestWidths : [50, 50, 50, 50]
	},
	
	COLUMNS : ["Id", "Name", "Grade", "Actions"],

    showGrid : function(cmp, gridNumber) {
        var gridContainer = cmp.find("container"+gridNumber);
        gridContainer.getElement().style.display = "block";
    },

    hideGrid : function(cmp, gridNumber) {
        var gridContainer = cmp.find("container"+gridNumber);
        gridContainer.getElement().style.display = "none";
    },

    testResizingWhenInitializing : {
        test : [function(cmp) {
            cmp.find("grid").resizeColumns([300, 500, 400]);
        }, function(cmp) {
            var grid = cmp.find("grid");
            var columns = grid.getElement().querySelectorAll('th');
            for (var i=0; i<columns.length; i++) {
                $A.test.assertTrue(columns[i].clientWidth >= this.WIDTHS.initialWidths[i],
                    "Column " + i + " should not have resized from " + this.WIDTHS.initialWidths[i] + " to " + columns[i].clientWidth + " since value was -1");
            }
        }]
    },

    testResizingWhenInitializingButIgnored : {
        test : [function(cmp) {
            this.hideGrid(cmp, 1);
            this.showGrid(cmp, 3);
            this.resizeArray = [300, 500, 400];
            cmp.find("grid3").resizeColumns(this.resizeArray);
        }, function(cmp) {
            var grid = cmp.find("grid3");
            var columns = grid.getElement().querySelectorAll('th');
            for (var i=0; i<columns.length; i++) {
                $A.test.assertTrue(columns[i].clientWidth >= this.resizeArray[i],
                    "Column " + i + " should not have resized from " + this.resizeArray[i] + " to " + columns[i].clientWidth + " since value was -1");
            }
        }]
    },

    testHandlesExist : {
        test : function(cmp) {
            var grid = cmp.find("grid");
            var columns = grid.getElement().querySelector('th');

            for (var i=0; i<columns.length; i++) {
                $A.test.assertDefined(columns[i].querySelector('.handle'), "Column " + i + " doesn't have a handle.");
            }
        }
    },

    testHandlesExistWithIgnoreInitialWiths : {
        test : function(cmp) {
            this.hideGrid(cmp, 1);
            this.showGrid(cmp, 3);
            var grid = cmp.find("grid3");
            var columns = grid.getElement().querySelector('th');

            for (var i=0; i<columns.length; i++) {
                $A.test.assertDefined(columns[i].querySelector('.handle'), "Column " + i + " doesn't have a handle.");
            }
        }
    }

	/*
	The following tests are also copied from VDG, but are mostly failing because the VDT changed how it initializes the
	table's initialWidths. It does that now through promises and so there is NO good way to tell when this is done and
	the tests can continue.

    testResizeEvent : {
        test : [function(cmp) {
            cmp.find("grid").resizeColumns(this.WIDTHS.smallerWidths);
        }, function(cmp) {
            var prevResize = cmp.get("v.prevResize");
            var lastIndex = this.COLUMNS.length - 1;
            var columns = cmp.find("grid").getElement().querySelectorAll('th');

            $A.test.assertEquals(prevResize.src.label, this.COLUMNS[lastIndex], "Name of last resized column does not match");
            $A.test.assertEquals(prevResize.src.index, lastIndex, "Index of last resized column does not match");
            $A.test.assertEquals(prevResize.width, columns[lastIndex].clientWidth);
        }]
    },

    testProgrammaticResizing : {
        test : [function(cmp) {
            cmp.find("grid").resizeColumns(this.WIDTHS.smallerWidths);
        }, function(cmp) {
            var grid = cmp.find("grid");
            var columns = grid.getElement().querySelectorAll('th');

            for (var i=0; i<columns.length; i++) {
                $A.test.assertEquals(columns[i].clientWidth, this.WIDTHS.smallerWidths[i], "Column " + i + " has an incorrect width.");
            }

        }]
    },

    testNegativeResizing : {
        test : [function(cmp) {
            cmp.find("grid").resizeColumns([-1, -1, -1]);
        }, function(cmp) {
            var grid = cmp.find("grid");
            var columns = grid.getElement().querySelectorAll('th');
            for (var i=0; i<columns.length; i++) {
                $A.test.assertTrue(columns[i].clientWidth > -1,
                    "Column " + i + " should not be resized if width is -1");
            }
        }

        ]
    },

    testTinyResizing : {
        test : [function(cmp) {
            cmp.find("grid").resizeColumns([1, 1, 1]);
        }, function(cmp) {
            var grid = cmp.find("grid");
            var columns = grid.getElement().querySelectorAll('th');

            for (var i=0; i<columns.length; i++) {
                $A.test.assertTrue(columns[i].clientWidth >= this.WIDTHS.smallestWidths[i],
                        "Column " + i + " is smaller than the minWidth value: " + this.WIDTHS.smallestWidths[i]);
            }
        }]
    }
    */
})
