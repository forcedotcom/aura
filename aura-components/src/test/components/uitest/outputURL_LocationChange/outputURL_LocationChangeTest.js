/*
 * Copyright (C) 2013 salesforce.com, inc.
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
({
    
    sanityCheck: function(cmp) {
        // locationChangeCount is 1 not 0 because Aura sets first history on init
        $A.test.addWaitForWithFailureMessage(1,
                function() { return cmp.get("v.locationChangeCount"); }, 
                "location Change event is fired once when load the app"
        );
    },
    
    
    setUp : function(cmp){
        this.sanityCheck(cmp);
    },
    
    /**
     * test for W-2250356
     * Previously, when a new handler is attached to locationChange, old handler was not removed, this results in 
     * multiple click event handlers for location change were applied when component was rerendered.
     *
     * Only applies to anchors with href starting with "#"
     * This is really testing htmlHelper.js when it sets up FastClick handling
     */
    testHashValueChangeInLocationChangeHandler:{
        test : [
                function(cmp) {
                    //re-render won't trigger locationChange, previously, we didn't clean up old handler attached to 
                    //fastClick event, reRender would make several duplicate handler and attach them all.
                    var urlCmpPeach = cmp.find('hashLinkP'),
                    urlElPeach = urlCmpPeach.getElement();
                    $A.rerender(urlCmpPeach);
                    $A.rerender(urlCmpPeach);
                    $A.rerender(urlCmpPeach);
                    $A.test.assertEquals(1,cmp.get("v.locationChangeCount"),
                            "locationChange event should not fired during rerender");
                },
                function(cmp) {
                    // Click Peach first time,its url has value="{!'#' + v.locationChangeCount}"
                    // we change locationChangeCount in locationChange handler
                    // locationChange event is fired once
                    // if multiple duplicate location change handlers were applied,
                    // location change count would increase exponentially instead of + 1
                    var urlCmpPeach = cmp.find('hashLinkP'),
                    urlElPeach = urlCmpPeach.getElement();
                    $A.test.clickOrTouch(urlElPeach);
                },
                function(cmp) {
                	var urlCmpPeach = cmp.find('hashLinkP'),
                    urlElPeach = urlCmpPeach.getElement();
                    $A.test.addWaitForWithFailureMessage(1,
                        function() { return cmp.get("v.clickCount");},
                            "clickCount should in crease after clicking on Peach",
                            function() {
                                $A.test.addWaitForWithFailureMessage(2, 
                                        function() { return cmp.get("v.locationChangeCount"); }, 
                                        "locationChangeCount should increase after clicking on Peach");
                                $A.test.addWaitForWithFailureMessage(1, 
                                        function() { return cmp.get("v.locationChangeCountPeach"); }, 
                                        "locationChangeCountPeach should increase after clicking on Peach");
                            }
                    );
                    href = urlElPeach.getAttribute('href');
                    var locationChangeCountPeach = cmp.get("v.locationChangeCountPeach");
                    $A.test.assertTrue(
                       href == "javascript:void(0);" || href == "javascript:void(0/*#" + locationChangeCountPeach +"*/);",
                       "href attribute not correct"
                    );
                },
                function(cmp) {
                    // Click Peach second time, location change event is fired again
                    // if multiple duplicate location change handlers were applied,
                    // location change count would increase exponentially instead of + 1
                    var urlCmpPeach = cmp.find('hashLinkP'),
                    urlElPeach = urlCmpPeach.getElement();
                    
                    $A.test.clickOrTouch(urlElPeach);
                    $A.test.addWaitForWithFailureMessage(2,
                            function() { return cmp.get("v.clickCount"); },
                            "clickCount should increase after clicking on Peach again",
                            function() {
                                $A.test.addWaitForWithFailureMessage(3, 
                                        function() { return cmp.get("v.locationChangeCount"); }, 
                                        "locationChangeCount should increase after clicking on Peach again");
                                $A.test.addWaitForWithFailureMessage(2, 
                                        function() { return cmp.get("v.locationChangeCountPeach"); }, 
                                        "locationChangeCountPeach should increase after clicking on Peach again");
                            }
                    );
                }
        ]
    },
    
    /*
     * this is disabled for : W-2317160
     * I think the value of outputURL cannot be changed BEFORE locationChange event is fired, looks like
     * our handler is attached to the "exact" outputURL, change in value will loose the handler. 
     * that's why if we don't change orange link's value, click after first will trigger locationChange
     * we do create a new HtmlAttribute everytime value changes, not 'reusing' the old one.
     */
    _testHashValueChangeInClickHandler:{
        test : [
                    function(cmp) {
                        //Click Orange first time,its url has value="{!'#' + v.locationTokenOrange}"
                        // we change locationToken in click event handler
                        // locationChange event DOES NOT fire
                        var urlCmpOrange = cmp.find('hashLinkO'),
                        urlElOrange = urlCmpOrange.getElement();
                        
                        $A.test.clickOrTouch(urlElOrange);
                        $A.test.addWaitForWithFailureMessage(1, 
                                function() { return cmp.get("v.clickCount"); }, 
                                "clickCount should increase after clicking on Orange at the first time",
                                function() {
                                    $A.test.assertEquals(2,cmp.get("v.locationChangeCount"),
                                            "locationChange event doesn't fire at the first time we click Orange");
                                }
                        );
                    },
                    function(cmp) {
                        //Click Orange Again, locationChange event doesn't fire
                        var urlCmpOrange = cmp.find('hashLinkO'),
                        urlElOrange = urlCmpOrange.getElement();
                        $A.test.clickOrTouch(urlElOrange);
                        $A.test.addWaitForWithFailureMessage(2, 
                                function() { return cmp.get("v.clickCount"); }, 
                                "clickCount should increase after clicking on Orange Again",
                                function() {
                                    $A.test.assertEquals(3,cmp.get("v.locationChangeCount"),
                                            "locationChange event should fire after clicking Orange again");
                                }
                        );
                    },
               ]
    },
    
    /*
     * W-2322327: test disable for IE8 
     */
    testConstHashValue : {
    	browsers:["-IE8"],
        test : [
                    function(cmp) {
                        //Click Apple,its url has value="#APPLE", locationChange is fired
                        var urlCmpApple = cmp.find('hashLinkA'),
                        urlElApple = urlCmpApple.getElement();
                        $A.test.clickOrTouch(urlElApple);
                        $A.test.addWaitForWithFailureMessage(1,
                                function() { return cmp.get("v.clickCount"); },
                                "click count should increase after clicking on Apple",
                                function() {
                                    $A.test.addWaitForWithFailureMessage(2, 
                                        function() { return cmp.get("v.locationChangeCount"); }, 
                                        "locationChangeCount should increase after clicking on Apple");
                                }
                        );
                    }, 
                    function(cmp) {
                        //Click Apple AGAIN, location doesn't really change,but locationChange event is fired anyway. 
                        var urlCmpApple = cmp.find('hashLinkA'),
                        urlElApple = urlCmpApple.getElement();
                        $A.test.clickOrTouch(urlElApple);
                        $A.test.addWaitForWithFailureMessage(2,
                                function() { return cmp.get("v.clickCount"); },
                                "click count should increase after clicking on Apple Again",
                                function() {
                                    $A.test.addWaitForWithFailureMessage(3, 
                                            function() { return cmp.get("v.locationChangeCount"); }, 
                                            "locationChangeCount should increase after clicking on Apple Again");
                                }
                        );
                    }, 
                    function(cmp) {
                        //Click Apple AGAIN, location doesn't really change,but locationChange event is fired anyway. 
                        var urlCmpApple = cmp.find('hashLinkA'),
                        urlElApple = urlCmpApple.getElement();
                        $A.test.clickOrTouch(urlElApple);
                        $A.test.addWaitForWithFailureMessage(3,
                                function() { return cmp.get("v.clickCount"); },
                                "click count should increase after clicking on Apple 3rd time",
                                function() {
                                    $A.test.addWaitForWithFailureMessage(4, 
                                            function() { return cmp.get("v.locationChangeCount"); }, 
                                            "locationChangeCount should increase after clicking on Apple 3nd time");
                                }
                        );
                    }
                ]
    },
    
    testBrokenHashValue : {
        test : [
                function(cmp){
                     //Click Banana,its url has value="{!'#' + BANANA}", location change event doesn't fire
                    var urlCmpBanana = cmp.find('hashLinkB'),
                    urlElBanana = urlCmpBanana.getElement();
                    $A.test.clickOrTouch(urlElBanana);
                    $A.test.addWaitForWithFailureMessage(1, 
                            function() { return cmp.get("v.clickCount"); }, 
                            "clickCount should increase after clicking on Banana",
                            function() {
                                $A.test.assertEquals(1,cmp.get("v.locationChangeCount"),
                                        "Location Event should not fire when clicking on broken outputURL Banana");
                            }
                    );
                }
        ]
    },
})