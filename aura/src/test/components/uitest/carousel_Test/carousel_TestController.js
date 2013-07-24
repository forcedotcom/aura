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
 			out1 : "i have something to say...",
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
 		var carousel = cmp.find("carousel2");
 		var pages = [];
 		for (var i=1; i<=10; i++){
 			var page = $A.componentService.newComponentDeprecated({
			            "componentDef" : {
			            	"descriptor" : "markup://ui:carouselPage"
			            },
			            "attributes" : {
			            	"values" : {
			            		"pageModel":"", 
			            		"pageIndex":i, 
			            		"parent":[carousel],
			            		"priv_visible":"false",
			            		"priv_continuousFlow": "false"
			            	}
			            }
			},null,true);
			var pageCmp = $A.componentService.newComponent({
			            "componentDef" : {
			            	"descriptor" : "markup://ui:outputText"
			            },
			            "attributes" : {
			            	"values" : {
			            		"value" : "page #"+i 
			            	}
			            }
			});
			page.getValue("v.body").setValue(pageCmp);
			pages.push(page);
 		}
 		carousel.getValue("v.pageComponents").setValue(pages);
 	}
 }