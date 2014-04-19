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
/*jslint sub: true */
var priv = {
    evt : null,

    getEvent : function(){
        if (!this.evt){
            this.evt = $A.getRoot().getDef().getLocationChangeEvent();
        }

        return this.evt;
    },

    changeHandler : function(){
        var loc = location["hash"];
        var event = eventService.newEvent(this.getEvent());
        
        if(!event) {
        	throw new Error("The event specified on the app for the locationChange (" + this.getEvent() + ") was not found.");
        }
        
        if (loc) {
        	//
        	// Its possible that more querystring parameters where specified in the hash
        	// then are defined on the event. In this case do specify them as parameters
        	// of the event. 
        	//
        	var parsedHash = this.parseLocation(loc); 
        	var parameters = {}; 
        	var attributes = event.getDef().getAttributeDefs();
        	for(var attribute in attributes) {
        		if(attributes["hasOwnProperty"](attribute) && parsedHash["hasOwnProperty"](attribute)) {
        			parameters[attribute] = parsedHash[attribute];
        		}
        	}
            event.setParams(parameters);
        }
        
        event.fire();
    },

    parseLocation : function(location){
        if (location["indexOf"]("#") === 0){
            location = location["substring"](1);
        }

        if (location["indexOf"]('=') > -1){
            var split = location["split"]('?');
            if(split.length == 1){
                return { "token": split[0], "querystring": "" };
            }

            if(split.length == 2){
                var ret = $A.util.urlDecode(split[1]);
                ret["token"] = split[0];
                ret["querystring"] = split[1];
                return ret;
            }

            throw new Error("Invalid location");
        } else{
            return {"token" : location, "querystring": "" };
        }
    }
};
