({

	clickPeach : function (cmp, evt) {
		cmp.set("v.locationToken","Peach");
        cmp.set("v.clickCount", cmp.get("v.clickCount") + 1);
    },
    
    clickApple : function(cmp,evt,helper) {
    	cmp.set("v.locationToken","Apple");
    	helper.clickFruit(cmp,"Apple");
    },
    
    clickBanana : function(cmp,evt,helper) {
    	cmp.set("v.locationToken","Banana");
    	helper.clickFruit(cmp,"Banana");
    },
    
    clickOrange : function(cmp,evt,helper) {
    	cmp.set("v.locationToken","Orange");
    	helper.clickFruit(cmp,"Orange");
    },
    
    locationChanged: function(cmp, evt) {
        cmp.set("v.locationChangeCount", cmp.get("v.locationChangeCount") + 1);
    },
    
})