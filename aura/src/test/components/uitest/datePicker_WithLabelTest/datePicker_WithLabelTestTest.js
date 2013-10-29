({
	testDocumentLevelHandler:{
        //For iphone/ipad:
        //when the date picker is up, it suppose to take the whole screen. there is no 'other place' you can 'touch'
		browsers: ["-IPHONE","-IPAD"],
        test:function(component){
        	var input_date = component.find("dlh_inputDate");
            var date_picker = input_date.find("datePicker");
            date_picker.getValue("v.visible").setValue(true);
            //this rerender is necessary: we need dataPickerRenderer to updateGlobalEventListeners
            $A.rerender(component);
            //date picker should disappear when click anywhere outside of it, like on the outputText
            var output_text = document.getElementById("dlh_outputText");
            //one event is enough to make date picker disappear, just to simulate mouse click, we have both here
            $A.test.fireDomEvent(output_text, "mousedown");
            $A.test.fireDomEvent(output_text, "mouseup");
            $A.test.assertFalse(date_picker.get("v.visible"));
        }
    }
})