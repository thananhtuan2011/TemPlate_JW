import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DocumentService } from 'src/app/service/document.service';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-convert-overreach',
    templateUrl: './convert-overreach.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-button,
                .p-button .p-button-icon-left,
                .p-datatable-scrollable-both .p-datatable-tbody > tr > td {
                    font-size: 0.875rem !important;
                }

                .p-inputtext,
                .p-inputgroup > .p-inputwrapper > .p-component > .p-inputtext {
                    width: 100px;
                }
            }
        `,
    ],
})
export class ConvertOverreachComponent implements OnInit {
    appUtil = AppUtil;
    @Output() onCancel = new EventEmitter();

    convertForm: FormGroup = new FormGroup({});
    types: any = {};

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private documentService: DocumentService,
    ) {
        this.convertForm = this.fb.group({
            documentType: ['', Validators.required],
            isDeleteData: [false, Validators.required],
            isNoiBo: [false, Validators.required],
            month: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.types = this.appUtil.getAriseReportTypes();
        this.getDocuments();
    }

    getDocuments() {
        this.documentService.getAllActiveDocument().subscribe((res: any) => {
            this.types.document = res.data;
        });
    }

    onSave() {
        console.log(this.convertForm.value);
        if (this.convertForm.invalid) {
            this.messageService.add({
                severity: 'error',
                detail: this.appUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                ),
            });
        }
        this.onCancel.emit({});
    }
}
