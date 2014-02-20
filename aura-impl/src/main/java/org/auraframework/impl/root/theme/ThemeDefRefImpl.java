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
package org.auraframework.impl.root.theme;

import java.io.IOException;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeDefRef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;

/**
 * 
 */
public class ThemeDefRefImpl extends DefinitionImpl<ThemeDefRef> implements ThemeDefRef {
    private static final long serialVersionUID = -3610356270716608682L;
    private final DefDescriptor<ThemeDef> themeDescriptor;
    private final int hashCode;

    public ThemeDefRefImpl(Builder builder) {
        super(builder);
        this.themeDescriptor = builder.themeDescriptor;
        this.hashCode = AuraUtil.hashCode(descriptor, themeDescriptor);
    }

    @Override
    public DefDescriptor<ThemeDef> getThemeDescriptor() {
        return themeDescriptor;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);
        json.writeMapEntry("themeDescriptor", themeDescriptor);
        json.writeMapEnd();
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        if (themeDescriptor == null) {
            throw new InvalidDefinitionException("Missing name", getLocation());
        }
    }

    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
        themeDescriptor.getDef().validateReferences();
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);
        dependencies.add(themeDescriptor);
    }

    @Override
    public String toString() {
        return String.valueOf(themeDescriptor);
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof ThemeDefRefImpl) {
            ThemeDefRefImpl other = (ThemeDefRefImpl) obj;
            return Objects.equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(themeDescriptor, other.themeDescriptor);
        }

        return false;
    }

    public static final class Builder extends DefinitionImpl.BuilderImpl<ThemeDefRef> {
        public Builder() {
            super(ThemeDefRef.class);
        }

        DefDescriptor<ThemeDef> themeDescriptor;

        public Builder setThemeDescriptor(DefDescriptor<ThemeDef> themeDescriptor) {
            this.themeDescriptor = themeDescriptor;
            return this;
        }

        @Override
        public ThemeDefRef build() throws QuickFixException {
            return new ThemeDefRefImpl(this);
        }
    }
}
