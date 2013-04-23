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
package org.auraframework.impl.controller;

import org.auraframework.Aura;
import org.auraframework.system.Annotations.*;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

@Controller
public class LabelController {

    @AuraEnabled
    public static String getLabel(@Key("section") String section, @Key("name") String name) throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        String result = context.getLabel(section, name, (Object[]) null);
        return result;
    }

}
