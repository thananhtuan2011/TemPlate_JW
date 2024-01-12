import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { SalaryLevel } from 'src/app/models/salary-level.model';
import { SalaryLevelService } from 'src/app/service/salary-level.service';
import { SalaryLevelFormComponent } from './components/salary-level-form/salary-level-form.component';
import { TypeData } from 'src/app/models/common.model';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import localeFr from '@angular/common/locales/fr';
import AppUtil from 'src/app/utilities/app-util';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
import AppConstants from '../../../utilities/app-constants';

@Component({
    selector: 'app-salary-level',
    templateUrl: './salary-level.component.html',
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
export class SalaryLevelComponent implements OnInit {
    public appConstant = AppConstants;
    @ViewChild('salaryLevelForm') SalaryLevelFormComponent:
        | SalaryLevelFormComponent
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
    salaryLevel: SalaryLevel[] = [];

    display: boolean = false;
    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    cols: any[] = [
        {
            header: 'label.number_order',
            value: 'id',
            width: 'width:8%;',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.position',
            value: 'positionName',
            width: 'width:20%;',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.sign_date',
            value: 'updateAt',
            width: 'width:12%;',
            display: true,
            classify: 'salary_level',
            optionHide: false,
        },
        {
            header: 'label.salary_level',
            value: 'salaryCost',
            width: 'width:12%;',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.coefficient',
            value: 'coefficient',
            width: 'width:12%;',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.amount_number',
            value: 'amounts',
            width: 'width:20%;',
            display: true,
            classify: 'salary_level',
            optionHide: true,
        },
        {
            header: 'label.note',
            value: 'note',
            width: 'width:30%;',
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
        private readonly salaryLevelServiice: SalaryLevelService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
    ) {}

    ngOnInit(): void {
        // this.postSalaryLevel(this.salaryLevel1)
        this.getSalaryLevel();
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getSalaryLevel();
            console.log('search');
        }
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
        this.salaryLevelServiice
            .getSalaryLevel(this.getParams)
            .subscribe((res) => {
                this.salaryLevel = res.data;
                this.salaryLevel.map((data) => {
                    data.amounts = this.format1(data.amount);
                });
                this.loading = false;
            });
    }

    format1(n) {
        return n.toFixed(0).replace(/./g, function (c, i, a) {
            return i > 0 && c !== '.' && (a.length - i) % 3 === 0 ? ',' + c : c;
        });
    }

    getDetail(salaryLevel) {
        this.formData = salaryLevel;
        this.isEdit = true;
        this.showDialog();
    }

    onAddDecide() {
        this.isEdit = false;
        this.showDialog();
    }

    showDialog() {
        this.SalaryLevelFormComponent.onReset();
        this.display = true;
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

                this.salaryLevelServiice
                    .deleteSalaryLevel(salaryID)
                    .subscribe((response: any) => {
                        this.getSalaryLevel();
                    });
            },
        });
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddDecide();
                break;
        }
    }
}
