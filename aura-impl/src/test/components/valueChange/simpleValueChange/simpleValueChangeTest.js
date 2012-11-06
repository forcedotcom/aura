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
    testString:{
        test:function(cmp){
            var ballot = cmp.find("ballot");
            var idxDiv = cmp.find("index").getElement();
            var valDiv = cmp.find("value").getElement();

            ballot.getValue("m.candidates.string").setValue(0);

            cmp.getValue("m.string").setValue("hi");

            $A.test.assertEquals("undefined", $A.test.getText(idxDiv));
            $A.test.assertEquals("hi", $A.test.getText(valDiv));
            $A.test.assertEquals(1, ballot.get("m.candidates.string"));
        }
    },

    testStringToSame:{
        test:function(cmp){
            var ballot = cmp.find("ballot");
            var idxDiv = cmp.find("index").getElement();
            var valDiv = cmp.find("value").getElement();

            ballot.getValue("m.candidates.string").setValue(0);
            cmp.getValue("m.string").setValue("ho");

            $A.test.assertEquals("undefined", $A.test.getText(idxDiv));
            $A.test.assertEquals("ho", $A.test.getText(valDiv));
            $A.test.assertEquals(1, ballot.get("m.candidates.string"));

                        //
                        // Here we set the string to the same value, and we still get
                        // a call to the change callback, but only the ballot count
                        // goes up.
                        //
            cmp.getValue("m.string").setValue("ho");

            $A.test.assertEquals("undefined", $A.test.getText(idxDiv));
            $A.test.assertEquals("ho", $A.test.getText(valDiv));
            $A.test.assertEquals(2, ballot.get("m.candidates.string"));
        }
        },

    testMap:{
        test:function(cmp){
            var ballot = cmp.find("ballot");
            var idxDiv = cmp.find("index").getElement();
            var valDiv = cmp.find("value").getElement();

            ballot.getValue("m.candidates.map").setValue(0);

            cmp.getValue("m.map").put("hi", "there");
            $A.test.assertEquals(1, ballot.get("m.candidates.map"));
            $A.test.assertEquals("hi", $A.test.getText(idxDiv));
            $A.test.assertEquals("there", $A.test.getText(valDiv));

            cmp.getValue("m.map.hi").setValue("yo");

            $A.test.assertEquals(2, ballot.get("m.candidates.map"));
            $A.test.assertEquals("hi", $A.test.getText(idxDiv));
            $A.test.assertEquals("yo", $A.test.getText(valDiv));

            cmp.getValue("m.map").put("hi", undefined);

            $A.test.assertEquals(3, ballot.get("m.candidates.map"));
            $A.test.assertEquals("hi", $A.test.getText(idxDiv));
            $A.test.assertEquals("undefined", $A.test.getText(valDiv));

            cmp.getValue("m.string").setValue("hi");

            $A.test.assertEquals(3, ballot.get("m.candidates.map"));
            $A.test.assertEquals("undefined", $A.test.getText(idxDiv));
            $A.test.assertEquals("hi", $A.test.getText(valDiv));
        }
    },

    testList:{
        test:function(cmp){
            var ballot = cmp.find("ballot");
            var idxDiv = cmp.find("index").getElement();
            var valDiv = cmp.find("value").getElement();

            ballot.getValue("m.candidates.string").setValue(0);
            cmp.getValue("m.list").push("hey");
            $A.test.assertEquals(1, ballot.get("m.candidates.list"));
            $A.test.assertEquals("undefined", $A.test.getText(idxDiv));
            $A.test.assertEquals("hey", $A.test.getText(valDiv));

            cmp.getValue("m.list.0").setValue("yo");

            $A.test.assertEquals("0", $A.test.getText(idxDiv));
            $A.test.assertEquals("yo", $A.test.getText(valDiv));
            $A.test.assertEquals(2, ballot.get("m.candidates.list"));

            cmp.getValue("m.string").setValue("hi");

            $A.test.assertEquals(2, ballot.get("m.candidates.list"));

            cmp.getValue("m.list").setValue(["yoeeee"]);
            $A.test.assertEquals(3, ballot.get("m.candidates.list"));
            cmp.getValue("m.list").push("hey");
            $A.test.assertEquals(4, ballot.get("m.candidates.list"));

            cmp.getValue("m.list").push({});
        }
    },

    testSingleChain:{
        test:function(cmp){
            cmp.getValue("m.chained").setValue("start");

            var idxDiv = cmp.find("index").getElement();
            var valDiv = cmp.find("value").getElement();
            $A.test.assertEquals("undefined", $A.test.getText(idxDiv));
            $A.test.assertEquals("finished", $A.test.getText(valDiv));
        }
    },

        //
        // FIXME: W-1296937 this should cause an error that we can check. This is a simple
        // infinite recursion. If you uncomment this, it gives a different result
        // depending on the browser
        //
    _testRecurseSimple:{
        test:function(cmp){
            cmp.getValue("m.recurseA").setValue("start");
        }
    },

        //
        // FIXME: W-1296937 this should cause an error that we can check. This is a ping-pong
        // infinite recursion. If you uncomment this, it gives a different result
        // depending on the browser
        //
    _testRecursePingPong:{
        test:function(cmp){
            cmp.getValue("m.recurseB").setValue("start");
        }
    }
})
