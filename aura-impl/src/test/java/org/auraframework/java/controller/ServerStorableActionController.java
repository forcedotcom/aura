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
package org.auraframework.java.controller;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.*;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Controller
public class ServerStorableActionController {
    public static ConcurrentHashMap<String, Integer> staticCounter = new ConcurrentHashMap<String, Integer>();
    @AuraEnabled
    public static void resetCounter(@Key("testName") String testName) {
        if (testName != null) {
            staticCounter.remove(testName);
            return;
        } else {
            for (String s : staticCounter.keySet()) {
                staticCounter.remove(s);
            }
        }
    }
    /**
     * Specify actions to be marked as storable.
     */
    @AuraEnabled
    public static void setStorable(@Key("testName") String testName, @Key("actionsToMark") List<String> actionsToMark) throws Exception {
        Action currentAction = Aura.getContextService().getCurrentContext().getCurrentAction();
        List<Action> actions = Lists.newArrayList();
        for(String actionCursor : actionsToMark){
            if(actionCursor.equals("java://org.auraframework.java.controller.ServerStorableActionController/ACTION$storedAction")){
                for (int n = 0; n < 10; n++) {
                    Map<String, Object> params = Maps.newHashMap();
                    params.put("message", "some really cool message #" + (n + 1));
                    runActionAndMarkStorable(actions,
                            actionCursor, params, true);
                }
            }else if(actionCursor.equals("java://org.auraframework.java.controller.ServerStorableActionController/ACTION$simpleValuesAsParams")){
                Map<String, Object> params = Maps.newHashMap();
                params.put("testName", testName);
                params.put("year", 2012);
                params.put("mvp", "Buster Posey");
                runActionAndMarkStorable(actions, actionCursor, params, true);
            }else if(actionCursor.equals("java://org.auraframework.java.controller.ServerStorableActionController/ACTION$complexValuesAsParams")){
                Map<String, Object> params = Maps.newHashMap();
                params.put("testName", testName);
                params.put("players", Arrays.asList("Buster Posey","Pablo Sandavol", "Angel Pagan"));
                runActionAndMarkStorable(actions, actionCursor, params, true);
            }else if(actionCursor.equals("java://org.auraframework.java.controller.ServerStorableActionController/ACTION$returnNothing")){
                runActionAndMarkStorable(actions, actionCursor, null, true);
            }else if(actionCursor.equals("java://org.auraframework.java.controller.ServerStorableActionController/ACTION$throwsException")){
                Map<String, Object> params = Maps.newHashMap();
                params.put("testName", testName);
                runActionAndMarkStorable(actions, actionCursor, params, true);
            }else if(actionCursor.equals("java://org.auraframework.java.controller.ServerStorableActionController/ACTION$unStoredAction")){
                Map<String, Object> params = Maps.newHashMap();
                params.put("testName", testName);
                runActionAndMarkStorable(actions, actionCursor, params, false);
            }else if(actionCursor.equals("java://org.auraframework.java.controller.ServerStorableActionController/ACTION$getComponent")){
                Map<String, Object> params = Maps.newHashMap();
                params.put("testName", testName);
                runActionAndMarkStorable(actions, actionCursor, params, true);
            }else if(actionCursor.equals("java://org.auraframework.impl.java.controller.TestController/ACTION$getString")){
                runActionAndMarkStorable(actions, actionCursor, null, true);
            }
        }
        currentAction.add(actions);
    }
    static void runActionAndMarkStorable(List<Action> actions, String actionName, Map<String, Object> params, boolean storable) throws Exception{
        StorableAction action = Aura.getInstanceService().getInstance( actionName, ActionDef.class, params);
        if(storable){action.setStorable();}
        actions.add(action);
    }
    @AuraEnabled
    public static String storedAction(@Key("message") String message) throws Exception {
        return "[from server] " + message;
    }

    @AuraEnabled
    public static String simpleValuesAsParams(@Key("testName") String testName, @Key("year")int year, @Key("mvp")String mvp){
        incrementCounter(testName);
        return String.format("Message %s : %s was the MVP in %s", staticCounter.get(testName), mvp, year);
    }

    @AuraEnabled
    public static String complexValuesAsParams(@Key("testName")String testName, @Key("players")List<String> players){
        incrementCounter(testName);
        StringBuffer s = new StringBuffer();
        for(String player: players){
            s.append(player + ", ");
        }
        return String.format("Message %s : Team contains %s", staticCounter.get(testName), s.toString());
    }

    @AuraEnabled
    public static void returnNothing(@Key("param1")String param1){
        return;
    }

    @AuraEnabled
    public static void throwsException(@Key("testName")String testName) throws Exception{
        incrementCounter(testName);
        throw new Exception(String.format("Message %s", staticCounter.get(testName)));
    }

    @AuraEnabled
    public static String unStoredAction(@Key("testName") String testName)throws Exception{
        incrementCounter(testName);
        return String.format("Message %s : Fresh response each time.", staticCounter.get(testName));
    }
    @AuraEnabled
    /**
     * Return a component instance with a simple model.
     */
    public static Component getComponent(@Key("testName")String testName)throws Exception{
        incrementCounter(testName);
        Map<String, Object> attr = Maps.newHashMap();
        attr.put("value", ""+staticCounter.get(testName));
        Component cmp = Aura.getInstanceService().getInstance("auraStorageTest:teamFacet", ComponentDef.class, attr);
        return cmp;
    }
    @AuraEnabled
    public static String markingSelfAsStorable(){
        Action currentAction = Aura.getContextService().getCurrentContext().getCurrentAction();
        StorableAction s = (StorableAction)currentAction;
        s.setStorable();
        return "Marking my self as storable";
    }
    static void incrementCounter(String testName){
        staticCounter.putIfAbsent(testName, 0);
        staticCounter.put(testName, new Integer(staticCounter.get(testName).intValue() + 1));
    }
}
