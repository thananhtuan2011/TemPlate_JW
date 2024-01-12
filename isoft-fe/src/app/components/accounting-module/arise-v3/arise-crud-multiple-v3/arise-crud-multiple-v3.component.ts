import {
    AfterViewInit,
    Component,
    Input,
    OnInit,
    ViewChild,
} from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { FormArray, FormBuilder } from '@angular/forms';
import { IConfigAriseDocumentBehaviourDto } from 'src/app/models/config-arise.model';
import { AriseCrudStockComponent } from '../components/arise-crud-stock/arise-crud-stock.component';
import { AriseCrudImportProductComponent } from '../components/arise-crud-import-product/arise-crud-import-product.component';
import { AriseCrudTaxComponent } from '../components/arise-crud-tax/arise-crud-tax.component';
import { AriseCrudDeliveryComponent } from '../components/arise-crud-delivery/arise-crud-delivery.component';
import { AriseCrudVatComponent } from '../components/arise-crud-vat/arise-crud-vat.component';
import { ContextMenu } from 'primeng/contextmenu';

@Component({
    selector: 'app-arise-crud-multiple-v3',
    templateUrl: './arise-crud-multiple-v3.component.html',
    styleUrls: ['./arise-crud-multiple-v3.component.scss'],
})
export class AriseCrudMultipleV3Component implements OnInit, AfterViewInit {
    @Input('listConfig') listConfig: IConfigAriseDocumentBehaviourDto[] = [];
    @Input('chartOfAccounts') chartOfAccounts: any[];
    @ViewChild('ariseCrudStockComponent')
    ariseCrudStockComponent!: AriseCrudStockComponent;
    @ViewChild('ariseCrudProductComponent')
    ariseCrudProductComponent!: AriseCrudImportProductComponent;
    @ViewChild('ariseCrudTaxComponent')
    ariseCrudTaxComponent!: AriseCrudTaxComponent;
    @ViewChild('ariseCrudDeliveryComponent')
    ariseCrudDeliveryComponent!: AriseCrudDeliveryComponent;
    @ViewChild('ariseCrudVatComponent')
    ariseCrudVatComponent!: AriseCrudVatComponent;
    @ViewChild('contextMenu') contextMenuAriseV3Product: ContextMenu;

    tabs: MenuItem[] = [
        {
            id: '0',
            label: 'Nhập hàng',
            icon: 'pi pi-fw pi-table',
            command: (event) => this.onTabSelected(event),
        },
        {
            id: '1',
            label: 'VAT',
            icon: 'pi pi-fw pi-table',
            command: (event) => this.onTabSelected(event),
        },
        {
            id: '2',
            label: 'Thuế nhập khẩu',
            icon: 'pi pi-fw pi-table',
            command: (event) => this.onTabSelected(event),
        },
        {
            id: '3',
            label: 'Chi phí hàng về kho',
            icon: 'pi pi-fw pi-table',
            command: (event) => this.onTabSelected(event),
        },
        {
            id: '4',
            label: 'Phân bổ phí hàng về kho',
            icon: 'pi pi-fw pi-table',
            command: (event) => this.onTabSelected(event),
        },
    ];

    activeItem: MenuItem = this.tabs[0];

    constructor(
        private readonly messageService: MessageService,
        private readonly fb: FormBuilder,
    ) {}
    ngAfterViewInit(): void {}

    validateForm(): boolean {
        if (this.ariseCrudProductComponent.ledgerTableForm.invalid)
            return false;
        // duyển mảng
        for (
            let index = 0;
            index < this.ariseCrudProductComponent.ledgers.controls.length;
            index++
        ) {
            // Nếu chi tiết 1 có con và chi tiết 2 có dữ liệu
            if (
                this.ariseCrudProductComponent.isDebitDetailCodeFirstHasDetails(
                    index,
                ) &&
                !this.ariseCrudProductComponent.isDebitDetailCodeSecondHas(
                    index,
                )
            ) {
                return false;
            }
            if (
                this.ariseCrudProductComponent.isCreditDetailCodeFirstHasDetails(
                    index,
                ) &&
                !this.ariseCrudProductComponent.isCreditDetailCodeSecondHas(
                    index,
                )
            )
                return false;
            // nếu tài khoản có/nợ có con và chi tiết 1 có dữ liệu
            if (
                this.ariseCrudProductComponent.isDebitCodeHasDetails(index) &&
                !this.ariseCrudProductComponent.isDebitDetailCodeFirstHas(index)
            )
                return false;
            if (
                this.ariseCrudProductComponent.isCreditCodeHasDetails(index) &&
                !this.ariseCrudProductComponent.isCreditDetailCodeFirstHas(
                    index,
                )
            )
                return false;
            // nếu tài khoản nợ/có không có dữ liệu
            if (
                [
                    this.ariseCrudProductComponent.isDebitCodeHas(index),
                    this.ariseCrudProductComponent.isCreditCodeHas(index),
                ].includes(false)
            )
                return false;
        }

        // for (let index = 0; index < this.ariseCrudVatComponent.ledgers.controls.length; index++) {
        //     // Nếu chi tiết 1 có con và chi tiết 2 có dữ liệu
        //     if (this.ariseCrudVatComponent.isDebitDetailCodeFirstHasDetails(index) && !this.ariseCrudVatComponent.isDebitDetailCodeSecondHas(index)) {
        //         return false
        //     };
        //     if (this.ariseCrudVatComponent.isCreditDetailCodeFirstHasDetails(index) && !this.ariseCrudVatComponent.isCreditDetailCodeSecondHas(index)) return false;
        //     // nếu tài khoản có/nợ có con và chi tiết 1 có dữ liệu
        //     if (this.ariseCrudVatComponent.isDebitCodeHasDetails(index) && !this.ariseCrudVatComponent.isDebitDetailCodeFirstHas(index)) return false;
        //     if (this.ariseCrudVatComponent.isCreditCodeHasDetails(index) && !this.ariseCrudVatComponent.isCreditDetailCodeFirstHas(index)) return false;
        //     // nếu tài khoản nợ/có không có dữ liệu
        //     if ([this.ariseCrudVatComponent.isDebitCodeHas(index), this.ariseCrudVatComponent.isCreditCodeHas(index)].includes(false)) return false;
        // }

        // for (let index = 0; index < this.ariseCrudTaxComponent.ledgers.controls.length; index++) {
        //     // Nếu chi tiết 1 có con và chi tiết 2 có dữ liệu
        //     if (this.ariseCrudTaxComponent.isDebitDetailCodeFirstHasDetails(index) && !this.ariseCrudTaxComponent.isDebitDetailCodeSecondHas(index)) {
        //         return false
        //     };
        //     if (this.ariseCrudTaxComponent.isCreditDetailCodeFirstHasDetails(index) && !this.ariseCrudTaxComponent.isCreditDetailCodeSecondHas(index)) return false;
        //     // nếu tài khoản có/nợ có con và chi tiết 1 có dữ liệu
        //     if (this.ariseCrudTaxComponent.isDebitCodeHasDetails(index) && !this.ariseCrudTaxComponent.isDebitDetailCodeFirstHas(index)) return false;
        //     if (this.ariseCrudTaxComponent.isCreditCodeHasDetails(index) && !this.ariseCrudTaxComponent.isCreditDetailCodeFirstHas(index)) return false;
        //     // nếu tài khoản nợ/có không có dữ liệu
        //     if ([this.ariseCrudTaxComponent.isDebitCodeHas(index), this.ariseCrudTaxComponent.isCreditCodeHas(index)].includes(false)) return false;
        // }

        // for (let index = 0; index < this.ariseCrudDeliveryComponent.ledgers.controls.length; index++) {
        //     // Nếu chi tiết 1 có con và chi tiết 2 có dữ liệu
        //     if (this.ariseCrudDeliveryComponent.isDebitDetailCodeFirstHasDetails(index) && !this.ariseCrudDeliveryComponent.isDebitDetailCodeSecondHas(index)) {
        //         return false
        //     };
        //     if (this.ariseCrudDeliveryComponent.isCreditDetailCodeFirstHasDetails(index) && !this.ariseCrudDeliveryComponent.isCreditDetailCodeSecondHas(index)) return false;
        //     // nếu tài khoản có/nợ có con và chi tiết 1 có dữ liệu
        //     if (this.ariseCrudDeliveryComponent.isDebitCodeHasDetails(index) && !this.ariseCrudDeliveryComponent.isDebitDetailCodeFirstHas(index)) return false;
        //     if (this.ariseCrudDeliveryComponent.isCreditCodeHasDetails(index) && !this.ariseCrudDeliveryComponent.isCreditDetailCodeFirstHas(index)) return false;
        //     // nếu tài khoản nợ/có không có dữ liệu
        //     if ([this.ariseCrudDeliveryComponent.isDebitCodeHas(index), this.ariseCrudDeliveryComponent.isCreditCodeHas(index)].includes(false)) return false;
        // }

        // for (let index = 0; index < this.ariseCrudStockComponent.ledgers.controls.length; index++) {
        //     // Nếu chi tiết 1 có con và chi tiết 2 có dữ liệu
        //     if (this.ariseCrudStockComponent.isDebitDetailCodeFirstHasDetails(index) && !this.ariseCrudStockComponent.isDebitDetailCodeSecondHas(index)) {
        //         return false
        //     };
        //     if (this.ariseCrudStockComponent.isCreditDetailCodeFirstHasDetails(index) && !this.ariseCrudStockComponent.isCreditDetailCodeSecondHas(index)) return false;
        //     // nếu tài khoản có/nợ có con và chi tiết 1 có dữ liệu
        //     if (this.ariseCrudStockComponent.isDebitCodeHasDetails(index) && !this.ariseCrudStockComponent.isDebitDetailCodeFirstHas(index)) return false;
        //     if (this.ariseCrudStockComponent.isCreditCodeHasDetails(index) && !this.ariseCrudStockComponent.isCreditDetailCodeFirstHas(index)) return false;
        //     // nếu tài khoản nợ/có không có dữ liệu
        //     if ([this.ariseCrudStockComponent.isDebitCodeHas(index), this.ariseCrudStockComponent.isCreditCodeHas(index)].includes(false)) return false;
        // }
        return true;
    }

    ngOnInit(): void {}

    onF10(data: any) {
        if (!this.ariseCrudProductComponent.validateForm()) {
            this.messageService.add({
                severity: 'error',
                detail: 'Dữ liệu nhập chưa chính xác',
            });
            return;
        }

        const totalProduct =
            this.ariseCrudProductComponent.ledgers.controls.reduce(
                (accumulator, group: any) => {
                    return accumulator + group.controls['amount']?.value;
                },
                0,
            );
        const totalVat = this.ariseCrudVatComponent.ledgers.controls.reduce(
            (accumulator, group: any) => {
                return accumulator + group.controls['amount']?.value;
            },
            0,
        );
        const total = Number.parseInt(totalProduct) + Number.parseInt(totalVat);

        if (this.activeTabId == '0') {
            const amount =
                (Number(total || 0) * Number(data?.percent || 0)) / 100;
            data.amount = amount;
            const lastIndex =
                this.ariseCrudProductComponent.ledgers.controls.length - 1;
            let lastData =
                this.ariseCrudProductComponent.ledgers.controls[lastIndex]
                    .value;
            if (data.credit) {
                data.credit = data ? data.credit : null;

                data.creditDetailFirst = data ? data.creditFirst : null;

                data.creditDetailSecond = data ? data.creditSecond : null;
            } else {
                data.credit = lastData?.creditCode;

                data.creditDetailFirst = lastData?.creditDetailCodeFirst;

                data.creditDetailSecond = lastData?.creditDetailCodeSecond;
            }

            if (data.debit) {
                data.credit = data ? data.credit : null;

                data.debitDetailFirst = data ? data.creditFirst : null;

                data.debitDetailSecond = data ? data.creditSecond : null;
            } else {
                data.debit = lastData?.debitCode;

                data.debitDetailFirst = lastData?.debitDetailCodeFirst;

                data.debitDetailSecond = lastData?.debitDetailCodeSecond;
            }

            this.ariseCrudProductComponent.addNewFormLedger(data);
        } else if (this.activeTabId == '1') {
            const amount =
                (Number(total || 0) * Number(data?.percent || 0)) / 100;
            data.amount = amount;

            const lastIndexTab1 =
                this.ariseCrudVatComponent.ledgers.controls.length - 1;
            const lastDataTab1 =
                this.ariseCrudVatComponent.ledgers.controls[lastIndexTab1]
                    .value;

            const lastIndexTab0 =
                this.ariseCrudProductComponent.ledgers.controls.length - 1;
            let lastDataTab0 =
                this.ariseCrudProductComponent.ledgers.controls[lastIndexTab0]
                    .value;

            let lastData;

            if (lastDataTab1.creditCode && lastDataTab0.debitCode) {
                lastData = lastDataTab0;
            } else {
                lastData = lastDataTab0;
            }

            if (data.credit) {
                data.credit = data ? data.credit : null;

                data.creditDetailFirst = data ? data.creditFirst : null;

                data.creditDetailSecond = data ? data.creditSecond : null;
            } else {
                data.credit = lastData?.creditCode;

                data.creditDetailFirst = lastData?.creditDetailCodeFirst;

                data.creditDetailSecond = lastData?.creditDetailCodeSecond;
            }

            if (data.debit) {
                data.credit = data ? data.credit : null;

                data.creditDetailFirst = data ? data.creditFirst : null;

                data.creditDetailSecond = data ? data.creditSecond : null;
            } else {
                data.debit = lastData?.debitCode;

                data.debitDetailFirst = lastData?.debitDetailCodeFirst;

                data.debitDetailSecond = lastData?.debitDetailCodeSecond;
            }

            let controls = this.ariseCrudVatComponent.getControlsByIndex(0);
            if (
                (controls['debitCode'].value == '' ||
                    controls['debitCode'].value == null) &&
                (controls['creditCode'].value == '' ||
                    controls['creditCode'].value == null)
            ) {
                this.ariseCrudVatComponent.buildFormTable([data]);
            } else {
                this.ariseCrudVatComponent.addNewFormLedger(data);
            }
        }
    }

    onF2() {
        if (this.activeTabId == '0') {
            this.ariseCrudProductComponent.addNewFormLedger();
        } else if (this.activeTabId == '3') {
            this.ariseCrudDeliveryComponent.addNewFormLedger();
        }
    }

    onF3() {
        const ledgersProduct = this.ariseCrudProductComponent.ledgers.value;
        if (!(ledgersProduct && this.allowOnF3)) {
            return;
        }
        if (this.activeTabId === '2') {
            this.syncDataForTaxComponent(ledgersProduct);
        } else {
            this.syncDataForStockComponent(ledgersProduct);
        }
    }

    get allowOnF3() {
        return this.activeTabId === '2' || this.activeTabId === '4';
    }

    resetLedgersArray(ledgerArray: FormArray) {
        let ids = [];
        if (ledgerArray.length > 0) {
            for (let index = 0; index < ledgerArray.length; index++) {
                let id = ledgerArray.controls[index]?.get('id')?.value;
                ledgerArray.removeAt(index);
                index--;
                if (id) {
                    ids.push(id);
                }
            }
        }
        return ids;
    }

    syncDataForTaxComponent(ledgers: any[]) {
        let ids = this.resetLedgersArray(this.ariseCrudTaxComponent.ledgers);
        ledgers.forEach((item, index) => {
            const obj: any = {};
            obj.creditCode = item.creditCode;
            obj.creditDetailCodeFirst = item.creditDetailCodeFirst;
            obj.creditDetailCodeSecond = item.creditDetailCodeSecond;
            obj.debitCode = item.debitCode;
            obj.debitDetailCodeFirst = item.debitDetailCodeFirst;
            obj.debitDetailCodeSecond = item.debitDetailCodeSecond;
            obj.projectCode = item.projectCode;
            obj.depreciaMonth = item.depreciaMonth;
            obj.orginalCurrency = item.orginalCurrency;
            obj.exchangeRate = item.exchangeRate;
            obj.quantity = item.quantity;
            obj.unitPrice = item.unitPrice;
            obj.amountImportWarehouse = item.amount;
            obj.id = ids[index];
            obj.type = [''];
            obj.month = [0];
            obj.voucherNumber = [''];
            obj.orginalAddress = [''];
            obj.orginalVoucherNumber = [''];
            obj.orginalBookDate = [];
            obj.referenceVoucherNumber = [''];
            obj.referenceBookDate = [];
            obj.referenceFullName = [''];
            obj.referenceAddress = [''];
            obj.isInternal = [0];
            obj.attachVoucher = [''];
            obj.invoiceCode = [''];
            obj.invoiceName = [''];
            obj.invoiceTaxCode = [''];
            obj.invoiceAddress = [''];
            obj.invoiceProductItem = [''];
            obj.invoiceAdditionalDeclarationCode = [''];
            obj.invoiceSerial = [''];
            obj.invoiceNumber = [''];
            obj.invoiceDate = [];
            obj.debitWarehouse = [''];
            obj.creditWarehouse = [''];
            //payer
            obj.orginalCompanyName = [''];
            //description
            obj.orginalDescription = [''];
            obj.percentImportTax = 0;
            obj.amountVat = 0;
            obj.percentTransport = 0;
            obj.amountTransport = 0;
            this.ariseCrudTaxComponent.ledgers.push(this.fb.group(obj));
        });
    }

    syncDataForStockComponent(ledgers: any[]) {
        const ids = this.resetLedgersArray(
            this.ariseCrudStockComponent.ledgers,
        );
        const totalDelivery =
            this.ariseCrudDeliveryComponent.ledgers.controls.reduce(
                (accumulator, group: any) => {
                    return accumulator + group.controls['amount']?.value;
                },
                0,
            );

        const totalProduct =
            this.ariseCrudProductComponent.ledgers.controls.reduce(
                (accumulator, group: any) => {
                    return accumulator + group.controls['amount']?.value;
                },
                0,
            );

        ledgers.forEach((item, index) => {
            const obj: any = {};
            obj.creditCode = item.creditCode;
            obj.creditDetailCodeFirst = item.creditDetailCodeFirst;
            obj.creditDetailCodeSecond = item.creditDetailCodeSecond;
            obj.debitCode = item.debitCode;
            obj.debitDetailCodeFirst = item.debitDetailCodeFirst;
            obj.debitDetailCodeSecond = item.debitDetailCodeSecond;
            obj.projectCode = item.projectCode;
            obj.depreciaMonth = item.depreciaMonth;
            obj.orginalCurrency = item.orginalCurrency;
            obj.exchangeRate = item.exchangeRate;
            obj.quantity = item.quantity;
            obj.unitPrice = item.unitPrice;
            obj.id = ids[index];
            obj.type = [''];
            obj.month = [0];
            obj.voucherNumber = [''];
            obj.orginalAddress = [''];
            obj.orginalVoucherNumber = [''];
            obj.orginalBookDate = [];
            obj.referenceVoucherNumber = [''];
            obj.referenceBookDate = [];
            obj.referenceFullName = [''];
            obj.referenceAddress = [''];
            obj.isInternal = [0];
            obj.attachVoucher = [''];
            obj.invoiceCode = [''];
            obj.invoiceName = [''];
            obj.invoiceTaxCode = [''];
            obj.invoiceAddress = [''];
            obj.invoiceProductItem = [''];
            obj.invoiceAdditionalDeclarationCode = [''];
            obj.invoiceSerial = [''];
            obj.invoiceNumber = [''];
            obj.invoiceDate = [];
            obj.debitWarehouse = [''];
            obj.creditWarehouse = [''];
            //payer
            obj.orginalCompanyName = [''];
            //description
            obj.orginalDescription = [''];
            obj.percentImportTax = 0;
            let amount = item.amount ?? 0;
            obj.amountImportWarehouse = amount;
            obj.percentTransport =
                Number.parseFloat(
                    ((amount / totalProduct) * 100)?.toFixed(2),
                ) ?? 0;
            obj.amountTransport =
                ((obj.percentTransport ?? 0) * totalDelivery) / 100;
            obj.amount = obj.amountTransport;
            this.ariseCrudStockComponent.ledgers.push(this.fb.group(obj));
        });
    }

    onF8() {
        let data: any[] = [];
        const ariseProductLedgers =
            this.ariseCrudProductComponent.ledgerTableForm.value?.ledgers;
        let ariseTaxLedgers =
            this.ariseCrudTaxComponent.ledgerTaxTableForm.value?.ledgers;
        let ariseVatLedgers =
            this.ariseCrudVatComponent.ledgerTableForm.value?.ledgers;
        let ariseDeliveieLedgers =
            this.ariseCrudDeliveryComponent.ledgerTableForm.value?.ledgers;
        let ariseStockLedgers =
            this.ariseCrudStockComponent.ledgerTableForm.value?.ledgers;
        ariseTaxLedgers = ariseTaxLedgers.filter((x) => x.debitCode);
        ariseVatLedgers = ariseVatLedgers.filter((x) => x.debitCode);
        ariseDeliveieLedgers = ariseDeliveieLedgers.filter((x) => x.debitCode);
        ariseStockLedgers = ariseStockLedgers.filter((x) => x.debitCode);
        for (let index = 0; index < ariseProductLedgers.length; index++) {
            const ariseProductLedger = ariseProductLedgers[index];
            const ariseTaxLedger = ariseTaxLedgers[index];
            const ariseStockLedger = ariseStockLedgers[index];

            if (
                ariseTaxLedger &&
                ariseTaxLedger.debitCode &&
                ariseTaxLedger.creditCode
            ) {
                ariseProductLedger.percentImportTax =
                    ariseTaxLedger.percentImportTax;
                ariseTaxLedger.amount = ariseTaxLedger.amountVat;
                ariseTaxLedger.tab = 2;
            }

            if (
                ariseStockLedger &&
                ariseStockLedger.debitCode &&
                ariseStockLedger.creditCode
            ) {
                ariseProductLedger.percentTransport =
                    ariseStockLedger.percentTransport;
                ariseProductLedger.amountTransport =
                    ariseStockLedger.amountTransport;
                ariseStockLedger.tab = 4;
            }

            ariseProductLedger.tab = 0;
        }

        ariseDeliveieLedgers = ariseDeliveieLedgers.filter((x) => x.debitCode);
        ariseDeliveieLedgers.forEach((item) => {
            item.tab = 3;
        });

        ariseVatLedgers.forEach((item) => {
            item.tab = 1;
        });

        data.push.apply(data, ariseProductLedgers);
        data.push.apply(data, ariseTaxLedgers);
        data.push.apply(data, ariseVatLedgers);
        data.push.apply(data, ariseDeliveieLedgers);
        data.push.apply(data, ariseStockLedgers);
        return data;
    }

    onF9() {
        this.ariseCrudTaxComponent.buildFormTable();
        this.ariseCrudVatComponent.buildFormTable();
        this.ariseCrudProductComponent.buildFormTable();
        this.ariseCrudStockComponent.buildFormTable();
        this.ariseCrudDeliveryComponent.buildFormTable();
    }

    onActionRowProduct(event) {
        if (event) {
            switch (event.action) {
                case 'remove':
                    this.ariseCrudProductComponent.ledgers.removeAt(
                        event.index,
                    );
                    this.ariseCrudTaxComponent.ledgers.removeAt(event.index);
                    this.ariseCrudStockComponent.ledgers.removeAt(event.index);
                    break;
                case 'clear':
                    this.ariseCrudProductComponent.ledgers.controls[
                        event.index
                    ].reset();
                    this.ariseCrudTaxComponent.ledgers.controls[
                        event.index
                    ].reset();
                    this.ariseCrudStockComponent.ledgers.controls[
                        event.index
                    ].reset();
                    this.ariseCrudStockComponent.ledgers.controls[event.index][
                        'amountTransport'
                    ].patchValue(0);
                    this.ariseCrudStockComponent.ledgers.controls[event.index][
                        'percentTransport'
                    ].patchValue(0);
                    break;
                default:
                    break;
            }
        }
    }

    getLedgerDetail(data: any[]) {
        const tab1 = data.filter((x) => x.tab === 0);
        const tab2 = data.filter((x) => x.tab === 1);
        const tab3 = data.filter((x) => x.tab === 2);
        const tab4 = data.filter((x) => x.tab === 3);
        const tab5 = data.filter((x) => x.tab === 4);
        this.ariseCrudProductComponent.buildFormTable(tab1);
        this.ariseCrudVatComponent.buildFormTable(tab2);
        this.ariseCrudTaxComponent.buildFormTable(tab3);
        this.ariseCrudDeliveryComponent.buildFormTable(tab4);
        this.ariseCrudStockComponent.buildFormTable(tab5);
    }

    //#region handle tab
    private onTabSelected(event: any) {
        this.activeItem = event?.item;
    }
    get activeTabId(): string {
        return this.activeItem?.id || '';
    }
    //#endregion
}
