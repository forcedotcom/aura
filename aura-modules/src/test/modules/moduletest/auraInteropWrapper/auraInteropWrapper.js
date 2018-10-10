// eslint-disable-next-line lwc/no-compat-create
import { createComponent, renderComponent } from "aura";
import { LightningElement, api } from "lwc";

export default class InteropWrapper extends LightningElement {
    @api async;
    @api logId;
    wrapperRendered = false;

    createWrapper() {
        const container = this.template.querySelector('.container');
        createComponent('test:testAppEventPhasesEmitter', { logId: this.logId }, (auraWrapper) => {
            renderComponent(auraWrapper, container);
        });
    }

    get isAsync() {
        return !!this.async;
    }

    renderedCallback() {
        if (!this.wrapperRendered) {
            this.wrapperRendered = true;
            if (this.async) {
                setTimeout(() => {
                    this.createWrapper();
                }, 0);
            } else {
                this.createWrapper();
            }
        }
    }
}
