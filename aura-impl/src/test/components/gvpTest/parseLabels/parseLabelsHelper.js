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
	someDummyHelperFunction1:function(cmp){
		var x = $A.get("$Label.Section1.helper");
	},
	someDummyHelperFunction2:function(cmp){
		var x = $A.get("$Label.Section2.helper");
	},
	someDummyHelperFunction3:function(cmp){
		/**$A.get("$Label.ML_Comment.helper"); **/
	},
	someDummyHelperFunction4:function(cmp){
		//$A.get("$Label.SL_Comment.helper");
	},
	someDummyHelperFunction5:function(cmp){
		var x = $A.get("{!$Label.Section5.helper}");
	},
	curiousCaseOfBenjamin:function(cmp){
		//A label expression which refers to a label 
		$A.get("{!$Label.Section_A.controller}");
		//Second label expression with the same section but A letter changed to upper case, but refers to the right label
		$A.get("{!$Label.Section_a.helper}");
		
	},
	anotherCuriousCase:function(){
		//correct label expression
		$A.get("{!$Label.Section_B.helper}");
		//wrong label expression
		$A.get("{!$Label.Section_B.HELPER}");
	}
})