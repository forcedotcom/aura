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
package org.auraframework.impl;

import java.io.IOException;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.ModelDef;
import org.auraframework.impl.java.JavaSourceLoader;
import org.auraframework.impl.java.model.JavaModelDefFactory;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Model;
import org.auraframework.util.json.Json;
import org.junit.Test;

/**
 * This class provides automation for Java models.
 */
public class JavaModelTest extends AuraImplTestCase {
    @Test
    public void testSerializeMetadata() throws Exception {
        JavaSourceLoader loader = new JavaSourceLoader();
        JavaModelDefFactory factory = new JavaModelDefFactory();
        ModelDef def = factory.getDefinition(descriptor, loader.getSource(descriptor));
        serializeAndGoldFile(def);
    }

    @Test
    public void testSerializeData() throws Exception {
        JavaSourceLoader loader = new JavaSourceLoader();
        JavaModelDefFactory factory = new JavaModelDefFactory();
        ModelDef def = factory.getDefinition(descriptor, loader.getSource(descriptor));
        Model model = instanceService.getInstance(def, null);
        serializeAndGoldFile(model);
    }

    private static final DefDescriptor<ModelDef> descriptor = new DefDescriptor<ModelDef>() {
        private static final long serialVersionUID = -2368424955441005888L;

        @Override
        public void serialize(Json json) throws IOException {
            json.writeValue(getQualifiedName());
        }

        @Override
        public String getPrefix() {
            return "java";
        }

        @Override
        public String getNamespace() {
            return org.auraframework.impl.java.model.TestModel.class.getPackage().getName();
        }

        @Override
        public String getName() {
            return org.auraframework.impl.java.model.TestModel.class.getSimpleName();
        }

        @Override
        public String getQualifiedName() {
            return getPrefix() + "://" + org.auraframework.impl.java.model.TestModel.class.getName();
        }

        @Override
        public String getDescriptorName() {
            return org.auraframework.impl.java.model.TestModel.class.getName();
        }

        @Override
        public boolean isParameterized() {
            return false;
        }

        @Override
        public String getNameParameters() {
            return null;
        }

        @Override
        public org.auraframework.def.DefDescriptor.DefType getDefType() {
            return DefType.MODEL;
        }

        @Override
        public ModelDef getDef() {
            return null;
        }

        @Override
        public boolean exists() {
            return false;
        }

        @Override
        public int compareTo(DefDescriptor<?> other) {
            return DefDescriptorImpl.compare(this, other);
        }

        @Override
        public DefDescriptor<? extends Definition> getBundle() {
            return null;
        }
    };
}
