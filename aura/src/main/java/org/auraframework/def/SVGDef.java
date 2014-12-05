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

/**
 * Handles <bundle name>.svg files within the bundle.
 *
 * FIXME: this is a hack, as there should be more here than just some string contents. It really should
 * have a better definition in the public docs to be part of OSS aura.
 */
public interface SVGDef extends RootDefinition {
    @Override
    DefDescriptor<SVGDef> getDescriptor();

    /**
     * Fixme: this should be different than just contents.
     */
    String getContents();
}
