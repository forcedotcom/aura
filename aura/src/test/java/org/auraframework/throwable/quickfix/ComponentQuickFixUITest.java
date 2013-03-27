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

import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.test.annotation.UnAdaptableTest;

/**
 * Quick fix testing for Components.
 */
// TODO(W-1589052): Unadaptable since does not function properly when running from jars
@UnAdaptableTest
public class ComponentQuickFixUITest extends BaseComponentQuickFixUITest {
    public ComponentQuickFixUITest(String name) {
        super(name, DefType.COMPONENT, ".cmp");
    }
}
