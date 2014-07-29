({

	clickPeach : function (cmp, evt, helper) {
		helper.clickFruit(cmp,"Peach");
    },
    
    clickApple : function(cmp,evt,helper) {
    	helper.clickFruit(cmp,"Apple");
    },
    
    clickBanana : function(cmp,evt,helper) {
    	helper.clickFruit(cmp,"Banana");
    },
    
    clickOrange : function(cmp,evt,helper) {
    	helper.clickFruit(cmp,"Orange");
    },
    
    locationChanged: function(cmp, evt) {
    	var fruit = cmp.get("v.locationToken");
    	if(fruit == "Peach") {
    		cmp.set("v.locationChangeCountPeach", cmp.get("v.locationChangeCountPeach") + 1);
    	}
    	//increase common counter
    	cmp.set("v.locationChangeCount", cmp.get("v.locationChangeCount") + 1);
    },
    
})