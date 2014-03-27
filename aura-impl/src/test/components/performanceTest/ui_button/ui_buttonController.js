({
	changeLabel:function(cmp, event) {
            var button = cmp.find("button1");
            var mark="ui button label change time";
            //Set the text value in the ui:outputText component
             $A.mark(mark);
              button.set("v.label", "clicked");
             $A.endMark(mark);
	}

})