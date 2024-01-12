import {Component, EventEmitter, Input, OnInit, Output, ViewChild,} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import * as moment from 'moment';
import {environment} from 'src/environments/environment';
import {CustomerJob} from 'src/app/models/customer-job.model';
import {CustomerStatus} from 'src/app/models/customer-status.model';
import {Customer} from 'src/app/models/customer.model';
import {CustomerContactHistoryService} from 'src/app/service/customer-contact-history.service';
import {MessageService} from 'primeng/api';
import {TranslateService} from '@ngx-translate/core';
import {TypeData} from 'src/app/models/common.model';
import {CustomerJobService} from 'src/app/service/customer-job.service';
import {CustomerStatusService} from 'src/app/service/customer-status.service';
import {ContactFormComponent} from '../contact-form/contact-form.component';

@Component({
    selector: 'app-contact-history-form',
    templateUrl: './contact-history-form.component.html',
    styleUrls: ['contact-history-form.component.scss'],
})
export class ContactHistoryFormComponent implements OnInit {
    public appConstant = AppConstant;
    public appUtil = AppUtil;

    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();

    @ViewChild('contactFormRef') contactFormRef: ContactFormComponent;
    displayJob = false;
    displayStatus = false;

    customerStatus: CustomerStatus[] = [];
    customerJobs: CustomerJob[] = [];
    customer: Customer;

    serverURLImage = environment.serverURLImage;

    title: string = '';
    customerForm: FormGroup = new FormGroup({});

    countryCodes: any[] = [];

    isSubmitted = false;
    isInvalidForm = false;
    selectedFile: any;

    types: any = {};
    contacts: any[] = [];
    filteredContacts: any[];

    constructor(
        private fb: FormBuilder,
        private readonly customerContactHistory: CustomerContactHistoryService,
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly customerStatusService: CustomerStatusService,
        private readonly customerJobService: CustomerJobService
    ) {
        this.customerForm = this.fb.group({
            id: [''],
            contact: ['', [Validators.required]],
            contactObject: ['', [Validators.required]],
            phone: [''],
            position: [''],
            startTime: ['', [Validators.required]],
            endTime: ['', [Validators.required]],
            nextTime: ['', [Validators.required]],
            customerId: [''],
            statusId: ['', [Validators.required]],
            jobsId: ['', [Validators.required]],
            exchangeContent: [''],
            fileLink: [''],
        });
    }

    onReset(customer?) {
        this.isInvalidForm = false;
        this.customerForm.reset();
        if (customer) {
            this.customer = customer;
            this.customerForm.controls['contact'].setValue(customer.name);
            this.customerForm.controls['phone'].setValue(customer.phone);
            this.customerForm.controls['startTime'].setValue(new Date());
            this.customerForm.controls['endTime'].setValue(new Date());
            this.customerForm.controls['nextTime'].setValue(new Date());
            this.getContacts(this.customer.id);
        }
    }

    ngOnInit() {
        this.getCustomerJobs();
        this.getCustomerStatus();
        this.countryCodes = AppUtil.getCountries();
        this.types = this.appUtil.getUserTypes();
    }

    checkValidValidator(fieldName: string) {
        return ((this.customerForm.controls[fieldName].dirty ||
            this.customerForm.controls[fieldName].touched) &&
            this.customerForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.customerForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.customerForm.controls[fieldNames[i]].dirty ||
                    this.customerForm.controls[fieldNames[i]].touched) &&
                    this.customerForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.customerForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        let newData = this.cleanObject(
            AppUtil.cleanObject(this.customerForm.value),
        );
        this.customerContactHistory
            .createCustomerContactHistory(newData)
            .subscribe((response: any) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.create',
                    ),
                });
                this.onCancel.emit({});
            });
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        newData.districtId = parseInt(newData.districtId) || 0;
        newData.provinceId = parseInt(newData.provinceId) || 0;
        newData.customerClassficationId =
            parseInt(newData.customerClassficationId) || 0;
        newData.startTime = this.appUtil.formatLocalTimezone(
            moment(
                newData.startTime && newData.startTime !== 'Invalid date'
                    ? newData.startTime
                    : new Date(),
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        newData.endTime = this.appUtil.formatLocalTimezone(
            moment(
                newData.endTime && newData.endTime !== 'Invalid date'
                    ? newData.endTime
                    : new Date(),
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );
        newData.nextTime = this.appUtil.formatLocalTimezone(
            moment(
                newData.nextTime && newData.nextTime !== 'Invalid date'
                    ? newData.nextTime
                    : new Date(),
                this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(this.appConstant.FORMAT_DATE.T_DATE),
        );

        const formData = new FormData();
        if (newData.id) {
            formData.append('id', String(newData.id));
        }
        formData.append('fileLink', this.selectedFile);
        formData.append('startTime', newData.startTime);
        formData.append('endTime', newData.endTime);
        formData.append('nextTime', newData.nextTime);
        if (newData.exchangeContent) {
            formData.append('exchangeContent', newData.exchangeContent);
        }
        if (newData.position) {
            formData.append('position', newData.position);
        }
        formData.append('statusId', String(newData.statusId));
        formData.append('statusName', newData.statusName);
        formData.append('jobsId', String(newData.jobsId));
        formData.append('jobsName', newData.jobsName);
        formData.append('contact', newData.contact);
        formData.append('customerId', String(this.customer.id));
        return formData;
    }

    getDayOfWeek(date: any) {
        return new Date(date.year, date.month, date.day).getDay();
    }

    doAttachFile(event: any): void {
        if (event) {
            this.selectedFile = event.target?.files[0];
        }
    }

    setEmptyData(columnName) {
        this.customerForm.controls[columnName].setValue('');
    }

    getCustomerStatus() {
        this.customerStatusService
            .getCustomerStatus({
                page: 0,
                pageSize: 9999,
            })
            .subscribe((response: TypeData<any>) => {
                this.customerStatus = response.data;
            });
    }

    getCustomerJobs() {
        this.customerJobService.getAllCustomerJob().subscribe((res) => {
            this.customerJobs = res.data;
        });
    }

    // Contact
    getContacts(customerId: number) {
        this.customerContactHistory
            .getCustomerContacts(customerId)
            .subscribe((contacts) => {
                this.contacts = contacts;
            });
    }
    filterContact($event: any) {
        let query = $event.query;
        this.filteredContacts = this.contacts.filter((contact) =>
            contact.name.toLowerCase().includes(query.toLowerCase()),
        );
    }
    fillOutContactInfo(contact) {
        if (contact == null) {
            return;
        }
        // Fill out contact info when selected contact
        this.customerForm.controls['position'].patchValue(contact.position);
        this.customerForm.controls['contact'].patchValue(contact.name);
        this.customerForm.controls['contactObject'].patchValue(contact);

        this.customerForm.patchValue({
            position: contact.position,
            contact: contact.name,
            phone: contact.contact,
            contactObject: contact,
        });
    }

    addNewContact() {
        this.contactFormRef.resetNewForm(this.customer.id);
    }
    onAddNewContactSuccess(contact: any) {
        this.contacts.push(contact);
        this.fillOutContactInfo(contact);
    }
}
