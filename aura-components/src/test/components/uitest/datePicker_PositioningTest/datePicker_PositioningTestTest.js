({

	/**
	 * Test Flow:
	 * For each position:
	 * 1. Set the inputDate at the correct position on screen
	 * 2. Check if datepicker is closed initially
	 * 3. Click on calendar icon in inputDate to open datePicker
	 * 4. Wait for datePicker to open
	 * 5. Check if datePicker is positioned below the inputDate and aligned to its left margin
	 */

	testDPPositioningAtPos1 : {
		browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
		test : [
		        function(cmp) {
		        	this.setPosition(cmp, "1");
		        },
		        function(cmp) {
		        	this.verifyDatePickerIsClosed(cmp);
		        },
		        function (cmp) {
		        	this.openDatePicker(cmp);
		        },
		        function (cmp) {
		        	this.verifyDatePickerPositioning(cmp);
		        }
		        ]
	},
	testDPPositioningAtPos2 : {
		browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
		test : [
		        function(cmp) {
		        	this.setPosition(cmp, "2");
		        },
		        function(cmp) {
		        	this.verifyDatePickerIsClosed(cmp);
		        },
		        function (cmp) {
		        	this.openDatePicker(cmp);
		        },
		        function (cmp) {
		        	this.verifyDatePickerPositioning(cmp);
		        }
		        ]
	},
	testDPPositioningAtPos3 : {
		browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
		test : [
		        function(cmp) {
		        	this.setPosition(cmp, "3");
		        },
		        function(cmp) {
		        	this.verifyDatePickerIsClosed(cmp);
		        },
		        function (cmp) {
		        	this.openDatePicker(cmp);
		        },
		        function (cmp) {
		        	this.verifyDatePickerPositioning(cmp);
		        }
		        ]
	},
	testDPPositioningAtPos4 : {
		browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
		test : [
		        function(cmp) {
		        	this.setPosition(cmp, "4");
		        },
		        function(cmp) {
		        	this.verifyDatePickerIsClosed(cmp);
		        },
		        function (cmp) {
		        	this.openDatePicker(cmp);
		        },
		        function (cmp) {
		        	this.verifyDatePickerPositioning(cmp);
		        }
		        ]
	},
	testDPPositioningAtPos5 : {
		browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
		test : [
		        function(cmp) {
		        	this.setPosition(cmp, "5");
		        },
		        function(cmp) {
		        	this.verifyDatePickerIsClosed(cmp);
		        },
		        function (cmp) {
		        	this.openDatePicker(cmp);
		        },
		        function (cmp) {
		        	this.verifyDatePickerPositioning(cmp);
		        }
		        ]
	},

	testDPPositioningAtPos6 : {
		browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
		test : [
		        function(cmp) {
		        	this.setPosition(cmp, "6");
		        },
		        function(cmp) {
		        	this.verifyDatePickerIsClosed(cmp);
		        },
		        function (cmp) {
		        	this.openDatePicker(cmp);
		        },
		        function (cmp) {
		        	this.verifyDatePickerPositioning(cmp);
		        }
		        ]
	},
	testDPPositioningAtPos7 : {
		browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
		test : [
		        function(cmp) {
		        	this.setPosition(cmp, "7");
		        },
		        function(cmp) {
		        	this.verifyDatePickerIsClosed(cmp);
		        },
		        function (cmp) {
		        	this.openDatePicker(cmp);
		        },
		        function (cmp) {
		        	this.verifyDatePickerPositioning(cmp);
		        }
		        ]
	},
	testDPPositioningAtPos8 : {
		browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
		test : [
		        function(cmp) {
		        	this.setPosition(cmp, "8");
		        },
		        function(cmp) {
		        	this.verifyDatePickerIsClosed(cmp);
		        },
		        function (cmp) {
		        	this.openDatePicker(cmp);
		        },
		        function (cmp) {
		        	this.verifyDatePickerPositioning(cmp);
		        }
		        ]
	},
	testDPPositioningAtPos9 : {
		browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET", "-IPHONE", "-IPAD"],
		test : [
		        function(cmp) {
		        	this.setPosition(cmp, "9");
		        },
		        function(cmp) {
		        	this.verifyDatePickerIsClosed(cmp);
		        },
		        function (cmp) {
		        	this.openDatePicker(cmp);
		        },
		        function (cmp) {
		        	this.verifyDatePickerPositioning(cmp);
		        }
		        ]
	},

	setPosition : function(cmp, position) {
		 var newClass = "pos" + position;
		 var inputDateDiv = cmp.find('inputDateDiv').getElement();
		 cmp.find("pos1").set('v.value', "Position 1");

		 cmp.set('v.pos', position);
		 cmp.find(newClass).set('v.value', '');
		 $A.util.swapClass(inputDateDiv, "pos1", newClass);
	},

	verifyDatePickerIsClosed : function (cmp) {
		var datePicker = cmp.find('inputDate').find('datePicker').getElement();
		$A.test.addWaitForWithFailureMessage(false, function(){
			return $A.util.hasClass(datePicker,"visible");
		},"datePicker didn't close");
	},

	openDatePicker : function(cmp) {

		var calendarIcon = $A.test.select('.datePicker-openIcon')[0];
		$A.test.clickOrTouch(calendarIcon);

		$A.test.addWaitForWithFailureMessage(true, function(){
	        var datePicker = cmp.find('inputDate').find('datePicker').getElement();
		    if(($A.util.hasClass(datePicker,"visible"))) {
	          return true;
	        }
		    return false;
   		}, "Date Picker not visible or was not visible at the correct position");
	},

	verifyDatePickerPositioning : function(cmp) {

		var datePicker = cmp.find('inputDate').find('datePicker').getElement();
	    var datePickerRect = datePicker.getBoundingClientRect();
	    var inputDateRect = cmp.find('inputDate').getElement().getBoundingClientRect();
		var helper = this;

		$A.test.addWaitForWithFailureMessage(true, function(){
			//this is the accepted delta in the positioning of the datePicker with respect to the inputDate
			var epsilon = 15;
		    datePickerRect = datePicker.getBoundingClientRect();
		    inputDateRect = cmp.find('inputDate').getElement().getBoundingClientRect();

		    var checkDatePickerVerticalAlignment = helper.checkDatePickerBelowInput(datePickerRect, inputDateRect, epsilon) ||
                helper.checkDatePickerFlipped(datePickerRect, inputDateRect, epsilon);

		    var checkDatePickerHorizontalAlignment = helper.checkDatePickerLeftAligned(datePickerRect, inputDateRect, epsilon) ||
                helper.checkDatePickerRightAligned(datePickerRect, inputDateRect, epsilon);

	        return checkDatePickerVerticalAlignment && checkDatePickerHorizontalAlignment;

   		}, "Date Picker not visible or was not visible at the correct position. **DEBUG INFO**:\n datePickerTop=" + datePickerRect.top + "; inputDateBottom=" + inputDateRect.bottom + "; datePickerLeft=" + datePickerRect.left+ "; inputDateLeft=" + inputDateRect.left +"\n");
	},

	checkDatePickerBelowInput : function(datePickerRect, inputDateRect, epsilon) {
		// check if datePicker is positioned immediately below inputDate and if its left margin is aligned to left margin of inputDate
		return (datePickerRect.top + epsilon >= inputDateRect.bottom) &&
				(datePickerRect.top - epsilon <= inputDateRect.bottom) &&
				(datePickerRect.top + epsilon >= 0);
	},

	checkDatePickerFlipped : function(datePickerRect, inputDateRect, epsilon) {
		// check if datePicker is positioned immediately below inputDate and if its left margin is aligned to left margin of inputDate
		return (datePickerRect.bottom + epsilon >= inputDateRect.top) &&
				(datePickerRect.bottom - epsilon <= inputDateRect.top) &&
				(datePickerRect.bottom + epsilon >= 0);
	},

    checkDatePickerLeftAligned : function (datePickerRect, inputDateRect, epsilon) {
		return (datePickerRect.left + epsilon >= inputDateRect.left) &&
            (datePickerRect.left - epsilon <= inputDateRect.left) &&
            (datePickerRect.left + epsilon >= 0);
    },

	checkDatePickerRightAligned : function (datePickerRect, inputDateRect, epsilon) {
		return (datePickerRect.right + epsilon >= inputDateRect.right) &&
            (datePickerRect.right - epsilon <= inputDateRect.right) &&
            (datePickerRect.left + epsilon >= 0);
    }

})
