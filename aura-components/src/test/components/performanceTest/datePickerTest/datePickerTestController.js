({
    setup : function(cmp, event, helper) {
        var done = event.getParam('arguments').done;
        var finishSetup = done.async();
        
        $A.createComponent("ui:datePicker",{
            "visible": true
        }, function(datePicker){
           cmp.datePicker = datePicker;
           finishSetup();
        });
    },
    
    run : function(cmp, event, helper) {
        cmp.find("datePickerContainer").set("v.body", cmp.datePicker);
        
        if(cmp.get("v.testHighlightRange") === true){
            cmp.datePicker.highlightRange('2015-12-31','2016-06-01');
        }
        
        event.getParam('arguments').done.immediate();
    },
    
    postProcessing : function(cmp, event, helper) {

    }   
})