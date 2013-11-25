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
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ValueDef;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.StorableAction;
import org.auraframework.service.LoggingService;
import org.auraframework.system.Location;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.AuraHandledException;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 */
public class JavaAction implements StorableAction {
    public JavaAction(DefDescriptor<ControllerDef> controllerDescriptor, JavaActionDef actionDef,
            Map<String, Object> paramValues) {
        this.controllerDescriptor = controllerDescriptor;
        this.actionDef = actionDef;
        this.paramValues = paramValues;
        this.state = State.NEW;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public void setId(String id) {
        this.id = id;
    }

    private Object[] getArgs() {
        Class<?>[] javaParams = actionDef.getJavaParams();
        Object[] args = new Object[javaParams.length];
        int i = 0;
        for (ValueDef valueDef : actionDef.getParameters()) {
            Object param = paramValues.get(valueDef.getName());
            try {
                param = valueDef.getType().valueOf(param);
            } catch (QuickFixException qfe) {
                //
                // This means that we have a broken definition.
                //
                addException(new AuraUnhandledException("Invalid parameter " + valueDef, qfe), State.ABORTED, true,
                        false);
                return null;
            } catch (IllegalArgumentException iae) {
                addException(new AuraUnhandledException("Invalid value for " + valueDef, iae), State.ERROR, false,
                        false);
                return null;
            } catch (AuraHandledException lhe) {
                addException(lhe, State.ABORTED, false, false);
                return null;
            } catch (Exception e) {
                addException(new AuraUnhandledException("Error on parameter " + valueDef, e), State.ABORTED, false,
                        false);
                return null;
            }
            args[i++] = param;
        }
        return args;
    }

    /**
     * Add an exception to our set of errors.
     * 
     * @param t the throwable to add.
     * @param newState the 'State' to set.
     * @param loggable should this exception be run through the 'exception
     *            adapter'.
     */
    private void addException(Throwable t, State newState, boolean loggable, boolean wrap) {
        this.state = newState;
        if (t instanceof AuraHandledException) {
            this.errors.add(t);
        } else {
            Throwable ex = t;
            if (wrap) {
                ex = new AuraExecutionException(ex, new Location(controllerDescriptor.toString(), 0));
            }
            if (loggable) {
                ex = Aura.getExceptionAdapter().handleException(ex, this);
            }
            this.errors.add(ex);
        }
    }

    @Override
    public void run() {
        if (this.actionDef == null) {
            addException(
                    new InvalidDefinitionException("No action found", new Location(
                            this.controllerDescriptor.getQualifiedName(), 0)), State.ERROR, true, false);
            return;
        }
        this.state = State.RUNNING;

        Object[] args = getArgs();
        if (args == null) {
            return;
        }

        LoggingService loggingService = Aura.getLoggingService();
        loggingService.stopTimer(LoggingService.TIMER_AURA);
        loggingService.startTimer("java");
        try {
            loggingService.incrementNum("JavaCallCount");
            this.returnValue = this.actionDef.getMethod().invoke(null, args);
            this.state = State.SUCCESS;
        } catch (InvocationTargetException e) {
            // something bad happened in the body of the action itself
            // getCause() unwraps the InvocationTargetException, gives us the
            // real information.
            addException(e.getCause(), State.ERROR, true, true);
        } catch (Exception e) {
            //
            // Several cases handled here, including
            // * IllegalArgumentError: the conversion probably didn't work.
            // * IllegalAccessException: should not be possible.
            //
            addException(e, State.ERROR, true, false);
        } finally {
            loggingService.stopTimer("java");
            loggingService.startTimer(LoggingService.TIMER_AURA);
        }
    }

    @Override
    public Object getReturnValue() {
        return returnValue;
    }

    @Override
    public State getState() {
        return state;
    }

    @Override
    public List<Object> getErrors() {
        return errors;
    }

    @Override
    public String toString() {
        return String.format("%s.%s", controllerDescriptor.toString(), actionDef.getName());
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    @Override
    public DefDescriptor<ActionDef> getDescriptor() {
        return actionDef.getDescriptor();
    }

    @Override
    public void add(List<Action> newActions) {
        this.actions.addAll(newActions);
    }

    @Override
    public List<Action> getActions() {
        return Collections.unmodifiableList(actions);
    }

    @Override
    public void registerComponent(BaseComponent<?, ?> component) {
        componentRegistry.put(component.getGlobalId(), component);
    }

    @Override
    public Map<String, BaseComponent<?, ?>> getComponents() {
        return componentRegistry;
    }

    @Override
    public int getNextId() {
        return nextId++;
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
    public Map<String, Object> getParams() {
        return paramValues;
    }

    private final DefDescriptor<ControllerDef> controllerDescriptor;
    private final JavaActionDef actionDef;
    private final Map<String, Object> paramValues;
    private final List<Action> actions = Lists.newArrayList();
    private Object returnValue;
    private final List<Object> errors = new ArrayList<Object>();
    private State state;
    private String id;
    private final Map<String, BaseComponent<?, ?>> componentRegistry = Maps.newLinkedHashMap();
    private int nextId = 1;
    private boolean storable;
    
    @Override
    public void logParams(KeyValueLogger logger) {
        List<String> loggableParams = actionDef.getLoggableParams();
        if (paramValues != null && loggableParams != null) {
            for (String paramName : loggableParams) {
                logger.log(paramName, String.valueOf(paramValues.get(paramName)));
            }
        }
    }
}
