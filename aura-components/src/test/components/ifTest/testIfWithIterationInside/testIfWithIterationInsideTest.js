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
	waitForMsg: function(cmp,message,emsg) {
		$A.test.addWaitForWithFailureMessage(
			message,
			function(){
            	var div = cmp.getElements()[1];
            	var t = $A.test.getText(div).replace(/\s+/gm,' ');
            	return t;
            },
            emsg,
            null
		);
	},
	
    clickAndWait: function(cmp, id,message,emsg) {
        var button = cmp.find(id);
        $A.test.clickOrTouch(button.getElement());
        this.waitForMsg(cmp,message,emsg);
    },
    
    clickAndWaitByClass: function(cmp, classNameToClick,expect,emsg) {
    	var eleToClick = $A.test.getElementByClass(classNameToClick)[0];
        $A.test.clickOrTouch(eleToClick);
        this.waitForMsg(cmp,expect,emsg);
    },

    checkOutput: function(cmp, className, expect, emsg) {
    	var ele = $A.test.getElementByClass(className)[0];
        var t = $A.test.getText(ele).replace(/\s+/gm,' ');
        $A.test.assertEquals(expect, t, emsg);
    },
    
    array1to10Even:"toggleEvenOdd index#2:2 index#4:4 index#6:6 index#8:8",
    
    array1to10Odd:"toggleEvenOdd index#1:1 index#3:3 index#5:5 index#7:7 index#9:9",
    
    array11to21Even:"toggleEvenOdd index#12:12 index#14:14 index#16:16 index#18:18",
    
    array11to21Odd:"toggleEvenOdd index#11:11 index#13:13 index#15:15 index#17:17 index#19:19",

    /*
     * R : toggle bool1 to load new array with different range
     * E : toggle even-odd in the array loaded
     */
    testRREE: { 
        test: [ 
           function(cmp) {
               //sanity check
        	   this.checkOutput(cmp, "iterationBlock", this.array1to10Even, "unexpected initial display");
        	   //toggle boolean in renderIf
        	   this.clickAndWait(cmp, "toggleBool1",this.array11to21Even,"error output toggle bool1");
           }, function(cmp) {
        	   //toggle boolean in renderIf
               this.clickAndWait(cmp, "toggleBool1",this.array1to10Even,"error output toggle bool1 again");
           }, function(cmp) {
               //toggle boolean in iteration
               this.clickAndWaitByClass(cmp,"toggleEvenOdd",this.array1to10Odd,"error output toggle even-odd");   
           }, function(cmp) {
        	   //toggle boolean in iteration
               this.clickAndWaitByClass(cmp,"toggleEvenOdd",this.array1to10Even,"error output toggle even-odd again");   
           }
           ]
    },
    
    testRERE: { 
        test: [ 
           function(cmp) {
               //sanity check
        	   this.checkOutput(cmp, "iterationBlock", this.array1to10Even, "unexpected initial display");
        	   //toggle boolean in renderIf
        	   this.clickAndWait(cmp, "toggleBool1",this.array11to21Even,"error output toggle bool1");
           }, function(cmp) {
               //toggle boolean in iteration
               this.clickAndWaitByClass(cmp,"toggleEvenOdd",this.array11to21Odd,"error output toggle even-odd");   
           },function(cmp) {
        	   //toggle boolean in renderIf, default v.showEven is even
               this.clickAndWait(cmp, "toggleBool1",this.array1to10Even,"error output toggle bool1 again"); 
           },  function(cmp) {
        	   //toggle boolean in iteration
               this.clickAndWaitByClass(cmp,"toggleEvenOdd",this.array1to10Odd,"error output toggle even-odd again");   
           }
           ]
    },
    
    testEERR: { 
        test: [ 
           function(cmp) {
        	    //sanity check
        	   this.checkOutput(cmp, "iterationBlock", this.array1to10Even, "unexpected initial display");
                //toggle boolean in iteration
               this.clickAndWaitByClass(cmp,"toggleEvenOdd",this.array1to10Odd,"error output toggle even-odd");   
           },
           function(cmp) {
               //toggle boolean in iteration
               this.clickAndWaitByClass(cmp,"toggleEvenOdd",this.array1to10Even,"error output toggle even-odd again");   
           },
           function(cmp) {
        	   //toggle boolean in renderIf
        	   this.clickAndWait(cmp, "toggleBool1",this.array11to21Even,"error output toggle new array");
           }, function(cmp) {
        	   //toggle boolean in renderIf
               this.clickAndWait(cmp, "toggleBool1",this.array1to10Even,"error output toggle new array again");
           }
      ]
   },
   

})
