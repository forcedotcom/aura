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
				}
			});
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
		var value = object[prop];
		type.value = getType(value);
		
		if (plan && plan.type) {
			if (plan.support === false) {
				type.status = "fail";
				type.value = "Not To Be Supported";
			} else {
				var expected = plan.type === "@event" ? "Null" : plan.type;
				if (source === "system") {
					type.status = (type.value === expected ? "pass" : "fail");
				} else if (source === "locker") {
					if (type.value === toLockerType(expected)) {
						type.status = "pass";
					} else {
						if ($A.util.isString(plan.support)) {					
							type.status = "warn";
							type.value = getExternalVersion(plan.support);
						} else {
							type.status = "warn";
						}
					}
				}
			}
		}

		// Result when empty set
		if (plan && plan.empty) {
			empty.value = callApi(object, prop, plan.empty.args);
			empty.status = (empty.value === plan.empty.value ? "pass" : "fail");
		}

		// Result when opaque set
		if (source === "locker" && plan && plan.opaque && plan.support) {
			opaque.value = callApi(object, prop, plan.opaque.args);
			opaque.status = (opaque.value === plan.opaque.value ? "pass" : "fail");
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
				
		if (type === "object") {
			switch (object) {
				case Window.prototype:
					return "Window";
				case Document.prototype:
					return "Document";
				case HTMLDocument.prototype:
					return "HTMLDocument";
				case Element.prototype:
					return "Element";
				case Node.prototype:
					return "Node";
				case HTMLElement.prototype:
					return "HTMLElement";
				case HTMLAnchorElement.prototype:
					return "HTMLAnchorElement";
				case HTMLAreaElement.prototype:
					return "HTMLAreaElement";
				case HTMLAudioElement.prototype:
					return "HTMLAudioElement";
				case HTMLMediaElement.prototype:
					return "HTMLMediaElement";
				case HTMLBaseElement.prototype:
					return "HTMLBaseElement";
				case HTMLButtonElement.prototype:
					return "HTMLButtonElement";
				case HTMLCanvasElement.prototype:
					return "HTMLCanvasElement";
				case HTMLTableColElement.prototype:
					return "HTMLTableColElement";
				case HTMLModElement.prototype:
					return "HTMLModElement";
				case HTMLEmbedElement.prototype:
					return "HTMLEmbedElement";
				case HTMLFieldSetElement.prototype:
					return "HTMLFieldSetElement";
				case HTMLFormElement.prototype:
					return "HTMLFormElement";
				case HTMLIFrameElement.prototype:
					return "HTMLIFrameElement";
				case HTMLImageElement.prototype:
					return "HTMLImageElement";
				case HTMLInputElement.prototype:
					return "HTMLInputElement";
				case HTMLLabelElement.prototype:
					return "HTMLLabelElement";
				case HTMLLIElement.prototype:
					return "HTMLLIElement";
				case HTMLLinkElement.prototype:
					return "HTMLLinkElement";
				case HTMLMapElement.prototype:
					return "HTMLMapElement";
				case HTMLMetaElement.prototype:
					return "HTMLMetaElement";
				case HTMLObjectElement.prototype:
					return "HTMLObjectElement";
				case HTMLOListElement.prototype:
					return "HTMLOListElement";
				case HTMLOptGroupElement.prototype:
					return "HTMLOptGroupElement";
				case HTMLOptionElement.prototype:
					return "HTMLOptionElement";
				case HTMLOutputElement.prototype:
					return "HTMLOutputElement";
				case HTMLParamElement.prototype:
					return "HTMLParamElement";
				case HTMLProgressElement.prototype:
					return "HTMLProgressElement";
				case HTMLQuoteElement.prototype:
					return "HTMLQuoteElement";
				case HTMLSelectElement.prototype:
					return "HTMLSelectElement";
				case HTMLSourceElement.prototype:
					return "HTMLSourceElement";
				case HTMLTableCellElement.prototype:
					return "HTMLTableCellElement";
				case HTMLTemplateElement.prototype:
					return "HTMLTemplateElement";
				case HTMLTextAreaElement.prototype:
					return "HTMLTextAreaElement";
				case HTMLTrackElement.prototype:
					return "HTMLTrackElement";
				case HTMLVideoElement.prototype:
					return "HTMLVideoElement";
			}
			
			// These types have browser compatibility issues currently and have to be guarded
			if (window.EventTarget && object === window.EventTarget.prototype) {
				return "EventTarget";
			} else if (window.HTMLDetailsElement && object === window.HTMLDetailsElement.prototype) {
				return "HTMLDetailsElement";
			} else if (window.HTMLMeterElement && object === window.HTMLMeterElement.prototype) {
				return "HTMLMeterElement";
			}

			type = Object.prototype.toString.call(object);
			
			if (type.startsWith("[object ") && type.endsWith("]")) {
				type = type.substring(8, type.length - 1);
			}
		}
		
		return type;
	}

	function toLockerType(type) {
		
		// DCHASMAN TODO Improve this to be LS SecureObject savvy!
		
		switch (type) {
		case "Window".prototype:
		case "HTMLDocument":
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