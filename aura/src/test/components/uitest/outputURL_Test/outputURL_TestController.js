({
    click : function (cmp, evt) {
        cmp.set("v.clickCount", cmp.get("v.clickCount") + 1);
    },

    locationChanged: function(cmp, evt, helper) {
        cmp.set("v.locationChangeCount", cmp.get("v.locationChangeCount") + 1);
    }
})