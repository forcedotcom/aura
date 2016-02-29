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

package org.auraframework.def.genericxml;

import javax.annotation.Nonnull;
import java.util.Set;

/**
 * Describes that the definition is capable of handling GenericXml tags.
 */
public interface GenericXmlCapableDef {

    /**
     * Returns a set of all GenericXmlTags
     */
    @Nonnull
    Set<GenericXmlElement> getGenericTags();

    /**
     * Returns a set of GenericXmlDef given a class that the Validator specifies.
     * See {@link GenericXmlValidator#definition}
     *
     * @param validatorClass class used to map elements
     */
    @Nonnull
    Set<GenericXmlElement> getGenericTags(Class<? extends GenericXmlValidator> validatorClass);
}
