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
	
	WIDTHS : {
		initialWidths  : [200, 400, 100, 50],
		smallerWidths  : [100, 300, 75, 50],
		smallestWidths : [50, 50, 50, 50]
	},
	
	COLUMNS : ["Id", "Name", "Grade", "Actions"],
	
	testHandlesExist : {
		test : function(cmp) {
			var grid = cmp.find("grid");
			var columns = grid.getElement().querySelector('th');
			
			for (var i=0; i<columns.length; i++) {
				$A.test.assertDefined(columns[i].querySelector('.handle'), "Column " + i + " doesn't have a handle.");
			}
		}
	},
	
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
		    this.waitForResize(cmp, 0, this.WIDTHS.initialWidths[0]);
		}, function(cmp) {
			var grid = cmp.find("grid");
			var columns = grid.getElement().querySelectorAll('th');
			
			for (var i=0; i<columns.length; i++) {
				$A.test.assertEquals(columns[i].clientWidth, this.WIDTHS.smallerWidths[i], "Column " + i + " has an incorrect width.");
			}
			
		}]
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
		}
		        
		]
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
	},
	
	waitForResize : function(cmp, columnIndex, initialSize) {
        $A.test.addWaitForWithFailureMessage(true, function(){
            var columns = cmp.find('grid').getElement().querySelectorAll('th');
            return columns[columnIndex].clientWidth !== initialSize;
        }, 'Column width did not change at columnIndex = ' + columnIndex +
            ' and initial size was ' + initialSize);
    }
})