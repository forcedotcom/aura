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
    /**
     * Verify the numbering of Actions.
     * Actions have two part numbering. The format is as shown below: 
     * x:y 
     * 	X -> Action instance number. Each instance of an Action object gets a new number.
     *  Y -> Denotes the num maintained by context. 
     */
    testActionIds:{
        test:[function(cmp){
            var a = cmp.get("c.getRoster");
            $A.test.assertEquals("3." + $A.getContext().getNum(), a.getId(),
                "Action numbering gone wild - Client Action(1)");
            var b = cmp.get("c.getRoster");
            $A.test.assertEquals("4." + $A.getContext().getNum(), b.getId(),
                "Action numbering gone wild - Client Action(2)");
        },function(cmp){
            var a = cmp.get("c.getBaseball");
            $A.test.assertEquals("5." + $A.getContext().getNum(), a.getId(),
                "Action numbering gone wild - Server Action(1)");
            var b = cmp.get("c.getBaseball");
            $A.test.assertEquals("6." + $A.getContext().getNum(), b.getId(),
                "Action Numbering gone wild - Server Action(2)");
            var c = cmp.get("c.resetCounter");
            $A.test.assertEquals("7." + $A.getContext().getNum(), c.getId(),
                "Action Numbering gone wild - Server Action(3)");
            $A.enqueueAction(c);
            $A.eventService.finishFiring();
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    //After a action request was sent to server, context will increment its counter.
                    var d = cmp.get("c.getBaseball");
                    $A.test.assertEquals(2, $A.getContext().getNum(), "Context lost track of request numbers" )
                    $A.test.assertEquals("8." + $A.getContext().getNum(), d.getId(),
                        "Action Numbering gone wild - Server Action(4)");
            });
        } ]
    },
    /**
     * Verify that components created from action responses are scoped by the action ID.
     * Automation for W-1446345
     */
    testActionScopedGlobalID:{
        test:[function(cmp){
            $A.test.setTestTimeout(300000);
            this.resetCounter(cmp, "testActionScopedGlobalID");
            cmp._testName = "testActionScopedGlobalID";
        },function(cmp){
            /**
             * Group of actions.
             */
            $A.test.assertEquals("1:1.1", cmp.getGlobalId(), "Invalid GlobalId for root component");
            var a = cmp.get("c.getRoster");
            a.run();
            $A.eventService.finishFiring();
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    //Verify result of first action
                    var teamActionNum =  this.getActionNumberFromPage(cmp)[0];
                    this.verifyTeamFacet(cmp, teamActionNum);
                    //Verify result of second action
                    var playerActionNum = this.getActionNumberFromPage(cmp)[1];
                    this.verifyPlayersFacet(cmp, playerActionNum);
                });
        },function(cmp){
            /**
             * Individual Actions to get Team
             */
            var a = cmp.get("c.getTeam");
            a.run();
            $A.eventService.finishFiring();
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    //Verify the new auraStorage:teamFacet component fetched by server action
                    var teamActionNum =  this.getActionNumberFromPage(cmp)[0];
                    this.verifyTeamFacet(cmp,teamActionNum);
                });
        },function(cmp){
            this.resetCounter(cmp, "testActionScopedGlobalID");
            /**
             * Group of actions with one of them aborted. So the sequence of replay changes
             */
            cmp._testCounter = 2; 
            var action1 = cmp.get("c.getBaseball");
            action1.setParams({testName : "testActionScopedGlobalID"});
            action1.setAbortable();
            action1.setCallback(cmp, function(action) {
                    //Clear the old facet in players div
                    cmp.find("Team").getValue("v.body").clear();
                });
            
            var action2 = cmp.get("c.getBaseball");
            action2.setParams({testName : "testActionScopedGlobalID"});
            action2.setAbortable();
            action2.setCallback(cmp, function(action) {
                    var teamFacet = $A.newCmpDeprecated(action.getReturnValue()[0]);
                    //Clear the old facet in team div
                    cmp.find("Team").getValue("v.body").clear();
                     //Insert newly fetched components
                    cmp.find("Team").getValue("v.body").push(teamFacet);
                    //Update the page with action number
                    cmp.find("Actions").getElement().innerHTML = action.getId();
                });
            var a = cmp.get("c.resetCounter");
            a.setParams({ testName: "testActionScopedGlobalID" }),
            a.setExclusive();
            a.setCallback(cmp,function(a){
                    $A.clientService.runActions([action1], cmp, function(){cmp._testCounter--;});
                    $A.clientService.runActions([action2], cmp, function(){cmp._testCounter--;});
                });
            $A.enqueueAction(a);
            $A.eventService.finishFiring();
            cmp.test = this;
            $A.test.runAfterIf(function() {
                    return cmp._testCounter == 0;
                }, function(){
                    var teamActionNum = cmp.test.getActionNumberFromPage(cmp)[0];
                            cmp.test.verifyTeamFacet(cmp, teamActionNum);
                });
        } ]
    },
    testActionScopedGlobalIDUsingStorageService:{
        attributes:{
            defaultExpiration : 60,
            defaultAutoRefreshInterval : 60
        },
        test:[function(cmp){
            $A.test.setTestTimeout(30000);
            this.resetCounter(cmp, "testActionScopedGlobalIDUsingStorageService");
            cmp._testName = "testActionScopedGlobalIDUsingStorageService";
        },function(cmp){
            /**
             * Group of actions, store them.
             */
            $A.test.assertEquals("1:1.1", cmp.getGlobalId(), "Invalid GlobalId for root component");
            var a = cmp.get("c.getRosterFromStorage");
            a.run();
            $A.eventService.finishFiring();
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    //Verify result of first action
                    var teamActionNum =  this.getActionNumberFromPage(cmp)[0];
                    this.verifyTeamFacet(cmp, teamActionNum);
                    //Verify result of second action
                    var playerActionNum = this.getActionNumberFromPage(cmp)[1];
                    this.verifyPlayersFacet(cmp, playerActionNum);
                });
        },function(cmp){
            /**Individual action to get players, should be from storage. 
            *Since the action signatures are the same, the last stored action for 
            *java://org.auraframework.impl.java.controller.AuraStorageTestController$getBaseball will be the player response
            */
            var a = cmp.get("c.getBaseball");
            a.setCallback(cmp, function(action) {
                    var ret = action.getReturnValue();
                    //Clear the old facet in players div
                    cmp.find("Players").getValue("v.body").clear();
                    for(var i=0;i<ret.length;i++){
                        var playerFacet = $A.newCmpDeprecated(ret[i]);
                        //Insert newly fetched components
                        cmp.find("Players").getValue("v.body").push(playerFacet);
                    }
                    //Update the page with action number
                    cmp.find("Actions").getElement().innerHTML = action.getId();
                });
            a.setParams({ testName: cmp._testName });
            a.setStorable();
            $A.enqueueAction(a);
            $A.eventService.finishFiring();
            cmp.test = this;
            $A.test.addWaitFor("SUCCESS", function(){return a.getState()},
                function(){
                    $A.test.assertTrue(a.isFromStorage(), "Action should have been from storage");
                    var playerActionNum = cmp.test.getActionNumberFromPage(cmp)[0];
                    cmp.test.verifyPlayersFacet(cmp, playerActionNum);
                });
        } ]
    },
    resetCounter:function(cmp, testName){
        cmp.getDef().getHelper().resetCounters(cmp, testName);
    },
    getActionNumberFromPage:function(cmp){
        return  ($A.test.getText(cmp.find("Actions").getElement())).split(",");
    },
    getActionNumberFromGlobalId:function(cmp){
        return cmp.getGlobalId().split(":")[1];
    },
    /**
     * Verifies the contents of the Players DIV.
     * 
     */
    verifyPlayersFacet:function(cmp, playerActionNum){
        var players = cmp.find("Players");
        var player1Facet = players.get("v.body")[0];
        $A.test.assertTruthy(player1Facet , "Could not find new playerFacet in body.");
        $A.test.assertEquals(playerActionNum, 
            this.getActionNumberFromGlobalId(player1Facet), 
            "Component Array from action request was not scoped by action ID");
        $A.test.assertEquals("markup://auraStorageTest:playerFacet", player1Facet.getDef().getDescriptor().toString(),
            "Expected to see playerFacet as response to second action.");
        
        var msg = player1Facet.find("msg");
        $A.test.assertEquals(playerActionNum, this.getActionNumberFromGlobalId(msg),
            "Expected all facets of playerFacet created at server to be scoped by action response");
        var association = player1Facet.find("Association");
        $A.test.assertEquals(playerActionNum, this.getActionNumberFromGlobalId(association),
            "Expected all facets of playerFacet created at server to be scoped by action response");
        $A.test.assertEquals("Major League Baseball Players Association", $A.test.getText(association.getElement()));
        
        var player2Facet = players.get("v.body")[1]; 
        $A.test.assertEquals(playerActionNum, 
            this.getActionNumberFromGlobalId(player2Facet),
                "Component Array from action request was not scoped by action ID");
        
        //Verify user actions on newly created components
        player1Facet.find("button").get("e.press").fire();
        player2Facet.find("button").get("e.press").fire();
        
        $A.test.addWaitFor("I am Posey the Buster", 
            function(){return $A.test.getText(player1Facet.find("msg").getElement());});
        $A.test.addWaitFor("I am PSandavol the Panda", 
            function(){return $A.test.getText(player2Facet.find("msg").getElement());});
    },
    /**
     * Verifies the contents of the Team DIV.
     */
    verifyTeamFacet:function(cmp, teamActionNum){
        //Verify result of first action
        var team = cmp.find("Team");
        var teamFacet = team.get("v.body")[0];
        $A.test.assertTruthy(teamFacet , "Could not find new teamFacet in body.");
        $A.test.assertEquals(teamActionNum, 
            this.getActionNumberFromGlobalId(teamFacet), "Component from action request was not scoped by action ID");
        $A.test.assertEquals("markup://auraStorageTest:teamFacet", teamFacet.getDef().getDescriptor().toString(),
            "Expected to see teamFacet as response to first action.");
        //Verify the facets of component from first action
        var msg = teamFacet.find("msg");
        $A.test.assertEquals(teamActionNum, this.getActionNumberFromGlobalId(msg),
            "Expected all facets of teamFacet created at server to be scoped by action response");
        var division = teamFacet.find("Division");
        $A.test.assertEquals(teamActionNum, this.getActionNumberFromGlobalId(division),
            "Expected all facets of teamFacet created at server to be scoped by action response");
        $A.test.assertEquals("National League", $A.test.getText(division.getElement()), 
            "Fetched the wrong data for model values.");
        teamFacet.find("button").get("e.press").fire();
        $A.test.addWaitFor("We are the Giants from San Francisco", 
            function(){return $A.test.getText(teamFacet.find("msg").getElement());});
    }
})
