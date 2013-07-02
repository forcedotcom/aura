({
    render: function outputPercentRender(cmp, helper) {
        var span = this.superRender()[0];
        var f = cmp.get("v.format");
        var num = cmp.get("v.value");
        var formatted;
        if (!$A.util.isUndefinedOrNull(num)) {
            var scale = cmp.get("v.valueScale");
            if (scale) {
                num *= Math.pow(10, scale);
            }
            if (!$A.util.isEmpty(f)) {
                var nf;
                try {
                    nf = $A.localizationService.getNumberFormat(f);
                } catch (e) {
                    formatted = "Invalid format attribute";
                    $A.log(e);
                }
                if (nf) {
                    formatted = nf.format(num);
                }
            } else {
                formatted = $A.localizationService.formatPercent(num);
            }
            span.innerText = formatted;
        }
        return span;
    },

    rerender: function outputPercentRerenderer(cmp, helper) {
        var val = cmp.getValue("v.value");
        var f = cmp.getValue("v.format");
        if (val.isDirty() || f.isDirty()) {
            var formatted = '';
            f = f.unwrap();
            val = val.unwrap();
            if (!$A.util.isUndefinedOrNull(val)) {
                var scale = cmp.get("v.valueScale");
                if (scale) {
                    num *= Math.pow(10, scale);
                }
                if (!$A.util.isEmpty(f)) {
                    var nf;
                    try {
                        nf = $A.localizationService.getNumberFormat(f);
                    } catch (e) {
                        formatted = "Invalid format attribute";
                        $A.log(e);
                    }
                    if (nf) {
                        formatted = nf.format(val);
                    }
                } else {
                    formatted = $A.localizationService.formatPercent(val);
                }
            }
            var span = cmp.find("span");
            span.getElement().innerText = formatted;
        }
    }
})