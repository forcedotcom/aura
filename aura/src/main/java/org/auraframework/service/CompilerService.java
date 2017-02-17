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
package org.auraframework.service;

import javax.annotation.Nonnull;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Source;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Find and load a definition from a sourceloader.
 */
public interface CompilerService {
    /**
     * get a definition by loading from a source loader.
     *
     * @param sourceLoader the loader.
     * @param descriptor the descriptor to look up.
     * @return the definition, null if not found.
     * @throws QuickFixException if theere was a problem loading the def.
     */
    <D extends Definition> D compile(@Nonnull SourceLoader sourceLoader, @Nonnull DefDescriptor<D> descriptor)
        throws QuickFixException;

    /**
     * get a definition by loading from a source.
     *
     * @param source the source to compile.
     * @return the definition, null if not found.
     * @throws QuickFixException if theere was a problem loading the def.
     */
    <D extends Definition> D compile(DefDescriptor<D> descriptor, @Nonnull Source<D> source) throws QuickFixException;
}
