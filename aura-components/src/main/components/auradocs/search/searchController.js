/*
 * Copyright (C) 2012 salesforce.com, inc.
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

{
	handleSearch : function(cmp,event){
		 var searchTerm = event.getParam('searchTerm') || event.getSource().getElement().value;
		 var results_location = "/auradocs#help?topic=searchResults";
		 
		 if (searchTerm.length > 0) {
			 var date = new Date();
			 var expire = date.getTime()+10;
			 document.cookie = "d=" + escape(searchTerm) + "; expires=" + expire;
			 window.location = results_location;
		 }
	}
}