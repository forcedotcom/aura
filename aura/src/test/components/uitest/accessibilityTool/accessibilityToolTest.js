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
    testFieldSetsWStyle:{
	attributes : {caseToRender : 'fieldSetWithStyles'},	
	test: function(cmp){    
	    	cmp.get("field_set_W_style_and_legend").getElement().style.display="none";
	    	cmp.get("field_set_field_style_no_legend").getElement().style.display="none";
	    	cmp.get("field_set_wrong_style_no_legend").getElement().style.display="BLAH";
	    	
		var expected = "Total Number of Errors found: 2";
		var output    = $A.devToolService.checkAccessibility();
		var actual   =  output.split("\n")[0];
		$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should not return errornous string. output: \n"+output);
	}
    },
    testHeadersCorrectOrder:{
		attributes : {caseToRender : 'headersCorrectOrder'},
		test: function(cmp){
			var expected = "";
			var output    = $A.devToolService.checkAccessibility();
			var actual   =  output.split("\n")[0];
			$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should not return errornous string. output: \n"+output);
		}
    },
    
    testHeadersWrongOrder:{
		attributes : {caseToRender : 'headersWrongOrder'},
		test: function(cmp){
			var expected = "Total Number of Errors found: 2";
			var output    = $A.devToolService.checkAccessibility();
			var actual   =  output.split("\n")[0];
			$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should return string with 2 errors. output: \n"+output);
		}
    },
    testHeadersWrongOrderWrapAround:{
		attributes : {caseToRender : 'headersWrongOrderWrapAround'},
		test: function(cmp){
			var expected = "Total Number of Errors found: 2";
			var output    = $A.devToolService.checkAccessibility();
			var actual   =  output.split("\n")[0];
			$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should return string with 2 errors. output: \n"+output);
		}
    },
    testHeadersWrongOrderReverse:{
		attributes : {caseToRender : 'headersWrongOrderReverse'},
		test: function(cmp){
			var expected = "";
			var output    = $A.devToolService.checkAccessibility();
			var actual   =  output.split("\n")[0];
			$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should not return errornous string. output: \n"+output);
		}
    },
    testAnchorWithInnerText:{
		attributes : {caseToRender : 'anchorWInnerText'},
		test: function(cmp){
			var expected = "";
			var output    = $A.devToolService.checkAccessibility();
			var actual   =  output.split("\n")[0];
			$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should not return errornous string. output: \n"+output);
		}
    },
    
    testAnchorWithOutInnerText:{
		attributes : {caseToRender : 'anchorWOInnerText'},
		test: function(cmp){
			var expected = "Total Number of Errors found: 1";
			var output    = $A.devToolService.checkAccessibility();
			var actual   =  output.split("\n")[0];
			$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should return string with 1 errors. output: \n"+output);
		}
    },

    testAnchorInOutputURLInfo:{
		attributes : {caseToRender : 'anchorInOutputURLInfo'},
		test: function(cmp){
			var expected = "Total Number of Errors found: 1";
			var output    = $A.devToolService.checkAccessibility();
			var actual   =  output.split("\n")[0];
			$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should return string with 1 errors. output: \n"+output);
		}
    },
    testAnchorInOutputURLDeco:{
		attributes : {caseToRender : 'anchorInOutputURLDeco'},
		test: function(cmp){
			var expected = "Total Number of Errors found: 2";
			var output    = $A.devToolService.checkAccessibility();
			var actual   =  output.split("\n")[0];
			$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should return string with 2 errors. output: \n"+output);
		}
    },
    testRadioIsInFieldSetError:{
		attributes : {caseToRender : 'RadioErrors'},
		test: function(cmp){
			var expected = "Total Number of Errors found: 4";;
			var output    = $A.devToolService.checkAccessibility();
			var actual   =  output.split("\n")[0];
			$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should return string with 4 errors. output: \n"+output);
		}
    },
    
    testRadioIsInFieldSetNoError:{
		attributes : {caseToRender : 'NoRadioErrors'},
		test: function(cmp){
			var expected = "";
			var output    = $A.devToolService.checkAccessibility();
			var actual   =  output.split("\n")[0];
			$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should not return errornous string. output: \n"+output);
		}
    },
    testLabels:{
		attributes : {caseToRender : 'labelTest'},
		test: function(cmp){
			var expected = "";
			var actual   =  $A.devToolService.checkAccessibility().split("\n")[0];
			$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should not return errornous string");
		}
    },
    testLabelsNotNeeded:{
	attributes : {caseToRender : 'labelsNotNeeded'},
	test: function(cmp){
	        var expected = "Total Number of Errors found: 1";
		var actual   =  $A.devToolService.checkAccessibility().split("\n")[0];
		$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should return 1 error for input of type image with out an alt");
	}
    },
    //Full tests
    testCheckAccessibility:{
		test: function(cmp){
			var expected = "Total Number of Errors found: 10";
			var actual   =  $A.devToolService.checkAccessibility().split("\n")[0];
			$A.test.assertEquals(expected, actual , "Unexpected return from CheckAccessibility, should return string with 10 errors");
		}
    },
  
    testAssertAccessible:{
		exceptionsAllowedDuringInit : ["Total Number of Errors found: 10"],
		test: function(cmp){
		    var expected = "Total Number of Errors found: 10";
		    var actual   =  "";
		    try{
		         $A.test.assertAccessible();
		    }catch(err){   
		        actual = err.message.split("\n")[0];
			$A.test.assertEquals(expected, actual, "Unexpected return from assertAccessilbe, expected: "+expected+" actual: "+actual);
		            
		        }
		}
    }
})