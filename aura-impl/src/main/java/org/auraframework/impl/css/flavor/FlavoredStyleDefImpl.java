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
package org.auraframework.impl.css.flavor;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.FlavoredStyleDefBuilder;
import org.auraframework.css.FlavorAnnotation;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.css.style.AbstractStyleDef;
import org.auraframework.impl.css.util.Tokens;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Optional;

public final class FlavoredStyleDefImpl extends AbstractStyleDef<FlavoredStyleDef> implements FlavoredStyleDef {
    private static final long serialVersionUID = -8722320028754842489L;

    private final Map<String, FlavorAnnotation> annotations;

    protected FlavoredStyleDefImpl(Builder builder) {
        super(builder);
        this.annotations = AuraUtil.immutableMap(builder.annotations);
    }

    @Override
    public Set<String> getFlavorNames() {
        return annotations.keySet();
    }

    @Override
    public Map<String, FlavorAnnotation> getFlavorAnnotations() {
        return annotations;
    }

    @Override
    public Optional<FlavorAnnotation> getFlavorAnnotation(String name) {
        return Optional.fromNullable(annotations.get(name));
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        if (!getExpressions().isEmpty()) {
            DefDescriptor<TokensDef> namespaceTokens = Tokens.namespaceDefaultDescriptor(descriptor);
            if (namespaceTokens.exists()) {
                dependencies.add(namespaceTokens);
            }
        }
    }

    // TODO: This is not working with bundle compile
    // We need Nathan's help understand how to make this work
    // comment out for now.
//    @Override
//    public void validateReferences() throws QuickFixException {
//        DefDescriptor<ComponentDef> desc = Flavors.toComponentDescriptor(getDescriptor());
//        ComponentDef def = Aura.getDefinitionService().getDefinition(desc);
//        if (!def.hasFlavorableChild() && !def.inheritsFlavorableChild() && !def.isDynamicallyFlavorable()) {
//            throw new InvalidDefinitionException(
//                    String.format("%s must contain at least one aura:flavorable element: ", desc), getLocation());
//        }
//    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);

        AuraContext context = Aura.getContextService().getCurrentContext();
        if (!context.isPreloading() && !context.isPreloaded(getDescriptor())) {
            json.writeMapEntry("code", getCode());
        }
        json.writeMapEnd();
    }

    public static class Builder extends AbstractStyleDef.Builder<FlavoredStyleDef> implements FlavoredStyleDefBuilder {
        public Builder() {
            super(FlavoredStyleDef.class);
        }

        private Map<String, FlavorAnnotation> annotations;

        @Override
        public FlavoredStyleDef build() throws QuickFixException {
            return new FlavoredStyleDefImpl(this);
        }

        @Override
        public Builder setFlavorAnnotations(Map<String, FlavorAnnotation> annotations) {
            this.annotations = annotations;
            return this;
        }
    }
}
