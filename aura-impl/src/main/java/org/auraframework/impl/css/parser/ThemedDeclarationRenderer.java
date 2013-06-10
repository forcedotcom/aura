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
package org.auraframework.impl.css.parser;

import java.io.IOException;
import java.util.List;

import org.auraframework.def.Renderer;
import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Joiner;
import com.google.common.collect.Lists;

/**
 * 
 */
public class ThemedDeclarationRenderer implements Renderer {
    @Override
    @SuppressWarnings("unchecked")
    public void render(BaseComponent<?, ?> component, Appendable out) throws IOException, QuickFixException {
        ThemeValueResolver resolver = new ThemeValueResolver(); // TODONM get override map from context app

        // append property name
        out.append(component.getAttributes().getValue("property").toString()).append(":");

        // append values
        List<String> refs = (List<String>) component.getAttributes().getValue("references");
        List<String> resolved = Lists.newArrayList();

        for (String ref : refs) {
            resolved.add(resolver.resolve(ref));
        }

        out.append(Joiner.on(" ").skipNulls().join(resolved));
    }

}
