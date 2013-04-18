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
		a.runAfter(a);
	},
	setCounter:function(cmp, newValue){
		var _testName = cmp._testName;
		var a = cmp.get("c.setCounter");
		a.setParams({
			testName: (!_testName?"baseBall":_testName),
			value: newValue
		}),
		a.setExclusive();
		a.runAfter(a);
	},
	getTeamAndPlayers:function(cmp, storable){
		var _testName = cmp._testName;
		//First Action
		var aTeam = cmp.get("c.getBaseball");
		aTeam.setCallback(cmp, function(action) {
            var teamFacet = $A.newCmp(action.getReturnValue()[0]);
            //Clear the old facet in team div
            cmp.find("Team").getValue("v.body").clear();
            //Insert newly fetched components
            cmp.find("Team").getValue("v.body").push(teamFacet);
            //Update the page with action number
            cmp.getDef().getHelper().findAndAppendText(cmp, "Actions", aTeam.getId() +",");
        });
		aTeam.setParams({
			testName: (!_testName?"baseBall":_testName)
		});
		if(storable)
			aTeam.setStorable();
		aTeam.runAfter(aTeam);
		
		//Second Action
		var aPlayers = cmp.get("c.getBaseball");
		aPlayers.setCallback(cmp, function(action) {
            var ret = action.getReturnValue();
            //Clear the old facet in players div
            cmp.find("Players").getValue("v.body").clear();
            for(var i=0;i<ret.length;i++){
                var playerFacet = $A.newCmp(ret[i]);
                //Insert newly fetched components
                cmp.find("Players").getValue("v.body").push(playerFacet);
            }
            //Update the page with action number
            cmp.getDef().getHelper().findAndAppendText(cmp, "Actions", aPlayers.getId() +",")
        });
		aPlayers.setParams({
			testName: (!_testName?"baseBall":_testName)
		});
		if(storable)
			aPlayers.setStorable();
		aPlayers.runAfter(aPlayers);
	},
	getTeamOnly:function(cmp,storable){
		this.setCounter(cmp,0);
		var _testName = cmp._testName;
		var a = cmp.get("c.getBaseball");
		a.setCallback(cmp, function(action) {
			var teamFacet = $A.newCmp(action.getReturnValue()[0]);
			//Clear the old facet in team div
			cmp.find("Team").getValue("v.body").clear();
			 //Insert newly fetched components
            cmp.find("Team").getValue("v.body").push(teamFacet);
            //Update the page with action number
            cmp.getDef().getHelper().findAndSetText(cmp, "Actions", a.getId());
        });
		a.setParams({
			testName: (!_testName?"baseBall":_testName)
		});
		if(storable)
			a.setStorable();
		a.runAfter(a);
		cmp.find("Actions").getElement().innerHTML = a.getId();
	},
	getPlayersOnly:function(cmp,storable){
		this.setCounter(cmp,1);
		var _testName = cmp._testName;
		var a = cmp.get("c.getBaseball");
		a.setCallback(cmp, function(action) {
			var ret = action.getReturnValue();
			//Clear the old facet in players div
			cmp.find("Players").getValue("v.body").clear();
            for(var i=0;i<ret.length;i++){
                var playerFacet = $A.newCmp(ret[i]);
                //Insert newly fetched components
                cmp.find("Players").getValue("v.body").push(playerFacet);
            }
            //Update the page with action number
            cmp.getDef().getHelper().findAndSetText(cmp, "Actions", a.getId());
        });
		a.setParams({
			testName: (!_testName?"baseBall":_testName)
		});
		if(storable)
			a.setStorable();
		a.runAfter(a);
		cmp.getDef().getHelper().findAndSetText(cmp, "Actions", a.getId());
	},
	findAndSetText:function(cmp, targetCmpId, msg){
		cmp.find(targetCmpId).getElement().innerHTML = msg;
	},
	findAndAppendText:function(cmp, targetCmpId, msg){
		cmp.find(targetCmpId).getElement().innerHTML += msg;
	}
})