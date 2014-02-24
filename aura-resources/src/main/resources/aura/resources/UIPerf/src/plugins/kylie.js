/*
 * Copyright (c) 2013, Salesforce.com. All rights reserved.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE.txt file for terms.
 */

/*jshint sub:true*/

/**
 * Config plugin config.js given an ID should generate something like below
 * BOOMR_configt=new Date().getTime();BOOMR.init( {log: null, site_domain: "sample.org", BW: {enabled: false}, IPv6: {
 * enabled: false}, DNS: {enabled:f alse}, user_ip: "xxx.xxx.xxx.xxx"} );
 * 
 * @private
 */
function kylierun() {
    // First make sure BOOMR is actually defined. It's possible that your plugin is loaded before boomerang, in which case
    // you'll need this.
    BOOMR = BOOMR || {};
    BOOMR.plugins = BOOMR.plugins || {};

    /**
     * @struct
     * @private
     * @const
     */
    var impl = {
        /**
         * !Document
         */
        doc: BOOMR.window.document,
        /**
         * @const
         * @type {!string}
         */
        script: 'script',
        complete: false,
        pass: false,
        start_ts: undefined,
        done: function () {
            if (!impl.complete) {
                impl.complete = true;
                impl.pass = false;
                BOOMR.sendBeacon();
            }
        },
        run: function () {
            var k = impl.doc.getElementsByTagName(impl.script)[0],
                d = impl.doc.createElement(impl.script);
            impl.start_ts = new Date().getTime();
            d.src = BOOMR.window["BOOMR_cURL"];
            k.parentNode.insertBefore(d, k);
        }
    };

    /**
     * @struct
     * @const
     * @type {!IPlugin}
     */
    var kylie = BOOMR.plugins.Kylie =  /** @lends {kylie} */ {
        /**
         * @return {!IPlugin}
         */
        init: function () {

            if (impl.complete) {
                return kylie;
            }
            // is_complete returns true only after executing the following code
            // let it pass the first time the plugin initializes ..so it can
            // subsribe to page_ready
            if (impl.pass) {

                setTimeout(impl.done, 10);
                /* Time taken to download, parse and execut the config JS */
                BOOMR.addVar('t_cjs', new Date().getTime() - impl.start_ts);
                if (perfOptions["BOOMR_configt"]) {
                    /* Time taken until the first byte of config JS */
                    BOOMR.addVar('t_cfb', perfOptions["BOOMR_configt"] - impl.start_ts);
                    delete perfOptions["BOOMR_configt"];
                }
                return kylie;
            }
            impl.pass = true;
            // the config js is triggered to download async after page_ready
            BOOMR.subscribe('page_ready', impl.run, null, null);
            return kylie;
        },
        /**
         * @return {!boolean}
         */
        is_complete : function () {
            return impl.complete;
        }
    };
}
kylierun();

/**
 * Disable all plugins by default and only enable the needed through the config plugin Only SFDC config plugin, RT
 * plugins are enabled default
 */
BOOMR.init({
    log: null,
    wait: true,
    Kylie: {
        enabled: false
    },
    autorun: false
});

//This is to get the end time of Kylie JS parsing
BOOMR.t_end = new Date().getTime(); // end of config plugin