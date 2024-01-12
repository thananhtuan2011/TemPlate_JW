import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, find } from 'lodash';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { SalaryAdvanceModel } from 'src/app/models/salary-advance.model';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
import { SalaryAdvanceService } from 'src/app/service/salary-advance.service';
import { UserService } from 'src/app/service/user.service';
import AppUtil from 'src/app/utilities/app-util';

@Component({
    selector: 'app-salary-advance-form',
    templateUrl: './salary-advance-form.component.html',
    styles: [
        `
            :host ::ng-deep {
            }
        `,
    ],
})
export class SalaryAdvanceFormComponent implements OnInit {
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Input('selectedItem') selectedItem: SalaryAdvanceModel = {};
    @Output() onCancel = new EventEmitter();

    isInvalidForm = false;
    loading: boolean = true;
    salaryAdvanceForm: FormGroup = new FormGroup({});
    isSubmitted = false;
    listSalaryAdvanceDetail = [];
    isMobile = screen.width <= 1199;
    public totalRecords = 0;
    public totalPages = 0;
    first = 0;
    currentPageRole: UserRoleCRUD;
    listUser = [];
    cols: any[] = [
        {
            header: 'label.number_order',
            value: 'id',
            width: 'w-5rem',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
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

    constructor(
        private translateService: TranslateService,
        private messageService: MessageService,
        private readonly userService: UserService,
        private salaryAdvanceService: SalaryAdvanceService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    ngOnInit(): void {
        this.currentPageRole = AppUtil.getMenus('TAMUNGLUONG');
        const listUser = this.userService.getPagingUser({});
        forkJoin(listUser).subscribe(([user]) => {
            this.listUser = user.data;
            this.getSalaryAdvanceDetail();
        });
    }

    getSalaryAdvanceDetail(event?: any, isExport: boolean = false): void {
        this.loading = true;
        this.listSalaryAdvanceDetail = this.selectedItem.items?.map((item) => {
            return {
                ...item,
                userName:
                    find(this.listUser, ['id', item.userId])?.fullName || '',
            };
        });
        this.totalRecords = this.listSalaryAdvanceDetail.length || 0;
        this.totalPages = this.listSalaryAdvanceDetail.length / (10 + 1);
        this.loading = false;
    }

    onSubmit() {
        this.salaryAdvanceService
            .updateSalaryAdvanceAccept(
                {
                    ...this.selectedItem,
                    items: cloneDeep(this.listSalaryAdvanceDetail),
                },
                this.selectedItem.id,
            )
            .subscribe(
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
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.0',
                        ),
                    });
                },
            );
        this.onCancel.emit({});
    }
    onBack() {
        this.onCancel.emit({});
    }

    onSave() {
        this.salaryAdvanceService
            .updateSalaryAdvance(
                {
                    ...this.selectedItem,
                    items: cloneDeep(this.listSalaryAdvanceDetail),
                },
                this.selectedItem.id,
            )
            .subscribe(
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
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.0',
                        ),
                    });
                },
            );
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
