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
package org.auraframework.impl;

import java.io.IOException;

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.RendererDef;
import org.auraframework.ds.serviceloader.AuraServiceProvider;
import org.auraframework.impl.system.RenderContextImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.RenderingService;
import org.auraframework.system.RenderContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import aQute.bnd.annotation.component.Component;

/**
 */
@Component (provide=AuraServiceProvider.class)
public class RenderingServiceImpl implements RenderingService {

    /**
     */
    private static final long serialVersionUID = 1663840391180454913L;

    @Override
    public void render(BaseComponent<?, ?> component, RenderContext rc) throws QuickFixException, IOException {
        Aura.getContextService().assertEstablished();

        BaseComponent<?, ?> renderable = null;
        BaseComponent<?, ?> tmpRenderable = component;
        BaseComponentDef componentDef = null;
        RendererDef rendererDef = null;

        while (tmpRenderable != null) {
            componentDef = tmpRenderable.getDescriptor().getDef();
            if (rendererDef == null) {
                rendererDef = componentDef.getLocalRendererDef();
                if (rendererDef == null && componentDef.getRendererDescriptor() != null) {
                    break;
                }
                renderable = tmpRenderable;
            }

            tmpRenderable = tmpRenderable.getSuper();
        }

        if (rendererDef == null) {
            throw new AuraRuntimeException(String.format("No local RendererDef found for %s", component));
        }

        rendererDef.render(renderable, rc);
    }

    /**
     * Handy class to do nothing.
     */
    private static class NullAppender implements Appendable {
        @Override
        public Appendable append(CharSequence csq) throws IOException {
            return this;
        }

        @Override
        public Appendable append(CharSequence csq, int start, int end) throws IOException {
            return this;
        }

        @Override
        public Appendable append(char c) throws IOException {
            return this;
        }
    }

    @Override
    public void render(BaseComponent<?, ?> component, Appendable standard, Appendable script)
            throws QuickFixException, IOException {
        if (standard == null) {
            standard = new NullAppender();
        }
        if (script == null) {
            script = new NullAppender();
        }
        RenderContext rc = new RenderContextImpl(standard, script);
        this.render(component, rc);
    }

    @Override
    public void render(BaseComponent<?, ?> component, Appendable out) throws QuickFixException, IOException {
        this.render(component, out, null);
    }

    @Override
    public RenderContext render(BaseComponent<?, ?> component) throws QuickFixException, IOException {
        RenderContext rc = new RenderContextImpl(new StringBuilder(), new StringBuilder());
        this.render(component, rc);
        return rc;
    }
}
