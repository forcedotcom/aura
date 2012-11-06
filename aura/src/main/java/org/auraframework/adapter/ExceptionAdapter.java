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
package org.auraframework.adapter;

import org.auraframework.instance.Action;

/**
 * An adapter for handling exceptions at the servlet level.
 *
 * This adapter should be implemented by Aura users when exceptions need to be handled
 * or surfaced differently than the default Aura Behavior. The default implementation
 * of this interface simply logs the exception.
 *
 * FIXME: there should be an ExceptionAdapterBaseImpl that implements standard stuff
 * and is in the aura package so that it can be overridden.
 *
 *
 *
 */
public interface ExceptionAdapter extends AuraAdapter {
    /**
     * Get the root cause of the exception.
     *
     * This will be deprecated. Kill it now!
     *
     */
    public Throwable getRootCause(Throwable th);

    /**
     * Handle an exception that is not a part of an action.
     *
     * This routine is used to handle most exceptions at the servlet level.
     * It is called for all non quick-fix exceptions and can modify the exception.
     * Note however, that sometimes the exception returned is ignored, especially
     * in cases where the Servlet is already handling an exception.
     *
     * In cases where the Throwable will be used, it will be serialized onto the
     * client connection for the client libraries to handle. Note that many exceptions
     * will simply be reported as 'Server Error' instead of a detail message.
     *
     * @param th the throwable to log/replace
     */
    public Throwable handleException(Throwable th);

    /**
     * Handle an exception that is part of an action.
     *
     * This routine is identical to {@link #handleException(java.lang.Throwable)} except
     * that it is used in the case of an action. In this case, the throwable will always
     * be attached to the action, and reported as an error to the client.
     *
     * @param th the throwable to process
     * @param action the action whose processing caused the exception.
     */
    public Throwable handleException(Throwable th, Action action);
}
