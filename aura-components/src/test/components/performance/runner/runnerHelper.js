({
    urlToJson: function (historyConfig) {
        historyConfig || (historyConfig = {});
        var hash       = historyConfig.hash || window.location.hash,
            perfConfig = {};

        if (hash.length) {
            perfConfig.componentConfig = JSON.parse(decodeURIComponent(hash.substring(1))) || {};
        }
        perfConfig.options = this.queryStringToJson(historyConfig.queryString) || {};

        if (perfConfig.options.componentDef) {
            perfConfig.componentConfig = { descriptor: perfConfig.options.componentDef };
        }

        return perfConfig;

    },
    queryStringToJson: function (queryString) {
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = queryString || window.location.search.substring(1),
            urlParams = {};

        while (match = search.exec(query)) {
           urlParams[decode(match[1])] = decode(match[2]);
        }

        return urlParams;
    }
})