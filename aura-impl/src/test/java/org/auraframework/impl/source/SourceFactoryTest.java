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
package org.auraframework.impl.source;

import java.util.List;

import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.AuraRuntimeException;

import com.google.common.collect.Lists;

public class SourceFactoryTest extends AuraImplTestCase {

    public SourceFactoryTest(String name) {
        super(name);
    }

    public void testSourceFactory() {
        SourceLoader loader = StringSourceLoader.getInstance();
        try {
            List<SourceLoader> loaders = Lists.newArrayList(loader, loader);
            new SourceFactory(loaders);
            fail("Should have failed with AuraException('Namespace claimed by 2 SourceLoaders')");
        } catch (AuraRuntimeException e) {
        }
    }
}
