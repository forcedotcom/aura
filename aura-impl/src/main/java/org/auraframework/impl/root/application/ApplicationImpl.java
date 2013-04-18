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
package org.auraframework.impl.root.application;

import java.util.Map;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.root.component.BaseComponentImpl;
import org.auraframework.instance.Application;
import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json.Serialization;
import org.auraframework.util.json.Json.Serialization.ReferenceType;

/**
 */
@Serialization(referenceType = ReferenceType.IDENTITY)
public class ApplicationImpl extends BaseComponentImpl<ApplicationDef, Application> implements Application {

    public ApplicationImpl(ApplicationDef def, Map<String, Object> attributes) throws QuickFixException {
        super(def, attributes);
    }

    public ApplicationImpl(DefDescriptor<ApplicationDef> descriptor, Map<String, Object> attributes)
            throws QuickFixException {
        super(descriptor, attributes);
    }

    protected ApplicationImpl(DefDescriptor<ApplicationDef> descriptor, Application extender,
            BaseComponent<?, ?> attributeValueProvider, Application concreteApplication) throws QuickFixException {
        super(descriptor, extender, attributeValueProvider, concreteApplication);
    }

    @Override
    protected void createSuper() throws QuickFixException {
        ApplicationDef def = getComponentDef();
        if (!remoteProvider) {
            DefDescriptor<ApplicationDef> superDefDescriptor = def.getExtendsDescriptor();
            if (superDefDescriptor != null) {
                Application concrete = concreteComponent == null ? this : concreteComponent;
                superComponent = new ApplicationImpl(superDefDescriptor, this, this, concrete);
            }
        }
    }

    @Override
    protected void injectComponent() {
    }
}
