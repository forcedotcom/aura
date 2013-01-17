/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.service;

import org.auraframework.integration.Integration;
import org.auraframework.system.AuraContext.Mode;

/**
 * <p>
 * Service for constructing an instance of a {@link Integration}
 * </p>
 * <p>
 * An Integration defines the scope of creating a set of component injection
 * scripts
 * </p>
 */
public interface IntegrationService extends AuraService {
	/**
	 * Create an Integration object that represents a set of components that
	 * will be injected into a non-Aura container
	 * 
	 * @param securityProviderDescr
	 * @param contextPath
	 * @param mode
	 * @param injectApplication
	 * @return
	 */
	Integration createIntegration(String contextPath, Mode mode);
}