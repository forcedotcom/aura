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

function (elementProxy, win) {
    'use strict';
    var w = win || window; // window injected for testing

    var ElementProxy = elementProxy.ElementProxy;
    
    var proxyCache = {};

    function checkProxy () {
        for(var proxy in proxyCache) {
            if(!proxyCache[proxy].el.checkNodeIsInDom()) {
                proxyCache[proxy].el.release();
            }
        }
    }

    function bakeOff() {
        for(var proxy in proxyCache) {
            if(proxyCache[proxy].el.isDirty()) {
                proxyCache[proxy].el.bake();
            }
        }
    }

    function getReferenceCount(proxy) {
        var id = proxy.id;
        if (!id || !proxyCache[id]) {
            return 0;
        } else {
            return proxyCache[id].refCount;
        }
    }


    function release(prx) {
        var proxy = proxyCache[prx.id];
        if(proxy) {
            --proxy.refCount;
        }
        if(proxy && proxy.refCount <= 0 ) {
            delete proxyCache[prx.id];
        }
        // if there is no proxy in the cache 
        // this is a no-op
    }

    function elementProxyFactory(el) {
        var key, newProxy;

        if(el !== w) {
    
            $A.assert(el && el.nodeType && (el.nodeType !== 1 || el.nodeType !== 11), "Element Proxy requires an element");
        }
        
        //validate node
        if(el !== w && !el.id) {
            el.id = w.$A.getComponent(el).getGlobalId();
        } else if (el === w) {
            el.id = 'window';
        }
       
        key = el.id;
        
        if(proxyCache[key]) {
            proxyCache[key].refCount++;
            return proxyCache[key].el;
        } else {
            newProxy = new ElementProxy(el, el.id);
            newProxy.setReleaseCallback(release, newProxy);

            proxyCache[key] = {
                el: newProxy,
                refCount : 1
            };
        }

        // run GC
        setTimeout(checkProxy, 0);
        return proxyCache[key].el;
    }

    function reset(){
        proxyCache = {};
    }

    return {
        _proxyCache: proxyCache,
        getReferenceCount: getReferenceCount,
        getElement : elementProxyFactory,
        bakeOff : bakeOff,
        resetFactory: reset,
        release: release
    };
}