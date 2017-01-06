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
package org.auraframework.impl.instance;

import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.JavaControllerDef;
import org.auraframework.impl.java.controller.JavaAction;
import org.auraframework.impl.java.controller.JavaActionDef;
import org.auraframework.instance.Action;
import org.auraframework.instance.InstanceBuilder;
import org.auraframework.instance.InstanceBuilderProvider;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.inject.Inject;
import java.util.Map;

/**
 * Provide an interface for an injectable builder of an instance.
 */
@ServiceComponent
public class JavaActionInstanceBuilder implements InstanceBuilder<Action, ActionDef> {
    @Inject
    private ContextService contextService;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private ExceptionAdapter exceptionAdapter;

    @Inject
    private LoggingService loggingService;

    @Inject
    private InstanceBuilderProvider instanceBuilderProvider;

    /**
     * Get the class that this builder knows how to instantiate.
     */
    @Override
    public Class<?> getDefinitionClass() {
        return JavaActionDef.class;
    }

    /**
     * Get an instance of the given def.
     */
    @Override
    public Action getInstance(ActionDef def, Map<String, Object> attributes) throws QuickFixException {
        AuraContext context = contextService.getCurrentContext();
        context.pushCallingDescriptor(def.getDescriptor());
        try {
            @SuppressWarnings("unchecked")
            SubDefDescriptor<ActionDef, ControllerDef> actionDesc = (SubDefDescriptor<ActionDef, ControllerDef>) def.getDescriptor();
            DefDescriptor<ControllerDef> controllerDesc = actionDesc.getParentDescriptor();

            JavaControllerDef controllerDef = (JavaControllerDef) definitionService.getDefinition(controllerDesc);
            Class<?> controllerClass = controllerDef.getJavaType();
            Object controllerBean;
            try {
                controllerBean = instanceBuilderProvider.get(controllerClass);
            } catch (Throwable t) {
                throw new AuraRuntimeException(
                        "Failed to retrieve controller instance for " + controllerDef.getDescriptor(), t);
            }

            return new JavaAction(controllerDesc, (JavaActionDef) def, controllerBean, attributes,
                    exceptionAdapter, loggingService);
        } finally {
            context.popCallingDescriptor();
        }
    }
}
