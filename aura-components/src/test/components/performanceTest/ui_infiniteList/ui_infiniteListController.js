({
	refresh: function(component, event, helper) {
        var list = component.find("list");
        list.get("e.refresh").fire();
	},

	showMore: function(component, event, helper) {
        var list = component.find("list");
        list.get("e.showMore").fire();
	}
})