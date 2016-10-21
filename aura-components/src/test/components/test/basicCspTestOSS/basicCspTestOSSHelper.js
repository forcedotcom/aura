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
    request: function(cmp, url) {
            var request = $A.test.createHttpRequest();   
            if(request != null) {
	            request.open("GET", url, true);   
	            request["onreadystatechange"] = function() {   
		            if (request["readyState"] == 4) {   
		                      cmp.set("v.xmlHttpRequestComplete",true);
		                      cmp.set("v.xmlHttpRequestDebug",cmp.get("v.xmlHttpRequestDebug")+"request readyState = "+request["readyState"]+"; ");
		                      //console.log("from action callback"); -- btw IE9 doesn't like console
		             } else {
		                 cmp.set("v.xmlHttpRequestDebug",cmp.get("v.xmlHttpRequestDebug")+"request readyState = "+request["readyState"]+"; ");
		             }   
	            };   
	            request.send();   
            } else {
                cmp.set("v.xmlHttpRequestDebug",cmp.get("v.xmlHttpRequestDebug")+"new XMLHttpRequest() return null; ");
            }
    }
})