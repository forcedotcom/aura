({

	/**
	 * Test Flow:
	 * For each position:
	 * 1. Check if datepicker is closed
	 * 2. Click on calendar icon in inputDate to open datePicker
	 * 3. Wait for datePicker to open
	 * 4. Check if datePicker is positioned below the inputDate and aligned to its left margin
	 * 5. Click on random date
	 * 6. Click on forward button and wait for the position of inputDate to be updated
	 */
	

	testPositioning: {
        test:  function(cmp) {
           	//trying 9 times since there 9 different positions to check at
        	this.checkEachPosition(cmp, 9);
        }  
    },
	    
    checkEachPosition : function(cmp, numberOfTries) {
    	var self = this;

    	self.checkDatePickerClosed(cmp, function(){
    		self.openDatePicker(cmp, function(){
    			if (numberOfTries > 1){
					numberOfTries--;

	    			self.goForward(cmp, function(){
						self.checkEachPosition(cmp, numberOfTries);
	    			}); 
	    		}
    		});	
    	});
    },

	checkDatePickerClosed : function(cmp, callback) {
		var datePicker = cmp.find('inputDate').find('datePicker').getElement();
		$A.test.addWaitForWithFailureMessage(false, function(){
			return $A.util.hasClass(datePicker,"visible");
		},"datePicker didn't close", callback);
	},
	
	openDatePicker : function(cmp, callback) {
		var epsilon = 2;
		var calendarIcon = $A.test.select('.datePicker-openIcon')[0];
		$A.test.clickOrTouch(calendarIcon);
		
		$A.test.addWaitForWithFailureMessage(true, function(){		
	        var inputDateDiv = cmp.find('inputDateDiv').getElement();
	        var datePicker = cmp.find('inputDate').find('datePicker').getElement();
		    
		    //check if datePicker has opened up
		    if(($A.util.hasClass(datePicker,"visible"))) {
	            var windowDimensions = $A.util.getWindowSize();
	            var datePickerRect = datePicker.getBoundingClientRect();
	            var inputDateRect = cmp.find('inputDate').getElement().getBoundingClientRect();

	            // check if datePicker is positioned immediately below inputDate and if its left margin is aligned to left margin of inputDate
	            if(((datePickerRect.top + epsilon) >= inputDateRect.bottom) && ((datePickerRect.top - epsilon) <= inputDateRect.bottom)
	            		&& (datePickerRect.left + epsilon >= 0)
	            		&& (datePickerRect.top + epsilon >= 0)
	            		&& (datePickerRect.left + epsilon >= inputDateRect.left) && (datePickerRect.left - epsilon <= inputDateRect.left)){
	            	return true;
	        	}	
	        return false;
	        }          
   		}, "Date Picker not visible or was not visible at the correct position", callback);
	},
	
	goForward : function(cmp,callback) {
		var previousRect = $A.test.select('form.uiInputDate input')[0].getBoundingClientRect();
		var randomDate = $A.test.getElementByClass('uiDayInMonthCell')[0];
		$A.test.clickOrTouch(randomDate);

		var forward = cmp.find('forwardBtn').getElement();  
		$A.test.clickOrTouch(forward);
		
		//wait for inputDate to move forward and update its position
		$A.test.addWaitForWithFailureMessage(true, function(){
				var curRect = $A.test.select('form.uiInputDate input')[0].getBoundingClientRect();
				return previousRect.top !== curRect.top || previousRect.left !== curRect.left;
			},'inputDate has not updated its position', callback);
	},

})