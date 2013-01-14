/*
 * Copyright (C) 2012 salesforce.com, inc.
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
/*
 * Copyright, 1999-2009, salesforce.com All Rights Reserved Company Confidential
 */
package org.auraframework.impl.javascript.renderer;

import static org.auraframework.instance.ValueProviderType.LABEL;

import java.io.IOException;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.RendererDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.Json;

import com.google.common.collect.Sets;

public class JavascriptRendererDef extends DefinitionImpl<RendererDef> implements RendererDef {
    private static final long serialVersionUID = -6937625695562864219L;
    private final JsFunction render;
    private final JsFunction afterRender;
    private final JsFunction rerender;
    private final JsFunction unrender;
    // Code is only used by aura-j. Would be nice if we could get rid of it.
    private final String code;
    private final Set<PropertyReference> expressionRefs;

    protected JavascriptRendererDef(Builder builder) throws QuickFixException {
        super(builder);
        this.render = builder.render;
        this.afterRender = builder.afterRender;
        this.rerender = builder.rerender;
        this.unrender = builder.unrender;
        this.code = builder.code;
        this.expressionRefs = builder.expressionRefs;
        retrieveLabels();
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);
        json.writeMapEntry("render", render);
        json.writeMapEntry("afterRender", afterRender);
        json.writeMapEntry("rerender", rerender);
        json.writeMapEntry("unrender", unrender);
        json.writeMapEntry("code", code);
        json.writeMapEnd();
    }

    @Override
    public boolean isLocal() {
        return false;
    }

    @Override
    public void render(BaseComponent<?, ?> component, Appendable out) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        GlobalValueProvider labelProvider = Aura.getContextService().getCurrentContext().getGlobalProviders()
                .get(LABEL);
        for (PropertyReference e : expressionRefs) {
            if (e.getRoot().equals(LABEL.getPrefix())) {
                labelProvider.getValue(e.getStem());
            }
        }
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<RendererDef> {
        public Builder() {
            super(RendererDef.class);
        }

        public JsFunction render;
        public JsFunction afterRender;
        public JsFunction rerender;
        public JsFunction unrender;
        public String code;
        public Set<PropertyReference> expressionRefs = Sets.newHashSet();

        @Override
        public JavascriptRendererDef build() throws QuickFixException {
            return new JavascriptRendererDef(this);
        }
    }
}
