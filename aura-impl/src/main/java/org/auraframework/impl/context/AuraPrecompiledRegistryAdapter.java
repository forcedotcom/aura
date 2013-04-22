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
package org.auraframework.impl.context;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.util.Set;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.AuraRuntimeException;

public class AuraPrecompiledRegistryAdapter implements RegistryAdapter {

    private final DefRegistry<?>[] registries;
    private static final Log log = LogFactory.getLog(AuraPrecompiledRegistryAdapter.class);

    public AuraPrecompiledRegistryAdapter(File sourceLocation, String precompiledPackagePath) {
        DefRegistry<?>[] precompiledRegistries = null;
        if (!sourceLocation.exists()) {
            ObjectInputStream ois = null;
            InputStream ris = AuraPrecompiledRegistryAdapter.class.getResourceAsStream(precompiledPackagePath);
            if (ris != null) {
                try {
                    ois = new ObjectInputStream(ris);
                    precompiledRegistries = (DefRegistry[]) ois.readObject();
                } catch (Exception e) {
                    log.error(e.getClass() + ": " + e.getMessage(), e);
                    throw new AuraRuntimeException(e);
                } finally {
                    try {
                        ris.close();
                    } catch (IOException e) {
                        throw new AuraRuntimeException(e);
                    }
                    if (ois != null) {
                        try {
                            ois.close();
                        } catch (IOException e) {
                            throw new AuraRuntimeException(e);
                        }
                    }
                }
            }
        }
        this.registries = precompiledRegistries;
    }

    @Override
    public DefRegistry<?>[] getRegistries(Mode mode, Access access, Set<SourceLoader> extraLoaders) {
        return registries;
    }

}
