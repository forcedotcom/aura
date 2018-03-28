({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741, W-4446969): FF and LockerService disabled for iOS browser in 212
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-SAFARI", "-IPHONE", "-IPAD"],

    /**
     * Verify that when a event is fired on a child component's element
     *  And the element is not accessible from the parent because of DOM encapsulation
     *  Then the event.target property is re-targeted to the first visible element in the DOM tree.
     */
    testEventTargetWhenElementIsInaccessible: {
        test: function(cmp) {
            var button = document.querySelector("#xNSButton");
            button.click();
            $A.test.addWaitForWithFailureMessage(
                true,
                function checkHandlerCalled() {
                    return cmp.get("v.handlerCalled");
                },
                "Click handler not invoked: Check if the event is bubbling",
                function assertFirstVisibleElementReturnedAsTarget() {
                    $A.test.assertEquals("childLi", cmp.get("v.eventTarget"),
                        "Expected to see <li> element as event target");
                });
        }
    },

    testEventTargetWhenElementIsAccessible: {
        test: function(cmp) {
            var button = cmp.find("button")[0].getElement();
            button.click();
            $A.test.addWaitForWithFailureMessage(
                true,
                function checkHandlerCalled() {
                    return cmp.get("v.handlerCalled");
                },
                "Click handler not invoked",
                function assertInlineButtonReturnedAsTarget() {
                    $A.test.assertEquals("inlineButton", cmp.get("v.eventTarget"),
                        "Expected to see the <button> #inlineButton element as event target");
                });
        }
    }
})