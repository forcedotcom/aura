({
    initializeMutex: function () {

        /*
        * Implemented based on "A Fast Mutual Exclusion Algorithm" (Leslie Lamport 1985)
        * http://research.microsoft.com/en-us/um/people/lamport/pubs/fast-mutex.pdf
        * 
        * Algorithm (`_lockPriv` method):
        * 1.  Set X = i
        * 2.  If Y != 0: Restart
        * 3.  Set Y = i
        * 4.  If X != i:
        * 5.    Delay
        * 6.    If Y != i: Restart
        * 7.  [Has lock, do work]
        * 8.  Set Y = 0
        *
        * In English:
        * 1. Always set X to the current client’s unique identifier.
        * 2. If Y is not zero then another client has the lock, so restart.
        * 3. If Y was zero, then set Y to the client ID.
        * 4. If X has changed, there’s a possibility of contention. So…
        * 5. Delay for long enough for another client to have seen Y as zero and tried to write it. (We added a random jitter here to minimize the chance of a client being starved.)
        * 6. If the client didn’t win Y, then restart the whole process.
        * 7. The lock was won, or there was no sign of contention, so now we can do our work.
        * 8. Clear Y to allow another client to take the lock.
        */
        function Mutex () {}

        Mutex.SET_MUTEX_WAIT = 50;
        Mutex.RETRY_WAIT     = 50;
        Mutex.MAX_LOCK_TIME  = 8000;
        Mutex.CLIENT_ID      = $A.getContext().getClientSessionId();
        Mutex.GLOBAL_KEY     = 'global';
        Mutex.MUTEX_X_KEY    = '__MUTEX_X';
        Mutex.MUTEX_Y_KEY    = '__MUTEX_Y';

        Mutex.prototype = {
            getClientId: function () {
                return Mutex.CLIENT_ID;
            },
            lock: function (/* [key], callback, [timeout] */) {
                var xargs    = Array.prototype.slice.call(arguments);
                var key      = typeof arguments[0] === 'string' ? xargs.shift() : Mutex.GLOBAL_KEY;
                var callback = xargs.shift();
                var timeout  = xargs.shift() || Mutex.MAX_LOCK_TIME;

                $A.assert(typeof callback === 'function', 'Mutex needs a function to execute');
                this._lockPriv(key, callback, timeout);
            },
            _lockPriv: function (key, callback, timeout) {
                this._setX(key, function () {
                    if (!this._isLockAvailable(key, timeout)) {
                        this._retry(key, callback, timeout);
                        return;
                    }

                    this._setY(key, function () {
                        if (this._getX(key) !== Mutex.CLIENT_ID) {
                            setTimeout(function () {
                                if (!this.hasLock(key)) { 
                                    this._retry(key, callback, timeout);
                                } else {
                                    this._execute(key, callback);
                                }
                            }.bind(this), Math.random() * Mutex.RETRY_WAIT);
                        } else {
                            this._execute(key, callback);
                        }
                    });
                });
            },
            hasLock: function (key) {
                return this._getY(key) === Mutex.CLIENT_ID;
            },
            _execute: function (key, callback) {
                setTimeout(function () {
                    callback(this._clearLock.bind(this, key));
                }.bind(this), 0);
            },
            _clearLock: function (key) {
                window.localStorage.removeItem(key + Mutex.MUTEX_Y_KEY);
            },
            _retry: function (key, callback, timeout) {
                window.setTimeout(function () {
                    this._lockPriv(key, callback, timeout);
                }.bind(this), Math.random() * Mutex.RETRY_WAIT);
            },
            _isLockAvailable: function (key, timeout) {
                var item = window.localStorage.getItem(key + Mutex.MUTEX_Y_KEY);
                var token = item && item.split('|');
                var mutex_y_TS = token && parseInt(token[1]);

                // No token or token expired
                if (!token || Date.now() > mutex_y_TS + timeout) {
                    return true;
                }
            },
            _getX: function (key) {
                var item = window.localStorage.getItem(key + Mutex.MUTEX_X_KEY);
                return item && item.split('|')[0];
            },
            _setX: function (key, callback) {
                window.localStorage.setItem(key + Mutex.MUTEX_X_KEY, Mutex.CLIENT_ID + '|' + Date.now());
                window.setTimeout(callback.bind(this), Math.random() * Mutex.SET_MUTEX_WAIT);
            },
            _getY: function (key) {
                var item = window.localStorage.getItem(key + Mutex.MUTEX_Y_KEY);
                return item && item.split('|')[0];
            },
            _setY: function (key, callback) {
                window.localStorage.setItem(key + Mutex.MUTEX_Y_KEY, Mutex.CLIENT_ID + '|' + Date.now());
                window.setTimeout(callback.bind(this), Math.random() * Mutex.SET_MUTEX_WAIT);
            }
        };

        return new Mutex();
    }
})