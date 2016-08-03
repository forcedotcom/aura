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
window.Aura || (window.Aura = {});
window.Aura.bootstrap || (window.Aura.bootstrap = {});
window.Aura.Crypto = {};
window.Aura.Crypto.key = 'invalid';
(function() {
    window.Aura.bootstrap.execEncryptionKey = window.performance && window.performance.now ? window.performance.now() : Date.now();
    window.Aura.encryptionKeyReady = true;
    if (window.Aura.afterEncryptionKeyReady) {
        window.Aura.afterEncryptionKeyReady();
    }
}());
