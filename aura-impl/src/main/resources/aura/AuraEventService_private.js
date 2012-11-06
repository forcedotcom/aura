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
/*jslint sub: true */
var priv = {
    registry : new EventDefRegistry(),
    eventDispatcher : {},
    actionQueue : [],
    eventStack : [],

    flushActionQueue : function(){
        var after = this.actionQueue;
        this.actionQueue = [];
        if (after.length > 0) {
            $A.clientService.runActions(after, this.cmp, function(msg){
                var errors = msg["errors"];
                if (errors && errors.length > 0) {
                    for(var i=0;i<errors.length;i++){
                        aura.log(errors[i]);
                    }
                }

                if($A["finishedInit"]){
                    $A.services.rendering.rerenderDirty();
                }
            });

        } else {
            if($A["finishedInit"]){
                $A.services.rendering.rerenderDirty();
            }
        }
    },

    qualifyEventName : function(event) {
        if(event.indexOf("://") == -1){
            event = "markup://"+event;
        }
        return event;
    }
};
