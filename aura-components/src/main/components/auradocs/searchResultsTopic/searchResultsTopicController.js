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

		/**Indexer**/
		//Components
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
		
		//Expressions
		s[11]= "Expressions^expressions^Aura expressions allow you to make calculations and access property values and other data within Aura markup. Use expressions for dynamic output or passing values into components by assigning them to attributes...^variables, operators, primitive, integer, string, boolean, object, collection, controller, syntax";
		s[12]= "Example Expressions^expressionsExamples^Here are a few examples of expressions used in Aura code that illustrate various interesting aspects of Aura expressions. Don't worry if you understand them completely yet, later sections will explain...^dynamic output, values, attributes, view, property values, model, passing values, conditional, true, false, aura:renderif";
		s[13]= "Accessing Data Using Value Providers^expressionsSourceValues^Value providers are one way to access data. Value providers encapsulate related values together, similarly to how an object encapsulates properties and methods. A number of value providers were introduced in Example Expressions, for example, m, v, and c...^model, view, controller, fields, objects, dot notation";
		s[14]= "Global Value Providers^globalValueProviders^Global value providers are global values and methods that a component can use in expressions. Global value providers are: $Label, globalID, $Browser...^formFactor, isAndroid, isIOS, isIPad, isIPhone, isPhone, isTablet";
		s[15]= "Although you will generally use expressions as though they resolve to simple values, under the hood expressions resolve to a value object. This thin wrapper around the actual data is used by Aura to notice changes to data and selectively re-render and update the user interface in response...^primitive value, value object, getValue, setParams, commit";
		s[16]= "Expression Evaluation^expressionsEvaluation^Expressions are evaluated much the same way that expressions in JavaScript or other programming languages are evaluated. Operators are a subset of those available in JavaScript, and evaluation order and precedence are generally the same as JavaScript...^parentheses, action methods, expressions, user interface events, onclick, onhover, controller";
		s[17]= "Expression Operators Reference^expressionsOperators^The following operators are available in the Aura expression language...^arithmetic operators, numerical values, add, substract, multiply, divide, integer, unary, float, null, string, literal, escape, comparison, operands, logical operators, logical literals";
		s[18]= "Expression Functions Reference^expressionsFunctions^The following functions are available in the Aura expression language. The Corresponding Operator column lists equivalent operators, if any. All functions are case-sensitive...^math functions, add, sub, mult, div, mod, abs, negate, concat, string functions, comparison functions, true, false, equals, noteequals, lessthan, greaterthan, lessthanorequal, greaterthanorequal, boolean functions, conditional function";
		s[19]= "Client-Side Controllers^helloActions^A client-side controller is a JavaScript file containing all the component's actions, which are used to handle events within the component. The syntax of a client-side controller file is just a simple JavaScript object that defines action functions. The syntax of a client-side controller file is just a simple JavaScript object that defines action functions...^ action parameters, auto-wire, call action, handle events, onclick, getAttributes, getRawValue, attribute values";
		s[20]= "Event Handling Lifecycle^eventsOverview^Aura events are declared by the aura:event tag in a .evt file, and they can have one of two types: component or application. Application and component events are declared in separate files, for example, drawApp/pickBrushComp/pickBrushComp.evt and drawApp/pickBrushApp/pickBrushApp.evt...^events demo, detect firing, event type, execute handler, rerender component";
		s[21]= "Component Events^eventsComp^Component events have attributes to pass relevant data from the firing component to any handling components. A component event is fired from an instance of a component...^handle events, register event, event handler, event notifier, aura:handler, controller";
		s[22]= "Application Events^eventsApp^Application events follow a traditional publish-subscribe model. An application event is fired from an instance of a component...^handle events, register events, event notifier, aura:handler";
		s[23]= "Events Demo^eventsDemo^Events Handling Lifecycle gives an overview of how events are handled in Aura. This topic leads you through an events demo. Before we see a component wired up to events, let's look at the individual files involved...^notifier, handler, container, fire event, application event, component event";
		s[24]= "Firing Aura Events from Non-Aura Code^eventsExternal^You can fire an Aura event from JavaScript code outside an Aura app. For example, your Aura app might need to call out to some non-Aura code, and then have that code communicate back to the Aura code once it's done...^window.opener, master window, external js, fire externally";
		
		//Creating Apps
		s[25]= "Designing App UI^designAppLayout^An Aura app is a special top-level component whose markup is in a .app file. The markup looks similar to HTML and can contain components as well as a set of supported HTML tags. Design your app's UI by including markup in the .app file, which starts with the <aura:application> tag...^sample app, notes.app, aura demo, aura:template, layout";
		s[26]= "Creating App Templates^createAppTemplate^An app template bootstraps the loading of the Aura framework and the app. The default template is aura:template. Customize the default template by creating your own component that extends the default template...^sample app, aura:template, aura:application, js libraries, external CSS, extraStyleTags, aura:set, inlineStyle";
		s[27]= "Adding Components^addAppComponents^When you're ready to add components to your app, you should first look at the out-of-the-box components that come with Aura. You'll save yourself development time if you can directly use existing components. You can also leverage these components by extending them or using composition to add them to custom components that you're building...^design components, combine components, API";
		s[28]= "Styling Apps^styleApp^An app is a special top-level component whose markup is in a .app file. Just like any other component, you can put CSS in the component bundle in a file called <appName>.css. For example, the demo app markup is in notes.app. Its CSS is in notes.css...^apply HTML, apply CSS, style";
		s[29]= "URL-Centric Navigation^urlNav^It's useful to understand how Aura handles page requests. The initial GET request for an app retrieves a template containing all the Aura JavaScript and a skeletal HTML response. All subsequent changes to everything after the # in the URL trigger an XMLHttpRequest (XHR) request for the content. The client service makes the request, and returns the result to the browser...^initial request, navigation events, custom events, aura:locationChange, AuraHistoryService, locationChangeEvent, tokenized attributes, AuraEnabled";
		s[30]= "Using Layouts for Metadata-Driven Navigation^layouts^Layouts are a metadata-driven description of navigation in an application. You can describe in an XML file how you want the application to respond to changes to everything after the # (hash) in the URL. You can use Aura without layouts, but they offer a centralized location for managing URL-centric navigation...^container, aside, article, aura:layout, aura:layoutItem, sidebar, content, regex, regular expression, aura:layouts, custom events, override layout, layout handling, handle layout, layout service, AuraLayoutService, changeLocation, aura:layoutHandler";
		s[31]= "Using Appcache^appcache^Application cache (AppCache) speeds up app response time and reduces server load by only downloading resources that have changed. It improves page loads affected by limited browser cache persistence on some devices. You can take advantage of application cache capabilities in Aura...^useAppcache, aura:application, cache, browser, load resources, load js, load css, manifest, preload";
		s[32]= "Controlling Access with Security Providers^securityProviders^A security provider centralizes the security logic to control access to your app, including components and actions. The default security provider is aura/components/DefaultSecurityProvider.java. It doesn't allow access to any resources when the app is in PROD (production) mode so you must write a Java class to implement your own security provider to enable access in PROD mode...^securityprovider, interface, DefDescriptor, metadata";
		
		//Code
		s[33]= "Code^code^The quick start introduces you to the structure of apps and components but there is no code beyond markup. This section helps you to start writing code...^JavaScript, Java, sample app, sample code";
		s[34]= "JavaScript^codeJavaScriptIntro^Use JavaScript for client-side Aura code. The Aura object is the top-level object in the JavaScript framework code. For all the methods available in the Aura class, see Aura in the JavaScript API in the Reference tab. You can use $A in JavaScript code to denote the Aura object...^controller, helper, renderer, testing, DOM, API, mode";
			
		
		
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
			var result = [];
			for (var i=0; i<co; i++){
				result[i] = "<a href=\"#help?topic=" + os[1] + "\" />" + os[0] + "</a><br/>" + os[2];
				myQuery.setValue(result[i]);
			}
		}
	}
  }
}