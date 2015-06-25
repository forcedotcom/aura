({
	addTab: function(cmp, evt, helper) {
        if (!cmp._counter) cmp._counter = 0;

        helper.addTab(
            cmp,
            "Dynamic " + cmp._counter,//title
            "Dynamic Content " + cmp._counter,//content
            $A.util.getBooleanValue( cmp.get('v.newTabCloseable') ),//closable
            $A.util.getBooleanValue( cmp.get('v.newTabActive') )//active
        );
        
        cmp._counter++;
    }
})