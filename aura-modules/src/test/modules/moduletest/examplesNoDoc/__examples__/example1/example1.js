import { LightningElement } from 'lwc';
import { hello } from 'e-exampleLib';

export default class Example1 extends LightningElement {
    text = hello;    
}