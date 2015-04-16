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
package org.auraframework.impl.css.flavor;

import static com.google.common.base.Preconditions.checkNotNull;

import java.io.IOException;

import org.auraframework.css.FlavorRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.FlavorNameNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;

/**
 * Impl for {@link FlavorRef}.
 */
public final class FlavorRefImpl implements FlavorRef {
    private static final long serialVersionUID = -5147434761291797938L;

    private final DefDescriptor<FlavoredStyleDef> flavorDescriptor;
    private final String name;
    private final int hashCode;

    public FlavorRefImpl(DefDescriptor<FlavoredStyleDef> flavorDescriptor, String name) {
        this.flavorDescriptor = checkNotNull(flavorDescriptor);
        this.name = checkNotNull(name);
        this.hashCode = AuraUtil.hashCode(flavorDescriptor, name);
    }

    @Override
    public DefDescriptor<FlavoredStyleDef> getFlavoredStyleDescriptor() {
        return flavorDescriptor;
    }

    @Override
    public String getFlavorName() {
        return name;
    }

    @Override
    public void verifyReference() throws FlavorNameNotFoundException, QuickFixException {
        if (!flavorDescriptor.getDef().getFlavorNames().contains(name)) {
            throw new FlavorNameNotFoundException(name, flavorDescriptor);
        }
    }

    @Override
    public String toStringReference() {
        if (isStandardFlavor()) {
            return name;
        }
        return String.format("%s:%s:%s", flavorDescriptor.getNamespace(), flavorDescriptor.getBundle().getName(), name);
    }

    @Override
    public boolean isStandardFlavor() {
        return flavorDescriptor.getPrefix().equals(DefDescriptor.CSS_PREFIX);
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof FlavorRefImpl) {
            FlavorRefImpl other = (FlavorRefImpl) obj;
            return Objects.equal(flavorDescriptor, other.flavorDescriptor)
                    && Objects.equal(name, other.name);
        }

        return false;
    }

    @Override
    public String toString() {
        return toStringReference();
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapEntry("ref", toStringReference());
    }
}