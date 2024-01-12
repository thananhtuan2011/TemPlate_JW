import { Component, OnInit } from '@angular/core';
import { InvoiceDeclarationModel } from '../../../../models/invoice-declaration.model';
import { Page, TypeData } from '../../../../models/common.model';
import { InvoiceDeclarationService } from '../../../../service/invoice-declaration.service';
import AppUtil from '../../../../utilities/app-util';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import AppConstants from '../../../../utilities/app-constants';
import AppConstant from '../../../../utilities/app-constants';

@Component({
    selector: 'app-instance-bill',
    templateUrl: './instance-bill.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-datatable.p-datatable-gridlines
                    .p-datatable-thead
                    > tr
                    > th {
                    background: #dbebfb;
                    border-color: #707070;
                    text-align: center;
                }

                .p-datatable.p-datatable-gridlines
                    .p-datatable-tbody
                    > tr
                    > td {
                    border-color: #707070;
                    text-align: center;
                }
            }
        `,
    ],
})
export class InstanceBillComponent implements OnInit {
    appConstant = AppConstants;
    loading: boolean = false;
    newInvoice: InvoiceDeclarationModel = {};
    result: TypeData<InvoiceDeclarationModel> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };
    param: Page = {
        page: 1,
        pageSize: 10,
        searchText: '',
    };
    clonedInvoices: { [s: string]: InvoiceDeclarationModel } = {};

    constructor(
        private invoiceDeclarationService: InvoiceDeclarationService,
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
    ) {}

    ngOnInit(): void {}

    getInvoices(event?: any): void {
        this.param.page =
            Math.floor((event?.first || 0) / (event?.rows || 1)) + 1;
        this.param.pageSize = event.rows || 20;
        this.loading = true;
        this.invoiceDeclarationService
            .getInvoiceDeclarations(this.param)
            .subscribe((res) => {
                this.loading = false;
                this.result = res;
            });
        console.log(this.result);
    }

    onSaveNew(): void {
        if (
            !this.newInvoice.name ||
            !this.newInvoice.templateSymbol ||
            !this.newInvoice.invoiceSymbol
        )
            return;
        this.invoiceDeclarationService
            .addInvoiceDeclaration(this.newInvoice)
            .subscribe(
                (res) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.create',
                        ),
                    });
                    this.newInvoice = {};
                    this.getInvoices();
                },
                (err) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.0',
                        ),
                    });
                },
            );
    }

    onRowEditDelete(item): void {
        this.invoiceDeclarationService
            .deleteInvoiceDeclaration(item.id)
            .subscribe(
                (res) => {
                    delete this.clonedInvoices[item.id];
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.delete',
                        ),
                    });
                    this.getInvoices();
                },
                (err) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.0',
                        ),
                    });
                },
            );
    }

    numberWithCommas(n) {
        return n?.toString()?.replace(/\B(?!\.\d*)(?=(\d{3})+(?!\d))/g, '.');
    }

    onRowEditInit(item: any): any {
        this.result.data[item.id] = { ...item };
    }

    onRowEditSave(item: any, ri: any): any {
        this.invoiceDeclarationService.updateInvoiceDeclaration(item).subscribe(
            (res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
                this.result.data[ri] = res.data;
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
    }

    onRowEditCancel(item: any, index: number) {
        this.result.data[index] = this.result.data[item.id];
        delete this.result.data[item.id];
    }

    onRetsetData(item: any, ri: any) {
        this.invoiceDeclarationService
            .resetInvoiceDeclaration(item.id)
            .subscribe(
                (res) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.update',
                        ),
                    });
                    this.result.data[ri] = res.data;
                },
                (err) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.0',
                        ),
                    });
                },
            );
    }

    onSyncData(item: any, ri: any) {
        this.invoiceDeclarationService.syncInvoiceWithLedger(item.id).subscribe(
            (res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
                this.result.data[ri] = res.data;
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
    }

    protected readonly AppConstant = AppConstant;
}
