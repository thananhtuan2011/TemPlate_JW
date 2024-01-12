import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { GeneralDiaryReportService } from './general-diary-report.service';
import * as moment from 'moment';
import { AuthService } from '../../../service/auth.service';
import AppConstant from '../../../utilities/app-constants';
import { AppMainComponent } from '../../../layouts/app.main.component';

@Component({
    selector: 'app-general-diary-report',
    templateUrl: './general-diary-report.component.html',
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

                .flex-button-report {
                    display: flex;
                    align-items: flex-end;
                    justify-content: flex-end;
                }

                .flex-button-report button {
                    margin-left: 10px;
                }

                .field-prepared {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                    color: var(--primary-color);
                }

                .field-prepared label {
                    margin-left: 5px;
                }

                .field-prepared-disabled {
                    pointer-events: none;
                    background: #f6f6f6;
                }

                .frame-container {
                    background: #fff;
                    padding: 10px;
                }

                p-calendar {
                    display: block;
                }

                p-calendar span {
                    width: 100%;
                }
            }
        `,
    ],
})
export class GeneralDiaryReportComponent implements OnInit {
    chooseDate = new FormControl(0);
    appConstant = AppConstant;
    currentDate = new Date();
    filterForm!: FormGroup;
    listMonth: any[] = [
        { label: 'Tháng 1', value: 1 },
        { label: 'Tháng 2', value: 2 },
        { label: 'Tháng 3', value: 3 },
        { label: 'Tháng 4', value: 4 },
        { label: 'Tháng 5', value: 5 },
        { label: 'Tháng 6', value: 6 },
        { label: 'Tháng 7', value: 7 },
        { label: 'Tháng 8', value: 8 },
        { label: 'Tháng 9', value: 9 },
        { label: 'Tháng 10', value: 10 },
        { label: 'Tháng 11', value: 11 },
        { label: 'Tháng 12', value: 12 },
    ];
    dateType: any[] = [
        { value: 0, label: 'label.month_type' },
        { value: 1, label: 'label.date_type' },
    ];

    constructor(
        private fb: FormBuilder,
        private reportService: GeneralDiaryReportService,
        private authService: AuthService,
        public appMain: AppMainComponent,
    ) {}

    ngOnInit(): void {
        this.initFormFilter();
        this.chooseDate.valueChanges.subscribe((value) => {
            if (value) {
                this.filterForm.patchValue({
                    FromDate: [
                        moment(new Date()).format(
                            this.appConstant.FORMAT_DATE.NORMAL_DATE,
                        ),
                    ],
                    ToDate: [
                        moment(new Date()).format(
                            this.appConstant.FORMAT_DATE.NORMAL_DATE,
                        ),
                    ],
                });
            }
        });
    }

    initFormFilter() {
        this.filterForm = this.fb.group({
            FromMonth: [new Date().getMonth() + 1],
            ToMonth: [new Date().getMonth() + 1],
            FromDate: [
                moment(new Date()).format(
                    this.appConstant.FORMAT_DATE.NORMAL_DATE,
                ),
            ],
            ToDate: [
                moment(new Date()).format(
                    this.appConstant.FORMAT_DATE.NORMAL_DATE,
                ),
            ],
            FileType: [''],
            isCheckName: [true],
            LedgerReportMaker: [this.authService.user.fullname],
        });
    }

    getValueField(name: string) {
        return this.filterForm.get(name).value;
    }

    submitForm(type: string) {
        this.filterForm.get('FileType').patchValue(type);
        let body = this.filterForm.value;

        if (!body.isCheckName) {
            delete body.LedgerReportMaker;
        }

        Object.keys(body).forEach((key) => {
            if (typeof body[key] === 'string' && !body[key]?.trim()?.length) {
                delete body[key];
            }
            if (body[key] && ['FromDate', 'ToDate'].includes(key)) {
                body[key] = moment(body[key]).format('YYYY-MM-DD');
            }
        });

        if (this.chooseDate.value) {
            delete body.ToMonth;
            delete body.FromMonth;
        }

        if (!this.chooseDate.value) {
            delete body.ToDate;
            delete body.FromDate;
        }

        this.reportService
            .getReport({
                ...body,
            })
            .subscribe((res) => {
                switch (type) {
                    case 'html': {
                        this.setShowReportReceiptHtml(res.data);
                        break;
                    }
                    default: {
                        this.openDownloadFile(res.data, type);
                        break;
                    }
                }
            });
    }

    setShowReportReceiptHtml(content: any) {
        var _idFrameReceipt = document.getElementById(
            'iframe-html-report-diary',
        );
        _idFrameReceipt.innerHTML = '';
        const divHTML = document.createElement('div');
        if (content.error) {
            divHTML.innerHTML = content.error;
        } else {
            divHTML.innerHTML = content;
        }
        _idFrameReceipt.appendChild(divHTML);
    }

    openDownloadFile(_fileName: string, _ft: string) {
        var _l = this.reportService.getFolderPathDownload(_fileName, _ft);
        window.open(_l);
    }
}
