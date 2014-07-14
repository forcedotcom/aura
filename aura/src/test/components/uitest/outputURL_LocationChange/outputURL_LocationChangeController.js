({

	clickPeach : function (cmp, evt, helper) {
		cmp.set("v.locationToken","Peach");
		helper.clickFruit(cmp);
    },
    
    clickApple : function(cmp,evt,helper) {
    	cmp.set("v.locationToken","Apple");
    	helper.clickFruit(cmp);
    },
    
    clickBanana : function(cmp,evt,helper) {
    	cmp.set("v.locationToken","Banana");
    	helper.clickFruit(cmp);
    },
    
    clickOrange : function(cmp,evt,helper) {
    	cmp.set("v.locationToken","Orange");
    	helper.clickFruit(cmp);
    },
    
    locationChanged: function(cmp, evt) {
        cmp.set("v.locationChangeCount", cmp.get("v.locationChangeCount") + 1);
    },
    
})