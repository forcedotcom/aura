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
 {
 	updateOutput : function(cmp) {
 		var outOptions = { 
 			out1 : "i have somehting to say...",
 			out2 : "hello!"
 		}
 		
 		var output = cmp.find("output");
 		if (output.getValue("v.value").getValue() == outOptions.out1){
 			output.getValue("v.value").setValue(outOptions.out2);
 		} else {
 			output.getValue("v.value").setValue(outOptions.out1);
 		}
 	},
 	
 	addManyPgCarousel : function(cmp) {
 		var carousel = cmp.find("manyPageCarousel");
 		var pages = [];
 		for (var i=0; i<10; i++){
 			var page = $A.componentService.newComponent({
			            "componentDef" : "markup://ui:carouselPage",
			            "attributes" : {
			            	"values" : {
			            		"pageModel":"page #"+(i+1), 
			            		"pageIndex":i, 
			            		"parent":[carousel],
			            		"priv_visible":"true",
			            		"priv_continuousFlow": "false"
			            	}
			            }
			});
			pages.push(page);
 		}
 		carousel.getValue("v.pageComponents").setValue(pages);
 		//$A.rerender(carousel);
 	}
 }