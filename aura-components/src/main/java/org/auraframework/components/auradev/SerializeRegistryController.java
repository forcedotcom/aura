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
package org.auraframework.components.auradev;

import java.io.IOException;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.system.Annotations.ActionGroup;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.throwable.AuraException;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.RegistryJsonSerializer;

@ServiceComponent
public class SerializeRegistryController implements Controller {
    @AuraEnabled
    @ActionGroup(value = "auradev")
    public String serializeComponentRegistryToJson() throws AuraException {
        try {
            return RegistryJsonSerializer.serializeToFile();
        } catch (IOException e) {
            throw new AuraRuntimeException(e.getMessage());
        }
    }
}
