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

import java.lang.reflect.Constructor;
import java.util.Map;

import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;

/**
 */
@Controller
public class AuraQuickFixController {
    private static final String className = "org.auraframework.throwable.quickfix.%sQuickFix";

    @SuppressWarnings("unchecked")
    @AuraEnabled
    public static void doFix(@Key("name") String name, @Key("attributes") Map<String, Object> attributes)
            throws Exception {
        Class<AuraQuickFix> clz = (Class<AuraQuickFix>) Class.forName(String.format(className, name));
        Constructor<AuraQuickFix> constructor = clz.getConstructor(Map.class);
        AuraQuickFix quickFix = constructor.newInstance(attributes);
        quickFix.fix();
    }
}
