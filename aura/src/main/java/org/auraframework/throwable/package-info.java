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
/**
 * This package provides all of the Aura exception classes.
 * <p>
 * Exceptions based off of {@link org.auraframework.throwable.quickfix.QuickFixException quick fix}
 * are exceptions that are checked, and can provide a set of quick fixes to a developer. These
 * will only be handled as a quick fix when Aura is not in
 * {@link org.auraframework.system.AuraContext.Mode#PROD production mode}
 *
 * This exception must be extended to use it (it is abstract). It is possible
 * to extend it in external code, but the appropriate providers and handlers
 * must also be extended.
 * <p>
 * Exceptions based off of a {@link org.auraframework.throwable.AuraHandledException}
 * provide a way to send a message to the client to handle the exception. These will be
 * automatically surfaced from within plug-in code, and should always send the appropriate
 * message to the client, short-circuiting all other handling.
 *
 * In order for this to be extended externally, appropriate handlers must be provided
 * and they must provide messaging that will be correctly interpreted by the client.
 * <p>
 * A {@link org.auraframework.throwable.AuraExecutionException}
 * is used to wrap an exception that occurs in plug-in code and to tag it with
 * the location of the definition to aid in tracking * down the problem. This exception
 * will never wrap {@link org.auraframework.throwable.quickfix.QuickFixException} or
 * {@link org.auraframework.throwable.AuraHandledException} exception.
 * <p>
 * {@link org.auraframework.throwable.AuraUnhandledException} is used to wrap exceptions in Aura code that
 * cannot be handled. These will be reported as an error to the client, and may
 * be further wrapped in other relevant exceptions.
 */
package org.auraframework.throwable;

