import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AriesExcelImportModel } from 'src/app/models/management-arise-excel.model';
import { ManagementAriesExcelService } from 'src/app/service/management-aries-excel.service';
import AppUtil from 'src/app/utilities/app-util';
import * as XLSX from 'xlsx';
import * as saveAs from 'file-saver';

@Component({
    selector: 'app-arise-list-filter-v2',
    templateUrl: './arise-list-filter.component.html',
    styleUrls: ['./arise-list-filter.component.scss'],
})
export class AriseListFilterComponent implements OnInit {
    @Input('dataTable') dataTable: any;
    @Input('documentList') documentList = [];
    @Input('onBackHomePage') onBackHomePage = new EventEmitter();
    @Output('onFilter') onFilter = new EventEmitter();

    formInput!: FormGroup;
    types = AppUtil.getAriseTypes();

    constructor(
        private readonly managementAriesExcelService: ManagementAriesExcelService,
        private readonly messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.formInput = new FormGroup({
            uploadFile: new FormControl(null),
        });
    }

    onChangeDocument() {
        this.dataTable.showAllDocument = !this.dataTable.document.code
            ? true
            : false;
        this.onFilter.emit();
    }

    onExportExcel() {
        const param = {
            isSort: true,
            sortField: '',
            page: 0,
            pageSize: 20,
            searchText: '',
            documentType: this.dataTable.document.code,
            filterMonth: this.dataTable.filterMonth,
            isInternal: this.dataTable.isInternal,
            month: 0,
        };
        this.managementAriesExcelService.exportAries(param).subscribe(
            (resultBlob: Blob) => {
                saveAs(
                    resultBlob,
                    `Sổ kế toán_${new DatePipe('en_US').transform(
                        new Date(),
                        'yyyyMMdd_HHmmss',
                    )}.xlsx`,
                );
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onImportExcel(files) {
        try {
            const header = [
                'type',
                'month',
                'bookDate',
                'orginalVoucherNumber',
                'orginalBookDate',
                'orginalDescription',
                'orginalCompanyName',
                'orginalAddress',
                'attachVoucher',
                'referenceVoucherNumber',
                'referenceBookDate',
                'referenceFullName',
                'referenceAddress',
                'invoiceCode',
                'invoiceAdditionalDeclarationCode',
                'invoiceNumber',
                'invoiceTaxCode',
                'invoiceAddress',
                'invoiceSerial',
                'invoiceDate',
                'invoiceName',
                'invoiceProductItem',
                'debitCode',
                'debitCodeName',
                'debitWarehouse',
                'debitWarehouseName',
                'debitDetailCodeFirst',
                'debitDetailCodeFirstName',
                'debitDetailCodeSecond',
                'debitDetailCodeSecondName',
                'creditCode',
                'creditCodeName',
                'creditWarehouse',
                'creditWarehouseName',
                'creditDetailCodeFirst',
                'creditDetailCodeFirstName',
                'creditDetailCodeSecond',
                'creditDetailCodeSecondName',
                'projectCode',
                'depreciaMonth',
                'quantity',
                'unitPrice',
                'orginalCurrency',
                'exchangeRate',
                'amount',
                'isInternal',
                'id',
            ];
            let fileReader = new FileReader();
            let arrayBuffer: any;
            let result = [];
            const importListItem = [];
            fileReader.readAsArrayBuffer(files[0]);
            fileReader.onload = (e) => {
                arrayBuffer = fileReader.result;
                var data = new Uint8Array(arrayBuffer);
                var arr = new Array();
                for (var i = 0; i != data.length; ++i)
                    arr[i] = String.fromCharCode(data[i]);
                var bstr = arr.join('');
                var workbook = XLSX.read(bstr, { type: 'binary' });
                var first_sheet_name = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[first_sheet_name];
                result = XLSX.utils.sheet_to_json(worksheet, {
                    raw: true,
                    header: header,
                    range: 2,
                });
                result.forEach((element) => {
                    importListItem.push({
                        type: element['type'] || '',
                        month: Number(element['month']) || 0,
                        bookDate: AppUtil.convertStringToDate(
                            element['bookDate'],
                        ),
                        orginalVoucherNumber:
                            element['orginalVoucherNumber'] || '',
                        orginalBookDate: AppUtil.convertStringToDate(
                            element['orginalBookDate'],
                        ),
                        orginalDescription: element['orginalDescription'] || '',
                        orginalCompanyName: element['orginalCompanyName'] || '',
                        orginalAddress: element['orginalAddress'] || '',
                        attachVoucher: element['attachVoucher'] || '',
                        referenceVoucherNumber:
                            element['referenceVoucherNumber'] || '',
                        referenceBookDate: AppUtil.convertStringToDate(
                            element['referenceBookDate'],
                        ),
                        referenceFullName: element['referenceFullName'] || '',
                        referenceAddress: element['referenceAddress'] || '',
                        invoiceCode: element['invoiceCode'] || '',
                        invoiceAdditionalDeclarationCode:
                            element['invoiceAdditionalDeclarationCode'] || '',
                        invoiceNumber: (
                            element['invoiceNumber'] || ''
                        ).toString(),
                        invoiceTaxCode: element['invoiceTaxCode'] || '',
                        invoiceAddress: element['invoiceAddress'] || '',
                        invoiceSerial: element['invoiceSerial'] || '',
                        invoiceDate: AppUtil.convertStringToDate(
                            element['invoiceDate'],
                        ),
                        invoiceName: element['invoiceName'] || '',
                        invoiceProductItem: element['invoiceProductItem'] || '',
                        debitCode: element['debitCode'] || '',
                        debitWarehouse: element['debitWarehouse'] || '',
                        debitDetailCodeFirst:
                            element['debitDetailCodeFirst'] || '',
                        debitDetailCodeSecond:
                            element['debitDetailCodeSecond'] || '',
                        creditCode: element['creditCode'] || '',
                        creditWarehouse: element['creditWarehouse'] || '',
                        creditDetailCodeFirst:
                            element['creditDetailCodeFirst'] || '',
                        creditDetailCodeSecond:
                            element['creditDetailCodeSecond'] || '',
                        projectCode: element['projectCode'] || '',
                        depreciaMonth: Number(element['depreciaMonth'] || 0),
                        quantity: Number(element['quantity'] || 0),
                        unitPrice: Number(element['unitPrice'] || 0),
                        exchangeRate: Number(element['exchangeRate'] || 0),
                        amount: Number(element['amount'] || 0),
                        orginalCurrency: Number(
                            element['orginalCurrency'] || 0,
                        ),
                        debitCodeName: element['debitCodeName'] || '',
                        debitDetailCodeFirstName:
                            element['debitDetailCodeFirstName'] || '',
                        debitDetailCodeSecondName:
                            element['debitDetailCodeSecondName'] || '',
                        creditCodeName: element['creditCodeName'] || '',
                        creditDetailCodeFirstName:
                            element['creditDetailCodeFirstName'] || '',
                        creditDetailCodeSecondName:
                            element['creditDetailCodeSecondName'] || '',
                        debitWarehouseName: element['debitWarehouseName'] || '',
                        creditWarehouseName:
                            element['creditWarehouseName'] || '',
                        isInternal: Number(
                            element['isInternal'] == '3. Nội bộ' ? 3 : 1,
                        ),
                        id: Number(element['id'] || 0),
                    });
                });
                const importFileObj: AriesExcelImportModel = {
                    year: 0,
                    month: 0,
                    ledgers: importListItem,
                };
                this.managementAriesExcelService
                    .importExcel(importFileObj)
                    .subscribe(
                        (res) => {
                            if (res) {
                                this.messageService.add({
                                    severity: 'success',
                                    detail: 'Import dữ liệu thành công',
                                });
                                this.onFilter.emit();
                            } else {
                                this.messageService.add({
                                    severity: 'error',
                                    detail: 'Import dữ liệu thất bại',
                                });
                            }
                            fileReader = null;
                        },
                        (er) => {
                            this.messageService.add({
                                severity: 'error',
                                detail: 'Import dữ liệu thất bại',
                            });
                            console.log(er);
                            fileReader = null;
                        },
                    );
                this.formInput.controls['uploadFile'].reset();
            };
        } catch (error) {
            throw new Error('Kiểm tra lại file import');
        }
    }
    onExportExcelSample() {
        this.managementAriesExcelService.exportAriesSample().subscribe(
            (resultBlob: Blob) => {
                saveAs(
                    resultBlob,
                    `Sổ kế toán mẫu_${new DatePipe('en_US').transform(
                        new Date(),
                        'yyyyMMdd_HHmmss',
                    )}.xlsx`,
                );
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }
}
