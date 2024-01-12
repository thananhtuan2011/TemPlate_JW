import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import AppConstant from 'src/app/utilities/app-constants';
import { TranslateService } from '@ngx-translate/core';
import AppUtil from 'src/app/utilities/app-util';
import { BranchService } from 'src/app/service/branch.service';
import { SalaryService } from 'src/app/service/salary.service';
import { Salary } from 'src/app/models/salary.model';
import * as moment from 'moment';
import { AllowanceService } from 'src/app/service/allowance.service';

@Component({
    selector: 'app-salary',
    templateUrl: './salary.component.html',
    styleUrls: ['../../../../assets/demo/badges.scss'],
    styles: [
        `
            :host ::ng-deep .p-frozen-column {
                font-weight: bold;
            }

            :host ::ng-deep .p-datatable-frozen-tbody {
                font-weight: bold;
            }

            :host ::ng-deep .p-progressbar {
                height: 0.5rem;
            }

            :host ::ng-deep .cell-number {
                text-align: right;
                justify-content: right;
            }
        

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
                    //
                    //&.border-right {
                    //    border-right: 1px solid #707070;
                    //}
                }
            }
        `,
    ],
})
export class SalaryComponent implements OnInit {
    public appConstant = AppConstant;

    loading: boolean = true;

    public isLoading: boolean = false;

    public lstBranchs: any[] = [];
    public lstSalary: Salary[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;

    months = [
        { name: 'Tháng 1', value: 1 },
        { name: 'Tháng 2', value: 2 },
        { name: 'Tháng 3', value: 3 },
        { name: 'Tháng 4', value: 4 },
        { name: 'Tháng 5', value: 5 },
        { name: 'Tháng 6', value: 6 },
        { name: 'Tháng 7', value: 7 },
        { name: 'Tháng 8', value: 8 },
        { name: 'Tháng 9', value: 9 },
        { name: 'Tháng 10', value: 10 },
        { name: 'Tháng 11', value: 11 },
        { name: 'Tháng 12', value: 12 },
    ];
    monthchoose;
    getParams: any = {
        month: moment(Date.now()).month() + 1,
        isInternal: 1,
    };
    internals = [
        { name: 'Hạch toán', value: 2 },
        { name: 'Nội bộ', value: 3 },
    ];
    cols: any[] = [
        {
            header: 'label.numerical_order',
            value: 'soThuTu',
            width: 'width:200px',
            rowspan: '2',
        },
        {
            header: 'label.employee_name',
            value: `fullName`,
            width: 'width:200px',
            rowspan: '2',
        },
        {
            header: 'label.accountant_position',
            value: `positionName`,
            width: 'width:200px',
            rowspan: '2',
        },
        {
            header: 'label.salaryContract',
            value: 'salaryContract',
            width: 'width:130px',
            rowspan: '2',
        },
        {
            header: 'label.salaryTotal',
            value: 'salaryTotal',
            width: 'width:200px',
            rowspan: '2',
        },
        {
            header: 'label.dayInOut',
            value: 'soNgayCong',
            width: 'width:200px',
            rowspan: '2',
        },
        {
            header: 'label.salaryReal',
            value: 'salaryReal',
            width: 'width:150px',
            rowspan: '2',
        },
        {
            header: 'label.salaryBHYT',
            value: 'salaryReal',
            width: 'width:150px',
            rowspan: '2',
        },
        {
            header: 'label.kpcd',
            value: 'salarySocial[0].valueCompany',
            width: 'width:150px',
            rowspan: '2',
        },
        {
            header: 'label.bhxh',
            value: 'salarySocial[1].valueCompany',
            width: 'width:100px',
            rowspan: '2',
        },
        {
            header: 'label.bhyt',
            value: 'salarySocial[2].valueCompany',
            width: 'width:100px',
            rowspan: '2',
        },
        {
            header: 'label.bhtn',
            value: 'salarySocial[3].valueCompany',
            width: 'width:100px',
            rowspan: '2',
        },
        {
            header: 'label.total',
            value: 'salarySocial[4].valueCompany',
            width: 'width:100px',
            rowspan: '2',
        },
        {
            header: 'label.bhtn',
            value: 'bhtn',
            width: 'width:100px',
            rowspan: '2',
        },
        {
            header: 'label.tax_TNCN',
            value: 'thueTNCN',
            width: 'width:100px',
            rowspan: '2',
        },
        {
            header: 'label.tam_ung',
            value: 'tamUng',
            width: 'width:100px',
            rowspan: '2',
        },
        {
            header: 'label.thuc_linh',
            value: 'decideTypeId',
            width: 'width:100px',
            rowspan: '2',
        },
        {
            header: 'label.note',
            value: 'decideTypeId',
            width: 'width:100px',
            rowspan: '2',
        },
    ];

    colAllowances: any[] = [];

    constructor(
        private messageService: MessageService,
        private readonly branchService: BranchService,
        private readonly salaryService: SalaryService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly allowanceService: AllowanceService,
    ) { }

    ngOnInit() {
        this.getAllowance();
        this.isMobile ? this.getSalary() : null
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.month = event.value;
        }
        this.getSalary();
    }
    onChangeType(event) {
        this.getParams.isInternal = event.value;
        this.getSalary();
    }

    getSalary(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (isExport) {
            this.salaryService
                .getExcelReport(this.getParams)
                .subscribe((res: any) => {
                    AppUtil.scrollToTop();
                    this.openDownloadFile(res.data, 'excel');
                });
        }
        // remove undefined value
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.pendingRequest = this.salaryService
            .getListSalary(this.getParams)
            .subscribe((data) => {
                AppUtil.scrollToTop();
                this.lstSalary = data.data;
                console.log(this.lstSalary);
                this.loading = false;
            });
    }

    getAllowance(): void {
        this.colAllowances = this.allowanceService
            .getAllowances()
            .subscribe((data) => {
                this.colAllowances = data.data;
                console.log(this.colAllowances);
            });
    }

    private openDownloadFile(_fileName: string, _ft: string) {
        try {
            this.isLoading = false;
            var _l = this.salaryService.getFolderPathDownload(_fileName, _ft);
            if (_l) window.open(_l);
        } catch (ex) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: 'File invalid',
            });
        }
    }

    isNumber(n) {
        return !isNaN(parseFloat(n)) && !isNaN(n - 0);
    }

    UpdateSalaryToAccountant(): void {
        // remove undefined value
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.loading = true;
        this.pendingRequest = this.salaryService
            .UpdateSalaryToAccountant(this.getParams)
            .subscribe((data) => {
                this.loading = false;
            });
    }
}
