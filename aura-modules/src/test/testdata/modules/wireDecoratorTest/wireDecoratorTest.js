import { LightningElement, api, wire } from "lwc";
import { getRecord } from 'x-record-api';

export default class Bar extends LightningElement {
    @api recordId;
    @wire(getRecord, {id: '$recordId', isRegistered: true})
    data;
}