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

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ActionDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.instance.Action;
import org.auraframework.service.ContextService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.Lists;

@ServiceComponent
public class ActionChainingController implements Controller {

    @Inject
    private ContextService contextService;

    @Inject
    private InstanceService instanceService;

    private int i = 0;

    private List<Action> readActions(Reader in) throws IOException, QuickFixException {
        Map<?, ?> message = (Map<?, ?>) new JsonReader().read(in);
        List<?> actions = (List<?>) message.get("actions");
        List<Action> ret = Lists.newArrayList();
        for (Object action : actions) {
            Map<?, ?> map = (Map<?, ?>) action;

            // FIXME: ints are getting translated into BigDecimals here.
            @SuppressWarnings("unchecked")
            Map<String, Object> params = (Map<String, Object>) map.get("params");

            Action instance = (Action) instanceService.getInstance((String) map.get("descriptor"),
                    ActionDef.class, params);
            instance.setId((String) map.get("id"));
            ret.add(instance);
        }
        return ret;
    }


    @AuraEnabled
    public int add(@Key("a") Integer a, @Key("b") Integer b, @Key("actions") String chainedActions)
            throws Exception {
        Action currentAction = contextService.getCurrentContext().getCurrentAction();
        if (chainedActions != null && chainedActions.length() > 0) {
            List<Action> actions = readActions(new StringReader(chainedActions));
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
        List<Action> actions = readActions(new StringReader(chainedActions));
        currentAction.add(Lists.newArrayList(actions));
    }
}
