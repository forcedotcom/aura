({
    querySelector: function(el, selectors, results) {
        if (selectors && results) {
            for (var i = 0; i < selectors.length; i++) {
                var sel = selectors[i];
                results[sel] = el.querySelector(sel);
            }
        }
    }
})