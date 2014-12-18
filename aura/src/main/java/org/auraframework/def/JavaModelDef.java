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
 * A definition for a java model.
 *
 * Similar to controllers and providers, you can either have a locally instantiated model POJO, or you can use
 * the useAdapter flag to indicate that the {@link BeanAdapter} will be instantiating the bean.
 */
public interface JavaModelDef extends ModelDef {
    Class<?> getJavaType();
}
