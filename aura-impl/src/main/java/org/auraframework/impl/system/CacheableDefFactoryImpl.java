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
package org.auraframework.impl.system;

import java.util.Set;

import org.auraframework.def.*;
import org.auraframework.impl.parser.ParserFactory;
import org.auraframework.impl.source.SourceFactory;
import org.auraframework.system.*;
import org.auraframework.throwable.quickfix.QuickFixException;

public class CacheableDefFactoryImpl<D extends Definition> extends DefFactoryImpl<D> implements CacheableDefFactory<D> {
    private final SourceFactory sourceFactory;

    public CacheableDefFactoryImpl(SourceFactory sourceFactory) {
        this.sourceFactory = sourceFactory;
    }

    @Override
    public D getDef(DefDescriptor<D> descriptor) throws QuickFixException {
        Source<?> source = sourceFactory.getSource(descriptor);
        if (source != null && source.exists()) {
            Parser parser = ParserFactory.getParser(source.getFormat());
            D def = parser.parse(descriptor, source);
            //def.validateDefinition();
            return def;
        }

        return null;
    }

    @Override
    public Source<D> getSource(DefDescriptor<D> descriptor) {
        return sourceFactory.getSource(descriptor);
    }

    @Override
    public long getLastMod(DefDescriptor<D> descriptor) {
        return sourceFactory.getSource(descriptor).getLastModified();
    }

    @Override
    public boolean exists(DefDescriptor<D> descriptor) {
        Source<D> s = getSource(descriptor);
        return s != null && s.exists();
    }

    @Override
    public Set<DefDescriptor<D>> find(DefDescriptor<D> matcher) {
        return sourceFactory.find(matcher);
    }
}
