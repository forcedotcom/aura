({

    clickPeach : function (cmp, evt, helper) {
        cmp.set("v.locationToken", "Peach");
    },

    clickApple : function(cmp,evt,helper) {
        helper.clickFruit(cmp,"Apple");
    },

    clickBanana : function(cmp,evt,helper) {
        helper.clickFruit(cmp,"Banana");
    },

    clickOrange : function(cmp,evt,helper) {
        helper.clickFruit(cmp,"Orange");
        //update token for Orange
        cmp.set("v.locationTokenOrange", cmp.get("v.locationTokenOrange") + "Orange");
    },

    locationChanged: function(cmp, evt) {
        var fruit = cmp.get("v.locationToken");
        if(fruit === "Peach") {
            cmp.set("v.locationChangeCountPeach", cmp.get("v.locationChangeCountPeach") + 1);
        }

        cmp.set("v.debugMsg", fruit);

        //increase common counter
        cmp.set("v.locationChangeCount", cmp.get("v.locationChangeCount") + 1);
    }
})
