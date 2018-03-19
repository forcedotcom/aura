import { api, track, Element } from 'engine';

export default class GlobalAttrsOverrideTests extends Element {
    @track state = {};

    @api get ariaDescribedBy() {
        return this.state.ariaDescribedBy || null;
    }
    @api set ariaDescribedBy(value) {
        this.state.ariaDescribedBy = value;
    }

    @api get ariaLabelledby() {
        return this.state.ariaLabelledby || null;
    }
    @api set ariaLabelledby(value) {
        this.state.ariaLabelledby = value;
    }

    @api get tabIndex() {
        return this.state.tabIndex || null;
    }
    @api set tabIndex(value) {
        this.state.tabIndex = value;
    }

    @api get readOnly() {
        return this.state.readOnly || null;
    }
    @api set readOnly(value) {
        this.state.readOnly = value;
    }
}
