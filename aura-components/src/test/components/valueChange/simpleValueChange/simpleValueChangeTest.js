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

			var map = cmp.get("m.map");
				map["hi"] = "there";
			cmp.set("m.map", map);
			
			$A.test.assertEquals(1, ballot.get("m.candidates.map"));
// JBUCH: HALO: TODO: NEED TO DECIDE WHAT TO DO ABOUT THIS
//			$A.test.assertEquals("hi", $A.test.getText(idxDiv));
//			$A.test.assertEquals("there", $A.test.getText(valDiv));

			cmp.set("m.map.hi", "yo");

			$A.test.assertEquals(2, ballot.get("m.candidates.map"));
			$A.test.assertEquals("hi", $A.test.getText(idxDiv));
			$A.test.assertEquals("yo", $A.test.getText(valDiv));

			map = cmp.get("m.map");
			map["hi"] = undefined;
			cmp.set("m.map", map);

			$A.test.assertEquals(3, ballot.get("m.candidates.map"));
// JBUCH: HALO: TODO: NEED TO DECIDE WHAT TO DO ABOUT THIS
//			$A.test.assertEquals("hi", $A.test.getText(idxDiv));
//			$A.test.assertEquals("undefined", $A.test.getText(valDiv));

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
			
			var list = cmp.get("m.list");
				list.push("hey");
			cmp.set("m.list", list);
			
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
			
			list = cmp.get("m.list");
			list.push("hey");
			cmp.set("m.list", list);
			$A.test.assertEquals(4, ballot.get("m.candidates.list"));

			//KRIS: HALO: 
			// Why Push an empty object and not validate?
			list = cmp.get("m.list");
			list.push({});
			cmp.set("m.list", list);
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
