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
		                {"label": "listitem0"},
		                {"label": "listitem1"},
		                {"label": "listitem2"},
		                {"label": "listitem3"},
		                {"label": "listitem4"}
		];

		component.set("v.mapdata", mapdata);
		component.set("v.listdata", listdata);
	},

	cmppop: function(component, event, helper) {
		var data = component.get("v.listdata");
		data.pop();
		component.set("v.listdata", data);
	},

	cmpshift: function(component, event, helper) {
		var data = component.get("v.listdata");
			data.shift();
			component.set("v.listdata", data);
	},

	cmppush: function(component, event, helper) {
		var data = component.get("v.listdata");
			data.push({ "label": "pushed" + Date.now()});
			component.set("v.listdata", data);
	},
	
	cmpcopy: function(component, event, helper) {
		var data = JSON.parse(JSON.stringify(component.get("v.listdata")));
		//data.push({ "label": "pushed" + Date.now()});
		component.set("v.listdata", data);
	},
	
	cmpaddremove: function(component, event, helper) {
		var data = component.get("v.listdata");
			data[1] = JSON.parse(JSON.stringify(data[0]));
			data[1].label = data[0].label + Date.now();
			component.set("v.listdata", data);
	},

	pop: function(component, event, helper) {

		// ****
		var iteration = component.find("iteration");
		
		// Should fire v.items changed
		// should not say v.items.0 changed
		var items = iteration.get("v.items");
		items.pop();
		iteration.set("v.items", items);
		

		// Additional Use case to support.
		// should fire v.items.1.label changed
		// as well as
		// v.items.1
		// v.items
		// should NOT fire
		// v.items.0.label
		var items = iteration.get("v.items");
		items[1].label = "foo" + Date.now();
		iteration.set("v.items", items);
		// ****

	},

	pop2: function(component, event, helper) {

		// ****
		var iteration = component.find("iteration");
		var items = iteration.get("v.items");
		items.pop();
		
		// Additional Use case to support. 
		items[1].label = "foo" + Date.now();

		iteration.set("v.items", items);
		// ****

	},

	push: function(component, event, helper) {

		// ****
		var iteration = component.find("iteration");
		var items = iteration.get("v.items");
		items.push({ "label": "pushed" + Date.now()});
		
		iteration.set("v.items", items);
		// ****

	},

	shift: function(component, event, helper) {

		// ****
		var iteration = component.find("iteration");
		
		// Should fire v.items changed
		// should not say v.items.0 changed
		var items = iteration.get("v.items");
		items.shift();
		iteration.set("v.items", items);
	},

	targeted: function(component, event, helper) {
		// var iteration = component.find("iteration");
		// //var items = iteration.get("v.items");
		// //items.push({ "label": "pushed" + Date.now()});
		
		// //iteration.set("v.items.0.label", "updated" + Date.now());
		var iteration = component.find("iteration");
		
		// Should fire v.items changed
		// should not say v.items.0 changed
		var items = iteration.get("v.items");
		items.splice(1, 1);
		iteration.set("v.items", items);
	}


	// ,

	// makeDirty: function(component, event, helper) {
	// 	component.set("v.count", component.get("v.count")+1);
	// },

	,logRenderEvent: function(component, event, helper) {
		console.log(event.getParams());
	},

	// popAndDirty: function(component, event, helper) {
	// 	var iteration = component.find("iteration");
	// 	var items = iteration.get("v.items");
	// 	iteration.set("v.items", []);
	// 	component.set("v.count", component.get("v.count")+1);
	// 	console.log("trace4");

	// 	items.length = 0;
	// 	items.push({ "label": "item10"});
	// 	items.push({ "label": "item11"});
	// 	items.push({ "label": "item12"});
	// 	items.push({ "label": "item13"});
	// 	items.push({ "label": "item14"});

	// 	iteration.set("v.items", items);
	// }
})