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
package org.auraframework.impl.linker;

import javax.annotation.Nonnull;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;

/**
 * A compiling definition.
 *
 * This embodies a definition that is in the process of being compiled. It stores the descriptor, definition, and
 * the registry to which it belongs to avoid repeated lookups.
 */
public class LinkingDefinition<T extends Definition> {
    public LinkingDefinition(@Nonnull DefDescriptor<T> descriptor) {
        this.descriptor = descriptor;
    }

    /**
     * The descriptor we are compiling.
     */
    @Nonnull
    public DefDescriptor<T> descriptor;

    /**
     * The compiled def.
     *
     * Should be non-null by the end of compile.
     */
    public T def;

    /**
     * Did we build this definition?.
     *
     * If this is true, we need to do the validation steps after finishing.
     */
    public boolean built = false;

    /**
     * The 'level' of this def in the compile tree.
     */
    public int level = 0;

    /**
     * Is this def cacheable?
     */
    public boolean cacheable = false;

    /**
     * have we validated this def yet?
     */
    public boolean validated = false;

    public String toNoLevelString() {
        StringBuffer sb = new StringBuffer();

        sb.append(descriptor);
        if (def != null) {
            sb.append("[");
            sb.append(def.getOwnHash());
            sb.append("]");
        } else {
            sb.append("[not-compiled]");
        }
        sb.append(" : built=");
        sb.append(built);
        sb.append(", cacheable=");
        sb.append(cacheable);
        return sb.toString();
    }

    @Override
    public String toString() {
        StringBuffer sb = new StringBuffer();

        sb.append(descriptor);
        if (def != null) {
            sb.append("[");
            sb.append(def.getOwnHash());
            sb.append("]");

            sb.append("<");
            sb.append(level);
            sb.append(">");
        } else {
            sb.append("[not-compiled]");
        }
        sb.append(" : built=");
        sb.append(built);
        sb.append(", cacheable=");
        sb.append(cacheable);
        return sb.toString();
    }
}
