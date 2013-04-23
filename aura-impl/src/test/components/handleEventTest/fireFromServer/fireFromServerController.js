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
	 * Attaching single event at server. 
	 */
	handleApplicationEvent:function(cmp, evt){
		var evtParam = evt.getParam('strAttr');
		cmp.find("events").getElement().innerHTML += evtParam;
	},
	attachOneEvent:function(cmp){
		var a = cmp.get('c.getDataAndOneEvent');
		a.setCallback(cmp, function(a){
			cmp.find("response").getElement().innerHTML += a.getReturnValue();
		});
		this.runAfter(a);
	},
	
	/**
	 * Multiple events attached at Server
	 */
	newEventDef:function(cmp, evt){
		var evtParam = evt.getParam('strParam');
		cmp.find("events").getElement().innerHTML += evtParam;
	},
	preloadedEventDef:function(cmp,evt){
		var evtParam = evt.getParam('strAttr');
		cmp.find("events").getElement().innerHTML += evtParam;
	},
	attachMultipleEvents:function(cmp){
		var a = cmp.get('c.getDataAndThreeEvents');
		a.setCallback(cmp, function(a){
			$A.renderingService.render(a.getReturnValue(), cmp.find("response").getElement());
		});
		this.runAfter(a);
	},
	
	/**
	 * Cycle event firing and handling
	 */
	causeInfiniteEvenLoop:function(cmp){
		$A.log("Processing application event fired from server.")
		var a = cmp.get('c.infiniteEventCycle');
		a.run();
	},
	infiniteEventCycle:function(cmp){
		$A.log("Call server action that attaches event.")
		var a = cmp.get('c.getCyclicEvent');
		this.runAfter(a);
	},
	
	/**
	 * Attaching same event twice but with different parameters.
	 */
	attachDupEvent:function(cmp){
		var a = cmp.get('c.getDupEvents');
		a.setCallback(cmp, function(a){
			cmp.find("response").getElement().innerHTML += a.getReturnValue();
		});
		this.runAfter(a);
	},
	handleDupEvent:function(cmp, evt){
		var evtParam = evt.getParam('strAttr');
		cmp.find("events").getElement().innerHTML += evtParam;
	},
	
	/**
	 * Attach a chain of event.
	 * Controller A invokes Server Action X
	 * Server action X attaches application event 1
	 * Application event 1 has a handler action B
	 * Handler action B invokes Server Action Y
	 * Verify that both server actions' callbacks were processed.
	 */
	attachEventChain:function(cmp){
		var a = cmp.get('c.getEventChain');
		a.setCallback(cmp, function(a){
			cmp.find("response").getElement().innerHTML += a.getReturnValue();
		});
		this.runAfter(a);
	},
	handleChainEvent:function(cmp, evt){
		var evtParam = evt.getParam('pandaAttr');
		cmp.find("events").getElement().innerHTML += evtParam;
		var a = cmp.get('c.chainLink');
		a.run();
	},
	chainLink:function(cmp){
		var a = cmp.get('c.getChainLink');
		a.setCallback(cmp, function(a){
			cmp.find("response").getElement().innerHTML += a.getReturnValue();
		});
		this.runAfter(a);
	}
})