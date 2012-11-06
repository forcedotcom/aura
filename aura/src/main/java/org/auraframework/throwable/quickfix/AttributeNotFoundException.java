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
import org.auraframework.system.Location;

/**
 * Thrown when trying to use an attribute that doesn't exist
 */
public class AttributeNotFoundException extends QuickFixException {
    private static final long serialVersionUID = 1068164156618526671L;

    public AttributeNotFoundException(DefDescriptor<?> descriptor, String attName, Location l) {
        super(getMessage(descriptor, attName), l, new CreateAttributeQuickFix(descriptor, attName));
    }

    private static String getMessage(DefDescriptor<?> descriptor, String attName) {
        return String.format("The attribute \"%s\" was not found on the %s %s", attName, descriptor.getDefType(),
                descriptor.getQualifiedName());
    }
}
