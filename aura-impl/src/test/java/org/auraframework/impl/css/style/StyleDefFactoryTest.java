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
package org.auraframework.impl.css.style;

import java.util.List;

import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.source.SourceFactory;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.system.SourceLoader;

import com.google.common.collect.Lists;

public class StyleDefFactoryTest extends AuraImplTestCase {

    public StyleDefFactoryTest(String name) {
        super(name);
    }

    /**
     * Verify that calling find() on a factory that does not implement the
     * method throws the proper exception.
     */
    public void testFind() throws Exception {
        SourceLoader loader = StringSourceLoader.getInstance();
        List<SourceLoader> loaders = Lists.newArrayList(loader);
        StyleDefFactory factory = new StyleDefFactory(new SourceFactory(loaders));

        assertFalse("StyleDefFactory should not have find() method", factory.hasFind());
        try {
            factory.find(new DescriptorFilter("*://*:*"));
            fail("Calling find() on Factory that does not implement method should throw exception");
        } catch (UnsupportedOperationException e) {
        }
    }
}
