({
	testDatePickerVisible: {
		test:function(component){
        	var input_date = component.find("dlh_inputDate");
            var date_picker_opener = input_date.find("datePickerOpener");
            date_picker_opener.getElement().click();
            //sanity test, verify date picker show up after click on the opener
            var date_picker = input_date.find("datePicker");
            $A.test.assertTrue(date_picker.get("v.visible"));
        }
	},
	
	testDocumentLevelHandler:{
        test:function(component){
        	var input_date = component.find("dlh_inputDate");
            var date_picker_opener = input_date.find("datePickerOpener");
            date_picker_opener.getElement().click();
            //date picker should disappear when click anywhere outside of it, like on the outputText
            var output_text = component.find("dlh_outputText").getElement();
        	$A.test.fireDomEvent(output_text, "mouseup");
        	var date_picker = input_date.find("datePicker");
        	$A.test.assertFalse(date_picker.get("v.visible"));
        	
        }
    }
})