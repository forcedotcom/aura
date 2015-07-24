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

import org.auraframework.css.FlavorOverrideLocation;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;

import com.google.common.base.Objects;
import com.google.common.base.Optional;

public final class FlavorOverrideLocationImpl implements FlavorOverrideLocation {
    private final DefDescriptor<FlavoredStyleDef> descriptor;
    private final Optional<String> condition;

    public FlavorOverrideLocationImpl(DefDescriptor<FlavoredStyleDef> descriptor) {
        this(descriptor, null);
    }

    public FlavorOverrideLocationImpl(DefDescriptor<FlavoredStyleDef> descriptor, String condition) {
        this.descriptor = checkNotNull(descriptor, "descriptor cannot be null");
        this.condition = Optional.fromNullable(condition);
    }

    @Override
    public DefDescriptor<FlavoredStyleDef> getDescriptor() {
        return descriptor;
    }

    @Override
    public Optional<String> getCondition() {
        return condition;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("descriptor", descriptor)
                .add("condition", condition)
                .toString();
    }
}
