({
    testPosition: {
        test: function(cmp) {
			var positions = ["pos1", "pos2", "pos3", "pos4", "pos5", "pos6", "pos7", "pos8", "pos9"]; //class names of various positions on the page - order matters
        	var moveForward = this.getMoveForward(cmp);	
        	for(var i = 0; i < positions.length; i++) {
				this.checkDatePicker(cmp, positions[i], moveForward);				
			}      	
        }
    },
    
    //helper functions
    getMoveForward : function (cmp) {
    	var forward = cmp.find('forwardBtn').getElement();  	
    	return function() {
    		$A.test.clickOrTouch(forward);
    	}		
	}, 
	
	checkDatePicker: function (cmp, position, moveForward) {
    	var epsilon = 1;
    	var calendarIcon = cmp.find('inputDate').find('datePickerOpener').getElement();
    	var datePicker = cmp.find('inputDate').find('datePicker').getElement();

    	$A.test.clickOrTouch(calendarIcon);
        $A.test.addWaitForWithFailureMessage(true, function(){
            var inputDateDiv = cmp.find('inputDateDiv').getElement();
           
            //check if datePicker is opened at the correct position
            if(($A.util.hasClass(inputDateDiv,position)) && ($A.util.hasClass(datePicker,"visible"))) {
                var windowDimensions = $A.util.getWindowSize();
                var datePickerRect = datePicker.getBoundingClientRect();
                var inputDateRect = cmp.find('inputDate').getElement().getBoundingClientRect();
                $A.test.assertTrue(datePickerRect.top >= 0, "top of datePicker going out of viewport for " + position);
                $A.test.assertTrue(datePickerRect.left >= 0, "left portion of datePicker going out of viewport for " + position);                          
                //$A.test.assertTrue(datePickerRect.bottom <= windowDimensions.height, "bottom of datePicker going out of viewport for " + position);
                //$A.test.assertTrue(datePickerRect.right <= windowDimensions.width, "right portion of datePicker going out of viewport for " + position);
                //$A.test.assertTrue((((datePickerRect.top + epsilon) >= inputDateRect.bottom) && ((datePickerRect.top - epsilon) <= inputDateRect.bottom)), "datePicker not positioned immediately below inputDate");
                $A.test.assertTrue(datePickerRect.left == inputDateRect.left, "datePicker not aligned to the left margin of inputDate");
                return true;
            }          
        }, "Date Picker not visible or was not visible at the correct position", moveForward);
    }
})