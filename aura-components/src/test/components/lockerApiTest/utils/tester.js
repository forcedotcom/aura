function tester() {

	var testName, testPlan, testProtos, testResults;

	var lockerApiTes$utils$tester = {

		initTests : function(newTestName, newTestPlan) {
			initTests(newTestName, newTestPlan);
		},

		testSystem : function(object) {
			testSystem(object);
		},

		testSecure : function(object) {
			testSecure(object);
		},

		showResults : function(cmp) {
			cmp.set("v.secureAPI", testName.secureAPI);
			cmp.set("v.systemAPI", testName.systemAPI);
			
			var report = makeReport();
						
			cmp.set("v.report", report);
		}
	};

	function initTests(newTestName, newTestPlan) {
		testName = newTestName;
		testPlan = newTestPlan;
		testProtos = {};
		testResults = {};
		Object.keys(testPlan).forEach(function(proto) {
			testResults[proto] = {};
			Object.keys(testPlan[proto]).forEach(function(prop) {
				testResults[proto][prop] = {
					plan : testPlan[proto][prop]
				};
			});
		});
	}

	// Test all properties along prototype hierarchy to detect
	// missing properties.
	function testSystem(object) {
		var protos = findAllProtosProps(object);
		Object.keys(protos).forEach(function(proto) {
			protos[proto].forEach(function(prop) {
				if (!hasResults(proto, prop, "system")) {
					executeTests(object, proto, prop, "system");
				}
			});
		});
	}

	// Test all properties in flat set to avoid the differences
	// in object prototype hierarchy between system and locker.
	function testSecure(object) {
		var props = findAllProps(object);
		Object.keys(testResults).forEach(function(proto) {
			Object.keys(testResults[proto]).forEach(function(prop) {
				var index = props.indexOf(prop);
				if (index >= 0) {
					executeTests(object, proto, prop, "locker");
					props.splice(index, 1);
				}
			});
		});
		// Add all extra properties under "Object"
		props.forEach(function(prop) {
			executeTests(object, "Object", prop, "locker");
		});
	}

	function executeTests(object, proto, prop, source) {
		var plan = testPlan[proto] && testPlan[proto][prop];
		if (plan && plan.skip) {
			return;
		}

		var type = {};
		var empty = {};
		var opaque = {};

		// Always test type
		type.value = getType(object[prop]);
		if (source === "system" && plan && plan.type) {
			type.status = (type.value === plan.type ? 'pass' : 'fail');
		} else if (source === "locker") {
			if (plan && plan.type) {
				if (type.value === toLockerType(plan.type)) {
					type.status = 'pass';
				} else {
					if (plan.support === false) {
						type.status = 'fail';
						type.value = "Not To Be Supported";
					} else if ($A.util.isString(plan.support)) {					
						type.status = 'warn';
						type.value = getExternalVersion(plan.support);
					} else {
						type.status = 'warn';
						type.value = "WIP";
					}
				}
			}
		}

		// Result when empty set
		if (plan && plan.empty) {
			empty.value = callApi(object, prop, plan.empty.args);
			empty.status = (empty.value === plan.empty.value ? 'pass' : 'fail');
		}

		// Result when opaque set
		if (source === "locker" && plan && plan.opaque && plan.support) {
			opaque.value = callApi(object, prop, plan.opaque.args);
			opaque.status = (opaque.value === plan.opaque.value ? 'pass' : 'fail');
		}

		addResults(proto, prop, source, {
			type : type,
			empty : empty,
			opaque : opaque
		});
	}

	function callApi(object, prop, args) {
		return JSON.stringify(object[prop](args));
	}

	function addResults(proto, prop, source, results) {
		if (!testResults) {
			testResults = {};
		}
		if (!testResults[proto]) {
			testResults[proto] = {};
		}
		if (!testResults[proto][prop]) {
			testResults[proto][prop] = {};
		}

		testResults[proto][prop][source] = results;
	}

	function hasResults(proto, prop, source) {
		return testResults && testResults[proto] && testResults[proto][prop] && testResults[proto][prop][source];
	}

	// Return all tests results by property and by prototype.
	function makeReport() {
		// Pivot the data		
		var report = {
			"protos" : Object.keys(testResults).map(function(proto) {
				return {
					"name" : proto,
					"proto" : testProtos[proto],
					"props" : Object.keys(testResults[proto]).sort().map(function(prop) {
						return Object.keys(testResults[proto][prop]).reduce(function(results, source) {
							results[source] = testResults[proto][prop][source];
							return results;
						}, {
							"name" : prop
						});
					})
				};
			})
		};
		return report;
	}

	function getPropertyDescriptor(object, prop) {
		var descriptor;
		while (object && !descriptor) {
			descriptor = Object.getOwnPropertyDescriptor(object, prop);
			object = Object.getPrototypeOf(object);
		}
		return descriptor;
	}

	// Return all properties per prototype as a map of arrays.
	function findAllProtosProps(object) {
		var protos = {};
		while (object) {
			var name = getType(object);
			var props = Object.getOwnPropertyNames(object);
			protos[name] = protos[name] ? protos[name].concat(props) : props;
			object = Object.getPrototypeOf(object);
			var proto = getType(object);
			testProtos[name] = proto;
		}
		return protos;
	}

	// Return all properties of all prototypes as a flat array.
	function findAllProps(object) {
		var props = [];
		while (object) {
			props = props.concat(Object.getOwnPropertyNames(object));
			object = Object.getPrototypeOf(object);
		}
		return props;
	}

	function getType(object) {
		var type = typeof object;
		if (type === "object" || type === "undefined") {
			type = Object.prototype.toString.call(object);
			if (type.startsWith("[object ") && type.endsWith("]")) {
				type = type.substring(8, type.length - 1);
			}
		}
		return type;
	}

	function toLockerType(type) {
		switch (type) {
		case "Window":
		case "HTMLHeadElement":
		case "HTMLBodyElement":
		case "HTMLHtmlElement":
			return "Object";

		case "NodeList":
			return "Array";
		}
		return type;
	}

	function uniq(items) {
		var out = [];
		var seen = {};
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (!seen[item]) {
				seen[item] = true;
				out.push(item);
			}
		}
		return out;
	}

	function arrayToMap(keys) {
		return keys.reduce(function(hash, key) {
			hash[key] = {};
			return hash;
		}, {});
	}
	
	function getExternalVersion(releaseVersion) {
		var releaseToExternal = {
			"202": "Summer'16",
			"204": "Winter'17",
			"206": "Spring'17"
		};
		
		return releaseToExternal[releaseVersion] || "TBD";
	}

	return lockerApiTes$utils$tester;
}