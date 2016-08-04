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
package org.auraframework.impl.java.renderer;

import java.io.IOException;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Renderer;
import org.auraframework.def.RendererDef;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.RendererInstance;
import org.auraframework.service.LoggingService;
import org.auraframework.system.RenderContext;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * As opposed to making every renderer support the Instance<?> interface,
 * we have a wrapper that is an instance and just carries the renderer around.
 */
public class JavaRendererInstance implements RendererInstance {

    private final RendererDef rendererDef;
    private final Renderer renderer;
    private final LoggingService loggingService;

    public JavaRendererInstance(RendererDef rendererDef, Renderer renderer, LoggingService loggingService) {
        this.rendererDef = rendererDef;
        this.renderer = renderer;
        this.loggingService = loggingService;
    }

    @Override
    public void serialize(Json json) throws IOException {
        rendererDef.serialize(json);
    }

    @Override
    public DefDescriptor<RendererDef> getDescriptor() {
        return rendererDef.getDescriptor();
    }

    @Override
    public String getPath() {
        throw new UnsupportedOperationException("JavaRendererInstance does not support getPath() at this time.");
    }

    public RendererDef getRendererDef() {
        return rendererDef;
    }

    @Override
    public void render(BaseComponent<?, ?> component, RenderContext rc) throws IOException, QuickFixException {
        loggingService.stopTimer(LoggingService.TIMER_AURA);
        loggingService.startTimer("java");
        try {
            renderer.render(component, rc);
            loggingService.incrementNum("JavaCallCount");
        } catch (Exception e) {
            throw AuraExceptionUtil.wrapExecutionException(e, rendererDef.getLocation());
        } finally {
            loggingService.stopTimer("java");
            loggingService.startTimer(LoggingService.TIMER_AURA);
        }
    }

}
