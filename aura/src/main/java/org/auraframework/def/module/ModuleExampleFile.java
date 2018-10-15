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

/**
 * Represents a module example file, simply a name (filename) and contents. 
 *
 */
public interface ModuleExampleFile extends Serializable {

	/**
	 * The name of this file that makes up part of an example
	 * @return The name of the example file.
	 */
	public String getName();

	/**
	 * The contents of the file that makes up part of an example. 
	 * @return The file contents. 
	 */
	public String getContent();
}