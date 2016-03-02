({
    onclick: function (cmp) {
        if (cmp.isValid()) {
            cmp.getConcreteComponent().select();
        }
    }
})// eslint-disable-line semi