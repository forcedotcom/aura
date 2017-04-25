({
    testElementAttributesGetSet: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var element = document.getElementById("title");
        var attrs = element.attributes;
        var origLength = attrs.length;

        var attr = document.createAttribute ("data-foo");
        attr.value = "bar";
        attrs.setNamedItem(attr);

        testUtils.assertEquals(origLength + 1, attrs.length, "Unexpected attribute length after adding new attribute");
        testUtils.assertEquals("data-foo", attrs.getNamedItem("data-foo").name, "Unexpected attribute name from new attribute");
        testUtils.assertEquals("data-foo", attrs[origLength].name, "Unexpected attribute accessed at last index");
        testUtils.assertEquals("bar", attrs.getNamedItem("data-foo").value, "Unexpected attribute value from new attribute");
        testUtils.assertEquals(null, attrs.getNamedItem("does-notExist"), "Unexpected return trying to get attribute that doesn't exist");
    },

    testElementAttributesRemove: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var element = document.getElementById("title");
        var attrs = element.attributes;
        var origLength = attrs.length;

        attrs.removeNamedItem("id");

        testUtils.assertEquals(origLength - 1, attrs.length, "Unexpected attribute length after removing attribute");
        testUtils.assertEquals(null, attrs.getNamedItem("id"), "Unexpected return trying to get removed attribute");
    },

    testElementGetAttribute: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var element = document.getElementById("title");
        var attr = element.getAttributeNode("id");

        testUtils.assertEquals("title", attr.value, "Unexpected Attr value");
        testUtils.assertTrue(attr.toString().startsWith("SecureElement"), "Attr returned from getAttributeNode should be SecureElement");
        testUtils.assertTrue(attr.ownerElement.toString().startsWith("SecureElement"), "Attr ownerElement did not return SecureElement");
    },

    testInnerHtmlFiltering: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var el = document.getElementById("innerHtmlFilteringTester");
        var innerHTML = el.innerHTML;

        // HTML output is coupled to location in DOM so just verify a few key characteristics
        testUtils.assertTrue(innerHTML.indexOf("<p id=\"hiP\"") !== -1, "Expected <p> element to be present in el.innerHTML");
        testUtils.assertTrue(innerHTML.indexOf("Inside facet") !== -1, "Expected facet text to be present in el.innerHTML");
        // ui:outputText from a different namespace so it should be filtered out
        testUtils.assertTrue(innerHTML.indexOf("outputText") === -1, "Expected ui:outputText to not be present in el.innerHTML");
    },

    testTextContentFiltering: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var el = document.getElementById("innerHtmlFilteringTester");
        testUtils.assertEquals("hiInside facet", el.textContent, "Unexpected return from el.textContent");
    },

    testInnerTextFiltering: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var el = document.getElementById("innerHtmlFilteringTester");
        // Note this exemplifies divergent behavior from the real innerText. The newline is not present here
        // since we are getting the innerText of the clone, not the live DOM element
        testUtils.assertEquals("hiInside facet", el.innerText, "Unexpected return from el.innerText");

        var notInDom = document.createElement("div");
        notInDom.innerHTML = "<p id='notInDom'>hi there</p><div> same line</div>";
        // Elements not in the live DOM will not have styles such as newline for div applied
        testUtils.assertEquals("hi there same line", notInDom.innerText, "Unexpected return from notInDom.innerText");
    },

    testAriaAttributesAccessible: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var td = document.getElementById("td");
        testUtils.assertEquals("cell", td.getAttribute("role"));
        testUtils.assertEquals("123", td.getAttribute("aria-describedby"));
        td.setAttribute("aria-describedby", "321");
        testUtils.assertEquals("321", td.getAttribute("aria-describedby"));
    },

    testAttributesPropertyContainsData: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var dataFooFound = false;

        var div = document.getElementById("attributesTester");
        for (var i = 0; i < div.attributes.length; i++) {
            var attribute = div.attributes.item(i);
            if (attribute.name === "data-foo") {
                dataFooFound = true;
            }
            // only id and data-* attributes are not filtered out for this case
            if (attribute.name !== "id" && attribute.name.indexOf("data-") !== 0) {
                testUtils.fail("Unexpected attribute " + attribute.name + " found on element");
            }
        }
        testUtils.assertTrue(dataFooFound, "Custom element attribute data-foo not present on div");
    },

    testElementProperties: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var auraId = event.getParam("arguments").auraId;
        var elementPropertiesWhitelist = event.getParam("arguments").elementPropertiesWhitelist;
        var elementPropertiesBlacklist = event.getParam("arguments").elementPropertiesBlacklist;
        var c = cmp.find(auraId);
        var element = c.getElement();

        elementPropertiesWhitelist.forEach(function(name) {
            testUtils.assertTrue(name in element, "Expected property '" + name + "' to be a property on SecureElement");
        });
        elementPropertiesBlacklist.forEach(function(name) {
            testUtils.assertUndefined(element[name], "Expected property '" + name + "' to return undefined on SecureElement");
        });
    },

    testHtmlProperties: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var htmlPropertiesWhitelist = event.getParam("arguments").htmlPropertiesWhitelist;
        var htmlPropertiesBlacklist = event.getParam("arguments").htmlPropertiesBlacklist;
        var element = cmp.find("title").getElement();

        htmlPropertiesWhitelist.forEach(function(name) {
            testUtils.assertTrue(name in element, "Expected property '" + name + "' to be a property on SecureElement");
        });
        htmlPropertiesBlacklist.forEach(function(name) {
            testUtils.assertFalse(element[name], "Expected property '" + name + "' to return undefined on SecureElement");
        });
    },

    testExposedMethods: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var methodsWhitelist = event.getParam("arguments").methodsWhitelist;
        var element = cmp.find("title").getElement();

        methodsWhitelist.forEach(function(name) {
            testUtils.assertDefined(element[name]);
        });
    },

    testFramesBlocked: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        try {
            document.createElement("frame");
            testUtils.fail("Should not have ben able to create a FRAME element");
        } catch(e) {
            testUtils.assertEquals(e.toString(), "The deprecated FRAME element is not supported in LockerService!");
        }
    },

    testRemoveEventListener: function(cmp, event) {
        var testUtils = cmp.get("v.testUtils");
        var counter = 0;

        var element = cmp.find("title").getElement();
        var testWithUseCapture = event.getParam("arguments").testWithUseCapture;
        var useCapture = undefined;
        if(testWithUseCapture) {
            useCapture = true;
        }

        element.addEventListener("click", function oneTimeClicker() {
            counter += 1;
            element.removeEventListener("click", oneTimeClicker, useCapture);
        }, useCapture);

        testUtils.clickOrTouch(element);
        // the event listener has been removed
        testUtils.clickOrTouch(element);

        testUtils.assertEquals(1, counter);
    },

    testInnerHTMLSupportsUseTagForSvgElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.innerHTML = '<defs> <text id="text" x="50" y="50">SVG</text> </defs>' +
            '<use xlink:href="#text"></use>';

        var actual = svg.innerHTML;
        // partially matching the tag, since browsers may insert attributes in the tag
        testUtils.assertTrue(actual.indexOf('xlink:href="#text"></use>') > -1,
            "use tag should not be removed by DOMPurify: " + actual);
    },

    testTextContent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var element = document.createElement("div");
        element.textContent = "text content";
        testUtils.assertEquals("text content", element.textContent);
    },

    testInnerText: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var element = document.createElement("div");
        // Node.innerText is not supported on all browsers
        if ("innerText" in element) {
            element.innerText = "innerText content";
            testUtils.assertEquals("innerText content", element.innerText);
        }
    },

    testInnerHTML: function(cmp, event) {
        var testUtils = cmp.get("v.testUtils");
        var targetElement = event.getParam("arguments").targetElement;
        var element;
        if(targetElement === "ExistingElement") {
            element = document.querySelector('.title');
        } else if (targetElement === "CreatedElement") {
            element = document.createElement("div");
        }

        element.innerHTML = "innerHTML content";
        testUtils.assertEquals("innerHTML content", element.innerHTML);
    },

    testInsertAdjacentHTML: function(cmp, event) {
        var testUtils = cmp.get("v.testUtils");
        var targetElement = event.getParam("arguments").targetElement;
        var element;
        if(targetElement === "ExistingElement") {
            element = document.querySelector('.title');
        } else if (targetElement === "CreatedElement") {
            element = document.createElement("div");
        }

        element.innerHTML = "<span>innerHTML content</span>";
        var innerElement = element.firstChild;
        innerElement.insertAdjacentHTML("afterbegin","<i>afterbegin content</i>");
        innerElement.insertAdjacentHTML("beforeend","<i>beforeend content</i>");
        innerElement.insertAdjacentHTML("beforebegin","<i>beforebegin content</i>");
        innerElement.insertAdjacentHTML("afterend","<i>afterend content</i>");

        testUtils.assertEquals("<i>beforebegin content</i><span><i>afterbegin content</i>innerHTML content<i>beforeend content</i></span><i>afterend content</i>", element.innerHTML);
    },

    testAddEventListenerMultipleCalls : function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        var counter = 0;
        var handler1 = function() {
            counter += 0.3;
        }
        var handler2 = function() {
            counter += 1;
        }

        var element = cmp.find("title").getElement();
        element.addEventListener("click", handler1);

        // additional handlers should be allowed
        element.addEventListener("click", handler2);

        // adding an existing handler should not error out
        element.addEventListener("click", handler1);

        // again, no error on adding an existing handler
        element.addEventListener("click", handler2);

        testUtils.clickOrTouch(element);

        // each handler above should have been invoked once only
        testUtils.assertEquals(1.3, counter);
    },

    testSvgGetBBox: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var expected = {
            "x": 20,
            "y": 30,
            "height": 40,
            "width": 50
        };

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.width = 400;
        svg.height = 400;
        document.body.appendChild(svg);

        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttributeNS(null, 'x', '20');
        rect.setAttributeNS(null, 'y', '30');
        rect.setAttributeNS(null, 'height', '40');
        rect.setAttributeNS(null, 'width', '50');
        rect.setAttributeNS(null, 'fill', 'blue');
        svg.appendChild(rect);

        var bbox = rect.getBBox();
        for (var prop in expected) {
            testUtils.assertEquals(expected[prop], bbox[prop], "Unexpected attribute value returned from getBBox() for <" + prop + ">");
        }
    },

    testScalarExpression: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var scalarExpression = cmp.find("scalarExpression");
        var element = scalarExpression.getElement();

        testUtils.assertEquals("A scalar expression", element.innerHTML);
    },

    testTableAPI: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        // Call addRow() with the ID of a table
        var table = document.createElement("table");

        // Insert a row in the table at row index 0
        var newRow = table.insertRow(0);
        testUtils.assertEquals("TR", newRow.tagName);

        // Insert a cell in the row at index 0
        var newCell = newRow.insertCell(0);
        testUtils.assertEquals("TD", newCell.tagName);

        // Append a text node to the cell
        var newText = document.createTextNode('New top row');
        newCell.appendChild(newText);

        testUtils.assertEquals("<tbody><tr><td>New top row</td></tr></tbody>", table.innerHTML);
    },

    testElementCache: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");

        // Verify that we get the same SE from multiple calls to SecureComponent.getElement()
        var e = cmp.find("cacheTestA").getElement();
        testUtils.assertDefined(e);
        testUtils.assertTrue(e === cmp.find("cacheTestA").getElement());

        // Verify that we get the same SE for multiple calls to document.getElementById()
        var cacheTestA = document.getElementById("cacheTestA");
        testUtils.assertDefined(cacheTestA);
        testUtils.assertTrue(cacheTestA === document.getElementById("cacheTestA"));

        // Add a new element, reparent it, and verify that we get the same SE
        var child = document.createElement("div");
        child.id = "reparentTest";
        child.innerHTML = "Dynamically Created Child";
        cacheTestA.appendChild(child);
        testUtils.assertTrue(child === cacheTestA.children[0]);

        var cacheTestB = document.getElementById("cacheTestB");
        cacheTestB.appendChild(child);
        testUtils.assertTrue(child === cacheTestB.children[0]);

        cacheTestB.innerHTML = "<span>Removed Children</span>"

        cacheTestA.appendChild(child);
        testUtils.assertTrue(child === cacheTestA.children[0]);
    },

    testNoAccessToParentNodeReturnsNull: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var title = document.getElementById("title");
        // go up 3 levels since we will have access to first 2 levels
        var greatGrandParentNode = title.parentNode.parentNode.parentNode.parentNode;

        testUtils.assertEquals(null, greatGrandParentNode, "Element.parentNode should return null when it is not accessible");
    },

    testParentNodeInsideOpaqueObject: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.getElementById("insideFacet");
        var parent = div.parentNode;
        testUtils.assertNotNull(parent, "parentNode of element nested in opaque element should not return null");
        testUtils.assertEquals("outsideFacet", parent.id, "parentNode should be first non-opaque element in parent chain")
    },

    testLinkElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var link = document.createElement("LINK");

        testUtils.assertDefined(link.title, "property 'title' is not defined");
        testUtils.assertStartsWith("SecureElement", link.toString(),
            "Link element should be SecureElement")
    },

    testCloneNodeShallow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var table = cmp.find("table").getElement();
        var tableClone = table.cloneNode();
        testUtils.assertNotUndefinedOrNull(tableClone);
        testUtils.assertEquals(table.tagName, tableClone.tagName);
        testUtils.assertEquals(0, tableClone.children.length, "Shallow cloned node should have zero children");
    },

    testCloneNodeDeep: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var table = cmp.find("table").getElement();
        var tableClone = table.cloneNode(true);
        testUtils.assertNotUndefinedOrNull(tableClone);
        testUtils.assertEquals(table.tagName, tableClone.tagName);
        // Verify the <tr/> elements inside the <table/>
        testUtils.assertEquals(2, tableClone.children.length, "Deep cloned node should have same no of children");
        // Verify the <td/> elements inside the <tr/>
        testUtils.assertEquals(1, tableClone.children[0].children.length, "Deep clone should clone inner nodes too");
        // Verify the contents of the child nodes
        testUtils.assertEquals("th", tableClone.children[0].textContent);
        testUtils.assertEquals("td", tableClone.children[1].textContent);
    },

    /**
     * Verify that a cloned node is locked with the same key as its twin and verify it can be accessed by the owner
     * @param cmp
     */
    testCloneNodeDeep_VerifyAccess: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        // Before clone : Query for the elements, this verifies that current component has access to these elements
        testUtils.assertEquals(1, document.querySelectorAll("#table").length, "My facet elements should be visible");
        testUtils.assertEquals(2, document.querySelectorAll("#table > tr").length);
        testUtils.assertEquals(1, document.querySelectorAll("#table th").length);

        var table = cmp.find("table").getElement();
        var tableClone = table.cloneNode(true);
        table.parentNode.appendChild(tableClone);
        //After clone : Query for the elements, this verifies that current component has access to the cloned elements
        testUtils.assertEquals(2, document.querySelectorAll("#table").length, "Cloned facet elements should be visible");
        testUtils.assertEquals(4, document.querySelectorAll("#table > tr").length);
        testUtils.assertEquals(2, document.querySelectorAll("#table th").length);
    },

    /**
     * Verify that when a facet's node is cloned and the facet is from a different namespace,
     * its is locked with a same key as twin. Verify it cannot be accessed by the owner.
     */
    testCloneNodeDeep_VerifyBlockedAccess: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertEquals(0, document.querySelectorAll("#table_facetLocked").length, "Facet content should not be accessible from other namespace");

        var lockedFacet = cmp.find("toBeClonedFacet");
        lockedFacet.cloneNode();
        // After clone : Look for text from facet, there should be two copies
        testUtils.assertEquals(0, document.querySelectorAll("#table_facetLocked").length,
            "Cloned nodes should not be accessible from other namespace");
    },

    testTextNodeApi: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var initialText = "Hi there";

        function verifyTextNode(textNode) {
            var expectedText = initialText + ", friend";

            // verify API on CharacterData
            textNode.appendData(", friend");
            testUtils.assertEquals(expectedText, textNode.data, "CharacterData.data returned unexpected results");

            // verify API on Node
            testUtils.assertStartsWith("SecureDocument", textNode.ownerDocument.toString(), "Node.ownerDocument should" +
                " return a SecureDocument");

            // verify API on Text
            testUtils.assertEquals(expectedText, textNode.wholeText, "Text.wholeText returned unexpected results");
        }

        var textNodeDynamic = document.createTextNode(initialText);
        verifyTextNode(textNodeDynamic);

        var textNodeConstructor = new Text(initialText);
        verifyTextNode(textNodeConstructor);
    },

    testTextNodeSplitText: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var initialText = "treehouse";

        var text = document.createTextNode(initialText);
        var div = document.createElement("div");
        div.appendChild(text);
        var splitText = text.splitText(4);

        testUtils.assertEquals("tree", text.data ,"text.data returned unexpected results");
        testUtils.assertEquals("house", splitText.data, "Text.splitText().data returned unexpected results");
        testUtils.assertEquals("treehouse", splitText.wholeText, "Text.splitText().wholeText returned unexpected results");
        testUtils.assertEquals(2, div.childNodes.length, "Unexpected number of childNodes present on div");
        testUtils.assertTrue(div.childNodes.item(1) === splitText, "2nd childnode on div should be what was returned from splitText()");
        testUtils.assertStartsWith("SecureElement", splitText.toString(), "Text.splitText() should return a SecureElement");
        testUtils.assertStartsWith("SecureElement", text.toString(), "Original text should be a SecureElement");
    },

    testGetSetInvalidAttributes: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        // Verify that warning messages. There should be 3 of these, verifying just 1 for sanity check
        testUtils.expectAuraWarning('SecureElement: [object HTMLButtonElement]{ key: {"namespace":"lockerTest"} } does not allow getting/setting the href attribute, ignoring!');

        var button = document.createElement("button");
        testUtils.assertNull(button.getAttribute("href"), "Should have got null when trying to access invalid attributes");
        testUtils.assertUndefined(button.setAttribute("href", "/foo"), "Should return undefined when trying to set invalid attributes on dom element");
        testUtils.assertNull(button.getAttribute("href"), "Accessing invalid attribute values should continue to return undefined");
    },

    testLabelForInput: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var labelElement = cmp.find("labelFor").getElement();
        testUtils.assertEquals("labelFor_Id", labelElement.htmlFor);
        testUtils.assertEquals("labelFor_Id", labelElement.getAttribute("for"));
        labelElement.setAttribute("for", "woLabel_Id");
        testUtils.assertEquals("woLabel_Id", labelElement.getAttribute("for"));
    },

    testForAttributeAllowedOnLabelOnly: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        // Negative test case to verify that "for" attribute cannot be read from other dom element types
        testUtils.expectAuraWarning('SecureElement: [object HTMLDivElement]{ key: {"namespace":"lockerTest"} } does not allow getting/setting the for attribute, ignoring!');
        testUtils.assertNull(cmp.find("title").getElement().getAttribute("for"), "Should have got null when trying to access 'for' attributes on a div");
    },

    // Verify that element can traverse up the dom hierarchy using parentNode property
    testRecursiveTraversal: function(cmp, event, helper){
        var testUtils = cmp.get("v.testUtils");
        var element = cmp.find("title").getElement();
        testUtils.assertTrue(helper.contains(document, element), "Dom element was expected to be in the document");

        var unattachedElement = document.createElement("div");
        testUtils.assertFalse(helper.contains(document, unattachedElement), "Dom element was expected to not be in the document");
    },

    testNodeApiParamUnfilter: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var div = document.getElementById("nodeApiTester");
        var insideDiv = document.getElementById("insideDiv");
        var outsideDiv = document.getElementById("outsideDiv");

        testUtils.assertTrue(div.contains(insideDiv), "Expected Node.contains() to return true for <p> inside <div>");
        testUtils.assertFalse(div.contains(outsideDiv), "Expected Node.contains() to return false for <p> outsidse <div>");
    }
})
