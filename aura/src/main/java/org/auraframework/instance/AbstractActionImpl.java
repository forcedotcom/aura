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
package org.auraframework.instance;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;

import org.auraframework.system.LoggingContext.KeyValueLogger;

import com.google.common.collect.Lists;

public abstract class AbstractActionImpl<T extends ActionDef> implements Action {
    public AbstractActionImpl(DefDescriptor<ControllerDef> controllerDescriptor, T actionDef,
            Map<String, Object> paramValues) {
        this.state = State.NEW;
        this.actionDef = actionDef;
        this.controllerDescriptor = controllerDescriptor;
        this.paramValues = paramValues;
    }

    @Override
    public String getId() {
        return this.actionId;
    }

    @Override
    public void setId(String id) {
        actionId = id;
    }

    @Override
    public void add(List<Action> newActions) {
        if (actions == null) {
            actions = Lists.newArrayList();
        }
        actions.addAll(newActions);
    }

    @Override
    public List<Action> getActions() {
        if (actions == null) {
            return Collections.emptyList();
        }
        return Collections.unmodifiableList(actions);
    }

    //public Object getReturnValue();

    @Override
    public State getState() {
        return this.state;
    }

    //public List<Object> getErrors();

    @Override
    public DefDescriptor<ActionDef> getDescriptor() {
        return actionDef.getDescriptor();
    }

    @Override
    public Map<String, Object> getParams() {
        return paramValues;
    }

    @Override
    public boolean isStorable() {
        return storable;
    }

    @Override
    public void setStorable() {
        storable = true;
        setId("s");
    }

    @Override
    public String toString() {
        return String.format("%s.%s", controllerDescriptor.toString(), actionDef.getName());
    }

    /**
     * Log any params that are useful and safe to log.
     * @param paramLogger
     */
    @Override
    public void logParams(KeyValueLogger logger) {
        List<String> loggableParams = actionDef.getLoggableParams();
        if (paramValues != null && loggableParams != null) {
            for (String paramName : loggableParams) {
                logger.log(paramName, String.valueOf(paramValues.get(paramName)));
            }
        }
    }
    
    @Override
    public InstanceStack getInstanceStack() {
        if (instanceStack == null) {
            instanceStack = new InstanceStack();
        }
        return instanceStack;
    }

    @Override
    public String getPath() {
        return actionId;
    }

    private String actionId;
    private List<Action> actions = null;
    private boolean storable;
    private InstanceStack instanceStack;

    protected final Map<String, Object> paramValues;
    protected final DefDescriptor<ControllerDef> controllerDescriptor;
    protected final T actionDef;
    protected State state;
}
