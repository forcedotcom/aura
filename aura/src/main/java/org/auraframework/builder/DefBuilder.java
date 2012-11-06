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
package org.auraframework.builder;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * @param <PrimaryIntf>
 *            The Primary Interface of a DefType, which should always line up with the DefTypes on the DefDescriptors
 *            that this builder deals with.
 * @param <DefOrRefType>
 *            Normally the same as T, but in the case of DefRefs, like ComponentDefRef, this would be the
 *            ComponentDefRef.class Even though the descriptors for ComponentDefRefs are Component.class.
 */
public interface DefBuilder<PrimaryIntf extends Definition, DefOrRefType extends Definition> {
    DefOrRefType build() throws QuickFixException;
    DefBuilder<PrimaryIntf,DefOrRefType> setLocation(String fileName, int line, int column, long lastModified);
    DefBuilder<PrimaryIntf,DefOrRefType> setLocation(String fileName, long lastModified);
    DefBuilder<PrimaryIntf,DefOrRefType> setDescriptor(String qualifiedName);
    DefBuilder<PrimaryIntf,DefOrRefType> setDescriptor(DefDescriptor<PrimaryIntf> desc);
    DefBuilder<PrimaryIntf,DefOrRefType> setDescription(String description);
    DefDescriptor<PrimaryIntf> getDescriptor();
}
