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
package org.auraframework.throwable.quickfix;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraExceptionDefDescriptorInfo;

/**
 * thrown when unable to locate a def for a descriptor
 */
public class DefinitionNotFoundException extends AuraValidationException
        implements AuraExceptionDefDescriptorInfo {

    private static final long serialVersionUID = 1918131174943191514L;

    private final DefDescriptor<?> descriptor;

    private static final String messageFormat = "No %s named %s found";

    public DefinitionNotFoundException(DefDescriptor<?> descriptor, Location l) {
        super(getMessage(descriptor.getDefType(), descriptor.getQualifiedName()), l);
        this.descriptor = descriptor;
    }

    public DefinitionNotFoundException(DefDescriptor<?> descriptor, Location l, String usedAt) {
        super(getMessage(descriptor.getDefType(), descriptor.getQualifiedName(), usedAt), l);
        this.descriptor = descriptor;
    }

    public DefinitionNotFoundException(DefDescriptor<?> descriptor) {
        this(descriptor, null);
    }

    public static String getMessage(DefType defType, String defName, String usedAt) {
        if (usedAt == null || usedAt.length() == 0) {
            return String.format(messageFormat, defType, defName);
        } else {
            return String.format(messageFormat, defType, defName) + " : " + usedAt;
        }
    }

    public static String getMessage(DefType defType, String defName) {
        return String.format(messageFormat, defType, defName);
    }

    @Override
    public DefDescriptor<? extends Definition> getDescriptor() {
        return descriptor;
    }

}
