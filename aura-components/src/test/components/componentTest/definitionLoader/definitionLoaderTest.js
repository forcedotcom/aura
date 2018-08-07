({
    testRequestOverlappingSetOfDefinitionsFiresCallbacksInCorrectOrder: {
        test: function(cmp) {

            var callbacksCalled = [];
            var onloadOfTwoCalledBeforeCallbackOfThree = null;

            var descriptorSetOne = {"markup://one:defExistsOnClient":100, "markup://one:defOnServer":101};
            var descriptorSetTwo = {"markup://two:two":200, "markup://one:defOnServer":101};
            var descriptorSetThree = {"markup://three:three":300, "markup://two:two":200};

            $A.componentService.addComponent("markup://one:defExistsOnClient", {"descriptor":"", "something":"else"});

            var callbackOne = function(){
                callbacksCalled.push("one");
            };
            var callbackTwo = function(){
                callbacksCalled.push("two");
            };
            var callbackThree = function(){
                if (onloadOfTwoCalledBeforeCallbackOfThree === null) {
                    onloadOfTwoCalledBeforeCallbackOfThree = false;
                }
                callbacksCalled.push("three");
            };

            // 3 depends only on 2, 2 depends on 1
            // mocked up response order will be inverse of order requested
            // 3, 2, 1
            // 3 should not call it's callback immediately
            // 2 should load but because one is not loaded, not callbacked
            // 3 should be fully satisfied and callback called
            // 1 should load and fire callback, then two callback called.

            var loadedCallbacks = {};
            var defsToInsert = ["markup://three:three", "markup://two:two", "markup://one:defOnServer"];

            var checkOtherLoaded = function(){
                if (defsToInsert.length > 0) {
                    var found = false;
                    for (var uriLoaded in loadedCallbacks) {
                        if (uriLoaded.indexOf(defsToInsert[0]) !== -1) {
                            found = true;
                            $A.componentService.addComponent(defsToInsert[0], {"d":"", "a":""});
                            if (defsToInsert[0] === "markup://two:two") {
                                if (onloadOfTwoCalledBeforeCallbackOfThree === null) {
                                    onloadOfTwoCalledBeforeCallbackOfThree = true;
                                }
                            }
                            defsToInsert = defsToInsert.slice(1);
                            loadedCallbacks[uriLoaded]();
                            delete loadedCallbacks[uriLoaded];
                            break;
                        }
                    }
                    if (found) {
                        setTimeout(checkOtherLoaded, 30);
                    }
                }
            };

            $A.test.replaceComponentDefLoader(function(uri, onload){
                if (uri.indexOf(defsToInsert[0]) !== -1) {
                    $A.componentService.addComponent(defsToInsert[0], {"d":"", "a":""});
                    defsToInsert = defsToInsert.slice(1);
                    setTimeout(function(){
                        onload();
                        setTimeout(checkOtherLoaded, 1);
                    }, 1);
                } else {
                    loadedCallbacks[uri] = onload;
                }
            });

            // these have to be loaded "async" breaing the UI Thread, thus these setTimeouts
            $A.test.loadComponentDefs(descriptorSetOne, callbackOne);
            setTimeout(function() {
                $A.test.loadComponentDefs(descriptorSetTwo, callbackTwo);
            }, 10);
            setTimeout(function() {
                $A.test.loadComponentDefs(descriptorSetThree, callbackThree);
            }, 100);

            $A.test.addWaitFor(true, function() {
                return !$A.test.isActionPending() && (callbacksCalled.length === 3);
            }, function(){
                $A.test.assertTrue(callbacksCalled[0] === "three" && onloadOfTwoCalledBeforeCallbackOfThree,
                    "'three' should have been calledback first : " + callbacksCalled +
                    " \nAnd onload of 'two' should have happened before that, but was: " + onloadOfTwoCalledBeforeCallbackOfThree);
            });
        }
    }
})
