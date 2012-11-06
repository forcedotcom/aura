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
package org.auraframework.controller.java;

import java.util.Date;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.Annotations.AuraEnabled;

@Controller
public class StringSourceController {
    /**
     * Adds a given type of def to the string source
     * @param name Name of the component/application/event, any type of def which uses MARKUP://
     * @param content Contents of the def
     * @param defType COMPONENT / APPLICATION / EVENT etc
     * @param lastModified long value
     */
    @AuraEnabled
    public static DefDescriptor<?> addSource(@Key("name") String name, @Key("content") String content, @Key("defType") String defType,@Key("lastModified") Long lastModified) throws Exception {
        StringSourceLoader stringSourceLoader = StringSourceLoader.getInstance();
        return stringSourceLoader.addSource(name,content, Enum.valueOf(DefType.class, defType).getPrimaryInterface(),  new Date(Long.valueOf(lastModified==null?System.currentTimeMillis():lastModified)));
    }
    /**
     * Removes a specified resource from string source
     * @param names name of resource in string source
     * @param defType COMPONENT / APPLICATION / EVENT etc
     * @throws Exception
     */
    @AuraEnabled
    public static void removeSource(@Key("names") List<String> names, @Key("defType") List<String> defType) throws Exception {
        StringSourceLoader stringSourceLoader = StringSourceLoader.getInstance();

        for(int i =0; i< names.size();i++){
            DefDescriptor<?> descriptor = Aura.getDefinitionService().getDefDescriptor(String.format("%s://%s:%s", DefDescriptor.MARKUP_PREFIX, "string", names.get(i)), Enum.valueOf(DefType.class, defType.get(i)).getPrimaryInterface());
            stringSourceLoader.removeSource(descriptor);
        }
        return;
    }
}
