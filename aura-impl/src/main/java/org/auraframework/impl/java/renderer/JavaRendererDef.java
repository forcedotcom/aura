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
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.Renderer;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.LoggingService;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class JavaRendererDef extends DefinitionImpl<RendererDef> implements RendererDef {
    private static final long serialVersionUID = 5720687422250668587L;
    private final Renderer renderer;

    /**
     * Consumers of this class should use a builder to build the instance. If
     * this were to be extended, the builder should also be extended, and the
     * build() method would need to be overridden.
     * 
     * @param builder the builder that is building this class.
     */
    protected JavaRendererDef(Builder builder) {
        super(builder);
        this.renderer = builder.rendererInstance;
    }

    /**
     * Validate our definition.
     * 
     * Most of the validation actually occurs in the builder, but we do ensure
     * that the renderer is not null. It would be cleaner to throw all errors
     * here, but we would need to store the error message in the constructor
     * which is a bit funky.
     */
    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (this.renderer == null) {
            throw new InvalidDefinitionException("Renderer must implement the Renderer interface.", location);
        }
    }

    @Override
    public boolean isLocal() {
        return true;
    }

    @Override
    public void render(BaseComponent<?, ?> component, Appendable out) throws IOException, QuickFixException {
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.stopTimer(LoggingService.TIMER_AURA);
        loggingService.startTimer("java");
        try {
            renderer.render(component, out);
            loggingService.incrementNum("JavaCallCount");
        } catch (Exception e) {
            AuraExceptionUtil.wrapExecutionException(e, this.location);
        } finally {
            loggingService.stopTimer("java");
            loggingService.startTimer(LoggingService.TIMER_AURA);
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    /**
     * A builder for JavaRendererDef.
     * 
     * This builder extends the basic Definition builder by adding the class of
     * the renderer.
     */
    public static class Builder extends DefinitionImpl.BuilderImpl<RendererDef> {
        private Class<?> rendererClass;
        private Renderer rendererInstance;

        /**
         * A function to actually build the renderer class.
         * 
         * This class is currently a bit over complicated, as it handles the old
         * static case for render methods.
         */
        protected void buildRenderer() throws QuickFixException {
            if (this.rendererClass == null) {
                return;
            }

            List<Class<? extends Renderer>> interfaces = AuraUtil.findInterfaces(this.rendererClass, Renderer.class);
            if (!interfaces.isEmpty()) {
                try {
                    this.rendererInstance = (Renderer) rendererClass.newInstance();
                } catch (InstantiationException ie) {
                    throw new InvalidDefinitionException("Cannot instantiate " + getLocation(), getLocation());
                } catch (IllegalAccessException iae) {
                    throw new InvalidDefinitionException("Constructor is inaccessible for " + getLocation(),
                            getLocation());
                }
            } else {
                this.rendererInstance = null;
            }
        }

        public Builder() {
            super(RendererDef.class);
        }

        public Builder setRendererClass(Class<?> rendererClass) {
            this.rendererClass = rendererClass;
            return this;
        }

        @Override
        public JavaRendererDef build() throws QuickFixException {
            this.buildRenderer();
            return new JavaRendererDef(this);
        }
    }
}
