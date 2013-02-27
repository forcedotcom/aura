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
	displaySearch : function(cmp,event){
		var searchURL = window.location; 
		var searchTerm = searchURL.hash.substr(37);
		//Highlight search term in results
		var bold = 1;
		var s = new Array();

		/*
		 * Client-side Indexer
		 * Format: TITLE^URL OR FILENAME^DESCRIPTIVE LINE(first few sentences of the topic)^KEYWORDS
		 */
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
		s[10]= "Using Menus^useMenu^ui:menu is a menu component that can contain a link which triggers the menu, ui:menuTriggerLink, and list items. You can wire up list items to actions in a client-side controller, so that selection of the item triggers an action. List items in the menu can be initialized from the menu's mode...^ui:menuItem, ui:actionMenuItem, ui:checkboxMenuItem, ui:radioMenuItem, ui:menuItemSeparator, dropdown, trigger, ui:menuTriggerLink";
		
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
		s[32]= "Controlling Access with Security Providers^securityProviders^A security provider centralizes the security logic to control access to your app, including components and actions. The default security provider is aura/components/DefaultSecurityProvider.java... It doesn't allow access to any resources when the app is in PROD (production) mode...^securityprovider, security provider, interface, DefDescriptor, metadata";
		
		//Code
		s[33]= "Code^code^The quick start introduces you to the structure of apps and components but there is no code beyond markup. This section helps you to start writing code...^JavaScript, Java, sample app, sample code";
		s[34]= "JavaScript^codeJavaScriptIntro^Use JavaScript for client-side Aura code. The Aura object is the top-level object in the JavaScript framework code. For all the methods available in the Aura class, see Aura in the JavaScript API in the Reference tab. You can use $A in JavaScript code to denote the Aura object...^controller, helper, renderer, testing, DOM, API, mode";
		s[35]= "Accessing the DOM^domAccess^The Document Object Model (DOM) is the language-independent model for representing and interacting with objects in HTML and XML documents. The Aura rendering service takes in-memory component state and updates the component in the DOM...^rendering service, renderer";
		s[36]= "Using JavaScript Libraries^jsLibs^To use a JavaScript library, you must reference it in your app's template. Use aura:set to set the extraScriptTags attribute in the template component. This sets the extraScriptTags attribute in aura:template, which your app's template extends...^third-party, library";
		s[37]= "Helpers^helper^A helper file contains JavaScript functions that can be called from a client-side controller or renderer for a component. Put functions that you want to reuse and call from a controller and renderer in the component's helper file...^renderer, bundle, controller";
		s[38]= "Renderers^renderers^The Aura rendering service takes in-memory component state and updates the component in the Document Object Model (DOM). The DOM is the language-independent model for representing and interacting with objects in HTML and XML documents...^rendering lifecycle, component rendering, customize rendering, rerendering, unrendering, render";
		s[39]= "Client-side Providers^providersClientSide^A provider enables you to use an abstract component or an interface in markup. The framework uses the provider to determine the concrete component to use at runtime. Server-side providers are more common, but if you don't need to access the server when you're creating a component, you can use a client-side provider instead...^external provider, componentDef, concrete, reuse provider";
		s[30]= "JavaScript Services^services^Aura provides a set of client-side services that helps you develop apps faster. You can call these services from your JavaScript code, using the syntax $A.<service>.<method>. For example, use $A.componentService.newComponent() to create a component dynamically...^AuraComponentService, AuraDevToolService, AuraEventService, AuraExpressionService, AuraHistoryService, AuraLayoutService, AuraRenderingService";
		s[31]= "Error Handling^error^This topic shows you how to handle client-side errors using JavaScript. Typically, you validate the user input, identify any errors, and display the error messages. You can use Aura's default error handling or customize it with your own error handlers.^ui:inputDefaultError, custom error handling, input error, validation error";
		s[32]= "Testing Components^docTests^Aura's loosely coupled components facilitate maintainability, enable efficient testing, and isolate each component from their application context for easier testing. Aura supports JavaScript testing for components and applications in production mode when you develop using the framework...^debugging, user interactions, tools, JavaScript test, JSTEST, test mode";
		s[33]= "Assertions^testsAssert^Assertions evaluate an object or expression for expected results and are the foundation of Aura Component testing. Each JavaScript test can contain one or more assertions. The test passes only when all the assertions are successful...^assert, fail, assertTrue";
		s[34]= "Utility Functions^testsUtility^Utility functions provide additional support for Aura's unit testing and should be prefixed with aura.test or $A.test...^addFunctionHandler, addWaitFor, callServerAction, getDump, getErrors, outer HTML, prototype, getAction, getText, isComplete,overrideFunction, runAfterIf, select, setTestTimeout";
		s[35]= "Sample Test Cases^testsCases^ The following test case use the utility function runAfterIf and assert statements to check that the right buttons are displayed in order...^initial render, rerender";
		s[36]= "Value Objects^valueObjects^All expressions resolve to a value object, which is a thin wrapper around the actual data. The wrapper layer around the literal JavaScript objects enables you to modify data in a transactional manner and selectively rerender and update the UI in response to data changes...^access value, set value, getValue, setValue, literal value, expressions, rerender, isDirty, commit, rollback, getPreviousValue, get previous value";
		s[37]= "Value Object Types^valueObjectTypes^These are the most commonly used value object types. Available methods can be found via the links in the Value Object column...^simple value, array, map, action reference, function call, property reference, immutable types";
		s[38]= "Detecting a Value Object Change^onchange^You can configure a component to automatically invoke a client-side controller action when a value in one of the component's model or attributes changes. When the value changes, the valueChange.evt event is automatically fired...^events, handler, value change, aura:handler, attribute change, aura:iteration,";
		s[39]= "Dynamically Creating Components^dynamicCmp^When the value changes, the valueChange.evt event is automatically fired. This sample code adds a component to a div element...^setParams, set parameters, destroy component, setValue, getValue, set value, get value, localId, local id, newComponent, action value, API";
		s[40]= "Finding Components by ID^findById^You want to retrieve a component by its ID in JavaScript code. For example, a component has a local ID of button1...^get, find, value provider, global id, globalId";
		s[41]= "Dynamically Showing or Hiding Markup^hideMarkup^You want to show or hide markup when a button is pressed...^toggle, visible, renderIf, toggle value, DOM";
		s[42]= "Invoking Actions on Component Initialization^initHandler^You want to update a component or fire an event after component construction but before rendering...^set init value, initialize, controller";
		s[43]= "Java^codeJavaIntro^Use Java for server-side Aura code. Services are the API in front of Aura. The Aura class is the entry point in Java for accessing server-side services...^models, initialize data, controller, provider, security provider, control access, definition, metadata, defdescriptor, instance, registry";
		s[44]= "Models^models^A model is a component's main source for dynamic data. Use a model to read your initial component data in Aura. For example, the model could read the component's data from a database. The component generates an appropriate user interface from the model's data...^value provider, rendering, evaluate value, initialize data, auraenabled, client-side model, java model, access model";
		s[45]= "Server-Side Controllers^serverSideControllers^ You can use client-side and server-side controllers in Aura. An event is always wired to a client-side controller action, which can in turn call a server-side controller action. For example, a client-side controller might handle an event and call a server-side controller action to persist data to a database...^call action, server action, callback, JSON, name-value, echo, abortable, action queue, auraenabled, serverEcho";
		s[46]= "Server-Side Renderers^renderersServerSide^The Aura rendering service takes in-memory component state and updates the component in the Document Object Model (DOM). The DOM is the language-independent model for representing and interacting with objects in HTML and XML documents...^Java renderer, rerender";
		s[47]= "Registering a Custom Converter^registerCustomConverter^A custom converter enables the conversion of one Java type to another Java type for client data sent to the server or for server markup data. When a client calls a server-side controller action, data that the client sends, such as input parameters for a server action, is sent in JSON format...^register converter, auraconfiguration, configuration, impl, custom type conversion, attribute conversion, action call conversion, parameterized type, convert type";
		s[48]= "Converter Interface^converterInterface^ The Converter interface is a type converter that converts a value from one Java type to another Java type. You can implement this interface to provide a custom converter for your own custom type for converting data sent from the client to the server, such as input parameters of server-side controller actions or component attributes...^return Java type, return Java parameter";
		s[49]= "Getting a DefDescriptor^javaDefDesc^A DefDescriptor is an Aura class that contains the metadata for any definition used in Aura, such as a component, action, or event. In the example of a model, it is a nicely parsed description with methods to retrieve the language, class name, and package name. Rather than passing a more heavyweight definition around in code, Aura usually passes around a DefDescriptor instead...^definitionservice, definition service, metadata";
		s[50]= "Getting an Instance of a Component^javaInstanceCmp^An instance represents the data for a component. You want to get an instance of a component in Java code...^instanceservice, instance service, get instance, componentdef, map, attribute map";
		s[51]= "Setting a Component ID^setIDdefref^You want to create a component with a local ID and attributes in Java code. If you want to create a component and set its local Id on the client, see Dynamically Creating Components...^componentdefrefbuilder, component definition reference, set id, set facet, set body, instance";
		s[52]= "Aura Integration Service^auraIntegrationService^The Aura Integration Service enables plugging Aura components into non-Aura HTML containers without having to create an Aura app. Because Aura requires an app to start and to render components, the Aura Integration Service creates and manages an internal integration app and a security provider on your behalf for the components you're embedding. This makes it easy to use Aura components in an HTML-based application...^IntegrationService, createIntegration, injectComponent";
		
		//Beyond the Basics
		s[53]= "What is inherited?^oodWhatsInherited^This topic lists what is inherited in Aura. All component attributes are inherited.  You can override an attribute in a sub-component using <aura:attribute>. However, you should only do this if you want to change the attribute's default value in the sub-component...^inheritance, object-oriented, controllers, events, helpers";
		s[54]= "Inheritance Rules^oodInheritanceRules^This table descibes the inheritance rules for various elemnts in Aura...^interfaces, component inheritance";
		s[55]= "Inherited Component Attributes^oodInheritedAttributes^Inherited attributes behave differently in Aura than, for example, inherited class fields in Java. In Aura, an attribute that is inherited from a base component can have different values in the sub-component and the base component. This will be clearer when we walk through an example...^aura:set, extend component, component extension";
		s[56]= "Traversing a Component's Extension Hierarchy^oodCmpTraverse^When you instantiate a component that extends a super component, the super component is instantiated as a separate component object. You can access the super component by calling getSuper() on the component...^getAttributes, attribute values";
		s[57]= "Abstract Components^oodCmpAbstract^Object-oriented languages, such as Java, support the concept of an abstract class that provides a partial implementation for an object but leaves the remaining implementation to concrete sub-classes. An abstract class in Java can't be instantiated directly, but a non-abstract subclass can...^Interfaces";
		s[58]= "Interfaces^oodInterfaces^Object-oriented languages, such as Java, support the concept of an interface that defines a set of method signatures. A class that implements the interface must provide the method implementations. An interface in Java can't be instantiated directly, but a class that implements the interface can...^abstract components, aura:interface; implement interface, isInstanceOf";
		s[59]= "Security Providers^oodProviders^A provider enables you to use an abstract component or an interface in markup. The framework uses the provider to determine the concrete component to use at runtime. Server-side providers are more common, but if you don't need to access the server when you're creating a component, you can use a client-side provider instead...^ComponentDescriptorProvider, ComponentConfigProvider, DefDescriptor, set attributes, provider interface";
		s[60]= "Setting the Mode for a Request^modesSetRequest^Each application has a default mode, but you can change the mode for each HTTP request by setting the aura.mode parameter in the query string. If the requested mode is in the list of available modes, the response for that mode is returned. Otherwise, the default mode is used...^dev, prod, aura.mode, modes";
		s[61]= "Modes Reference^modesReference^This section lists all the modes that Aura supports. The list of modes in Aura is defined in AuraContext. Every request in Aura is associated with a context. After initial loading of an application, each subsequent request is an XHR POST that contains your Aura context configuration. This includes the mode to run in, the name of the application, and the namespaces that already have preloaded metadata on the client...^closure, closure compiler, runtime, prod, dev, proddebug, jstest, jstestdebug, autojstest, autojstestdebug, ptest, cadence, selenium, seleniumdebug, utest, ftest, stats";
		s[62]= "Controlling Available Modes^modesAvailableSet^You can customize the set of available modes in your application by writing a Java class that implements the getAvailableModes() method in ConfigAdapter. The default implementation in ConfigAdapterImpl makes all modes available...^prod mode";
		s[63]= "Setting the Default Mode^modesSetDefault^The default mode is DEV. This is defined in ConfigAdapterImpl. You can change the default mode to PROD by setting the aura.production Java system property to true...^ConfigAdapter, getDefaultMode";
		s[64]= "Component Request Overview^cycleComp^Aura performs initial construction of a component on the server. The client completes the initialization process and manages any rendering or rerendering. Before we explore the component request process, it is important to understand these terms...^definition, defdescriptor, instance, registry, rendering, metadata, init";
		s[65]= "Server-Side Process^cycleInit^A component lifecycle starts when the client sends an HTTP request to the server, which can be in the form http://<yourServer>/<namespace>/<component>.cmp. Attributes can be included in the query string, such as http://<yourServer>/<namespace>/<component>.cmp?title=Component1. If attributes are not specified, the defaults that are defined in the attribute definition are used...^registry, component definitions, init, instantiate, serialize";
		s[66]= "Client-Side Process^clientInit^In Server-Side Process, we looked at what happens on the server when the client sends a request for a component. After the server processes the request, it returns the component definitions (metadata for the all required components) and instance tree (data) in JSON format...^deserialize, metadata, instance tree, rendering";
		s[67]= "Component Request Glossary^cycleRefs^This glossary explains terms related to Aura definitions and registries...^definition, aura:component, root definition, componentdef, interfacedef, eventdef, controllerdef, modeldef, providerdef, rendererdef, themedef, testsuitedef, attributedef, registereventdef, actiondef, provider, defref, componentdefref, attributedefref, registry, defdescriptor";
		s[68]= "Querying State and Statistics^queryLang^To aid debugging and testing, you can use Aura's query language to see the current state of certain objects in a running app. The query language is available in your browser's console for all modes, except for PROD mode...^qhelp, console, view, query value objects, grouping, groupby, diffing, diff";
		
		//Reference
		s[69]= "Javadoc^javadoc^Browse the Aura Javadoc by clicking Java API in the Reference tab.^JavaScript API";
		s[70]= "aura:if^tagIf^aura:if renders the content within the tag if the isTrue attribute evaluates to true. Aura evaluates the isTrue expression on the server and instantiate components either in its body or else attribute...^aura:renderIf";
		s[71]= "aura:iteration^tagIteration^Renders a view of a collection of items. Data changes are re-rendered automatically on the page.^componentdefref, aura:forEach, hashmap, model";
		s[72]= "aura:application^appOverview^An Aura app is a special top-level component whose markup is in a .app file. The markup looks similar to HTML and can contain Aura components as well as a set of supported HTML tags. The .app file is a standalone entry point for the app and enables you to define the overall application layout, style sheets, and global JavaScript includes...^location change, security provider, securityProvider, template, appcache, useAppcache";
		s[73]= "Setting Attributes on a Super Component^tagAuraSetSuper^Use the <aura:set> system tag to set the value of an attribute in a super component if you are extending a component or implementing an interface...^inherited attributes, inherited body";
		s[74]= "Setting Attributes on a Component Reference^tagAuraSetReference^When you include another component, such as <ui:button>, in a component, we call that a component reference to <ui:button>. You can use <aura:set> to set an attribute on the component reference. For example, if your component includes a reference to <ui:button>...^aura:set, ui:block";
		s[75]= "Supported HTML Tags^tagAuraSetReference^HTML tags are implemented as Aura components. The majority of HTML5 tags are supported...^HTML support, strict XHTML";
		s[76]= "Supported aura:attribute Types^attrTypesOverview^All <aura:attribute> tags have name and type values...^case sensitive";
		s[77]= "Basic Types^attrTypesBasic^This table lists the supported type values for basic types. Some of these types correspond to the wrapper objects for primitives in Java. Since Aura is written in Java, defaults, such as maximum size for a number, for these basic types are defined by the Java objects that they map to...^boolean, date, datetime, decimal, double, integer, long, string, arrays, objects, aura:attribute, pass array, create attribute";
		s[78]= "Collection Types^attrTypesCollection^This table lists the supported type values for collection types.^list, map, set";
		s[79]= "Custom Java Class Types^attrTypesJava^A aura:attribute can have a type corresponding to a Java class...^list, Java type, JsonSerializable, JSON";
		s[80]= "Aura-Specific Types^attrTypesAuraSpecific^This table lists the supported type values for types that are specific to Aura...^Aura.Component, Aura.Action, action type, component type";
		s[94]= "Setting Label Parameters^labelParameters^The aura:label component accepts parameters, allowing you to provide different values for the labels. This can be useful for localizing your labels...^$Label, label provider"
		
		//Quick Start
		s[81]= "Create an Aura App from the Command Line^qsCmdLine^You can generate a basic Aura app quickly using the command line...^maven, archetype, aura template, jetty";
		s[82]= "Create an Aura App in Eclipse^eclipseCreateApp^This section shows you how to create an Aura app in Eclipse using a Maven remote archetype...^archetype, maven, eclipse plugin";
		s[83]= "Install the Aura Assist Plugin^auraPlugin^The Aura Assist Eclipse Plugin enables Aura code highlighting and auto-completion of namespaces, components, and attributes.^download plugin";
		s[84]= "Add a Component^eclipseCreateCmp^An Aura app is represented by a .app file composed of a series of Aura components and HTML tags. In Eclipse, we'll add a component to the simple app that we just created...^create component";
		s[85]= "Build Aura from Source^buildFromSource^You don't have to build Aura from source to use it. However, if you want to customize the source code or submit a pull request with enhancements to the framework, here's how to do it...^download aura, git, run aura";
		s[86]= "Aura Demo^buildApp^We built a simple app on the Aura framework to demonstrate its capabilities. Aura Note is a note-taking app showcasing the simplicity of building apps on Aura...^aura source";
			
		//FAQs
		s[87]= "What are the benefits of using Aura?^faqBenefits^Performance, flexible integration, event-driven architecture, MVC architecture, parallel design and development^inheritance, encapsulation, object-oriented, cross browser, HTML5, CSS3, FAQ";
		s[88]= "What is an Aura Component?^faqComp^Components are the self-contained and reusable units of an Aura app. They represent a reusable section of the UI, and can range in granularity from a single line of text to an entire app. Components are rendered to produce HTML DOM elements within the browser. The framework includes a rich set of prebuilt components. You can assemble and configure components to form new components in an app...^FAQ";
		s[89]= "What is an Aura App?^faqApp^An Aura app is a special top-level component whose markup is in a .app file. The markup looks similar to HTML and can contain Aura components as well as a set of supported HTML tags...^FAQ";
		s[90]= "How do I use Events in Aura?^faqEvents^You may be familiar with event-driven programming as it's used in many languages and frameworks, such as JavaScript and Java Swing. The idea is that you write handlers that respond to interface events as they occur. In Aura, you write the handlers in client-side controller actions with JavaScript...^FAQ";
		s[91]= "What happens when I make an initial request?^faqInit^When you make a request to load an application on a browser, Aura returns an HTTP response with a default template, denoted by the template attribute in the .app file. The template contains JavaScript tags that make requests to get your application data.^preload namespace, rendering, DOM, HTML";
		s[92]= "Which browsers does Aura support?^faqBrowsers^Aura supports the most recent stable version of the following web browsers across major platforms, with exceptions noted...^Chrome, Safari, Firefox, IE, Internet Explorer, HTML, browser support";
		s[93]= "What do Aura version numbers mean?^faqVersions^Aura uses version numbers that are consistent with other Maven projects. This makes it easy for projects built with Maven to express their dependency on Aura...^maven, build, snapshot, release build, getauraversion";
			
		
		searchTerm = unescape(searchTerm);
		
		/**
		 * Open-source JavaScript Search Kit 1.0
		 * Supports double-quote exact matches 
		 * and omitting of keywords with hyphens
		 */
		var od = searchTerm;
		var m = 0;
		if (searchTerm.charAt(0) == '"' && searchTerm.charAt(searchTerm.length - 1) == '"') {
			m = 1;

		}

		var r = new Array();
		var co = 0;

		if (m == 0) {
			var woin = new Array();
			var w = searchTerm.split(" ");
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
			searchTerm = searchTerm.replace(/\"/gi, "");
			var a = 0;
			var pat = new RegExp(searchTerm, "i");
			for (var c = 0; c < s.length; c++) {
				var rn = s[c].search(pat);
				if (rn >= 0) {
					r[a] = s[c];
					a++;
				}
			}
			co = a;
		}
		
		//Return search term
		var searchTerm = cmp.getValue("v.searchTerm");
		searchTerm.setValue(od);	
		
		//Return number of results found
		var queryCount = cmp.getValue("v.queryNum");
		queryCount.setValue(co);
		
		//Return help text
		var help = cmp.getValue("v.helpText");
		if (co==0) {
			var helpStr = "Please enter another search term.";
			help.setValue(helpStr);
		}
		if (co>5) {
			var helpStr = "Improve your search by using double quotes \"\" for exact keyword matches or omitting terms by using a hyphen - before the term.";
			help.setValue(helpStr);
		}
		if (co>10) {
			var helpStr = "Narrow your search by using double quotes \"\" for exact keyword matches or omitting terms with a hyphen -. For example, instead of searching for \"component\", try searching for \"component attribute\" with double quotes or \"component -value\".";
			help.setValue(helpStr);
		}
		
		var myQuery = cmp.getValue("v.myQuery");
		
		//Create an array to store search results
		var result = [];
		
		//Display results
			for (var a=0; a < r.length; a++){
				var os = r[a].split("^");
				var br="<b>" + od + "</b>";
				os[2] = os[2].replace(pat, br);
			
				//Set the format of the search result
				result[a] = "<a href=\"#help?topic=" + os[1] + "\" />" + os[0] + "</a><br/>" + os[2];	
			}
			myQuery.setValue(result);
	}
			
}