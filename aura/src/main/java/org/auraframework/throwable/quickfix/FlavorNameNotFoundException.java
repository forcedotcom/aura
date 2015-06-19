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

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.system.Location;

/**
 * Used when a flavor name isn't found on a {@link FlavoredStyleDef}.
 */
public class FlavorNameNotFoundException extends AuraValidationException {
    private static final String MSG = "The flavor named \"%s\" was not found on the %s %s";
    private static final String CMP_MSG = "A flavor named \"%s\" was not found for %s %s or its super components";
    private static final long serialVersionUID = -2571041901012359701L;

    public FlavorNameNotFoundException(String message, Location location) {
        super(message, location);
    }

    public static FlavorNameNotFoundException onFlavoredStyleDef(String flavor, DefDescriptor<FlavoredStyleDef> descriptor) {
        return new FlavorNameNotFoundException(
                String.format(MSG, flavor, descriptor.getDefType(), descriptor.getQualifiedName()), null);
    }

    public static FlavorNameNotFoundException forComponentDef(String flavor, DefDescriptor<? extends BaseComponentDef> descriptor) {
        return new FlavorNameNotFoundException(String.format(CMP_MSG, flavor, descriptor.getDefType(), descriptor.getQualifiedName()), null);
    }
}
