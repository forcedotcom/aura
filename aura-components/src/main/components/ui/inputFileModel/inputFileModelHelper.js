({
    setDefaultModelProps : function (cmp) {
        var defaultProps = this.getDefaultProps(cmp);
        cmp.set('v.model', defaultProps);
    },
    getDefaultProps : function (cmp) {
        return {
            inputFileElement : this.createInputFileElementAndSetListener(cmp)
        }
    },
    createInputFileElementAndSetListener : function (cmp) {
        var fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');

        // setting listen input change event
        setTimeout(function () {
            fileSelector.addEventListener('change', this.handleChangeEvent.bind(this,cmp));
        }.bind(this),0);

        return fileSelector;
    },
    handleChangeEvent : function (cmp, event) {
        // firing change event
        cmp.getEvent('modelHasChange').setParams({
            files : cmp.get('v.model').inputFileElement.files
        }).fire();
    }


})