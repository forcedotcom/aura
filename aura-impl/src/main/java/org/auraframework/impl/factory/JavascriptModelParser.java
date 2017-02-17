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
package org.auraframework.impl.factory;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.impl.javascript.parser.handler.JavascriptModelDefHandler;
import org.auraframework.impl.source.AbstractTextSourceImpl;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

@ServiceComponent
public class JavascriptModelParser implements DefinitionFactory<TextSource<ModelDef>, ModelDef> {
    @Override
    public ModelDef getDefinition(DefDescriptor<ModelDef> descriptor, TextSource<ModelDef> source)
            throws QuickFixException {
        return new JavascriptModelDefHandler(descriptor, source).getDefinition();
    }

    @Override
    public Class<?> getSourceInterface() {
        return TextSource.class;
    }

    @Override
    public Class<ModelDef> getDefinitionClass() {
        return ModelDef.class;
    }

    @Override
    public String getMimeType() {
        return AbstractTextSourceImpl.MIME_JAVASCRIPT;
    }
}
