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
package org.auraframework.service;

import org.auraframework.integration.Integration;
import org.auraframework.integration.IntegrationServiceObserver;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * <p>
 * Service for constructing an instance of a {@link Integration}
 * </p>
 * <p>
 * An Integration defines the scope of creating a set of component injection scripts
 * </p>
 */
public interface IntegrationService extends AuraService {
	public static String NO_DEFAULT_PRELOADS_INTERFACE = "aura:noDefaultPreloads";
	
    /**
     * Create an Integration object that represents a set of components that
     * will be injected into a non-Aura container.
     * 
     * @param contextPath
     *            The portion of the request URI that is used to select the context of the request.
     *            This is the first part of a request URI. The path starts with a / character
     *            but does not end with a / character.
     *            For servlets in the default (root) context, the context path is an empty string.
     * @param mode
     *            The Aura mode.
     * @param initializeAura
     *            Indicates whether to create an internal integration app (true) or not (false).
     *            Passing a value of false allows for partial page updates, that is, adding additional
     *            components on subsequent trips to the server after an app has already been loaded.
     * @param userAgent
	 * @param application Fully qualified (namespace:name) name of the Aura application. The application must extend aura:integrationServiceApp
	 * @param observer
     * @return
     *         A new integration.
     * @throws QuickFixException 
     */
    Integration createIntegration(String contextPath, Mode mode, boolean initializeAura, String userAgent, String application, IntegrationServiceObserver observer) throws QuickFixException;
}