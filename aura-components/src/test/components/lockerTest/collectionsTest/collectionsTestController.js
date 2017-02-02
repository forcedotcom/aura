({
    // Test "liveness" of HTMLCollection and NodeList proxy layer
    testLiveCollections: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var e = cmp.find("content").getElement();

        var childNodes = e.childNodes;
        var children = e.children;

        testUtils.assertEquals(0, childNodes.length);
        testUtils.assertEquals(0, children.length);

        var child = document.createElement("span");
        e.appendChild(child);

        testUtils.assertEquals(1, childNodes.length);
        testUtils.assertStartsWith("SecureElement", childNodes[0].toString(), "Expected childNodes[0] to be a SecureElement");

        testUtils.assertEquals(1, children.length);
        testUtils.assertStartsWith("SecureElement", children[0].toString(), "Expected children[0] to be a SecureElement");
    },

    testSymbolCollection: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var collection = document.querySelectorAll('[data-class-t="park-message-meet"]');
        testUtils.assertEquals(3, collection.length);
        var expectedIds = ["1-div", "1.1-span", "2-p"]
        var i = 0;
        expectedIds.forEach(function(id){
            testUtils.assertEquals(id, collection[i].id, "Unexpected node when accessing by index"); // Verify accessing items by index
            testUtils.assertEquals(id, collection.item(i).id, "Unexpected node when accessing by item() api"); // Verify item() api on collections
            i++;
        });

        // Verify Symbol.iterator property on collections
        testUtils.assertEquals("function", typeof collection[Symbol.iterator]);
        var valuesIterator = collection[Symbol.iterator]();
        expectedIds.forEach(function(id){
            testUtils.assertEquals(id, valuesIterator.next().value.id, "Unexpected node when iterating");
        });
    },

    // Automation for W-3235081
    testMovingExistingNodes: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var container = document.getElementById("div_container"); // <div id="div_container"><span id="spanInContainer"/></div>
        var child = document.getElementById("div_child"); // <div id="div_child"/>
        console.log(container.outerHTML);

        container.appendChild(child); // <div id="div_container"><span id="spanInContainer"/><div id="div_child"/>/div>
        testUtils.assertEquals("span", container.childNodes[0].tagName.toLowerCase());
        testUtils.assertEquals("div", container.childNodes[1].tagName.toLowerCase());

        container.insertBefore(child, document.getElementById("spanInContainer"));
        // <div id="div_container"><div id="div_child"/><span id="spanInContainer"/>/div>
        testUtils.assertEquals("div", container.childNodes[0].tagName.toLowerCase());
        testUtils.assertEquals("span", container.childNodes[1].tagName.toLowerCase());

        var newChild = document.createElement("p");
        container.insertBefore(newChild, document.getElementById("spanInContainer"));
        // <div id="div_container"><div id="div_child"/><p/><span id="spanInContainer"/>/div>
        testUtils.assertEquals("div", container.childNodes[0].tagName.toLowerCase());
        testUtils.assertEquals("p", container.childNodes[1].tagName.toLowerCase());
        testUtils.assertEquals("span", container.childNodes[2].tagName.toLowerCase());
    }
})

