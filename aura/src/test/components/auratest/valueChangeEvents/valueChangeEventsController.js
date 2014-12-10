({
	doInit: function(component, event, helper) {

		// Add some data to the "data" attribute to show in the iteration
		var mapdata = {
			items: [
				{ "label": "item0"},
				{ "label": "item1"},
				{ "label": "item2"},
				{ "label": "item3"},
				{ "label": "item4"}
			]
		};

		var listdata = [
			"listitem0",
			"listitem1",
			"listitem2",
			"listitem3",
			"listitem4"
		];

		component.set("v.mapdata", mapdata);
		component.set("v.listdata", listdata);
	}
})