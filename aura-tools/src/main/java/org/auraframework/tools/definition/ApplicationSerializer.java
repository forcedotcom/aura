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
package org.auraframework.tools.definition;

import java.io.File;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.*;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.IOUtil;

import com.google.common.collect.Maps;

public class ApplicationSerializer {

    public static void main(String[] args) {
        ContextService contextService = Aura.getContextService();
        DefinitionService definitionService = Aura.getDefinitionService();
        DefDescriptor<ApplicationDef> appDesc = definitionService.getDefDescriptor("aura:test", ApplicationDef.class);
        contextService.startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED, appDesc);

        SerializationService serializationService = Aura.getSerializationService();
        try {
            Map<String, Object> atts = Maps.newHashMap();
            File outputDir = new File(
                    "/home/dpletter/dev/lumen-beta/aura-integration-test/src/test/resources/htdocs/app");
            if (outputDir.exists()) {
                IOUtil.delete(outputDir);
            }
            atts.put("outputPath", outputDir.getAbsolutePath());

            serializationService.write(appDesc.getDef(), atts, ApplicationDef.class, System.out, "OFFLINE_HTML");
        } catch (Throwable e) {
            e.printStackTrace();
            System.exit(1);
        }

        contextService.endContext();
    }
}
