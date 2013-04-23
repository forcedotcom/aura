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

import java.io.StringReader;
import java.util.Collection;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.instance.Action;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;

import com.google.common.collect.Lists;

@Controller
public class ActionChainingController {
    public static int i = 0;

    @AuraEnabled
    public static int add(@Key("a") Integer a, @Key("b") Integer b, @Key("actions") String chainedActions)
            throws Exception {
        Action currentAction = Aura.getContextService().getCurrentContext().getCurrentAction();
        Collection<Action> actions = Aura.getSerializationService().readCollection(new StringReader(chainedActions),
                Action.class);
        currentAction.add(Lists.newArrayList(actions));
        i = a + b;
        return i;
    }

    @AuraEnabled
    public static int multiply(@Key("a") Integer a) throws Exception {
        i = i * a;
        return i;
    }

    @AuraEnabled
    public static int subtract(@Key("a") Integer a) throws Exception {
        i = i - a;
        return i;
    }

    @AuraEnabled
    public static int divide(@Key("a") Integer a) throws Exception {
        i = i / a;
        return i;
    }

    @AuraEnabled
    public static void doNothing(@Key("actions") String chainedActions) throws Exception {
        Action currentAction = Aura.getContextService().getCurrentContext().getCurrentAction();
        Collection<Action> actions = Aura.getSerializationService().readCollection(new StringReader(chainedActions),
                Action.class);
        currentAction.add(Lists.newArrayList(actions));
    }

    @AuraEnabled
    public static void infiniteChain() throws Exception {
        Action currentAction = Aura.getContextService().getCurrentContext().getCurrentAction();
        Action actions = Aura.getInstanceService().getInstance(
                "java://org.auraframework.java.controller.ActionChainingController/ACTION$infiniteChain",
                ActionDef.class, null);
        currentAction.add(Lists.newArrayList(actions));
    }
}
