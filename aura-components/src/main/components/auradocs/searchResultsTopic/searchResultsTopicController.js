/*
 * Copyright (C) 2012 salesforce.com, inc.
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
{
	searchDocs : function(cmp,event){
		console.log("in search results");
		var include_num = 1;
		var bold = 1;
		var s = new Array();

		//Indexer
		s[0] = "Components Overview^helloWorld^Components are the functional units of Aura. They encapsulate a modular and potentially reusable section of UI, and can range in granularity from a single line of text to an entire application...^markup, bundles, browser, url";
		s[1] = "Component Bundles^compBundle^A component bundle is a folder containing a component or an app and all related resources for that component or app. It can contain the following files...^ resources, css, controller, renderer, helper, provider, app, client-side";
		s[2] = "Component IDs^compIds^A component has two types of IDs: a local ID and a global ID...^getCmp, globalId, localId, aura:id";
		s[3] = "Applying HTML and CSS^helloHTML^Components can contain more than just text. Let's add some HTML and CSS to the mix...^unescape, unescapedHtml, expressions, selector, top-level element";
		s[4] = "Component Attributes^helloAttributes^Let's see how we can make components more dynamic by using attributes...^aura:attribute, expressions, validation";
		s[5] = "Component Composition^nestedComponents^The strength of a component-based UI framework is in combining components to make a more interesting application. Let's take a look at how components fit together...^attributes, instance, definition, passing attributes";
		s[6] = "Component Body and Facets^helloFacets^All components inherently extend <aura:component> at the root of their hierarchy. When you extend a component, you inherit all its attributes...^aura:attribute, aura:registerEvent, aura:handler, aura:set, access body, expression";
		s[7] = "Lazy loading^lazyload^A lazily loaded component is rendered after its parent component is loaded. This can improve the apparent response time of your app if you have many components that users don't need all at once...^aura:load, aura:placeholder, exlusive load, aysnchronous";
		s[8] = "Positioning UI Components^useLayout^You can position your components easily using several Aura ui components. The ui:block component positions page elements horizontally, while the ui:vbox component positions them vertically...^left, right, body, north, south, div, aura:set";
		s[9] = "Getting User Input^useForm^Aura provides out-of-the-box input components that enable you to easily retrieve and process user input with built-in features such as value binding and event handling...^attributes, controller, updateOn, error handling, events, ui:input, ui:inputText, ui:inputPhone, ui:inputEmail, ui:inputSecret, ui:inputURL, ui:inputDate, ui:inputTime, ui:inputNumber, ui:inputTextArea";
		s[10]= "Using Menus^useMenu^ui:menu is a menu component that contains list items. You can wire up list items to actions in a client-side controller, so that selection of the item triggers an action. List items in the menu can be initialized from the menu's mode...^ui:menuItem, ui:actionMenuItem, ui:checkboxMenuItem, ui:radioMenuItem, ui:menuItemSeparator, dropdown, trigger, ui:menuTriggerLink";
		
		s[11]= "Expressions^expressions^Aura expressions allow you to make calculations and access property values and other data within Aura markup. Use expressions for dynamic output or passing values into components by assigning them to attributes...^variables, operators, primitive, integer, string, boolean, object, collection, controller, syntax";
		s[12]= "Example Expressions^expressionsExamples^Here are a few examples of expressions used in Aura code that illustrate various interesting aspects of Aura expressions. Don't worry if you understand them completely yet, later sections will explain...^dynamic output, values, attributes, view, property values, model, passing values, conditional, true, false, aura:renderif";

		cookies = document.cookie;
		var p = cookies.indexOf("d=");
		console.log("p = " + p);
		
		if (p != -1) {
			var st = p + 2;
			var en = cookies.indexOf(";", st);
			if (en == -1) {
				en = cookies.length;
			}
			var d = cookies.substring(st, en);
			d = unescape(d);
			console.log("cookies.substring d= " + d);
		}
		od = d;
		console.log("od = " + od);
		var m = 0;
		if (d.charAt(0) == '"' && d.charAt(d.length - 1) == '"') {
			m = 1;
		}

		var r = new Array();
		var co = 0;

		if (m == 0) {
			var woin = new Array();
			var w = d.split(" ");
			for (var a = 0; a < w.length; a++) {
				woin[a] = 0;
				if (w[a].charAt(0) == '-') {
					woin[a] = 1;
				}
			}
			for (var a = 0; a < w.length; a++) {
				w[a] = w[a].replace(/^\-|^\+/gi, "");
			}
			a = 0;
			for (var c = 0; c < s.length; c++) {
				pa = 0;
				nh = 0;
				for (var i = 0; i < woin.length; i++) {
					if (woin[i] == 0) {
						nh++;
						var pat = new RegExp(w[i], "i");
						var rn = s[c].search(pat);
						if (rn >= 0) {
							pa++;
						} else {
							pa = 0;
						}
					}
					if (woin[i] == 1) {
						var pat = new RegExp(w[i], "i");
						var rn = s[c].search(pat);
						if (rn >= 0) {
							pa = 0;
						}
					}
				}
				if (pa == nh) {
					r[a] = s[c];
					a++;
				}
			}
			co = a;
		}

		if (m == 1) {
			d = d.replace(/\"/gi, "");
			var a = 0;
			var pat = new RegExp(d, "i");
			for (var c = 0; c < s.length; c++) {
				var rn = s[c].search(pat);
				if (rn >= 0) {
					r[a] = s[c];
					a++;
				}
			}
			co = a;
		}
		console.log("return query");
		//Return search term
		var searchTerm = cmp.getValue("v.searchTerm");
		searchTerm.setValue(od);
		
		//Return number of results found
		var queryCount = cmp.getValue("v.queryNum");
		queryCount.setValue(co);
		var myQuery = cmp.getValue("v.myQuery");
		//Display results
		if (co==0){
			var noResults = "Please try another search term."
			myQuery.setValue(noResults);
			return;
		}
		for (var a=0; a < r.length; a++){
			var os = r[a].split("^");
			if(bold==1){
				console.log(r.length);
				var br="<b>" + d + "</b>";
				os[2] = os[2].replace(pat, br);
				
			}
			var result = "<a href=\"/auradocs#help?topic=" + os[1] + "\" />" + os[0] + 
			"</a><br/>" + os[2];
			myQuery.setValue(result);
				
		}
		
	}
		
	}
}