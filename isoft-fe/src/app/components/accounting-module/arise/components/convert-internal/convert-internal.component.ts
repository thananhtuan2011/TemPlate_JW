import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { MessageService } from 'primeng/api';
import { DocumentService } from 'src/app/service/document.service';
import { ManagementAriesExcelService } from 'src/app/service/management-aries-excel.service';
import AppUtil from 'src/app/utilities/app-util';
@Component({
    selector: 'app-convert-internal',
    templateUrl: './convert-internal.component.html',
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
export class ConvertInternalComponent implements OnInit {
    appUtil = AppUtil;
    @Output('onCancel') onCancel = new EventEmitter();
    @Input('selectedArises') selectedArises: any = [];
    @Input('paramToGetLedgers') paramToGetLedgers: any = {};

    convertForm: FormGroup = new FormGroup({});
    types: any = {};
    typeConverts: any = [
        { value: 1, label: 'Cả hai' },
        { value: 2, label: 'Hạch toán' },
        { value: 3, label: 'Nội bộ' },
        { value: 4, label: 'Lưu tạm' },
    ];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private documentService: DocumentService,
        private managementAriesExcelService: ManagementAriesExcelService,
    ) {
        this.convertForm = this.fb.group({
            documentType: ['', Validators.required],
            isDeleteData: [false, Validators.required],
            typeData: [1, Validators.required],
            month: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.types = this.appUtil.getAriseReportTypes();
        this.getDocuments();
    }

    getDocuments() {
        this.documentService.getAllActiveDocument().subscribe((res: any) => {
            this.types.document = res.data.sort((a, b) => a.stt - b.stt);
            this.convertForm.patchValue({
                month: this.types.month[0]?.value,
                documentType: this.types.document[0]?.code,
            });
        });
    }
    onSave() {
        this.convertForm.value.ledgerIds = this.paramToGetLedgers.selectIds;
        this.convertForm.value.fromTypeData = this.paramToGetLedgers.isInternal;
        if (!this.convertForm.value.ledgerIds.length) {
            this.messageService.add({
                severity: 'error',
                detail: 'Vui lòng chọn phát sinh trên lưới',
            });
            return;
        }
        this.managementAriesExcelService
            .transferInfoLedger(this.convertForm.value)
            .subscribe((res) => {
                if (res.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        detail: 'Cập nhật thành công',
                    });
                    this.onCancel.emit({});
                } else
                    this.messageService.add({
                        severity: 'error',
                        detail: res.data,
                    });
            });
    }
}
