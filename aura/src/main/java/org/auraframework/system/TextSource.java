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
package org.auraframework.system;

import java.io.Reader;

import org.auraframework.def.Definition;

/**
 * A source that is for 'text'.
 *
 * FIXME: both the reader and hashing reader should probably be deprecated an removed.
 */
public interface TextSource<D extends Definition> extends Source<D> {
    /**
     * get the contents.
     */
    String getContents();

    /**
     * Get a reader for the contents.
     */
    Reader getReader();

    /**
     * Get a hashing reader.
     */
    Reader getHashingReader();
}
