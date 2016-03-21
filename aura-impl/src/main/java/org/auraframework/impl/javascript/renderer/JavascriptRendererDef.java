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
/*
 * Copyright, 1999-2009, salesforce.com All Rights Reserved Company Confidential
 */
package org.auraframework.impl.javascript.renderer;

import static org.auraframework.instance.AuraValueProviderType.LABEL;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.RendererDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.system.RenderContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.Json;

public class JavascriptRendererDef extends DefinitionImpl<RendererDef> implements RendererDef {
    private static final long serialVersionUID = -6937625695562864219L;
    private final Map<String, Object> functions;
    private final Set<PropertyReference> expressionRefs;

    protected JavascriptRendererDef(Builder builder) {
        super(builder);
        this.functions = builder.functions;
        this.expressionRefs = builder.expressionRefs;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        retrieveLabels();
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();

        serializeMethod(json, "render", functions.get("render"));
        serializeMethod(json, "afterRender", functions.get("afterRender"));
        serializeMethod(json, "rerender", functions.get("rerender"));
        serializeMethod(json, "unrender", functions.get("unrender"));

        json.writeMapEnd();
    }

    /**
     * Serialize a method, if it's defined, and alter it to
     * re-scope local invocations of super methods. Those have
     * moved to the component class itself and are not part of
     * the renderer anymore.
     * @return
     */
    void serializeMethod(Json json, String name, Object function)
            throws IOException {
        if (function != null && function instanceof JsFunction) {
            json.writeMapKey(name);
            json.writeLiteral(changeSuper(name, (JsFunction) function));
        }
    }

    /**
     * This method edits the call to the superMethod. Calling super methods on the
     * renderer was a questionable pattern because it forces us to create an instance
     * of the renderer at each level of the component inheritance just to hold a
     * reference on the component.
     */
    private JsFunction changeSuper(String name, JsFunction function) {

    	// Get the name of the first argument, if not supplied, add a default one.
    	List<String> arguments = function.getArguments();
    	String cmp;
    	if (arguments.size() > 0) {
            cmp = arguments.get(0);
        } else {
        	cmp = "cmp";
        	arguments.add(cmp);
        }

        // Re-scope the call to the super method .
        String body = function.getBody();
        String superMethodName = "super" + Character.toString(name.charAt(0)).toUpperCase() + name.substring(1);
		body = body.replace("this." + superMethodName,  cmp + "." + superMethodName);

        // Now make sure we escape the right sequences.
        return new JsFunction(arguments, body);
    }

    @Override
    public boolean isLocal() {
        return false;
    }

    @Override
    public void render(BaseComponent<?, ?> component, RenderContext rc) {
        throw new UnsupportedOperationException();
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

    public static class Builder extends DefinitionImpl.BuilderImpl<RendererDef> {
        public Map<String, Object> functions = new HashMap<>();
        public Set<PropertyReference> expressionRefs = new HashSet<>();

        public Builder() {
            super(RendererDef.class);
        }

        public void addFunction(String name, Object function) {
            functions.put(name, function);
        }

        @Override
        public JavascriptRendererDef build() {
            return new JavascriptRendererDef(this);
        }
    }
}
