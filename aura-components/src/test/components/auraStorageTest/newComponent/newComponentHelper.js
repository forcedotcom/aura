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
    resetCounters:function(cmp, _testName){
        var a = cmp.get("c.resetCounter");
        a.setParams({
            testName: (!_testName?"baseBall":_testName)
        }),
        a.setExclusive();
        $A.enqueueAction(a);
    },
    setCounter:function(cmp, newValue){
        var _testName = cmp._testName;
        var a = cmp.get("c.setCounter");
        a.setParams({
            testName: (!_testName?"baseBall":_testName),
            value: newValue
        }),
        a.setExclusive();
        $A.enqueueAction(a);
    },
    /*
     * we enqueue two actions, though they have same signature, we enqueue the second in first one's callback
     * we don't store response of the 1st one, so 2nd one get to send to server and get its own resposne
     */
    getTeamAndPlayers: function(cmp, storable) {
    	var _testName = cmp._testName;
    	
    	//Second Action
        var aPlayer = cmp.get("c.getBaseball");
        aPlayer.setCallback(cmp, function(action) {
        	var body = [];
        	for(var i = 0; i< action.getReturnValue().length; i++) {
        		var aPlayerFacet = $A.createComponentFromConfig(action.getReturnValue()[i]);
        		body.push(aPlayerFacet);
        	}
            cmp.find("Players").set("v.body", body);
            
            //Update the page with action number
            cmp.getDef().getHelper().findAndAppendText(cmp, "Actions", aPlayer.getId() +",")
        });
        aPlayer.setParams({
            testName: (!_testName?"baseBall":_testName)
        });
        if(storable) {
        	aPlayer.setStorable();
        }
        
        //First Action
        var aTeam = cmp.get("c.getBaseball");
        aTeam.setCallback(cmp, function(action) {
            var aTeamFacet = $A.createComponentFromConfig(action.getReturnValue()[0]);
            //Clear the old facet in team div & insert newly fetched components
            cmp.find("Team").set("v.body", [aTeamFacet]);
            //Update the page with action number
            cmp.getDef().getHelper().findAndAppendText(cmp, "Actions", aTeam.getId() +",");
            $A.enqueueAction(aPlayer);
        });
        aTeam.setParams({
            testName: (!_testName?"baseBall":_testName)
        });
        
        $A.enqueueAction(aTeam);
    },
    
    /*
     * we enqueue two actions with same signature(def and params), in a $A.run(), which makes them concurrent. 
     * in this case, we actually only send first action to server
     * the second action will get first one's response.
     */
    getTeamAndTeam:function(cmp, storable){
        $A.run(function() {
                var _testName = cmp._testName;
                //First Action
                var aTeam = cmp.get("c.getBaseball");
                aTeam.setCallback(cmp, function(action) {
                    var aTeamFacet = $A.createComponentFromConfig(action.getReturnValue()[0]);
                    //Clear the old facet in team div & insert newly fetched components
                    cmp.find("Team").set("v.body", [aTeamFacet]);
                    //Update the page with action number
                    cmp.getDef().getHelper().findAndAppendText(cmp, "Actions", aTeam.getId() +",");
                });
                aTeam.setParams({
                    testName: (!_testName?"baseBall":_testName)
                });
                if(storable) {
                    aTeam.setStorable();
                }
                $A.enqueueAction(aTeam);
                
                //Second Action
                var bTeam = cmp.get("c.getBaseball");
                bTeam.setCallback(cmp, function(action) {
                    var bTeamFacet = $A.createComponentFromConfig(action.getReturnValue()[0]);
                    cmp.find("Team2").set("v.body", [bTeamFacet]);
                    
                    //Update the page with action number
                    cmp.getDef().getHelper().findAndAppendText(cmp, "Actions", bTeam.getId() +",")
                });
                bTeam.setParams({
                    testName: (!_testName?"baseBall":_testName)
                });
                if(storable) {
                	bTeam.setStorable();
                }
                $A.enqueueAction(bTeam);
            });
    },
    getTeamOnly:function(cmp,storable){
        this.setCounter(cmp,0);
        var _testName = cmp._testName;
        var a = cmp.get("c.getBaseball");
        a.setCallback(cmp, function(action) {
            var teamFacet = $A.createComponentFromConfig(action.getReturnValue()[0]);
            //Clear the old facet in team div & insert newly fetched components
            cmp.find("Team").set("v.body", [teamFacet]);
            //Update the page with action number
            cmp.getDef().getHelper().findAndSetText(cmp, "Actions", a.getId());
        });
        a.setParams({
            testName: (!_testName?"baseBall":_testName)
        });
        if(storable)
            a.setStorable();
        $A.enqueueAction(a);
        cmp.find("Actions").getElement().innerHTML = a.getId();
    },
    getPlayersOnly:function(cmp,storable){
        this.setCounter(cmp,1);
        var _testName = cmp._testName;
        var a = cmp.get("c.getBaseball");
        a.setCallback(cmp, function(action) {
            var ret = action.getReturnValue();
            //Clear the old facet in players div
            var newBody = [];
            for(var i=0;i<ret.length;i++){
                var playerFacet = $A.createComponentFromConfig(ret[i]);
                newBody.push(playerFacet);
            }
            //Insert newly fetched components
            cmp.find("Players").set("v.body", newBody);
            //Update the page with action number
            cmp.getDef().getHelper().findAndSetText(cmp, "Actions", a.getId());
        });
        a.setParams({
            testName: (!_testName?"baseBall":_testName)
        });
        if(storable)
            a.setStorable();
        $A.enqueueAction(a);
        cmp.getDef().getHelper().findAndSetText(cmp, "Actions", a.getId());
    },
    findAndSetText:function(cmp, targetCmpId, msg){
        cmp.find(targetCmpId).getElement().innerHTML = msg;
    },
    findAndAppendText:function(cmp, targetCmpId, msg){
        cmp.find(targetCmpId).getElement().innerHTML += msg;
    }
})
