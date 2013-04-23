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
	getRosterFromStorage:function(cmp, evt, helper){
		//Two action requests with the same action signature.
		helper.getTeamAndPlayers(cmp,true);;
	},
	getTeamFromStorage:function(cmp, evt, helper){
		helper.getTeamOnly(cmp,true);
	},
	getPlayersFromStorage:function(cmp, evt, helper){
		helper.getPlayersOnly(cmp,true);
	},
	
	getRoster:function(cmp, evt, helper){
		//Two action requests with the same action signature.
		helper.getTeamAndPlayers(cmp);
	},
	getTeam:function(cmp, evt, helper){
		helper.getTeamOnly(cmp);
	},
	getPlayers:function(cmp, evt, helper){
		helper.getPlayersOnly(cmp);
	},
	
	resetCounters:function(cmp, evt, helper){
		helper.resetCounters(cmp);
	}
})