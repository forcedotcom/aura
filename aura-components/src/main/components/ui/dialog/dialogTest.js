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
    testDialogIsModalTrue:{
	attributes : {description:'test', title:'this is a great title', isModal:'true'},
	test: function(cmp){
	        var cls = cmp.find("mask").getElement().className;
    		aura.test.assertTrue(aura.test.contains(cls,"mask hidden"), "isModal is set to true, but does not have the class associated with it");
        }
    },
    
    testDialogIsModalFalse:{
        attributes : {description:'test', title:'this is a great title', isModal:'false'},
	test: function(cmp){
	        var obj = cmp.find("mask");  
    		aura.test.assertTrue($A.util.isUndefinedOrNull(obj), "isModal is set to false, but contains the class as though it was set to true");
        }
    }
})