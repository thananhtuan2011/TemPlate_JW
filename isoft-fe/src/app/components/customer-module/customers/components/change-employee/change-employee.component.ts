import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { AppMainComponent } from 'src/app/layouts/app.main.component';
import { TypeData } from 'src/app/models/common.model';
import { CustomerContactHistory } from 'src/app/models/customer-contact-history.model';
import { Customer } from 'src/app/models/customer.model';
import { Description } from 'src/app/models/description.model';
import { AccountBalanceSheetReportService } from 'src/app/service/account-balance-sheet-report';
import {
    CustomerContactHistoryService,
    PageFilterCustomerContactHistory,
} from 'src/app/service/customer-contact-history.service';
import { DescriptionService } from 'src/app/service/description.service';
import { PageFilterPayer } from 'src/app/service/payer.service';
import AppConstant from 'src/app/utilities/app-constants';
import { environment } from 'src/environments/environment';
import { UserService } from '../../../../../service/user.service';
import { MessageService } from 'primeng/api';
import AppUtil from '../../../../../utilities/app-util';
import { TranslateService } from '@ngx-translate/core';
import { CustomerService } from 'src/app/service/customer.service';

@Component({
    selector: 'app-change-employee',
    templateUrl: './change-employee.component.html',
    styles: [
        `
            :host ::ng-deep {
                .p-dropdown .p-dropdown-panel {
                    max-width: unset;
                }

                .p-calendar .p-datepicker {
                    min-width: 300px;
                }

                .card-table {
                    min-height: auto !important;
                }

                .p-paginator {
                    height: auto !important;
                }

                .p-disabled {
                    background-color: inherit !important;
                }

                .p-button,
                .p-button .p-button-icon-left,
                .p-datatable-scrollable-both .p-datatable-tbody > tr > td {
                    font-size: 0.875rem !important;
                }

                .p-datatable-tbody {
                    min-height: auto !important;
                }

                .card {
                    padding: 0 !important;
                }

                .field {
                    margin-bottom: 0 !important;
                }

                p-badge,
                .p-badge {
                    width: 100% !important;
                }

                .p-badge {
                    text-overflow: ellipsis !important;
                    overflow: hidden !important;
                    white-space: nowrap !important;
                }
            }
        `,
    ],
})
export class ChangeEmployeeComponent implements OnInit {
    @Input('visible') visible: boolean = false;
    @Input('customers') customers: any[] = [];
    @Output() onChangeSuccess = new EventEmitter();
    @Output() onHidden = new EventEmitter();

    changeEmployee: any = {
        userId: 0,
        customerIds: [],
    };

    employees: any[] = [];

    constructor(
        private readonly userService: UserService,
        private messageService: MessageService,
        private translateService: TranslateService,
        private readonly customerService: CustomerService,
    ) {}

    ngOnInit(): void {
        this.getAllUserActive();
    }

    getAllUserActive() {
        this.userService.getAllUserActive().subscribe((res: any) => {
            this.employees = res.data;
        });
    }

    onSaveChange() {
        this.changeEmployee.customerIds = this.customers.map((item) => item.id);
        this.visible = false;
        this.customerService
            .updateUserCreate(this.changeEmployee)
            .subscribe((response: any) => {
                this.onChangeSuccess.emit(this.changeEmployee);
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        'success.change_employee',
                    ),
                });
            });
    }
}
