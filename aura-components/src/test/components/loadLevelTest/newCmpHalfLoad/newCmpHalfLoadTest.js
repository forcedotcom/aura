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
	setUp: function(cmp) {
		var receiverCmp = "markup://"+cmp.get("v.receiverCmp");
		var receiverCmpAuraId = cmp.get("v.receiverCmpAuraId");
    	var config = {
            componentDef:receiverCmp,
            localId:receiverCmpAuraId
        };
		this.pushNewCmpToBody(cmp, config, true);
	},
	
	pushNewCmpToBody : function(cmp, config, replaceBody) {
		$A.componentService.newComponentAsync(
	            this,
	            function(newCmp){
	            	var body = cmp.get("v.body");
	            	if(replaceBody) {
	            		body = [newCmp];
	            	} else {
	            		body.push(newCmp);
	            	}
	                cmp.set("v.body", body);
	                cmp.index(config.localId, newCmp.getGlobalId());
	            },
	            config
	        );
	},
	
	waitForReceiverCmpCreated : function(cmp) {
		$A.test.addWaitFor(true, 
        		function() { 
        			var receiverCmp = cmp.find("receiverCmp"); 
        			return (receiverCmp !== undefined); }, 
	        		function() {}
        	);
	},
	
	
	/**
     * ask receiverCmp to create a new Cmp whose definition is not available at the client.
     * This definition would be fetched from the server by a server action
     * kill receiverCmp before server action does its callback
     */
    testCmpCreatedByFetchingDefFromServer:{
    	attributes:{ 
    		receiverCmp: "loadLevelTest:newCmpWithValueProvider",
    		receiverCmpAuraId: "receiverCmp",
    		controllerFuncToCreateCmp: "c.createCmpByFetchingDefFromServer"
    	},
        test:[ function(cmp) {
        	//$A.test.setTestTimeout(6000000);//for stepping through
        	this.waitForReceiverCmpCreated(cmp);
        },
        function(cmp){
        	$A.test.blockRequests();
        	//ask server for new cmp
        	var receiverCmp = cmp.find("receiverCmp");
        	receiverCmp.get(cmp.get("v.controllerFuncToCreateCmp")).runDeprecated();//c.createCmpByFetchingDefFromServer
        	//kill the receiver cmp
        	$A.test.releaseRequests();
        	receiverCmp.destroy();
        	$A.test.addWaitFor(false, function() { return $A.test.isActionPending(); }, 
        		function(){
        			/* we can create a new cmp put it to v.body. but that's not necessary, as long as we wait until
        			 * actions are finished, inValid cmp will get removed, and re-rendering happens after the this 
        			 * test stage won't cause any problems. 
        			var receiverCmp = "markup://"+cmp.get("v.receiverCmp");
        			var receiverCmpAuraId = cmp.get("v.receiverCmpAuraId")+"_new";
        	    	var config = {
        	            componentDef:receiverCmp,
        	            localId:receiverCmpAuraId
        	        };
        			this.pushNewCmpToBody(cmp, config, true);
        			*/
        		}
        	);
        }
        ]
    },
    
    //TODO: not working because of W-2547251 . also I'm working on a different solution
    //now we have no control over when the request with the server action (getComponent) is send, also when the response is back
    //this means receiver cmp could got destroyed before request is send. that's ok for the first test in this file, but blow up at this test
    _testCmpCreatedByFetchingMapFromServer:{
    	attributes:{ 
    		receiverCmp: "loadLevelTest:newCmpWithValueProvider",
    		receiverCmpAuraId: "receiverCmp",
    		controllerFuncToCreateCmp: "c.createCmpWithMapValuePropRefValueFromServer"
    	},
        test:[ function(cmp) {
        	//$A.test.setTestTimeout(6000000);//for stepping through
        	this.waitForReceiverCmpCreated(cmp);
        },
        function(cmp){
        	$A.test.blockRequests();
        	//ask server for new cmp
        	var receiverCmp = cmp.find("receiverCmp");
        	var actionToCreateNewCmp = receiverCmp.get(cmp.get("v.controllerFuncToCreateCmp"));
        	
        	actionToCreateNewCmp.runDeprecated();//c.createCmpByFetchingDefFromServer
        	//kill the receiver cmp
        	$A.test.releaseRequests();
        	receiverCmp.destroy();
        	
        	$A.test.addWaitFor(false, function() { return $A.test.isActionPending(); }, 
        		function(){
        		}
        	);
        }
        ]
    }
})
