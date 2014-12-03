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
	createHttpRequest: function(cmp) {
		if (window.XMLHttpRequest) {
		    cmp.set("v.xmlHttpRequestDebug",cmp.get("v.xmlHttpRequestDebug")+"window.XMLHttpRequest exist, return one; ");
			return new XMLHttpRequest();   
           } else if (window.ActiveXObject) { // code for IE6, IE5
        	   try { 
        		   return new ActiveXObject("Msxml2.XMLHTTP");
        	   } catch (e) {  
        		   try {   
        			   return new ActiveXObject("Microsoft.XMLHTTP"); 
        		    } catch (ignore) { }   
               }   
           }   
           return null;   
    },
    
    request: function(cmp, url) {
            var request = this.createHttpRequest(cmp);   
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