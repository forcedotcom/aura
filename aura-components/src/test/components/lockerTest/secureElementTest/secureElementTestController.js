({
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
        div.attributes.forEach(function(attribute) {
            if (attribute.name === "data-foo") {
                dataFooFound = true;
            }
            // only id and data-* attributes are not filtered out for this case
            if (attribute.name !== "id" && attribute.name.indexOf("data-") !== 0) {
                testUtils.fail("Unexpected attribute " + attribute.name + " found on element");
            }
        });
        testUtils.assertTrue(dataFooFound, "Custom element attribute data-foo not present on div");
    },

    testElementProperties: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var auraId = event.getParam("arguments").auraId;
        var elementPropertiesWhitelist = event.getParam("arguments").elementPropertiesWhitelist;
        var elementPropertiesBlacklist = event.getParam("arguments").elementPropertiesBlacklist;
        var element = cmp.find(auraId).getElement();

        elementPropertiesWhitelist.forEach(function(name) {
            testUtils.assertTrue(name in element, "Expected property '" + name + "' to be a property on SecureElement");
        });
        elementPropertiesBlacklist.forEach(function(name) {
            testUtils.assertFalse(name in element, "Expected property '" + name + "' to not be exposed on SecureElement");
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
            testUtils.assertFalse(name in element, "Expected property '" + name + "' to not be exposed on SecureElement");
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
        var greatGrandParentNode = title.parentNode.parentNode.parentNode;

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
     * @param cmp
     */
    testCloneNodeDeep_VerifyBlockedAccess: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        // Before clone : Look for text from facet. Verifying that facet was rendered
        testUtils.assertEquals(1, document.querySelector("#toBeClonedFacet").textContent.match(/body_toBeClonedFacet/g).length);
        testUtils.assertEquals(0, document.querySelectorAll("#table_facetLocked").length, "Facet content should not be accessible from other namespace");

        var lockedFacet = cmp.find("toBeClonedFacet");
        lockedFacet.cloneNode();
        // After clone : Look for text from facet, there should be two copies
        testUtils.assertEquals(2, document.querySelector("#toBeClonedFacet").textContent.match(/body_toBeClonedFacet/g).length,
            "Node of facet not cloned");
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
    }
})
