import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, filter, isEmpty, map, pickBy, startsWith } from 'lodash';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { SalaryAdvanceModel } from 'src/app/models/salary-advance.model';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
import { SalaryAdvanceService } from 'src/app/service/salary-advance.service';
import { UserService } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-salary-advance-add-form',
    templateUrl: './salary-advance-add-form.component.html',
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
            :host ::ng-deep .p-datepicker-group-container {
                width: 18rem;
            }
            :host ::ng-deep .dropdown-table {
                height: 100%;
                width: 100%;
                .p-dropdown {
                    height: 100%;
                    width: 100%;
                }
            }
            :host ::ng-deep .dropdown-custom {
                height: 100%;
                width: 100%;
                .p-dropdown {
                    height: fit-content;
                    width: 100%;
                }
                .p-dropdown-label {
                    height: 2.7rem;
                }
            }
            .full-w {
                width: 100%;
            }
            .m-left-20rem {
                margin-left: 20rem;
            }
            .d-flex {
                display: flex;
            }
            .center-text {
                padding-top: 1rem;
                text-align: center;
                margin-right: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .p-left-2rem {
                padding-left: 2rem;
            }
            .f-normal {
                font-weight: normal;
            }
        `,
    ],
})
export class SalaryAdvanceAddFormComponent implements OnInit {
    @Input() listBranch = [];
    @Input() listDepartment = [];
    @Input() listMonth = [];
    @Input() isEdit: boolean = false;
    @Input() selectedItem: SalaryAdvanceModel = {};
    @Output() onCancel = new EventEmitter();
    error = {};
    listUser = [];
    selectedListDepartment = [];
    listSalaryAdvanceDetail: SalaryAdvanceModel = {
        id: 0,
        name: '',
        branchId: 0,
        departmentId: 0,
        date: moment().format(AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE),
        createAt: new Date(),
        procedureNumber: '',
        items: [],
    };
    listSalaryAdvanceItemOriginal = [];
    salaryAdvanceItem = {
        id: 0,
        p_SalaryAdvanceId: 0,
        userId: 0,
        branchId: 0,
        value: 0,
    };
    cols: any[] = [
        {
            header: 'label.employee_code',
            value: 'userId',
            width: 'w-2',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.employee_name',
            value: 'userName',
            width: 'w-2',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.amount_of_money',
            value: 'value',
            width: 'w-2',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
    ];
    loading: boolean = true;
    public totalRecords = 0;
    public totalPages = 0;
    page = 1;
    pageSize = 10;
    first = 0;
    isMobile = screen.width <= 1199;
    currentPageRole: UserRoleCRUD;
    procedureNumber = 0;
    showItem = [];
    constructor(
        private readonly userService: UserService,
        private salaryAdvanceService: SalaryAdvanceService,
        private translateService: TranslateService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngAfterViewInit() {
        this.inintDefaultValue();
        this.cdr.detectChanges();
    }

    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }
    ngOnInit(): void {
        this.currentPageRole = AppUtil.getMenus('TAMUNGLUONG');
        this.getData();
    }

    getData() {
        if (this.isEdit) {
            const listUser = this.userService.getPagingUser({});
            forkJoin(listUser).subscribe(([user]) => {
                this.listUser = user.data;
                this.listSalaryAdvanceDetail = cloneDeep(this.selectedItem);
                (this.listSalaryAdvanceDetail.date = moment(
                    this.selectedItem.date,
                ).format(AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE)),
                    (this.selectedListDepartment = filter(this.listDepartment, [
                        'branchId',
                        this.selectedItem.branchId,
                    ]));
            });
            return;
        }
        const listUser = this.userService.getPagingUser({});
        const procedureNumber = this.salaryAdvanceService.getProcedureNumber();
        forkJoin(listUser, procedureNumber).subscribe(([user, proNum]) => {
            this.listUser = user.data;
            this.listSalaryAdvanceDetail.procedureNumber = proNum;
        });
    }

    inintDefaultValue() {
        if (this.isEdit) {
            this.onFilterBranch(this.selectedItem.branchId);
            this.salaryAdvanceItem.branchId = cloneDeep(
                this.selectedItem.branchId,
            );
            this.totalRecords = this.selectedItem.items.length || 0;
        } else {
            this.listSalaryAdvanceDetail.branchId = cloneDeep(
                this.listBranch[0].id,
            );
            this.onFilterBranch(this.listBranch[0].id);
            this.salaryAdvanceItem.branchId = cloneDeep(this.listBranch[0].id);
            this.onAdd();
        }
    }

    onFilterBranch(branchId: any) {
        this.selectedListDepartment = filter(this.listDepartment, [
            'branchId',
            branchId,
        ]);
        if (this.selectedListDepartment.length > 0) {
            this.listSalaryAdvanceDetail.departmentId = cloneDeep(
                this.selectedListDepartment[0].id,
            );
        }
    }

    getSalaryAdvanceDetail(event?: any, isExport: boolean = false) {
        this.loading = true;
        if (event) {
            this.page = event.first / event.rows + 1;
            this.pageSize = event.rows;
        }
        if (this.listSalaryAdvanceItemOriginal.length <= this.pageSize) {
            this.listSalaryAdvanceDetail.items = cloneDeep(
                this.listSalaryAdvanceItemOriginal,
            );
        } else {
            this.listSalaryAdvanceDetail.items = cloneDeep(
                this.listSalaryAdvanceItemOriginal,
            ).splice((this.page - 1) * this.pageSize, this.pageSize);
        }
        this.calculatePageRecord();
        this.loading = false;
    }

    calculatePageRecord() {
        this.totalRecords = this.listSalaryAdvanceItemOriginal.length || 0;
        this.totalPages = this.listSalaryAdvanceItemOriginal.length / (10 + 1);
    }

    onChange(value: any, key: string, rowIndex: number) {
        if (value == null) {
            return;
        }
        let originIndex = (this.page - 1) * this.pageSize;
        this.listSalaryAdvanceDetail.items[rowIndex - originIndex][key] = value;
        this.listSalaryAdvanceItemOriginal[rowIndex][key] = value;
    }

    checkShowItem(rowIndex) {
        let index = this.showItem.indexOf(rowIndex);
        if (~index) {
            return true;
        }
        return false;
    }
    onSubmit() {
        let valid = this.checkValidatetion();
        if (valid) {
            let newData = this.cleanObject(
                AppUtil.cleanObject({
                    ...this.listSalaryAdvanceDetail,
                    items: [...this.listSalaryAdvanceItemOriginal],
                }),
            );
            if (this.isEdit) {
                this.updateItem(newData, this.selectedItem.id);
            } else {
                this.createItem(newData);
            }
            this.onCancel.emit({});
        }
    }

    createItem(item) {
        this.salaryAdvanceService.submitSalaryAdvance(item).subscribe(
            (res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
    }

    updateItem(item, id) {
        this.salaryAdvanceService.updateSalaryAdvance(item, id).subscribe(
            (res) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.update',
                    ),
                });
            },
            (err) => {
                this.messageService.add({
                    severity: 'error',
                    detail: AppUtil.translate(this.translateService, 'error.0'),
                });
            },
        );
    }

    checkValidValidator(fieldName: string) {
        return this.error[fieldName] != undefined && this.error[fieldName]
            ? 'ng-invalid ng-dirty'
            : '';
    }

    checkValidatetion() {
        this.error = {};
        this.checkValidationDetail();
        this.checkValidationItem();
        if (isEmpty(this.error)) {
            return true;
        }
        return false;
    }

    checkValidationDetail() {
        const { name, date } = this.listSalaryAdvanceDetail;
        if (!name) {
            this.error['name'] = AppUtil.translate(
                this.translateService,
                'info.please_check_again',
            );
        }
        if (
            !moment(
                date,
                AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).isValid()
        ) {
            this.error['date'] = AppUtil.translate(
                this.translateService,
                'info.please_check_again',
            );
        }
    }

    checkValidationItem() {
        map(this.listSalaryAdvanceItemOriginal, (item, index) => {
            const { userId } = item;
            if (!userId) {
                this.error[`userId${index}`] = AppUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                );
            }
        });
    }

    onAdd() {
        this.listSalaryAdvanceDetail.items.push({ ...this.salaryAdvanceItem });
        this.listSalaryAdvanceItemOriginal.push({ ...this.salaryAdvanceItem });
        this.calculatePageRecord();
    }

    onDelete(index: number) {
        if (this.listSalaryAdvanceItemOriginal.length == 1) {
            this.listSalaryAdvanceItemOriginal = [
                { ...this.salaryAdvanceItem },
            ];
        } else {
            let items = cloneDeep(this.listSalaryAdvanceItemOriginal);
            items.splice(index, 1);
            this.listSalaryAdvanceItemOriginal = items;
        }
        this.getSalaryAdvanceDetail();
        return (this.error = pickBy(this.error, function (value, key) {
            return !startsWith(key, 'userId');
        }));
    }

    cleanObject(data) {
        let item = {
            ...data,
        };
        item['date'] = AppUtil.formatLocalTimezone(
            moment(
                this.listSalaryAdvanceDetail.date,
                AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
            ).format(AppConstant.FORMAT_DATE.T_DATE),
        );
        return item;
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.onSubmit();
                break;
            case 'F6':
                event.preventDefault();
                this.onCancel.emit({});
                break;
        }
    }
}
