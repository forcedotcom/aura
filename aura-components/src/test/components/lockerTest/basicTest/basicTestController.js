({
    doInit: function(cmp, event) {
        cmp._thisFromInit = this;
        cmp._eventParamValue = event.getParams().value;
    },

    testAuraLockerInController: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureAura", $A.toString(), "Expected $A in controller to be a SecureAura");
    },

    testComponentLockerInController: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureComponent", cmp.toString(), "Expected component in controller"
                + " to be a SecureComponent");
    },

    testDocumentLockerInController: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureDocument", document.toString(), "Expected document in controller"
                + " to be a SecureDocument");
    },

    testWindowLockerInController: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureWindow", window.toString(), "Expected window in controller"
                + " to be a SecureWindow");
    },

    testAppendDynamicallyCreatedDivToMarkup: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.createElement("div");
        div.id = "myId";
        div.className = "fancypants";
        var content = cmp.find("content");
        var contentEl = content.getElement();
        contentEl.appendChild(div);

        div = cmp.find("content").getElement();
        var appendedDiv = div.childNodes[0];
        testUtils.assertEquals("myId", appendedDiv.id);
        testUtils.assertEquals("fancypants", appendedDiv.className);
    },

    testContextOfController: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertUndefined(this, "Expected 'this' in Locker controller to be undefined");
    },

    testDefineGetterExploit: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        try {
            var defprop = ({}).__defineGetter__;
            defprop('FOO', function() { return this; });
            testUtils.fail("Expected attempt to overwrite __defineGetter__ to throw an error");
        } catch (e) {
            testUtils.assertStartsWith("TypeError", e.toString(), "Unexpected error. Expected TypeError, got " + e);
        }
    },

    testSetTimeoutNonFunctionParamExploit: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        try {
            setTimeout({ bind: function() {
                return function() {
                    alert(this);
                };
            }});
            testUtils.fail("setTimeout with a non-function parameter should throw error");
        } catch (e) {
            testUtils.assertStartsWith("TypeError", e.toString(), "Unexpected error. Expected TypeError, got " + e);
        }
    },

    testComponentUnfilteredFromUserToSystemMode: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponent = cmp.find("innerCmp");
        // Make sure it's really a SecureComponent before setting
        testUtils.assertStartsWith("SecureComponent", secureComponent.toString());
        cmp.set("v.componentStore", secureComponent);
    },

    testLocationExposed: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertDefined(location, "Expected location to be defined");
    },

	testEvalBlocking : function(cmp, event, helper) {
		var testUtils = cmp.get("v.testUtils");
		var inIframe = event.getParam("arguments").inIframe;

		// eval attempts that return a SecureWindow object
		helper.doTestEvalForSecureWindow(cmp, function() { return window }, testUtils);
		helper.doTestEvalForSecureWindow(cmp, function() { return self }, testUtils);

	    if(inIframe){
	        helper.doTestEvalForSecureIFrameContentWindow(cmp, function() { return top }, testUtils);
		    helper.doTestEvalForSecureIFrameContentWindow(cmp, function() { return parent }, testUtils);
	    }else{
	        helper.doTestEvalForSecureWindow(cmp, function() { return top }, testUtils);
		    helper.doTestEvalForSecureWindow(cmp, function() { return parent }, testUtils);
	    }
		// DCHASMAN TODO Here is where things go south: basically it looks like aura.mode=JSTESTDEBUG results in an aura doc iframed and missing the CSP header entirely
		// so that needs to be addressed (results in failures of things that should be blocked by unsafe-inoine etc)

		//helper.doTestEvalForUndefined(cmp, function() { var evil = eval; ("indirect", evil)("this") }, testUtils);
		//helper.doTestEvalForUndefined(cmp, function() { return ("indirect", eval)((new Function("return this"))()) }, testUtils);

		//helper.doTestEvalForUndefined(cmp, function() { return (function () { return this }()) }, testUtils);
		//helper.doTestEvalForUndefined(cmp, function() { return new Function('return this')() }, testUtils);
		//helper.doTestEvalForUndefined(cmp, function() { return ({}).constructor.constructor('return this')() }, testUtils);

		// Hieroglyphy for: alert("Hello")
		//helper.doTestEvalForUndefined(cmp, function() { return [][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((+{}+[])[+!![]]+(![]+[])[!+[]+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[+[]]+([][[]]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()([][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()(([]+{})[+[]])[+[]]+(!+[]+!![]+[])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+[]))+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[+[]]+([][[]]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()([][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()(([]+{})[+[]])[+[]]+(!+[]+!![]+[])+(!+[]+!![]+[]))+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[+[]]+([][[]]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()([][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()(([]+{})[+[]])[+[]]+(!+[]+!![]+!![]+!![]+[])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+[]))+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[+[]]+([][[]]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()([][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()(([]+{})[+[]])[+[]]+(!+[]+!![]+[])+(!+[]+!![]+[]))+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[+[]]+([][[]]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()([][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()(([]+{})[+[]])[+[]]+(!+[]+!![]+[])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+!![]+[])))() }, testUtils);
	},

    testUpdateElementDoesNotReturnCachedItem: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var origLiQuery = document.getElementsByTagName("li");
        var ul = document.getElementById("ul1");
        var newLi = document.createElement("li");
        newLi.id = "li2";
        ul.appendChild(newLi);
        var newLiQuery = document.getElementsByTagName("li");

        testUtils.assertEquals(2, newLiQuery.length, "2 'li' elements should be returned from query");
        testUtils.assertEquals("li2", newLiQuery[1].id, "Unexpected id value from appended 'li' element");
    },

    testAddExpandoToCachedItem: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var li = document.getElementById("l1");
        li.myExpando = "expando";
        var liCached = document.getElementById("l1");

        testUtils.assertEquals("expando", liCached.myExpando, "Expando on element not present after retrieving it from SecureObject cache");
    },

    testValueProviderOnDynamicallyCreatedComponents: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var completed = false;

        var origLiCount = document.getElementsByTagName("li").length;
        testUtils.assertEquals(1, origLiCount, "Test setup failure. Expected only 1 <li> element in the DOM");

        $A.createComponent("aura:html", {"tag":"li", "body":"B", "HTMLAttributes":{"id":"l2"}}, function(newCmp) {
            var ul = cmp.find("ul");
            var ulBody = [];
            ul.get("v.body").forEach(function(item, index) {
                ulBody.push(item);
            });
            ulBody.push(newCmp);
            ul.set("v.body", ulBody);
            completed = true;
        });

        testUtils.addWaitFor(
                true,
                function() { return completed; },
                function() {
                    var liElements = document.getElementsByTagName("li");
                    testUtils.assertEquals(origLiCount+1, liElements.length, "Dynamically created component not returned from" +
                           " document.getElementsByTagName after pushing to facet.");
                    var createdLi = document.getElementById("l2");
                    testUtils.assertEquals("B", testUtils.getText(createdLi), "Unexpected text on dynamically created component");
                }
        );
    },

    testThisVariableNotLeakedFromMarkup: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var thisAttribute = cmp.get("v.thisAttribute");

        testUtils.assertStartsWith("SecureComponent", thisAttribute.toString(), "Attribute with value {!this} should" +
                " be a SecureComponent");
        testUtils.assertStartsWith("SecureComponent", cmp._eventParamValue.toString(), "init handler event param" +
                " should be a SecureComponent");
        testUtils.assertUndefined(cmp._thisFromInit, "'this' in init handler should be undefined");
        testUtils.assertUndefined(this, "'this' in controller method should be undefined");
    },
    
    testCtorAnnotation: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var audio = new Audio();
        testUtils.assertStartsWith("SecureElement", audio.toString(), "Expected result of new Audio() to be a SecureElement");
        testUtils.assertTrue(audio.toString().indexOf("HTMLAudioElement") > 0, "Expected result of new Audio() to be an HTMLAudioElement");
    },
    
    testSecureElementPrototypeCounterMeasures: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        // Try to access the internal prototype of a SecureElement
        var el = cmp.find("content").getElement();
        var prototype = Object.getPrototypeOf(el);
        testUtils.assertTrue(prototype === HTMLDivElement.prototype);
    },

    // this should only be run on browsers where Locker is not supported
    testLockerDisabledForUnsupportedBrowser: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("[object Window]", window.toString(), 
                "Unsupported browsers should not have Locker enabled and should return raw window object");
        // do some minor operation to prove Aura is booted and functional
        var text = cmp.find("outputText").get("v.value");
        testUtils.assertEquals("Output Text here", text, "Unexpected value of output text");
    },

    testComponentPassedToOtherNamespaceViaCreateComponent: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        helper.passCmpViaCreateComponent(cmp);
        testUtils.addWaitForWithFailureMessage(
                true,
                function checkComponentCreationComplete() {
                    return document.getElementById("content").textContent !== "";
                },
                "DOM element with return from createComponent never updated",
                function assertReturnIsSecureComponentRef() {
                	var content = document.getElementById("content").textContent;
                    testUtils.assertStartsWith("SecureComponentRef", content,
                            "SecureComponent passed to another namespace should be filtered to SecureComponentRef");
                });
    },
    
    testInstanceOf: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        // Test Object
        var o = new Object();
        testUtils.assertTrue(o instanceof Object, "Object created via 'new Object()' should be an instance of Object");

        o = Object.create(Object.prototype);
        testUtils.assertTrue(o instanceof Object, "Object created via 'Object.create(null)'  should be an instance of Object");

        o = {};
        testUtils.assertTrue(o instanceof Object, "Object created via object literal should be an instance of Object");
        
        // Pull object through the locker membrane
        cmp.set("v.object", o);
        var oFromMembrane = cmp.get("v.object");
        testUtils.assertTrue(oFromMembrane instanceof Object, "Object created via object literal should be an instance of Object");
        
        // Test Function
        function foo() {
            return "foo";
        }       
        
        testUtils.assertTrue(foo instanceof Function, "Function foo() should be an instance of Function");

        // Test Array
        var array = new Array();
        testUtils.assertTrue(array instanceof Array, "Array created via 'new Array()' should be an instance of Array");

        array = [1, 2, 3];
        testUtils.assertTrue(array instanceof Array, "Array created via array literal should be an instance of Array");

        // Test Date
        var date = new Date();
        testUtils.assertTrue(date instanceof Date, "Array created via 'new Date()' should be an instance of Date");
        
        var iso = $A.localizationService.toISOString(date);
        testUtils.assertEquals(date.toISOString(), iso);
                
        // Test Element
        var element = document.createElement("div");
        testUtils.assertTrue(element instanceof HTMLDivElement, "DIV element should be an instance of HTMLDivElement");
        testUtils.assertTrue(element instanceof HTMLElement, "DIV element should be an instance of HTMLElement");
        testUtils.assertTrue(element instanceof Element, "DIV element should be an instance of Element");
        testUtils.assertTrue(element instanceof Node, "DIV element should be an instance of Node");
        testUtils.assertTrue(element instanceof EventTarget, "DIV element should be an instance of EventTarget");
        
        // DCHASMAN TODO Negative assertions for now - we expect that functions, arrays, 
        // and objects created in system mode will not match the type system of the locker.
        // However, these will flip to true once universal proxy is enabled where we can then explicitly wire up 
        // the prototype/or proxied getPrototypeOf() to cross realms /or masquarade as the underlying type (e.g. SecureWindow instanceof Window)!
        testUtils.assertFalse(cmp instanceof Object, "Object cmp should not be an instance of Object");
        testUtils.assertFalse(cmp.getGlobalId instanceof Function, "Function cmp.getGlobalId should not be an instance of Function");
        testUtils.assertFalse(cmp.get("v.body") instanceof Array, "Array cmp.get('v.body') should not be an instance of Array");
        testUtils.assertFalse(document instanceof Document, "document should not be an instance of Document");
        testUtils.assertFalse(window instanceof Window, "window should not be an instance of Window");
    },
    
    testFilteringProxy: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
                
        var o = helper._o;
        var po = helper._po;
        var TestPrototype = helper._TestPrototype;
    	
        testUtils.assertEquals("fooValue", po.foo());
        
        testUtils.assertTrue(o instanceof TestPrototype);
        testUtils.assertTrue(po instanceof TestPrototype);
        
        testUtils.assertTrue("foo" in po);
        testUtils.assertEquals("fooValue", po.foo());

        testUtils.assertEquals(
            JSON.stringify(Object.getOwnPropertyDescriptor(o, "someProperty")),
            JSON.stringify(Object.getOwnPropertyDescriptor(po, "someProperty")));

        // Add a dynamic property and make sure its visible on the proxy
        po.expando = "expandoValue";
        testUtils.assertEquals("expandoValue", po.expando);    
        
        // Verify that an expando set on one reference is reflected in another reference from a different namespace
        testUtils.assertEquals(JSON.stringify(Object.keys(o)), JSON.stringify(Object.keys(po)));
        
        delete po.expando;

        testUtils.assertEquals(JSON.stringify(Object.keys(o)), JSON.stringify(Object.keys(po)));
    }
})
