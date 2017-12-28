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
package org.auraframework.impl.source;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.TextSource;

/**
 * Abstract base class for providing access to source code and metadata.
 *
 * Implemented as abstract with inversion of control.
 *
 * Implementors should read the comments for {@link #getHash()} and ensure they honor the
 * contract.
 */
public abstract class AbstractTextSourceImpl<D extends Definition> extends AbstractSourceImpl<D> implements TextSource<D> {
    protected AbstractTextSourceImpl(DefDescriptor<D> descriptor, String systemId, String mimeType) {
        super(descriptor, systemId, mimeType);
    }

    protected AbstractTextSourceImpl(DefDescriptor<D> descriptor, String systemId, Format format) {
        super(descriptor, systemId, format);
    }
}
