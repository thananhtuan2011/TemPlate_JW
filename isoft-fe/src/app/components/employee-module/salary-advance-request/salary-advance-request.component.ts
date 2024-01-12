import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { SalaryLevel } from 'src/app/models/salary-level.model';
import { SalaryLevelService } from 'src/app/service/salary-level.service';
import { SalaryAdvanceRequestFormComponent } from './components/salary-advance-request-form/salary-advance-request-form.component';
import { TypeData } from 'src/app/models/common.model';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import localeFr from '@angular/common/locales/fr';
import AppUtil from 'src/app/utilities/app-util';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
import { SalaryAdvanceService } from '../../../service/salary-advance.service';

@Component({
    selector: 'app-salary-advance-request',
    templateUrl: './salary-advance-request.component.html',
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
export class SalaryAdvanceRequestComponent implements OnInit {
    @ViewChild('salaryLevelForm') SalaryLevelFormComponent:
        | SalaryAdvanceRequestFormComponent
        | undefined;
    isInvalidForm = false;
    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    pendingRequest: any;

    first = 0;
    isMobile = screen.width <= 1199;
    salaryAdvanceRequest: any[] = [];

    display: boolean = false;
    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    currentPageRole: UserRoleCRUD;

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
            header: 'label.name',
            value: 'name',
            width: 'width:20%;',
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
            header: 'label.amount_number',
            value: 'value',
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
        page: 1,
        pageSize: 100,
    };

    constructor(
        private readonly salaryAdvanceService: SalaryAdvanceService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
    ) {}

    ngOnInit(): void {
        this.currentPageRole = AppUtil.getMenus('BACLUONG');
        this.getSalaryAdvanceRequest();
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getSalaryAdvanceRequest();
            console.log('search');
        }
    }

    getSalaryAdvanceRequest(event?: any, isExport: boolean = false) {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        this.loading = true;
        this.salaryAdvanceService
            .getSalaryAdvanceRequest(this.getParams)
            .subscribe((res) => {
                this.salaryAdvanceRequest = res.data;
                this.loading = false;
                console.log(this.salaryAdvanceRequest);
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

                this.salaryAdvanceService
                    .deleteSalaryAdvanceRequest(salaryID)
                    .subscribe((response: any) => {
                        this.getSalaryAdvanceRequest();
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
