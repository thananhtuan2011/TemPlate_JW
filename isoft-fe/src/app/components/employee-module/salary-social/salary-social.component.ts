import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { SalarySocial } from 'src/app/models/salary-socail.model';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
import { SalarySocailService } from 'src/app/service/salary-socail.service';
import AppUtil from 'src/app/utilities/app-util';
import { SalarySocailFormComponent } from './compomemts/salary-socail-form/salary-socail-form.component';
import AppConstants from '../../../utilities/app-constants';

@Component({
    selector: 'app-salary-social',
    templateUrl: './salary-social.component.html',
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
        `,
    ],
})
export class SalarySocialComponent implements OnInit {
    public appConstant = AppConstants;
    @ViewChild('salarysocialForm') SalarySocailFormComponent:
        | SalarySocailFormComponent
        | undefined;

    isInvalidForm = false;
    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;

    first = 0;
    number_order_display = true;
    avatar_display = true;
    code_display = true;
    full_name_display = true;
    gender_display = true;
    birthday_display = true;
    phone_number_display = true;
    identify_display = true;
    send_salary_Date_display = true;
    department_display = true;
    role_display = false;
    last_login_display = false;
    isMobile = screen.width <= 1199;
    salarySocial: SalarySocial[] = [];

    display: boolean = false;
    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    cols: any[] = [
        {
            header: 'label.STT',
            value: 'order',
            width: 'width:70px',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.code',
            value: 'code',
            width: 'width:12rem',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.name',
            value: 'name',
            width: 'width:200px',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.value_company',
            value: 'valueCompany',
            width: 'width:100px',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.value_user',
            value: 'valueUser',
            width: 'width:120px',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.account_debit',
            value: 'accountDebit',
            width: 'width:150px',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.detail_1',
            value: 'detailDebit1',
            width: 'width:120px',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.detail_2',
            value: 'detailDebit1',
            width: 'width:120px',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.account_credit',
            value: 'accountCredit',
            width: 'width:150px',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.detail_1',
            value: 'detailCredit1',
            width: 'width:120px',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.detail_2',
            value: 'detailCredit2',
            width: 'width:120px',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
    ];

    public getParams = {
        page: 0,
        pageSize: 100,
    };
    constructor(
        private readonly salarySocialService: SalarySocailService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
    ) {}

    ngOnInit(): void {
        this.getSalaryLevel();
    }

    getSalaryLevel(event?: any, isExport: boolean = false) {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        this.loading = true;
        this.salarySocialService.getSalarySocial().subscribe((res) => {
            this.salarySocial = res.data;
            this.salarySocial.map((item) => {
                if (item.valueCompany) {
                    const [preNumberInString, postNumberInString] =
                        item.valueCompany.toString().split('.');
                    item.valueCompany = `${
                        preNumberInString ? preNumberInString : ''
                    }${postNumberInString ? ', ' + postNumberInString : ''}`;
                }
                if (item.valueUser) {
                    const [preNumberInString, postNumberInString] =
                        item.valueUser.toString().split('.');
                    item.valueUser = `${
                        preNumberInString ? preNumberInString : ''
                    }${postNumberInString ? ', ' + postNumberInString : ''}`;
                }
            });
            this.loading = false;
        });
    }
    onAddSalarySocial() {
        this.isEdit = false;
        this.showDialog();
    }
    getDetail(salarySocial) {
        this.formData = salarySocial;
        this.isEdit = true;
        this.showDialog();
    }

    onDelete(salaryID) {
        let message;
        let header;
        this.translateService
            .get('question.delete_salary_level_content')
            .subscribe((res) => {
                message = res;
            });
        this.translateService
            .get('question.delete_salary_level_header')
            .subscribe((res) => {
                header = res;
            });
        this.confirmationService.confirm({
            header: header,
            message: message,
            accept: () => {
                console.log(salaryID);

                this.salarySocialService
                    .deleteSalaryLevel(salaryID)
                    .subscribe((response: any) => {
                        this.getSalaryLevel();
                    });
            },
        });
    }

    showDialog() {
        // this.SalarySocailFormComponent.onReset();
        this.display = true;
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddSalarySocial();
                break;
        }
    }

    protected readonly AppConstants = AppConstants;
}
