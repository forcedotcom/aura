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
package org.auraframework.def.module;

import java.io.Serializable;
import java.util.Collection;

/** Represents an example for a LWC module **/
public interface ModuleExampleDef extends Serializable {

    static String EXAMPLES_DIRNAME = "__examples__";
    
	/** The (module) name for this example **/
	public String getName();
	
	/** The display label for this example **/
	public String getLabel();

	/** Description of the example.  **/
	public String getDescription();

	/** List of file contents **/
	public Collection<ModuleExampleFileDef> getContents();
}
