({
    render: function (cmp) {
        var ret = this.superRender();
        var element = ret[3];
        element.setAttribute("data-refid", "keyRef");
        element.setAttribute("data-keyRef", cmp.get("v.innerTextValue"));
        return ret;
    }
})