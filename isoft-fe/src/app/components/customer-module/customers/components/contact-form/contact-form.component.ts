import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomerContactHistoryService } from '../../../../../service/customer-contact-history.service';
import { Message, MessageService } from 'primeng/api';
import AppUtil from '../../../../../utilities/app-util';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-contact-form',
    templateUrl: './contact-form.component.html',
    styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent implements OnInit {
    contactForm: FormGroup = new FormGroup({});
    customerId: number = 0;
    @Output() onSuccess = new EventEmitter<any>();
    display: boolean = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly contactHistoryService: CustomerContactHistoryService,
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
    ) {
        this.contactForm = this.fb.group({
            name: [''],
            position: [''],
            contact: [''],
        });
    }

    ngOnInit(): void {}

    onAdd() {
        let payload = this.contactForm.value;
        this.contactHistoryService
            .addNewContact(this.customerId, payload)
            .subscribe((res) => {
                this.onSuccess.emit(payload);
                this.display = false;
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.add_new',
                    ),
                });
            });
    }

    resetNewForm(customerId: number) {
        this.contactForm.reset();
        this.display = true;
        this.customerId = customerId;
    }
}
