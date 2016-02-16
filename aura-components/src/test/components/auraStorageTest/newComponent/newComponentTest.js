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
     * x;a 
     * 	X -> Action instance number. Each instance of an Action object gets a new number.
     *  a -> Denotes action
     */
    testActionIds:{
        test:[function(cmp){
            var startactioncount = 24;
            var a = cmp.get("c.getRoster");
            $A.test.assertEquals(++startactioncount+";a", a.getId(),
                "Action numbering gone wild - Client Action(1)");
            var b = cmp.get("c.getRoster");
            $A.test.assertEquals(++startactioncount+";a", b.getId(),
                "Action numbering gone wild - Client Action(2)");
        },function(cmp){
            var startactioncount = 26;
            var a = cmp.get("c.getBaseball");
            $A.test.assertEquals(++startactioncount+";a", a.getId(),
                "Action numbering gone wild - Server Action(1)");
            var b = cmp.get("c.getBaseball");
            $A.test.assertEquals(++startactioncount+";a", b.getId(),
                "Action Numbering gone wild - Server Action(2)");
            var c = cmp.get("c.resetCounter");
            $A.test.assertEquals(++startactioncount+";a", c.getId(),
                "Action Numbering gone wild - Server Action(3)");
            $A.test.enqueueAction(c);
            
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    var d = cmp.get("c.getBaseball");
                    $A.test.assertEquals(++startactioncount+";a", d.getId(),
                        "Action Numbering gone wild - Server Action(4)");
            });
        } ]
    },
    /**
     * Verify that components created from action responses are scoped by the action ID.
     * Automation for W-1446345
     */
    testActionScopedGlobalID:{
        labels: ["flapper"],
        test:[function(cmp){
            cmp._testName = "testActionScopedGlobalID";
            var a = cmp.get("c.resetCounter");
            a.setParams({ testName: "testActionScopedGlobalID" }),
            $A.test.enqueueAction(a);
            $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([a]);});
        },function(cmp){
            /**
             * Group of actions.
             */
            var that = this;
            $A.run(function () {
                var a = cmp.get("c.getRoster");
                a.runDeprecated();
            });
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    //Verify result of first action
                    var teamActionNum =  that.getActionNumberFromPage(cmp)[0];
                    that.verifyTeamFacet(cmp, teamActionNum);
                    //Verify result of second action
                    var playerActionNum = that.getActionNumberFromPage(cmp)[1];
                    that.verifyPlayersFacet(cmp, playerActionNum);
                });
        },function(cmp){
            /**
             * Individual Actions to get Team
             */
        	var that = this;
            var a = cmp.get("c.getTeam");
            $A.run(function() {a.runDeprecated();});
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    //Verify the new auraStorage:teamFacet component fetched by server action
                    var teamActionNum =  that.getActionNumberFromPage(cmp)[0];
                    that.verifyTeamFacet(cmp,teamActionNum);
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
            var a = cmp.get("c.getTeamFromServerAndTeam2AsDupOfTeam");
            a.runDeprecated();
            var that = this;
            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    //Verify result of first action
                    var teamActionNum =  that.getActionNumberFromPage(cmp)[0];
                    that.verifyTeamFacet(cmp, teamActionNum);
                    //Verify result of second action
                    var team2ActionNum = that.getActionNumberFromPage(cmp)[1];
                    //
                    // This is because we only execute the action once on the server.
                    // 
                    that.verifyTeamFacet(cmp, team2ActionNum, "Team2");
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
                    var newBody = []
                    for(var i=0;i<ret.length;i++){
                        var playerFacet = $A.createComponentFromConfig(ret[i]);
                        newBody.push(playerFacet);
                    }
                    //Insert newly fetched components
                    cmp.find("Players").set("v.body", newBody);
                    //Update the page with action number
                    cmp.find("Actions").getElement().innerHTML = action.getId();
                });
            a.setParams({ testName: cmp._testName });
            a.setStorable();
            $A.test.enqueueAction(a);
            cmp.test = this;
            $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([a]); },
                function(){
                    $A.test.assertEquals("SUCCESS", a.getState());
                    $A.test.assertTrue(a.isFromStorage(), "Action should have been from storage");
                    var playerActionNum = cmp.test.getActionNumberFromPage(cmp)[0];
                    cmp.test.verifyTeamFacet(cmp, playerActionNum, "Players");
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
    verifyPlayersFacet:function(cmp, playerActionNum, name){
        name = name || "Players";
        var players = cmp.find(name);
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
    verifyTeamFacet:function(cmp, teamActionNum, name){
        name = name || "Team";
        //Verify result of first action
        var team = cmp.find(name);
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
