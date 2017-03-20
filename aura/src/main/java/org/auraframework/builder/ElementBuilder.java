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

package org.auraframework.builder;

import org.auraframework.def.DefinitionAccess;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.text.Hash;

/**
 *
 */
public interface ElementBuilder {

    ElementBuilder setLocation(String fileName, int line, int column, long lastModified);

    ElementBuilder setLocation(String fileName, long lastModified);

    /**
     * Set the location to a location that you build.
     */
    ElementBuilder setLocation(Location location);

    Location getLocation();

    ElementBuilder setTagName(String fullyQualifiedName);

    ElementBuilder setAPIVersion(String apiVersion);

    ElementBuilder setDescription(String description);

    ElementBuilder setAccess(DefinitionAccess access);

    /**
     * Set the Hash object from which the definition should extract the string.
     *
     * @param hash the hash object to use, it does not need to be complete when set.
     */
    ElementBuilder setOwnHash(Hash hash);

    /**
     * Set a string to use as the hash.
     * <p>
     * Note that this overrides {@link #setOwnHash(Hash)} as it assumes that if you
     * set the string version, you know what you are doing. This hash must change any
     * time the definition changes.
     *
     * @param hash the string to use.
     */
    ElementBuilder setOwnHash(String hash);

    /**
     * Get any error that occurred during the build process.
     */
    QuickFixException getParseError();

    /**
     * Set an error from when we are parsing/building the def.
     * <p>
     * This method allows the building process to set a parse error that will be returned
     * as a quick fix exception. If the cause is of an appropriate type information is
     * extracted/sent on to the quick fix.
     *
     * @param cause the underlying throwable.
     */
    void setParseError(Throwable cause);
}
