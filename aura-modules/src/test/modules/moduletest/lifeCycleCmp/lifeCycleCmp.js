import { LightningElement, api, dangerousObjectMutation } from "lwc";

export default class LifeCycleCmp extends LightningElement {
    @api lifeCycleLog = [];

    connectedCallback() {
        dangerousObjectMutation(this.lifeCycleLog).push('module connected');
    }

    renderedCallback() {
        dangerousObjectMutation(this.lifeCycleLog).push('module rendered');
    }
}

