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
	/*
	 * Test for Bean Model
	 * two component use the same mode (TestModelBean). one include another in markup. 
	 * According to BeanAdapter.java, the models should be unique to the current component.
	 * 
	 */
	 testBeanModel:{
	        test:function(cmp){
	        	var mCounter = cmp.get("m.counter");
	        	var mCounterChild = cmp.find("childCmp").get("m.counter");
	        	$A.test.assertEquals(mCounter,1,"should be a new model instance for parent cmp");
	        	$A.test.assertEquals(mCounterChild,1,"should be a new model instance for child cmp");
	        }
	 },
	 /*
	  * Test for Bean Action 
	  * two component use the same server side Action(TestControllerBean), both call the action:increaseCounter 
	  * of TestControllerBean during init. 
	  * these two actions are group into a request -- according to chrome/network
	  * BeanAdapter.java says:
	  * "This method can return the same bean for all calls within a single context (i.e. request)"
	  * the second call to the same action should reach the existing action instance, 
	  * increaseCounter will give us 2 instead of 1. but that is not the case now, as we don't cache the 
	  * action instance.
	  * 
	  * This doesn't work now : W-2222955
	  */
	 _testBeanController:{
	        test:function(cmp){
	        	var cCounter = cmp.get("v.counter");
	        	var cCounterChild = cmp.find("childCmp").get("v.childCounter");
	        	$A.test.assertEquals(cCounterChild,1,"should be a new controller instance for the first call");
	        	$A.test.assertEquals(cCounter,2,"suppose to use the existing instance of Controller inside a request");
	        }
	 },
})