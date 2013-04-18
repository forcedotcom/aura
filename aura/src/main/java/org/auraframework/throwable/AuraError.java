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
package org.auraframework.throwable;

/**
 * Aura-related error arising from abnormal conditions which no one should
 * reasonably try to catch. One example might be if Aura was missing some key
 * source code of the engine itself.
 * "Even if you could recover, things will continue to not go your way."
 * 
 * @see AuraException
 * @see AuraRuntimeException
 */
public class AuraError extends Error {
    private static final long serialVersionUID = 4086385148934637611L;

    public AuraError(Throwable t) {
        super(t);
    }

    public AuraError(String message) {
        super(message);
    }

    public AuraError(String message, Throwable t) {
        super(message, t);
    }
}
