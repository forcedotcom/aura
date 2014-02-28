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
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ValueDef;
import org.auraframework.instance.AbstractActionImpl;
import org.auraframework.service.LoggingService;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.AuraHandledException;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

/**
 * A server side java based action.
 */
public class JavaAction extends AbstractActionImpl<JavaActionDef> {
    /**
     * The constructor for an action.
     *
     * Note that if the bean parameter is non-null, this action is invoked as an instance
     * method on the bean, otherwise, it must be static.
     *
     * @param controllerDescriptor the descriptor for the owning controller.
     * @param actionDef the definition for this action.
     * @param bean The controller bean, if there is one, otherwise null.
     * @param paramValues the parameter values.
     */
    public JavaAction(DefDescriptor<ControllerDef> controllerDescriptor, JavaActionDef actionDef,
            Object bean, Map<String, Object> paramValues) {
        super(controllerDescriptor, actionDef, paramValues);
        this.bean = bean;
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
                addException(new AuraUnhandledException("Invalid parameter " + valueDef, qfe), State.ERROR, true,
                        false);
                return null;
            } catch (IllegalArgumentException iae) {
                addException(new AuraUnhandledException("Invalid value for " + valueDef, iae), State.ERROR, false,
                        false);
                return null;
            } catch (AuraHandledException lhe) {
                addException(lhe, State.ERROR, false, false);
                return null;
            } catch (Exception e) {
                addException(new AuraUnhandledException("Error on parameter " + valueDef, e), State.ERROR, false,
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
            this.returnValue = this.actionDef.getMethod().invoke(bean, args);
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
    public List<Object> getErrors() {
        return errors;
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    private Object returnValue;
    private final List<Object> errors = Lists.newArrayList();
    private final Object bean;
}
