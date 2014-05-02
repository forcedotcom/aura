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
Function.RegisterNamespace("Test.Aura");

[Fixture]
Test.Aura.AuraHistoryServiceTest = function(){
    var $A = {
        ns : {}
    };

    //Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
    Mocks.GetMocks(Object.Global(), { "exp": function(){}, "$A":$A})(function(){
        // #import aura.AuraHistoryService
    });
    
    var mockIsIOSWebViewTrue = Mocks.GetMock(Object.Global(), "$A", {
        util: {
            isIOSWebView: function() {
                return true;
            }
        }
    });

    var mockIsIOSWebViewFalse = Mocks.GetMock(Object.Global(), "$A", {
        util: {
            isIOSWebView: function() {
                return false;
            }
        }
    });

    [Fixture]
    function set(){
        [Fact]
        function UsePushStatePushesUrlWithToken(){
            // if history.pushState is supported, call it setting the url to #<token>
            var token = "theToken";
            var expected = "#" + token;
            var actual;
            var mockPushState = Mocks.GetMocks(Object.Global(), {
                window: { 
                    history: {
                        pushState: function(state, title, url){
                            actual = url;
                        }
                    }
                }
            });
            var historyService = new $A.ns.AuraHistoryService();
            historyService.usePushState = function() { return true; };
            historyService.changeHandler = function() {};

            mockPushState(function() {
                historyService.set(token);
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function NonPushStateSetsLocationHash(){
            // if history.pushState is not supported, set window.location hash to #<token>
            var token = "theToken";
            var expected = "#" + token;
            var windowMock = {
                location: {
                    hash: "initial"
                }
            };
            var mockLocationHash = Mocks.GetMocks(Object.Global(), {
                window: windowMock
            });
            var historyService = new $A.ns.AuraHistoryService();
            historyService.usePushState = function() { return false; };

            var actual;
            mockLocationHash(function() {
                mockIsIOSWebViewFalse(function() {
                    historyService.set(token);
                    actual = windowMock.location.hash;
               });
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function iOS7WebViewPushesTokenToHistoryArray(){
            // if on iOS WebView, track token manually via history array
            var token = "theToken";
            var expectedHash = "#" + token;
            var windowMock = {
                location: {
                    hash: "initial"
                }
            };
            var mockLocationHash = Mocks.GetMocks(Object.Global(), {
                window: windowMock
            });
            var historyService = new $A.ns.AuraHistoryService();
            historyService.usePushState = function() { return false; };

            var actualHash;
            var historyEntry;
            mockLocationHash(function() {
                mockIsIOSWebViewTrue(function() {
                    historyService.set(token);
                });
                actualHash = windowMock.location.hash;
                historyEntry = historyService.history.pop();
            });

            Assert.Equal(token, historyEntry); // verify token is pushed to history array
            Assert.Equal(expectedHash, actualHash); // verify location hash set
        }
    }

    [Fixture]
    function usePushState(){
        var mockUserAgentNativeAndroid = Mocks.GetMocks(Object.Global(), {
            window: {
                navigator: {
                    userAgent: "Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30"
                },
                history: {
                    pushState: true
                }
            }
        });

        var mockUserAgentChromeAndroid = Mocks.GetMocks(Object.Global(), {
            window: {
                navigator: {
                    userAgent: "Mozilla/5.0 (Linux; Android 4.2.2; Galaxy Nexus Build/IMM76B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.72 Mobile Safari/537.36"
                },
                history: {
                    pushState: true
                }
            }
        });

        [Fact]
        function ReturnsFalseIfIOS7WebView() {
            var historyService = new $A.ns.AuraHistoryService();

            var actual; 
            mockUserAgentChromeAndroid(function() {
                mockIsIOSWebViewTrue(function() {
                    actual = historyService.usePushState();
                });
            });

            Assert.False(actual);
        }

        [Fact]
        function ReturnsFalseIfNativeAndroid() {
            var historyService = new $A.ns.AuraHistoryService();

            var actual; 
            mockUserAgentNativeAndroid(function() {
                mockIsIOSWebViewFalse(function() {
                    actual = historyService.usePushState();
                });
            });

            Assert.False(actual);
        }

        [Fact]
        function ReturnsTrueIfChromeAndroid() {
            var historyService = new $A.ns.AuraHistoryService();

            var actual; 
            mockUserAgentChromeAndroid(function() {
                mockIsIOSWebViewFalse(function() {
                    actual = historyService.usePushState();
                });
            });
 
            Assert.True(actual);
        }
    }

    [Fixture]
    function forward(){
        [Fact]
        function NonIOSWebViewCallsHistoryGo(){
            // Non iOS WebView should call window.history.go function
            var actual = "initial";
            var expected = 1;
            var mockHistory = Mocks.GetMocks(Object.Global(), {
                window: { 
                    history: {
                        go: function(param){
                            actual = param;
                        }
                    }
                }
            });
            var historyService = new $A.ns.AuraHistoryService();

            mockHistory(function() {
                mockIsIOSWebViewFalse(function() {
                    historyService.forward();
                });
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function IOSWebViewSetsLocationHash(){
            // iOS WebView will set the window.location hash
            var token = "theToken";
            var actual;
            var expected = "#" + token;
            var windowMock = {
                location: {
                    hash: "initial"
                }
            };
            var mockLocationHash = Mocks.GetMocks(Object.Global(), {
                window: windowMock
            });
            var historyService = new $A.ns.AuraHistoryService();
            historyService.history = [token];
            historyService.currentIndex = -1;

            mockLocationHash(function() {
                mockIsIOSWebViewTrue(function() {
                    historyService.forward();
                    actual = windowMock.location.hash;
                });
            });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function back(){
        [Fact]
        function NonIOSWebViewCallsHistoryGo(){
            // Non iOS WebView should call window.history.go function
            var actual = "initial";
            var expected = -1;
            var mockHistory = Mocks.GetMocks(Object.Global(), {
                window: { 
                    history: {
                        go: function(param){
                            actual = param;
                        }
                    }
                }
            });
            var historyService = new $A.ns.AuraHistoryService();

            mockHistory(function() {
                mockIsIOSWebViewFalse(function() {
                    historyService.back();
                });
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function IOSWebViewSetsLocationHash(){
            // iOS WebView will set the window.location hash
            var token = "theToken";
            var actual;
            var expected = "#" + token;
            var windowMock = {
                location: {
                    hash: "initial"
                }
            };
            var mockLocationHash = Mocks.GetMocks(Object.Global(), {
                window: windowMock
            });
            var historyService = new $A.ns.AuraHistoryService();
            historyService.history = [token];
            historyService.currentIndex = 1;

            mockLocationHash(function() {
                mockIsIOSWebViewTrue(function() {
                    historyService.back();
                    actual = windowMock.location.hash;
                });
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function IOSWebViewResetsIfAtStart(){
            // iOS WebView will call reset and set window.location hash to "" if at start
            var actual;
            var expected = "";
            var expectedHistory = [];
            var windowMock = {
                location: {
                    hash: "initial"
                }
            };
            var mockLocationHash = Mocks.GetMocks(Object.Global(), {
                window: windowMock
            });
            var historyService = new $A.ns.AuraHistoryService();
            historyService.history = ["something"];
            historyService.currentIndex = 0;

            mockLocationHash(function() {
                mockIsIOSWebViewTrue(function() {
                    historyService.back();
                    actual = windowMock.location.hash;
                });
            });

            Assert.Equal(expected, actual);
            Assert.Equal(expectedHistory, historyService.history); // verify history array is reset
        }
    }
}
