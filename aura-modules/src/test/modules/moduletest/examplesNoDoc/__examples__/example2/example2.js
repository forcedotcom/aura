import { LightningElement } from 'lwc';
import { hello } from 'e-exampleLib';

export default class Example2 extends LightningElement {
    text = hello;    
}