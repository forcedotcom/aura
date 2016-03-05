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
function CrossTabLib () { //eslint-disable-line no-unused-vars

    var CROSSTAB_INSTANCE; //Only one instance per page/tab;

    function CrossTab () {
        this.id = Math.random();
        this.isMaster = false;
        this.others = {};
        this.listeners = {};

        window.addEventListener('storage', this, false);
        window.addEventListener('unload', this, false);

        this.broadcast('hello');

        var self = this;
        var check = function check () {
            self.check();
            self._checkTimeout = setTimeout(check, 9000);
        };
        var ping = function ping () {
            self.sendPing();
            self._pingTimeout = setTimeout(ping, 17000);
        };
        this._checkTimeout = setTimeout(check, 500);
        this._pingTimeout = setTimeout(ping, 17000);
    }

    CrossTab.prototype.destroy = function () {
        clearTimeout( this._pingTimeout );
        clearTimeout( this._checkTimeout );

        window.removeEventListener('storage', this, false);
        window.removeEventListener('unload', this, false);

        this.broadcast('bye');
    };

    CrossTab.prototype.handleEvent = function (event) {
        if (event.type === 'unload') {
            this.destroy();
        } else if (event.key === 'broadcast') {
            try {
                var data = JSON.parse(event.newValue);
                if (data.id !== this.id) {
                    if (this.listeners[data.type]) {
                        var listeners = this.listeners[data.type];

                        for (var i in listeners) {
                            listeners[i](data.msg, data.id, data.type);
                        }

                    } else {
                        if (this[data.type]) {
                            this[data.type](data);
                        }
                    }
                }
            } catch (error) {
                $A.warning('Error parsing broadcasted msg');
            }
        }
    };

    CrossTab.prototype.sendPing = function () {
        this.broadcast( 'ping' );
    };

    CrossTab.prototype.hello = function ( event ) {
        this.ping( event );
        if ( event.id < this.id ) {
            this.check();
        } else {
            this.sendPing();
        }
    };

    CrossTab.prototype.ping = function (event) {
        this.others[event.id] = +new Date();
    };

    CrossTab.prototype.bye = function ( event ) {
        delete this.others[event.id];
        this.check();
    };

    CrossTab.prototype.check = function () {
        var now = +new Date(),
            takeMaster = true,
            id;
        for (id in this.others) {
            if (this.others[id] + 23000 < now) {
                delete this.others[ id ];
            } else if (id < this.id) {
                takeMaster = false;
            }
        }

        if (this.isMaster !== takeMaster) {
            this.isMaster = takeMaster;
            this._masterDidChange(takeMaster);
        }
    };

    CrossTab.prototype._masterDidChange = function (takeMaster) {
        if (this._onMasterChange) {
            this._onMasterChange(takeMaster);
        }
    };

    // -- PUBLIC APIS ---------------------------------------------------------------------------------------

    CrossTab.prototype.broadcast = function (type, data, forMaster) {
        var event = { id : this.id, type: type, forMaster: !!forMaster, msg : data };
        try {
            localStorage.setItem('broadcast', JSON.stringify(event));
        } catch ( error ) {
            $A.warning('Error broadcasting message');
        }
    };

    CrossTab.prototype.broadcastMaster = function (type, data) {
        this.broadcast(type, data, true);
    };

    CrossTab.prototype.onMasterChange = function (fn) {
        this._onMasterChange = fn;
    };

    CrossTab.prototype.on = function (event, fn) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(fn);
    };

    // We want to instanciate it only if explicitly called
    return {
        getInstance: function () {
            // Eventually we could implement another version 
            // based on SharedWorkers for example...
            if (!CROSSTAB_INSTANCE) {
                CROSSTAB_INSTANCE = new CrossTab();
            }
            return CROSSTAB_INSTANCE;
        }
    };
}