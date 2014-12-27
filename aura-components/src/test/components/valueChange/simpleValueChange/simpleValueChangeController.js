/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
	stringChange : function(cmp, evt) {
		var value = evt.getParam("value");
		cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
		cmp.find("value").getElement().innerHTML = value || 'undefined';
		$A.get("e.test:vote").setParams({
			candidate : 'string'
		}).fire();
	},

	mapChange : function(cmp, evt) {
		var value = evt.getParam("value");
		cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
		cmp.find("value").getElement().innerHTML = value || 'undefined';
		$A.get("e.test:vote").setParams({
			candidate : 'map'
		}).fire();
	},

	listChange : function(cmp, evt) {
		var value = evt.getParam("value");
		cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
		cmp.find("value").getElement().innerHTML = value || 'undefined';
		$A.get("e.test:vote").setParams({
			candidate : 'list'
		}).fire();
	},

	recurseAChange : function(cmp, evt) {
		var value = evt.getParam("value");
		var depth = cmp.get("m.recurseADepth");

		cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
		cmp.find("value").getElement().innerHTML = value || 'undefined';
		cmp.set("m.recurseADepth", ++depth);
		cmp.set("m.recurseA", "recursing(A): " + depth);
		cmp.set("m.recurseADepth", --depth);
	},

	//
	// This is a ping-pong recursion with recurseCChange.
	//
	recurseBChange : function(cmp, evt) {
		var value = evt.getParam("value");
		var depth = cmp.get("m.recurseBDepth");

		cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
		cmp.find("value").getElement().innerHTML = value || 'undefined';
		cmp.set("m.recurseBDepth", ++depth);
		cmp.set("m.recurseC", "recursing(B): " + depth);
		cmp.set("m.recurseBDepth", --depth);
	},

	//
	// This is a ping-pong recursion with recurseBChange.
	//
	recurseCChange : function(cmp, evt) {
		var value = evt.getParam("value");
		var depth = cmp.get("m.recurseCDepth");

		cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
		cmp.find("value").getElement().innerHTML = value || 'undefined';
		cmp.set("m.recurseCDepth", ++depth);
		cmp.set("m.recurseB", "recursing(C): " + depth);
		cmp.set("m.recurseCDepth", --depth);
	},

	//
	// Chain a single change through to 'unchained'
	//
	chainedChange : function(cmp, evt) {
		var value = evt.getParam("value");

		cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
		cmp.find("value").getElement().innerHTML = value || 'undefined';;
		cmp.set("m.unchained", "finished");
	},

	unchainedChange : function(cmp, evt) {
		var value = evt.getParam("value");

		cmp.find("index").getElement().innerHTML = (evt.getParam("index"));
		cmp.find("value").getElement().innerHTML = value || 'undefined';
	}
})
