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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;

import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;

import org.auraframework.util.text.Hash;

/**
 * @param <PrimaryIntf> The Primary Interface of a DefType, which should always
 *            line up with the DefTypes on the DefDescriptors that this builder
 *            deals with.
 * @param <DefOrRefType> Normally the same as T, but in the case of DefRefs,
 *            like ComponentDefRef, this would be the ComponentDefRef.class Even
 *            though the descriptors for ComponentDefRefs are Component.class.
 */
public interface DefBuilder<PrimaryIntf extends Definition, DefOrRefType extends Definition> {
    DefOrRefType build() throws QuickFixException;

    DefBuilder<PrimaryIntf, DefOrRefType> setLocation(String fileName, int line, int column, long lastModified);

    DefBuilder<PrimaryIntf, DefOrRefType> setLocation(String fileName, long lastModified);
    
    /**
     * Set the location to a location that you build.
     */
    DefBuilder<PrimaryIntf, DefOrRefType> setLocation(Location location);

    DefBuilder<PrimaryIntf, DefOrRefType> setDescriptor(String qualifiedName);

    DefBuilder<PrimaryIntf, DefOrRefType> setDescriptor(DefDescriptor<PrimaryIntf> desc);

    DefBuilder<PrimaryIntf, DefOrRefType> setDescription(String description);

    /**
     * Set the Hash object from which the definition should extract the string.
     *
     * @param hash the hash object to use, it does not need to be complete when set.
     */
    DefBuilder<PrimaryIntf, DefOrRefType> setOwnHash(Hash hash);

    /**
     * Set a string to use as the hash.
     *
     * Note that this overrides {@link #setOwnHash(Hash)} as it assumes that if you
     * set the string version, you know what you are doing. This hash must change any
     * time the definition changes.
     *
     * @param hash the string to use.
     */
    DefBuilder<PrimaryIntf, DefOrRefType> setOwnHash(String hash);

    DefDescriptor<PrimaryIntf> getDescriptor();
}
