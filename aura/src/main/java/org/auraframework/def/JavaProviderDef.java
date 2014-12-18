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
 * A definition for a Java Provider.
 *
 * Java Providers are server side providers written in java. They must be annotated
 * with the {@link Provider} annotation, and they must implement at least one of the provider interfaces.
 * {@link ComponentConfigProvider} or {@link ComponentDescriptorProvider}, and may additionally implement
 * {@link StaticComponentConfigProvider}
 *
 * <ul>
 * <li>Simple Providers:<br />
 * Simple providers are instantiated directly without using the bean adapter. This should generally only be used
 * for internal implementations that are intended for this.
 *
 * <li>Adapter Based Providers:<br />
 * Adapter based providers are annotated with {@link Provider} with useAdapter = true. These providers must
 * implement the appropriate interface.
 * </ul>
 */
public interface JavaProviderDef extends ProviderDef {
    @Override
    DefDescriptor<? extends JavaProviderDef> getDescriptor();
}
