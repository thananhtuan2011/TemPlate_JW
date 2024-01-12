import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import * as moment from 'moment';
import { AppMainComponent } from 'src/app/layouts/app.main.component';
import { ChartOfAccountService } from 'src/app/service/chart-of-account.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import { PayerService } from '../../../../../service/payer.service';
import { AccountingReportService } from '../../../../../service/accounting-report.service';

@Component({
    selector: 'app-report-filter',
    templateUrl: './report-filter.component.html',
    styles: [
        `
            .border-right {
                border-right: 2px solid var(--primary-color);
            }

            :host ::ng-deep {
                .p-panel .p-panel-content {
                    padding: 4px 0 8px 0;
                }

                .p-button {
                    min-width: 130px;
                }

                .p-button,
                .p-dropdown,
                .p-multiselect {
                    height: 40px;
                }

                .p-dropdown,
                .p-inputtext-sm .p-inputtext {
                    min-width: 100px;
                }

                .p-panel .p-panel-header {
                    background-color: var(--primary-color);
                    color: var(--surface);
                }
            }
        `,
    ],
})
export class ReportFilterComponent implements OnInit {
    @Input('title') title: string = '';
    @Input('types') types: any = {};
    @Input('showTypes') showTypes?: any = {};
    @Input('typedate') typedate: any = {};
    @Input() hasTaxCode = false;
    @Input() hasContraAccount = false;
    @Input() hasPrintPDF = true;
    @Input() hasPrintXML = false;

    appUtil = AppUtil;
    appConstant = AppConstant;
    @Input() filter = {
        filterType: 1,
        printType: [],
        bookDetailType: '',
        fillFullName: true,
        preparedBy: '',
        ledgerReportMaker: '',
        dfPreparedBy: '',
        voteMaker: '',
        accountCode: '',
        accountCodeDetail1: '',
        accountCodeDetail2: '',
        document: '',
        taxVat: '',
        documentMonth: new Date().getMonth() + 1,
        fromMonth: `${new Date().getMonth() + 1}`,
        toMonth: `${new Date().getMonth() + 1}`,
        fromDate: moment(new Date()).format(
            this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
        ),
        toDate: moment(new Date()).format(
            this.appConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
        ),
        page: 0,
        pageSize: 20,
        isCheckName: false,
        invoiceNumber: '',
        invoiceTaxCode: '',
        accountCodeReciprocal: '',
        accountCodeDetail1Reciprocal: '',
        accountCodeDetail2Reciprocal: '',
    };
    @Output() onPreview = new EventEmitter();
    @Output() onPrint = new EventEmitter();
    @Output() onPrintExcel = new EventEmitter();
    @Output() onChangeFilter = new EventEmitter();
    @Output() onChangeTypes = new EventEmitter();
    @Output() onPrintXML = new EventEmitter();
    @Input() dateType: any[] = [
        { value: 1, label: 'label.month_type' },
        { value: 2, label: 'label.date_type' },
    ];

    authUser: any = {};
    preparedBy;
    printType: number[] = [0, 1, 2, 3];
    chartOfAccounts: any[] = [];
    payers: any[] = [];
    taxCodes: any[] = [];

    constructor(
        public appMain: AppMainComponent,
        private chartOfAccountService: ChartOfAccountService,
        private payerService: PayerService,
        private accountingReportService: AccountingReportService,
    ) {}

    ngOnInit() {
        this.filter.printType = this.printType;
        this.getChartOfAccounts();
        // this.getPayers()
        this.getListTaxCode();
    }

    // get list chart of account
    getChartOfAccounts() {
        this.chartOfAccountService
            .getAllByDisplayInsert()
            .subscribe((res: any) => {
                this.chartOfAccounts = res;
            });
    }

    // get list payer
    getPayers() {
        this.payerService.getList().subscribe((res) => {
            this.payers = res.data;
            this.taxCodes =
                this.payers?.reduce((arr, curr) => {
                    if (curr?.taxCode)
                        arr.push({
                            value: curr?.code,
                            label: curr?.taxCode,
                        });
                    return arr;
                }, []) || [];
        });
    }

    // get list tax code
    getListTaxCode() {
        const request = {
            year: 0,
            fromMonth: Number(this.filter.fromMonth || 0),
            toMonth: Number(this.filter.toMonth || 0),
            fromDate:
                this.filter.filterType === 2 ? this.filter.fromDate : null,
            toDate: this.filter.filterType === 2 ? this.filter.toDate : null,
            voucherType: this.filter.document || '',
            voteMaker: '',
            isCheckName: true,
            fileType: '',
            invoiceNumber: '',
            invoiceTaxCode: '',
        };
        this.accountingReportService
            .getListTaxCode(request)
            .subscribe((res) => {
                this.taxCodes = res.data || [];
            });
    }

    choosePrint() {
        this.filter.printType = this.printType;
    }

    onActionSubmit(emitter: EventEmitter<any>) {
        this.check();
        let filterResult = { ...this.filter };

        if (this.typedate == 'yyyymmdd') {
            filterResult.fromDate = moment(
                AppUtil.adjustDateOffset(filterResult.fromDate),
            ).format('YYYY-MM-DD');
            filterResult.toDate = moment(
                AppUtil.adjustDateOffset(filterResult.toDate),
            ).format('YYYY-MM-DD');
        } else {
            filterResult.fromDate = moment(
                AppUtil.adjustDateOffset(filterResult.fromDate),
            ).format(this.appConstant.FORMAT_DATE.MOMENT_SHORT_DATE);
            filterResult.toDate = moment(
                AppUtil.adjustDateOffset(filterResult.toDate),
            ).format(this.appConstant.FORMAT_DATE.MOMENT_SHORT_DATE);
        }
        emitter.emit(filterResult);
    }

    check() {
        if (this.filter.fillFullName) {
            this.filter.ledgerReportMaker = this.filter.preparedBy;
            this.filter.voteMaker = this.filter.preparedBy;
            this.filter.isCheckName = this.filter.fillFullName;
        } else {
            this.filter.ledgerReportMaker = '';
            this.filter.voteMaker = '';
            this.filter.preparedBy = '';
            this.filter.isCheckName = this.filter.fillFullName;
        }
    }

    onChangeType(type) {
        if (this.filter.filterType === type) {
        }
        if (this.filter.toDate === type) {
            this.filter.fromMonth = '1';
            this.filter.toMonth = '1';
        }
        this.getListTaxCode();
    }

    onCheck(event) {
        if (!event.checked && this.filter.preparedBy) {
            this.preparedBy = this.filter.preparedBy;
        }
        this.filter.preparedBy = event.checked ? this.preparedBy : '';
    }

    onChangeAccount(event, type) {
        if (type === 'account') {
            this.chartOfAccountService
                .getDetailHasParam(event.value, { pageSize: 9999 })
                .subscribe((res: any) => {
                    this.types.detail1 = res.data;
                    this.onChangeTypes.emit(this.types);
                });
        } else {
            this.chartOfAccountService
                .getDetailHasParam(
                    `${this.filter.accountCode}:${event.value}`,
                    { pageSize: 9999 },
                )
                .subscribe((res: any) => {
                    this.types.detail2 = res.data;
                    this.onChangeTypes.emit(this.types);
                });
        }
    }
}
