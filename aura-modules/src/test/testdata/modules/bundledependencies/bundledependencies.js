import { LightningElement } from 'lwc';

// APEX
import apexRefresh from '@salesforce/apex';
import apexMethod from '@salesforce/apex/MyClass.methodA';
import apexMethodNS from '@salesforce/apex/ns.MyClass.methodA';

// CONTENT ASSET URL
import contentAsset from '@salesforce/contentAssetUrl/foo';
import contentAssetNS from '@salesforce/contentAssetUrl/ns__foo';

// DESIGN SYSTEM
import designSystem from '@salesforce/designSystem/index.css';

// ACCESS CHECK
import accessCheck from '@salesforce/accessCheck/Record.recordDataInvalidation'; // will be module

// I18N
import i18N from '@salesforce/i18n/country';

// LABEL
import label from '@salesforce/label/foo';
import labelNS from '@salesforce/label/ns.foo';

// RESOURCE URL
import resource from '@salesforce/resourceUrl/foo';
import resourceNS from '@salesforce/resourceUrl/ns__foo';

// SCHEMA
import schema from '@salesforce/schema/MyObject__c';
import schemaNS from '@salesforce/schema/ns__MyObject__c';

// USER
import user from '@salesforce/user/id';


export default class GvpApp extends LightningElement {

}