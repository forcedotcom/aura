import { api, track, LightningElement } from "lwc";

export default class GlobalAttrsOverrideTests extends LightningElement {
    @track state = {};

    @api get ariaDescribedBy() {
        return this.state.ariaDescribedBy || null;
    }
    set ariaDescribedBy(value) {
        this.state.ariaDescribedBy = value;
    }

    @api get ariaLabelledby() {
        return this.state.ariaLabelledby || null;
    }
    set ariaLabelledby(value) {
        this.state.ariaLabelledby = value;
    }

    @api get tabIndex() {
        return this.state.tabIndex || null;
    }
    set tabIndex(value) {
        this.state.tabIndex = value;
    }

    @api get readOnly() {
        return this.state.readOnly || null;
    }
    set readOnly(value) {
        this.state.readOnly = value;
    }
}
