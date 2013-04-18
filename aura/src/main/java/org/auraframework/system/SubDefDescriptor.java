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
package org.auraframework.system;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;

/**
 * Sub descriptors are for concrete things that are part of another definition
 * with its own descriptor, and need to be referenced by something outside of
 * that definition.
 */
public interface SubDefDescriptor<T extends Definition, P extends Definition> extends DefDescriptor<T> {

    DefDescriptor<P> getParentDescriptor();
}
