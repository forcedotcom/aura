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
package org.auraframework.throwable.quickfix;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraValidationException;

/**
 * thrown when unable to locate a def for a descriptor
 */
public class DefinitionNotFoundException extends AuraValidationException {

    private static final long serialVersionUID = 1918131174943191514L;

    private final DefDescriptor<?> descriptor;

    private static final String messageFormat = "No %s named %s found";

    public DefinitionNotFoundException(DefDescriptor<?> descriptor, Location l) {
        super(getMessage(descriptor.getDefType(), descriptor.getQualifiedName()), l, getFixes(descriptor));
        this.descriptor = descriptor;
    }

    private static AuraQuickFix[] getFixes(DefDescriptor<?> descriptor){
        switch(descriptor.getDefType()){
            case COMPONENT:
                return new AuraQuickFix[]{new CreateComponentDefQuickFix(descriptor)};
            case APPLICATION:
                return new AuraQuickFix[]{new CreateApplicationDefQuickFix(descriptor)};
            default : return null;
        }
    }

    public DefinitionNotFoundException(DefDescriptor<?> descriptor) {
        this(descriptor, null);
    }

    public DefDescriptor<?> getDescriptor() {
        return descriptor;
    }

    private static String getMessage(DefType defType, String defName) {
        return String.format(messageFormat, defType, defName);
    }
}
