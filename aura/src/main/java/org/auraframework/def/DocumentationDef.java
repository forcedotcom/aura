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
package org.auraframework.def;

import java.util.List;
import java.util.Map;

import org.auraframework.pojo.Description;
import org.auraframework.pojo.Example;

/**
 */
public interface DocumentationDef extends Definition {
    @Override
    DefDescriptor<DocumentationDef> getDescriptor();

    /**
     * @return map from DescriptionDef name to DescriptionDef
     */
    Map<String, Description> getDescriptionsAsMap();

    /**
     * Convenience method
     *
     * @return list of description from this DocumentationDef
     */
    List<String> getDescriptions();

    List<Example> getExamples();

    /**
     * @return map from Example name to ExampleDef
     */
    Map<String, Example> getExamplesAsMap();

    /**
     * Gets the {@link MetaDef} within this documentation.
     */
    Map<String, MetaDef> getMetaDefsAsMap();
}
