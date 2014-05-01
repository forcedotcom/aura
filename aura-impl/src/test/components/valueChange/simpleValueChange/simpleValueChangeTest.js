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
	testString : {
		test : function(cmp) {
			var ballot = cmp.find("ballot");
			var idxDiv = cmp.find("index").getElement();
			var valDiv = cmp.find("value").getElement();

			ballot.set("m.candidates.string", 0);

			cmp.set("m.string", "hi");

			// $A.test.assertEquals("undefined", $A.test.getText(idxDiv));
			$A.test.assertEquals("hi", $A.test.getText(valDiv));
			$A.test.assertEquals(1, ballot.get("m.candidates.string"));
		}
	},

	testMap : {
		test : function(cmp) {
			var ballot = cmp.find("ballot");
			var idxDiv = cmp.find("index").getElement();
			var valDiv = cmp.find("value").getElement();

			ballot.set("m.candidates.map", 0);

			cmp.getValue("m.map").put("hi", "there");
			$A.test.assertEquals(1, ballot.get("m.candidates.map"));
			$A.test.assertEquals("hi", $A.test.getText(idxDiv));
			$A.test.assertEquals("there", $A.test.getText(valDiv));

			cmp.set("m.map.hi", "yo");

			$A.test.assertEquals(2, ballot.get("m.candidates.map"));
			$A.test.assertEquals("hi", $A.test.getText(idxDiv));
			$A.test.assertEquals("yo", $A.test.getText(valDiv));

			cmp.getValue("m.map").put("hi", undefined);

			$A.test.assertEquals(3, ballot.get("m.candidates.map"));
			$A.test.assertEquals("hi", $A.test.getText(idxDiv));
			$A.test.assertEquals("undefined", $A.test.getText(valDiv));

			cmp.set("m.string", "hi");

			$A.test.assertEquals(3, ballot.get("m.candidates.map"));
			$A.test.assertEquals("undefined", $A.test.getText(idxDiv));
			$A.test.assertEquals("hi", $A.test.getText(valDiv));
		}
	},

	testList : {
		test : function(cmp) {
			var ballot = cmp.find("ballot");
			var idxDiv = cmp.find("index").getElement();
			var valDiv = cmp.find("value").getElement();

			ballot.set("m.candidates.string", 0);
			cmp.getValue("m.list").push("hey");
			$A.test.assertEquals(1, ballot.get("m.candidates.list"));
			$A.test.assertEquals("undefined", $A.test.getText(idxDiv));
			$A.test.assertEquals("hey", $A.test.getText(valDiv));

			cmp.set("m.list.0", "yo");

			$A.test.assertEquals("0", $A.test.getText(idxDiv));
			$A.test.assertEquals("yo", $A.test.getText(valDiv));
			$A.test.assertEquals(2, ballot.get("m.candidates.list"));

			cmp.set("m.string", "hi");

			$A.test.assertEquals(2, ballot.get("m.candidates.list"));

			cmp.set("m.list", [ "yoeeee" ]);
			$A.test.assertEquals(3, ballot.get("m.candidates.list"));
			cmp.getValue("m.list").push("hey");
			$A.test.assertEquals(4, ballot.get("m.candidates.list"));

			cmp.getValue("m.list").push({});
		}
	},

	testSingleChain : {
		test : function(cmp) {
			cmp.set("m.chained", "start");

			var idxDiv = cmp.find("index").getElement();
			var valDiv = cmp.find("value").getElement();
			$A.test.assertEquals("undefined", $A.test.getText(idxDiv));
			$A.test.assertEquals("finished", $A.test.getText(valDiv));
		}
	},

	/*
	 * X observe Y : X is watching Y, which means Y.$observers$ has X, and
	 * X.$observing$ is Y
	 */
	testObservers : {
		test : function(cmp) { // sanity test
			var ballot = cmp.find("ballot");
			var idxDiv = cmp.find("index").getElement();
			var valDiv = cmp.find("value").getElement();

			ballot.set("m.candidates.string", 0);

			/*
			 * X:attrib Y:value case1.1: 1.1.1: make X observe Y 1.1.2: X's old
			 * value will be replaced with Y's value
			 */
			var attrib = cmp.getValue("m.string");
			$A.test.assertEquals("hey", attrib.getValue());
			var value = cmp.getValue("v.observed");
			attrib.setValue(value); // implicitly tracks value in m.string
			$A.test.assertEquals("first", attrib.getValue());
			$A.test.assertEquals("first", $A.test.getText(valDiv));
			$A.test.assertEquals(1, ballot.get("m.candidates.string"));

			/*
			 * X:attrib Y:value X observe Y case1.2: when Y's value change, X's
			 * value get updated.
			 */
			value.setValue("second"); // tracked by observer, including change
										// event
			$A.test.assertEquals("second", attrib.getValue());
			$A.test.assertEquals("second", $A.test.getText(valDiv));
			$A.test.assertEquals(2, ballot.get("m.candidates.string"));

			/*
			 * X:attrib Y:value X observe Y case1.3: try to Z that X is NOT
			 * observing from X observing, should result in warning message on
			 * console case1.4: 1.4.1: call X.observe(Y) again, not necessary,
			 * as X is already observing Y. 1.4.2: change Y's value, X's value
			 * get udpated
			 */
			attrib.unobserve(cmp); // No-op, except to generate a warning
			attrib.observe(value); // No-op, already in effect
			value.setValue("third"); // only one change per set, not doubled!
			$A.test.assertEquals("third", attrib.getValue());
			$A.test.assertEquals("third", $A.test.getText(valDiv));
			$A.test.assertEquals(3, ballot.get("m.candidates.string"));

			/*
			 * X:attrib Y:value X observe Y case 1.5: drop X's observing (Y).
			 * change Y's value, X's value stay the same
			 */
			attrib.unobserve(value); // Unlink
			value.setValue("fourth"); // Not propagated
			$A.test.assertEquals("third", attrib.getValue());
			$A.test.assertEquals("third", $A.test.getText(valDiv));
			$A.test.assertEquals(3, ballot.get("m.candidates.string"));

			/*
			 * X:attrib Y:value. X is not observing after case1.5 case1.6:
			 * 1.6.1: make Y observe X 1.6.2: change X's value, Y's value get
			 * updated.
			 */
			value.observe(attrib); // Preferred new syntax
			attrib.setValue("fifth");
			$A.test.assertEquals("fifth", value.getValue());

			// clean up
			value.unobserve(attrib);

		},
		test : function(cmp) { // let's try some chain, and also loops
			function callFunc(funcToCall, simpleValueA, simpleValueB) {
				funcToCall.call(simpleValueA, simpleValueB);
			}
			function initToDifferentValue() {
				attrib.setValue("one");
				valueA.setValue("two");
				valueB.setValue("three");
				valueC.setValue("four");
			}
			function initToSameValue(sameValue) {
				attrib.setValue(sameValue);
				valueA.setValue(sameValue);
				valueB.setValue(sameValue);
				valueC.setValue(sameValue);
			}
			var attrib = cmp.getValue("m.string");
			var valueA = cmp.getValue("v.observed");
			var valueB = cmp.getValue("v.observedB");
			var valueC = cmp.getValue("v.observedC");
			/*
			 * X:attrib A:valueA. case 2.1: loop, two value try to watch each
			 * other. same thing will happen if the loop contains more than two
			 * value 2.1.1: set both A and X to "six" 2.1.2: make X observe A ,
			 * A observe X 2.1.3: change A's value, first, A will stop observing
			 * X since X's value is different than A's, but X still watch A, so
			 * X get updated
			 */
			function testLoop(funcToCall, errMsg) {
				valueA.setValue("six");
				attrib.setValue("six");
				callFunc(funcToCall, attrib, valueA);
				callFunc(funcToCall, valueA, attrib);
				valueA.setValue("seven");
				$A.test.assertEquals("seven", attrib.getValue(), errMsg);
				// clean up
				attrib.unobserve(valueA);
			}
			testLoop(attrib.observe, "Error in simpleValueChangeTest,test observe loop");
			testLoop(attrib.setValue, "Error in simpleValueChangeTest,test setValue loop");
			/*
			 * X:attrib A:valueA B:valueB C:valueC case 2.2: one value is
			 * watched by multiple value 2.2.0: init X,A,B,C to different value
			 * 2.2.1: make A observe X, B observe X, C observe X 2.2.2: change
			 * X's value, A,B and C should get updated
			 */
			function testWatchedByMultiple(funcToCall, errMsg) {
				initToDifferentValue();
				callFunc(funcToCall, valueA, attrib);
				callFunc(funcToCall, valueB, attrib);
				callFunc(funcToCall, valueC, attrib);
				attrib.setValue("eight");
				$A.test.assertEquals("eight", valueA.getValue(), errMsg + " error with valueA.");
				$A.test.assertEquals("eight", valueB.getValue(), errMsg + " error with valueB.");
				$A.test.assertEquals("eight", valueC.getValue(), errMsg + " error with valueC.");
				// clean up
				valueA.unobserve(attrib);
				valueB.unobserve(attrib);
				valueC.unobserve(attrib);
			}
			testWatchedByMultiple(attrib.observe, "Error in simpleValueChangeTest,testWatchedByMultiple, observe.");
			testWatchedByMultiple(attrib.setValue, "Error in simpleValueChangeTest,testWatchedByMultiple, setValue.");
			/*
			 * X:attrib A:valueA B:valueB C:valueC case 2.3: chained watch
			 * 2.3.1: init X,A,B,C to different value 2.3.2: make A observe B, B
			 * observe C, C observe X 2.3.3: change X's value, A,B and C should
			 * get updated
			 */
			function testChainedWatch(funcToCall, errMsg) {
				initToDifferentValue();
				callFunc(funcToCall, valueA, valueB);
				callFunc(funcToCall, valueB, valueC);
				callFunc(funcToCall, valueC, attrib);
				attrib.setValue("nine");
				$A.test.assertEquals("nine", valueA.getValue(), errMsg + " error with valueA.");
				$A.test.assertEquals("nine", valueB.getValue(), errMsg + " error with valueB.");
				$A.test.assertEquals("nine", valueC.getValue(), errMsg + " error with valueC.");
				// clean up
				valueA.unobserve(valueB);
				valueB.unobserve(valueC);
				valueC.unobserve(attrib);
			}
			testChainedWatch(attrib.observe, "Error in simpleValueChangeTest,testChainedWatch, observe.");
			testChainedWatch(attrib.setValue, "Error in simpleValueChangeTest,testChainedWatch, setValue.");
			/*
			 * X:attrib A:valueA B:valueB C:valueC case 2.4: one value try to
			 * watch more than one value, the last one win 2.4.1: init X,A,B,C
			 * to "nine" 2.4.2: make X observe A, X observe B, X observe C, X
			 * will end up watching C only 2.4.3: change A's value, X won't
			 * change 2.4.4: change C's value, X get updated
			 */
			function testWatchMultiple(funcToCall, errMsg) {
				initToSameValue("nine");
				callFunc(funcToCall, attrib, valueA);
				callFunc(funcToCall, attrib, valueB);
				callFunc(funcToCall, attrib, valueC);
				valueA.setValue("ten");
				$A.test.assertEquals("nine", attrib.getValue(), errMsg + " attrib shouldn't change with valueA. ");
				valueC.setValue("ten");
				$A.test.assertEquals("ten", attrib.getValue(), errMsg + " attrib should change with valueC. ");
				// clean up
				attrib.unobserve(valueC);
			}
			testWatchMultiple(attrib.observe, "Error in simpleValueChangeTest,testWatchMultiple, observe.");
			testWatchMultiple(attrib.setValue, "Error in simpleValueChangeTest,testWatchMultiple, setValue.");
		},
		/*
		 * enable this when W-1954683 is resolved
		 */
		_test : function(cmp) {// test error case
			var stringValue = "somestring";
			var errorMsg = "Type mismatch between SimpleValue and somestring";
			$A.test.expectAuraError(errorMsg);
			valueA.observe(stringValue);
		}

	},

	//
	// FIXME: W-1296937 this should cause an error that we can check. This is a
	// simple
	// infinite recursion. If you uncomment this, it gives a different result
	// depending on the browser
	//
	_testRecurseSimple : {
		test : function(cmp) {
			cmp.set("m.recurseA", "start");
		}
	},

	//
	// FIXME: W-1296937 this should cause an error that we can check. This is a
	// ping-pong
	// infinite recursion. If you uncomment this, it gives a different result
	// depending on the browser
	//
	_testRecursePingPong : {
		test : function(cmp) {
			cmp.set("m.recurseB", "start");
		}
	}
})
