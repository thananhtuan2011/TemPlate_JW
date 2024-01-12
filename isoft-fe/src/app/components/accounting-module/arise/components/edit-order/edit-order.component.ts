import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import AppUtil from 'src/app/utilities/app-util';
import { LedgerService } from '../../../../../service/ledger.service';
import { EditOrderRequest } from '../../../../../models/ledger.model';
import { ManagementAriesExcelService } from '../../../../../service/management-aries-excel.service';

@Component({
    selector: 'app-edit-order',
    templateUrl: './edit-order.component.html',
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
export class EditOrderComponent implements OnInit {
    @Input('paramToGetLedgers') paramToGetLedgers: any = {};
    @Output() onCancel = new EventEmitter();

    editOrderForm: FormGroup = new FormGroup({});
    types: any[] = [
        { label: 'Giảm', value: 1 },
        { label: 'Tăng', value: 2 },
    ];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private ledgerService: LedgerService,
        private managementAriesExcelService: ManagementAriesExcelService,
    ) {
        this.editOrderForm = this.fb.group({
            editOrderStart: [null, Validators.required],
            editOrderEnd: [null, Validators.required],
            orderType: [null, Validators.required],
            editValue: [null, Validators.required],
        });
    }

    onReset() {
        this.editOrderForm.reset();
    }

    ngOnInit(): void {}

    onAuto() {
        this.managementAriesExcelService
            .updateOrginalVoucherNumber({
                startDate: null,
                endDate: null,
                type: this.paramToGetLedgers.document.code,
                month: this.paramToGetLedgers.filterMonth,
                isInternal: this.paramToGetLedgers.isInternal
            })
            .subscribe((res) => {
                if (res.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        detail: 'Cập nhật thành công',
                    });
                    this.onCancel.emit({});
                }
            });
    }

    async onSave() {
        if (
            this.editOrderForm.value.minIndex === 0 ||
            this.editOrderForm.value.maxIndex === 0 ||
            this.editOrderForm.value.value === 0
        ) {
            this.messageService.add({
                severity: 'error',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                ),
            });
            return;
        }
        const request: EditOrderRequest = {
            editOrderStart: Number(this.editOrderForm.value.editOrderStart),
            editOrderEnd: Number(this.editOrderForm.value.editOrderEnd),
            orderType: this.editOrderForm.value.orderType,
            editValue: Number(this.editOrderForm.value.editValue),
            isInternal: this.paramToGetLedgers.isInternal
        };
        const response = await this.ledgerService.editOrderLedger(request);
        if (response)
            this.messageService.add({
                severity: 'success',
                detail: AppUtil.translate(
                    this.translateService,
                    'success.update',
                ),
            });
    }
}
