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
package org.auraframework.impl.javascript.helper;

import static org.auraframework.instance.AuraValueProviderType.LABEL;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.HelperDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 */
public class JavascriptHelperDef extends DefinitionImpl<HelperDef> implements HelperDef {
    private static final long serialVersionUID = 1967445547376133339L;
    private final Map<String, Object> functions;
    private final Set<PropertyReference> expressionRefs;

    protected JavascriptHelperDef(Builder builder) {
        super(builder);
        this.functions = builder.functions;
        this.expressionRefs = builder.expressionRefs;
    }

    @Override
    public boolean isLocal() {
        return false;
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        GlobalValueProvider labelProvider = Aura.getContextService().getCurrentContext().getGlobalProviders()
                .get(LABEL.getPrefix());
        for (PropertyReference e : expressionRefs) {
            if (e.getRoot().equals(LABEL.getPrefix())) {
                labelProvider.getValue(e.getStem());
            }
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
    	json.writeMap(functions);
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<HelperDef> {
        public Map<String, Object> functions = new HashMap<>();
        public Set<PropertyReference> expressionRefs = new HashSet<>();

        public Builder() {
            super(HelperDef.class);
        }

        public void addFunctions(Map<String, Object> functions) {
            this.functions.putAll(functions);
        }

        public void addExpressionRefs(Collection<PropertyReference> refs) {
            expressionRefs.addAll(refs);
        }

        @Override
        public JavascriptHelperDef build() {
            return new JavascriptHelperDef(this);
        }
    }
}
