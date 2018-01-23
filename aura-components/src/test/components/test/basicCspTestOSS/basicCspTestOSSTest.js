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
    /**
     * automation for default CSP in OSS -- as Oct.21.2016
     * Content-Security-Policy:
        default-src 'self'; 
        script-src 'self' chrome-extension:; 
        object-src 'self'; 
        style-src 'self' chrome-extension: 'unsafe-inline'; 
        img-src *; 
        media-src *; 
        frame-ancestors 'self'; 
        frame-src 'self'; 
        font-src *; 
        connect-src 'self' http://invalid.salesforce.com http://offline https://offline; 
        report-uri /_/csp
        
        Note: these are all positive tests, negative ones are in CSPReportLoggingUITest.java
     */
    
    labels : ["UnAdaptableTest"],//mark as unadaptable as csp is different in OSS
    
	//test for [frame-ancestors 'self'] and [frame-src 'self'] 
    testChildCmpInsideIframe:{
    	attributes: { testIframe: true },
        test:[ 
            function(cmp){
                var ele_iframe = document.getElementById('iframe_kitchenSink');
                var doc_iframe = 
                	ele_iframe.contentWindow ? ele_iframe.contentWindow.document : ele_iframe.contentDocument;
                $A.test.assertTrue($A.test.contains(ele_iframe.src, "test/kitchenSink.cmp"), "iframe fail to load");
            }
         ]
    },
    
    //test for [script-src 'self' chrome-extension: 'unsafe-inline';]
    testScriptSource : {
        browsers : [ "-IE8" ],
        attributes: { testScriptSource: true },
        test:[ 
            function(cmp) {
                //test loading script from same origin
                $A.test.addWaitForWithFailureMessage (true,
                        function() { 
                            return typeof CodeMirror !== "undefined";
                        },
                        "fail to load script from same origin : codemirror.js"
                );
            }
        ]
    },
    
    //test for [style-src 'self' chrome-extension: 'unsafe-inline'; ]
    testStyleSource : {
    	attributes: { testStyleSource: true },
        test:[ 
            function(cmp){
            	
            	$A.test.addWaitForWithFailureMessage(true,
                        function() { 
            	                var ele = document.getElementsByTagName('h1')[0];
            	                var styleString = $A.test.getStyle(ele, "color");
            	                return (styleString == "rgb(0, 0, 255)")||( styleString == "blue");//IE8 is different
                        },
                        "fail to load inline style."
                );
            }
        ]
    },
    
    //test for the whitelist url: [connect-src self' http://invalid.salesforce.com http://offline https://offline] 
    testConnectionSource : {
        browsers : [ "-IE8", "-IE9" ],
        attributes: { testConnectionSource: true },
        test: [function(cmp) {
    			$A.test.assertFalse(cmp.get("v.xmlHttpRequestComplete"));
    			$A.test.clickOrTouch(cmp.find("uiButton_sendXHR").getElement());
    		}, function(cmp) {
    			$A.test.addWaitForWithFailureMessage(true,
    					function() { 
    			            return cmp.get("v.xmlHttpRequestComplete"); 
    			        },
    					"xmlHttpRequest fail to complete."
    			);
    		}
    	]
    },
    
    //test for [media-src *; ] -- 
    //though we don't put restriction for media-src, but the src has to be same-domain, or it will get blocked by connect-src
    //Firefox doesn't support mp4
    //IE9 is giving me error: "getApplication not implemented", not sure why, not CSP related though
    //IE8 and below doesn't support HTML5 video
    testMediaSource : {
        browsers : [ "-FIREFOX", "-IE9", "-IE8"],
    	attributes: { testMediaSource: true },
    	test: [function(cmp) {
    		var ele = document.getElementById('videoSameDomain');
    		$A.test.addWaitForWithFailureMessage(true, function() {
                return $A.test.contains(ele.currentSrc, "auraFW/resources/aura/videos/Test6.mp4")
            }, "video failed to load");
    	}
    	]
    }
    
    //test for [font-src *; ] is in CSPReportLoggingTest.testAllowFontSrc
    //test for [object-src 'self'; ] -- we don't allow object tag 
    //test for [default-src 'self';] -- no test
})
