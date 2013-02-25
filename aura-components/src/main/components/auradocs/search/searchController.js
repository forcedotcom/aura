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
		var searchTerm = event.getParam('searchTerm') || (event.getSource() && event.getSource().getElement().value);
		if (searchTerm.length > 0) {
			 var results_location = "#help?topic=searchResults&searchTerm=" + escape(searchTerm);
			 window.location = results_location;
			 
		 }
	}
}