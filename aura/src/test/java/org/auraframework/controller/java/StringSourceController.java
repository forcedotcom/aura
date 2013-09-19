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
package org.auraframework.controller.java;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;

@Controller
public class StringSourceController {
	 /**
     * Adds a given type of def to the string source
     * @param name Name of the component/application/event, any type of def which uses MARKUP://
     * @param content Contents of the def
     * @param defType COMPONENT / APPLICATION / EVENT etc
     * @param lastModified long value
     * @return
     * @throws Exception
     */
    @AuraEnabled
    public static DefDescriptor<?> addSource(@Key("name") String name, @Key("content") String content, @Key("defType") String defType) throws Exception {
        StringSourceLoader stringSourceLoader = StringSourceLoader.getInstance();
        return stringSourceLoader.addSource(Enum.valueOf(DefType.class, defType).getPrimaryInterface(), content, name).getDescriptor();
    }
    /**
     * Removes a specified resource from string source
     * @param name name of resource in string source
     * @param defType COMPONENT / APPLICATION / EVENT etc
     * @throws Exception
     */
    @AuraEnabled
    public static void removeSource(@Key("names") List<String> names, @Key("defType") List<String> defType) throws Exception {
        StringSourceLoader stringSourceLoader = StringSourceLoader.getInstance();
        
        for(int i =0; i< names.size();i++){
            DefDescriptor<?> descriptor = Aura.getDefinitionService().getDefDescriptor(names.get(i), Enum.valueOf(DefType.class, defType.get(i)).getPrimaryInterface()); 
            stringSourceLoader.removeSource(descriptor);
        }
        return;
    }
    /**
     * Obtain the commit SHA of HEAD
     * @return
     * @throws Exception
     */
    @AuraEnabled
    public static String getCommitSHAAndDate()throws Exception{
    	Process process = Runtime.getRuntime().exec("git log --pretty=format:%h,%cd -n 1 HEAD");
        BufferedReader stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String commitSHAAndDate = stdInput.readLine();
    	return commitSHAAndDate;
    }
}
