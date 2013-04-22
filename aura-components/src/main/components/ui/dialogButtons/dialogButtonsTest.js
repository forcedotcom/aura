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
({
    testDialogButtonsConfirm:{
        attributes : {defaultButtons:"confirm"},
	test: function(cmp){
	        var conf = cmp.find("confirmButton");  
    		$A.test.assertDefined(conf, "defaultButtons attribute is set to confirm, but does not acknowledge it by showing the confrimButton");
        }
    },
    testDialogButtonsCancel:{
	attributes : {defaultButtons:"cancel"},
	test: function(cmp){
	        var can = cmp.find("cancelButton");  
	        $A.test.assertDefined(can, "defaultButtons attribute is set to cancel, but does not acknowledge it by showing the cancelButton");
        }
    },
    testDialogButtonsBoth:{
	attributes : {defaultButtons:"both"},
	test: function(cmp){
	        var conf = cmp.find("confirmButton");    
	        var can = cmp.find("cancelButton");  
	        $A.test.assertDefined(conf, "defaultButtons attribute is set to both, but does not show the confrimButton");
	        $A.test.assertDefined(can, "defaultButtons attribute is set to both, but does not show the cancelButton");
        }
    },
    testDialogButtonsNone:{
	test: function(cmp){
	        var conf = cmp.find("confirmButton");    
	        var can = cmp.find("cancelButton"); 
    		aura.test.assertTrue($A.util.isUndefinedOrNull(conf), "defaultButtons attribute is set to None, but is showing confrimButton");
    		aura.test.assertTrue($A.util.isUndefinedOrNull(can), "defaultButtons attribute is set to None, but is showing cancelButton");
        }
    },

})