({
	changeCount:function(cmp, event) {
            var button = cmp.find("button1");
            var mark="ui button label change time";
            //Set the text value in the ui:outputText component
            var count = cmp.get("v.changeCount");
            count = ''+(1+count*1);
             $A.Perf.mark(mark);
              cmp.set("v.changeCount", count);
             $A.Perf.endMark(mark);
	}

})
