({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741,W-3674751): FF and iOS browser versions in autobuilds are too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],

    // TODO(tbliss): make these lists on SecureElement accessible here for maintainablility
    ElementPropertiesWhitelist: [
        "attributes",
        "classList", "className", "id", "tagName", "innerHTML", "namespaceURI",
        "scrollHeight", "scrollLeft", "scrollTop", "scrollWidth", "nextElementSibling", "previousElementSibling"
    ],
    ElementPropertiesBlacklist: ['childElementCount', 'firstElementChild', 'lastElementChild'],

    HTMLPropertiesWhitelist: ['accessKey', 'contentEditable', 'isContentEditable',
                              'dataset', 'dir', 'lang', 'spellcheck', 'style', 'tabIndex', 'title'],

    HTMLPropertiesBlacklist: [],

    OtherPropertiesWhitelist: ["childNodes", "children", "ownerDocument", "parentNode", "offsetParent"],

    MethodsWhitelist: ["appendChild", "replaceChild", "insertBefore", "addEventListener", "removeEventListener",
                       "dispatchEvent", "getAttribute", "setAttribute", "blur", "click", "focus", "hasAttribute",
                       "hasAttributeNS", "removeAttribute", "getAttributeNS", "setAttributeNS", "removeAttributeNS"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testElementProperties: {
        test: function(cmp) {
            cmp.testElementProperties("title", this.ElementPropertiesWhitelist, this.ElementPropertiesBlacklist);
        }
    },

    testAProperties: {
        test: function(cmp) {
            var linkProperties = [
                "hash",
                "host",
                "hostname",
                "href",
                "pathname",
                "port",
                "protocol",
                "search"
            ];

            // Exclude the properties for unsupported browser
            if(!$A.get("$Browser").isIE11) {
                linkProperties.push("origin");
            }

            cmp.testElementProperties("link", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("link", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("link", linkProperties, []);
        }
    },

    testAreaProperties: {
        test: function(cmp) {
            var areaProperties = [
                "alt",
                "coords",
                //"download", Not on FF
                "href",
                //"hreflang",
                //"media",
                //"rel",
                "shape",
                "target"
                //"type"
            ];
            cmp.testElementProperties("area", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("area", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("area", areaProperties, []);
        }
    },

    //FIXME: goliver  "AUDIO" : [ "autoplay", "buffered", "controls", "loop", "muted", "played", "preload", "src", "volume" ],

    //FIXME: goliver  "BASE" : [ "href", "target" ],

    //FIXME: goliver  "BDO" : [ "dir" ],

    testButtonProperties: {
        test: function(cmp) {
            // commented out attributes don't apply to input text
            var buttonProperties = [
                "autofocus",
                "disabled",
                "form",
                "formAction",
                "formEnctype",
                "formMethod",
                "formNoValidate",
                "formTarget",
                "name",
                "type"
            ];
            cmp.testElementProperties("button", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("button", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("button", buttonProperties, []);
        }
    },

    //FIXME: goliver "CANVAS" : [ "height", "width" ],

    //FIXME: goliver "COL" : [ "span" ],

    //FIXME: goliver "COLGROUP" : [ "span", "width" ],

    //FIXME: goliver  "DATA" : [ "value" ],

    //FIXME: goliver "DEL" : [ "cite", "datetime" ],

    //FIXME: goliver  "DETAILS" : [ "open" ],

    //FIXME: goliver  "EMBED" : [ "height", "src", "type", "width" ],

    //FIXME: goliver  "FIELDSET" : [ "disabled", "form", "name" ],

    testFormProperties: {
        test: function(cmp) {
            var formProperties = [
                "acceptCharset",
                "action",
                "autocomplete",
                "enctype",
                "method",
                "name",
                "noValidate",
                "target"
            ];
            cmp.testElementProperties("form", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("form", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("form", formProperties, []);
        }
    },

    testImgProperties: {
        test: function(cmp) {
            var imgProperties = [
                "alt",
                "crossOrigin",
                "height",
                "isMap",
                "longDesc",
                "src",
                "width",
                "useMap"
            ];

            // Exclude the properties for unsupported browser
            var browser = $A.get("$Browser");
            if(!browser.isIE11 && !browser.isPhone && !browser.isTablet) {
                imgProperties.push("sizes");
            }
            if(!browser.isIE11) {
                imgProperties.push("srcset");
            }

            cmp.testElementProperties("img", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("img", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("img", imgProperties, []);
        }
    },

    testInputProperties: {
        test: function(cmp) {
            // commented out attributes don't apply to input text
            var inputProperties = [
                "type",
                "accept",
                "autocomplete",
                "autofocus",
                //"autosave",
                "checked",
                "disabled",
                "form",
                "formAction",
                "formEnctype",
                "formMethod",
                "formNoValidate",
                "formTarget",
                "height",
                //"inputmode",
                //"list", Not on Safari
                "max",
                "maxLength",
                "min",
                //"minLength", - minLength is not in FF
                "multiple",
                "name",
                "pattern",
                "placeholder",
                "readOnly",
                "required",
                "size",
                "src",
                "step",
                "tabIndex",
                "value",
                "width"
            ];

            // Exclude the properties for unsupported browser
            if(!$A.get("$Browser").isIE11) {
                inputProperties.push("selectionDirection");
            }

            cmp.testElementProperties("input", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("input", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("input", inputProperties, []);
        }
    },

    //FIXME - goliver - "INS" : [ "cite", "datetime" ],

    testLabelProperties: {
        test: function(cmp) {
            var labelProperties = [
                "htmlFor",
                "form"
            ];
            cmp.testElementProperties("label", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("label", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("label", labelProperties, []);
        }
    },

    testLabelForInput: {
        test: function(cmp) {
            cmp.testLabelForInput();
        }
    },

    testForAttributeAllowedOnLabelOnly: {
        test: function(cmp) {
            cmp.testForAttributeAllowedOnLabelOnly();
        }
    },

    //FIXME - goliver - "LI" : [ "value" ],

    //FIXME - goliver - "LINK" : [ "crossOrigin", "href", "hreflang", "media", "rel", "sizes", "title", "type" ],

    //FIXME - goliver - "MAP" : [ "name" ],

    //FIXME - goliver - "META" : [ "content", "name" ],

    //FIXME - goliver - "METER" : [ "value", "min", "max", "low", "high", "optimum", "form" ],

    // TODO(goliver) we can't instantiate object in the component. I'm guessing that typemustmatch is wrong.
    _testObjectProperties: {
        test: function(cmp) {
            var objectProperties = [
                "data",
                "form",
                "height",
                "type",
                "typeMustMatch",
                "useMap",
                "width"
            ];
            cmp.testElementProperties("object", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("object", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("object", objectProperties, []);
        }
   },

    //FIXME - goliver - "OL" : [ "reversed", "start", "type" ],

    //FIXME - goliver - "OPTGROUP" : [ "disabled", "label" ],

    //FIXME - goliver - "OPTION" : [ "disabled", "label", "selected", "value" ],

    //FIXME - goliver - "OUTPUT" : [ "for", "form", "name" ],

    //FIXME - goliver - "PARAM" : [ "name", "value" ],

    //FIXME - goliver - "PROGRESS" : [ "max", "value" ],

    //FIXME - goliver - "Q" : [ "cite" ],

    //FIXME - goliver - "SELECT" : [ "autofocus", "disabled", "form", "multiple", "name", "required", "size" ],

    //FIXME - goliver - "SOURCE" : [ "src", "type" ],

    testTableProperties: {
        test: function(cmp) {
            //None currently defined
            //var tableProperties = [
            //];
            cmp.testElementProperties("table", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("table", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            //cmp.testElementProperties("table", tableProperties, []);
        }
    },

    testTdProperties: {
        test: function(cmp) {
            var tdProperties = [
                "colSpan",
                "headers",
                "rowSpan"
                //"scope" Not on FF or Safari
            ];
            cmp.testElementProperties("td", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("td", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("td", tdProperties, []);
        }
    },

    //FIXME - goliver - "TEMPLATE" : [ "content" ],

    testTextAreaProperties: {
        test: function(cmp) {
            // commented out attributes don't apply to input text
            var textareaProperties = [
                //"autocomplete", NOT IN FF or Chrome
                "autofocus",
                "cols",
                "disabled",
                "form",
                "maxLength",
                //"minLength", NOT IN FF
                "name",
                "placeholder",
                "readOnly",
                "required",
                "rows",
                "selectionEnd",
                "selectionStart",
                "wrap"
            ];

            // Exclude the properties for unsupported browser
            if(!$A.get("$Browser").isIE11) {
                textareaProperties.push("selectionDirection");
            }

            cmp.testElementProperties("textarea", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("textarea", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("textarea", textareaProperties, []);
        }
    },

    testThProperties: {
        test: function(cmp) {
            var thProperties = [
                "colSpan",
                "headers",
                "rowSpan"
                //"scope" Not on FF or Safari
            ];
            cmp.testElementProperties("th", this.ElementPropertiesWhitelist,  this.ElementPropertiesBlacklist);
            cmp.testElementProperties("th", this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
            cmp.testElementProperties("th", thProperties, []);
        }
    },

    //FIXME - goliver - "TIME" : [ "datetime" ],

    //FIXME - goliver - "TRACK" : [ "default", "kind", "label", "src", "srclang" ],

    //FIXME - goliver - "VIDEO" : [ "autoplay", "buffered", "controls", "crossOrigin", "height", "loop", "muted", "played", "preload", "poster", "src", "width" ]


    testHtmlProperties: {
        test: function(cmp) {
            cmp.testHtmlProperties(this.HTMLPropertiesWhitelist, this.HTMLPropertiesBlacklist);
        }
    },

    // TODO(tbliss): Need special setup to get some of these to be available, need to revisit
    _testOtherProperties: {
        test: function(cmp) {
            cmp.getDiv();
            var element = cmp.get("v.log");
            this.OtherPropertiesWhitelist.forEach(function(name) {
                $A.test.assertTrue(name in element);
            });
        }
    },

    testExposedMethods: {
        test: function(cmp) {
            cmp.testExposedMethods(this.MethodsWhitelist);
        }
    },

    testFramesBlocked: {
        test: function(cmp) {
            cmp.testFramesBlocked();
        }
    },

    /**
     * removeEventListener() is special in SecureElement, so besides verifying it's exposed,
     * it also needs to be verified working correctly.
     */
    testRemoveEventListener: {
        test: function(cmp) {
            cmp.testRemoveEventListener(false);
        }
    },

    testRemoveEventListenerWithUseCapture: {
        test: function(cmp) {
            cmp.testRemoveEventListener(true);
        }
    },

    testInnerHTMLSupportsUseTagForSvgElement: {
        test: function(cmp) {
            cmp.testInnerHTMLSupportsUseTagForSvgElement();
        }
    },

    testTextContent: {
        test: function(cmp) {
            cmp.testTextContent();
        }
    },

    testInnerText: {
        test: function(cmp) {
            cmp.testInnerText();
        }
    },

    testInnerHTMLForExistingElement: {
        test: function(cmp) {
            cmp.testInnerHTML("ExistingElement");
        }
    },

    testInnerHTMLForCreatedElement: {
        test: function(cmp) {
            cmp.testInnerHTML("CreatedElement");
        }
    },

    testInsertAdjacentHTMLForExistingElement: {
        test: function(cmp) {
            cmp.testInsertAdjacentHTML("ExistingElement");
        }
    },

    testInsertAdjacentHTMLForCreatedElement: {
        test: function(cmp) {
            cmp.testInsertAdjacentHTML("CreatedElement");
        }
    },

    testAddEventListenerMultipleCalls: {
        test: function(cmp) {
            cmp.testAddEventListenerMultipleCalls();
        }
    },

    testSvgGetBBox: {
        test: function(cmp) {
            cmp.testSvgGetBBox();
        }
    },

    testScalarExpression: {
        test: function(cmp) {
            cmp.testScalarExpression();
        }
    },
    
    testTableAPI: {
        test: function(cmp) {
            cmp.testTableAPI();
        }
    },    

    testElementCache: {
        test: function(cmp) {
            cmp.testElementCache();
        }
    },

    testNoAccessToParentNodeReturnsNull: {
        test: function(cmp) {
            cmp.testNoAccessToParentNodeReturnsNull();
        }
    },

    testParentNodeInsideOpaqueObject: {
        test: function(cmp) {
            cmp.testParentNodeInsideOpaqueObject();
        }
    },

    testLinkElement:{
        test: function(cmp) {
            cmp.testLinkElement();
        }
    },

    testCloneNodeShallow: {
        test: function(cmp) {
            cmp.testCloneNodeShallow();
        }
    },

    testCloneNodeDeep: {
        test: function(cmp) {
            cmp.testCloneNodeDeep();
        }
    },

    testCloneNodeDeep_VerifyAccess: {
        test: function(cmp) {
            cmp.testCloneNodeDeep_VerifyAccess();
        }
    },

    testCloneNodeDeep_VerifyBlockedAccess: {
        test: function(cmp) {
            cmp.testCloneNodeDeep_VerifyBlockedAccess();
        }
    },

    testTextNodeApi: {
        test: function(cmp) {
            cmp.testTextNodeApi();
        }
    },

    /**
     * Text.splitText() is special because it creates a new node as a sibling to the current node and returns that
     * to the user. LockerService must do special handling to key this new node before returning it.
     */
    testTextNodeSplitText: {
        test: function(cmp) {
            cmp.testTextNodeSplitText();
        }
    },

    testAriaAttributesAccessible: {
        test: function(cmp) {
            cmp.testAriaAttributesAccessible();
        }
    },

    testAttributesPropertyContainsData: {
        test: function(cmp) {
            cmp.testAttributesPropertyContainsData();
        }
    },

    testGetSetInvalidAttributes: {
        test: function(cmp) {
            cmp.testGetSetInvalidAttributes();
        }
    },

    testRecursiveTraversal: {
        test: function(cmp) {
            cmp.testRecursiveTraversal();
        }
    },
    
    testSuperRenderResultFiltering: {
        test: function(cmp) {
            var testUtils = cmp.get("v.testUtils");

        	// Verify that all elements (owned by the locker and by system) are returned from render
            var sentinel = document.querySelector(".stamp-success.uiStamp");
            
            testUtils.assertNotUndefinedOrNull(sentinel, "Unable to locate sentinel DOM element!");
            testUtils.assertEquals("Sentinel For Rendering Tests", sentinel.textContent);
                        
            var secondSentinel = document.getElementById("secondSentinel");
            testUtils.assertNotUndefinedOrNull(secondSentinel, "Unable to locate second sentinel DOM element!");
            testUtils.assertEquals("Second Sentinel", secondSentinel.textContent);        }
    }
})
