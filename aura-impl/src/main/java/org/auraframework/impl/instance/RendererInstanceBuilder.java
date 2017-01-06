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

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.Renderer;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.java.renderer.JavaRendererDef;
import org.auraframework.impl.java.renderer.JavaRendererInstance;
import org.auraframework.instance.InstanceBuilder;
import org.auraframework.instance.InstanceBuilderProvider;
import org.auraframework.instance.RendererInstance;
import org.auraframework.service.LoggingService;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.inject.Inject;
import java.util.Map;

@ServiceComponent
public class RendererInstanceBuilder implements InstanceBuilder<RendererInstance, RendererDef> {

    @Inject
    LoggingService loggingService;

    @Inject
    private InstanceBuilderProvider instanceBuilderProvider;

    @Override
    public Class<?> getDefinitionClass() {
        return JavaRendererDef.class;
    }

    @Override
    public RendererInstance getInstance(RendererDef rendererDef, Map<String, Object> attributes) throws QuickFixException {
        Object instance;
        try {
            instance = instanceBuilderProvider.get(((JavaRendererDef)rendererDef).getJavaType());
        } catch (Throwable t) {
            throw new AuraRuntimeException(
                    "Failed to retrieve renderer instance for " + rendererDef.getDescriptor(), t);
        }
        
        if (instance instanceof Renderer) {
            return new JavaRendererInstance(rendererDef, (Renderer) instance, loggingService);
        }

        // Consider throwing for now?

        return null;
    }

}
