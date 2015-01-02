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

function (w) {
    'use strict';
    w || (w = window);

    var NS = w.__S;
    var Scroller = NS.constructor;

    Scroller.getScrollerComponents = function () {
    	var instances = NS.instances;
    	var list = [];
    	if (instances) {
    		for (var i in instances) {
    			list.push($A.getCmp(i));
    		}
    	}
    	return list;
    };
    Scroller.getScrollerInstances = function () {
    	var instances = NS.instances;
    	var list = [];
    	if (instances) {
    		for (var i in instances) {
    			list.push($A.getCmp(i).getScrollerInstance());
    		}
    	}
    	return list;
    };

}