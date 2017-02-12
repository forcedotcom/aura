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
package org.auraframework.impl.javascript.parser.handler;

import java.io.IOException;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.javascript.controller.JavascriptActionDef;
import org.auraframework.impl.javascript.controller.JavascriptControllerDef;
import org.auraframework.impl.javascript.controller.JavascriptControllerDef.Builder;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.impl.util.JavascriptTokenizer;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsFunction;
import org.auraframework.util.json.JsonHandlerProvider;

/**
 * Javascript handler for controller defs
 */
public class JavascriptControllerDefHandler extends JavascriptHandler<ControllerDef, ControllerDef> {

    private final Builder builder = new Builder();

    public JavascriptControllerDefHandler(DefDescriptor<ControllerDef> descriptor, TextSource<?> source) {
        super(descriptor, source);
    }

    @Override
    protected JsonHandlerProvider getHandlerProvider() {
        return new JavascriptControllerHandlerProvider();
    }

    @Override
    protected JavascriptControllerDef createDefinition(String code) throws IOException, QuickFixException {
        setDefBuilderFields(builder);
        new JavascriptTokenizer(getParentDescriptor(), code, getLocation()).process(builder);

        Map<String, Object> map = codeToMap(code);
        Map<String, JavascriptActionDef> actions = createActionMap(map);
        builder.addActions(actions);

        String recode = mapToCode(map);
        builder.setCode(recode);
        return builder.build();
    }

    private Map<String, JavascriptActionDef> createActionMap(Map<String, Object> map) {
		Map<String, JavascriptActionDef> actions = new TreeMap<>();
	    for (Entry<String, Object> entry : map.entrySet()) {
	        Object value = entry.getValue();
	        if (value != null && value instanceof JsFunction) {
	            String name = entry.getKey();
	            JavascriptActionDef action = createActionDef(name);
	            actions.put(name, action);
	        }
	    }
	    return actions;
    }

    private JavascriptActionDef createActionDef(String name) {
        JavascriptActionDef.Builder builder = new JavascriptActionDef.Builder();
        builder.setDescriptor(SubDefDescriptorImpl.getInstance(name, getDescriptor(), ActionDef.class));
        builder.setAccess(new DefinitionAccessImpl(Access.INTERNAL));
        return builder.build();
    }

    @Override
    protected ControllerDef createDefinition(Throwable error) {
        setDefBuilderFields(builder);
        builder.setParseError(error);
        return builder.build();
    }
}
