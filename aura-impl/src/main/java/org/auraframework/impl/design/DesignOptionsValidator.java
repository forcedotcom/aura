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

package org.auraframework.impl.design;

import com.google.common.collect.Sets;
import org.auraframework.def.design.DesignDef;
import org.auraframework.def.genericxml.RootLevelGenericXmlValidator;

import javax.annotation.Nonnull;
import java.util.Set;

/**
 * Uses GenericXmlHandler to add design:options into the design def.
 */
public final class DesignOptionsValidator extends RootLevelGenericXmlValidator {
    public static final String TAG = "design:option";
    private static final Set<String> ATTRIBUTES = Sets.newHashSet("name", "value", "access");

    public DesignOptionsValidator() {
        super(TAG, DesignDef.class);
    }

    @Override
    public boolean allowsTextLiteral() {
        return false;
    }

    @Override
    public boolean requiresInternalNamespace() {
        //DesignOptions is for internal namespace only
        return true;
    }

    @Override
    @Nonnull
    public Set<String> getAllowedAttributes(boolean isInternalNs) {
        return ATTRIBUTES;
    }

}
