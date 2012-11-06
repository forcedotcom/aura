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
package org.auraframework.throwable;

import java.io.PrintWriter;
import java.io.StringWriter;

import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Utility class for Exceptiony things.
 */
public final class AuraExceptionUtil {
    public static String getStackTrace(Throwable th) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        th.printStackTrace(pw);
        return sw.toString();
    }

    /**
     * jambs a aura location into the stacktrace of a throwable
     */
    public static void addLocation(Location location, Throwable t) {
        if (location != null) {
            StackTraceElement[] oldTrace = t.getStackTrace();
            StackTraceElement[] trace = new StackTraceElement[oldTrace.length + 1];
            StackTraceElement loc = new StackTraceElement("", "", location.getFileName(), location.getLine());
            trace[0] = loc;
            for (int i = 0; i < oldTrace.length; i++) {
                trace[i + 1] = oldTrace[i];
            }
            t.setStackTrace(trace);
        }
    }

    /**
     * Try really hard to find a QuickFixException.
     *
     * This routine will attempt to unwrap any Aura exception nested inside
     * other exceptions. It is intended to handle things like Memoization or
     * Excecution exceptions, surfacing the underlying Aura exception. Note
     * that this can hide the actual exception chain.
     *
     * @param t a Throwable to check.
     * @return the original QuickFixException if the Throwable or a cause is a quick fix
     * @throws Error original Error if the Throwable or a cause is an error.
     * @throws AuraRuntimeException for any other Throwable.
     */
    public static QuickFixException passQuickFix(Throwable t) throws AuraRuntimeException, Error {
        Throwable recurse = t;
        AuraRuntimeException unwrapped = null;
        int count = 5;

        while ((recurse != null) && (count-- > 0)) {
            if (recurse instanceof QuickFixException) {
                return (QuickFixException)recurse;
            } else if ((unwrapped == null) && (recurse instanceof AuraRuntimeException)) {
                unwrapped = (AuraRuntimeException)recurse;
            } else if (recurse instanceof Error) {
                throw (Error)recurse;
            }
            recurse = recurse.getCause();
        }
        if (unwrapped != null) {
            throw unwrapped;
        }
        if(t instanceof AuraRuntimeException){
            throw (AuraRuntimeException)t;
        }
        throw new AuraRuntimeException(t);
    }

    /**
     * Wrap an exception thrown inside plug-in code.
     *
     * Whenever a plug-in is called in Java, the caller MUST handle all exceptions, and wrap things as follows:
     * <ul>
     *   <li>Quick-Fixes should be passed through untouched
     *      (they will either be handled, or reported as an application error)</li>
     *   <li>AuraHandledException should be passed through untouched.
     *       It is an error intended for the client, and should not be wrapped.</li>
     *   <li>Any other AuraRuntimeException should be wrapped in a AuraExecutionException
     *       (note, if these hide a quick-fix or other exception, those exceptions should be surfaced).</li>
     *   <li>All non-aura exceptions should also be wrapped in a AuraExecutionException</li>
     *   <li>If there is an error somewhere in the set of causes, surface that.</li>
     * </ul>
     *
     * Returning a QuickFixException allows the caller to do a:
     * <code>throw AuraExceptionUtil.wrapExcecutionException(t,l)</code>
     * making the calling code more obvious (we are always throwing an exception).
     *
     * @param t the exception to wrap/return.
     * @param l the location of the execution.
     * @return a quick fix exception
     * @throws AuraRuntimeException (actually a subclass of this) if there is no Quick-Fix
     * @throws Error if an error was thrown.
     */
    public static QuickFixException wrapExecutionException(Throwable t, Location l) {
        Throwable recurse = t;
        int count = 5;

        while ((recurse != null) && (count-- > 0)) {
            if (recurse instanceof QuickFixException) {
                return (QuickFixException)recurse;
            } else if (recurse instanceof AuraHandledException) {
                // Short circuit out, assume that the thrower knew what they were doing.
                throw (AuraHandledException)recurse;
            } else if (recurse instanceof Error) {
                // unwrap errors, ignoring anyone else's attempt to wrap.
                throw (Error)recurse;
            }
            recurse = recurse.getCause();
        }
        throw new AuraExecutionException(t, l);
    }

    /**
     * Wrap an exception thrown inside plug-in code, not allowing a quick-fix.
     *
     * This is a very simple wrapper around {@link #wrapExecutionException}
     *
     * @param t the exception to wrap/return.
     * @param l the location of the execution.
     * @return a wrapped quick-fix exception
     * @throws AuraRuntimeException (actually a subclass of this) if there is no Quick-Fix
     * @throws Error if an error was thrown.
     */
    public static AuraRuntimeException wrapExecutionExceptionNoQFE(Throwable t, Location l) {
        QuickFixException unwrapped = wrapExecutionException(t, l);
        return new AuraUnhandledException("Unexpected exception", unwrapped);
    }
}
