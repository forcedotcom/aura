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
/*
 * Copyright (C) 2006 Sun Microsystems, Inc. All rights reserved.
 * Use is subject to license terms.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met: Redistributions of source code
 * must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of
 * conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution. Neither the name of the Sun Microsystems nor the names of
 * is contributors may be used to endorse or promote products derived from this software
 * without specific prior written permission.

 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package org.auraframework.util.phobos.script.util;

import java.util.Map;
import java.util.Set;

import javax.script.Bindings;

/*
 * Abstract super class for Bindings implementations. Handles
 * global and local scopes.
 *
 * @author Mike Grogan
 * @version 1.0
 * @since 1.6
 */
public abstract class BindingsImpl extends BindingsBase {

    //get method delegates to global if key is not defined in
    //base class or local scope
    protected Bindings global = null;

    //get delegates to local scope
    protected Bindings local = null;

    public void setGlobal(Bindings n) {
        global = n;
    }

    public void setLocal(Bindings n) {
        local = n;
    }

    @Override
    public  Set<Map.Entry<String, Object>> entrySet() {
        return new BindingsEntrySet(this);
    }

    @Override
    public Object get(Object key) {
        checkKey(key);

        Object ret  = null;
        if ((local != null) && (null != (ret = local.get(key)))) {
            return ret;
        }

        ret = getImpl((String)key);

        if (ret != null) {
            return ret;
        } else if (global != null) {
            return global.get(key);
        } else {
            return null;
        }
    }

    @Override
    public Object remove(Object key) {
        checkKey(key);
        Object ret = get(key);
        if (ret != null) {
            removeImpl((String)key);
        }
        return ret;
    }
}
