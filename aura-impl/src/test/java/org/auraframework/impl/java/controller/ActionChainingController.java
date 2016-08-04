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
package org.auraframework.impl.java.controller;

import com.google.common.collect.Lists;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.instance.Action;
import org.auraframework.service.ContextService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;

import javax.inject.Inject;
import java.io.StringReader;
import java.util.Collection;

@ServiceComponent
public class ActionChainingController implements Controller {

    @Inject
    private ContextService contextService;

    @Inject
    private SerializationService serializationService;

    private int i = 0;

    @AuraEnabled
    public int add(@Key("a") Integer a, @Key("b") Integer b, @Key("actions") String chainedActions)
            throws Exception {
        Action currentAction = contextService.getCurrentContext().getCurrentAction();
        if (chainedActions != null && chainedActions.length() > 0) {
            Collection<Action> actions = serializationService.readCollection(new StringReader(chainedActions),
                    Action.class);
            currentAction.add(Lists.newArrayList(actions));
        }
        i = a + b;
        return i;
    }

    @AuraEnabled
    public int multiply(@Key("a") Integer a) throws Exception {
        i = i * a;
        return i;
    }

    @AuraEnabled
    public int subtract(@Key("a") Integer a) throws Exception {
        i = i - a;
        return i;
    }

    @AuraEnabled
    public int divide(@Key("a") Integer a) throws Exception {
        i = i / a;
        return i;
    }

    @AuraEnabled
    public void doNothing(@Key("actions") String chainedActions) throws Exception {
        Action currentAction = contextService.getCurrentContext().getCurrentAction();
        Collection<Action> actions = serializationService.readCollection(new StringReader(chainedActions),
                Action.class);
        currentAction.add(Lists.newArrayList(actions));
    }
}
