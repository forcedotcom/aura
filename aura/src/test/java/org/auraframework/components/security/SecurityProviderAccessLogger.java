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
package org.auraframework.components.security;

import java.util.LinkedList;
import java.util.List;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.SecurityProvider;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.AuraEnabled;

@Controller
public class SecurityProviderAccessLogger implements SecurityProvider {
    private static List<DefDescriptor<?>> log = new LinkedList<DefDescriptor<?>>();

    @AuraEnabled
    public static List<DefDescriptor<?>> getLog() {
        return log;
    }

    @AuraEnabled
    public static void clearLog() {
        log.clear();
    }

    @Override
    public boolean isAllowed(DefDescriptor<?> descriptor) {
        log.add(descriptor);
        return true;
    }
}
