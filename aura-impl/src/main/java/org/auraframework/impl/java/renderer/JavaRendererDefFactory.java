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
package org.auraframework.impl.java.renderer;

import java.util.List;

import org.auraframework.builder.DefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.java.BaseJavaDefFactory;
import org.auraframework.system.SourceLoader;

/**
 */
public class JavaRendererDefFactory extends BaseJavaDefFactory<RendererDef> {

    public JavaRendererDefFactory() {
        this(null);
    }

    public JavaRendererDefFactory(List<SourceLoader> sourceLoaders) {
        super(sourceLoaders);
    }

    @Override
    protected DefBuilder<?, ? extends RendererDef> getBuilder(DefDescriptor<RendererDef> descriptor) {
        JavaRendererDef.Builder builder = new JavaRendererDef.Builder();
        Class<?> rendererClass = getClazz(descriptor);

        if (rendererClass == null) {
            return null;
        }
        builder.setDescriptor(descriptor);
        builder.setLocation(rendererClass.getCanonicalName(), -1);
        builder.setRendererClass(rendererClass);
        return builder;
    }
}
