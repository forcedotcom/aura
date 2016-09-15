({
	render : function(component) {
		var ret = component.superRender();
		
		var tr = component.find("tr").getElement();
		
		var prop = component.get("v.prop");
		var plan = prop.plan;
		var s = prop.system;
		var l = prop.locker;
		
		function value() {
			var args = Array.prototype.slice.call(arguments);
			return args.reduce(function(previousValue, currentValue) {
				if (previousValue) {
					var v = previousValue[currentValue];
					return v || '';
				} else {
					return '';
				}
			});
		}
		
		tr.innerHTML = '<td>' + prop.name + '</td>' + 
			'<td>' + value(plan, "type") + '</td>' + 
			'<td>' + value(plan, "empty", "value") + '</td>' + 
			'<td>' + value(plan, "opaque", "value") + '</td>' +

			// ENSURE OUR TEST PLAN MEETS SYSTEM (to monitor browser API change)
			'<td class="' + value(s, "type", "status") + '">' + value(s, "type", "value") + '</td>' + 
			'<td class="' + value(s, "empty", "status") + '">' + value(s, "empty", "value") + '</td>' +

			// ENSURE LOCKER MEETS PLANS (to monitor support)
			'<td class="' + value(l, "type", "status") + '">' + value(l, "type", "value") + '</td>' + 
			'<td class="' + value(l, "empty", "status") + '">' + value(l, "empty", "value") + '</td>' + 
			'<td class="' + value(l, "opaque", "status") + '">' + value(l, "opaque", "value") + '</td>';
				
		return ret;
	}
})