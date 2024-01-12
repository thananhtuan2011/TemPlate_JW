import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AllowanceModel } from '../../../../models/allowance.model';
import { Subject } from 'rxjs';
import { CompanyService } from '../../../../service/company.service';
import { AllowanceService } from '../../../../service/allowance.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { AllowanceUserService } from '../../../../service/allowance-user.service';
import AppUtil from '../../../../utilities/app-util';
import { UserService } from '../../../../service/user.service';

@Component({
    selector: 'app-allowance-user-form',
    templateUrl: './allowance-user-form.component.html',
    styleUrls: [],
})
export class AllowanceUserFormComponent implements OnInit {
    @Input() display = false;

    @Input() set formData(value) {
        if (value?.id) {
            this.isEdit = true;
            this.allowanceUserModel = Object.assign(
                this.allowanceUserModel,
                value,
            );
        } else {
            this.isEdit = false;
            this.allowanceUserModel = {};
        }
    }

    @Output() onCancel = new EventEmitter();
    isEdit = false;
    allowanceUserModel: any = {};

    constructor(
        private readonly companyService: CompanyService,
        private readonly allowanceUserService: AllowanceUserService,
        private readonly translateService: TranslateService,
        private readonly messageService: MessageService,
        private readonly userService: UserService,
    ) {}

    ngOnInit(): void {}

    onSave(): void {
        if (this.allowanceUserModel?.id)
            this.allowanceUserService
                .updateAllowanceUser(
                    this.allowanceUserModel,
                    this.allowanceUserModel.id,
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
                        this.onCancel.emit({});
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
        else
            this.allowanceUserService
                .createAllowanceUser(this.allowanceUserModel)
                .subscribe(
                    (res) => {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.create',
                            ),
                        });
                        this.onCancel.emit({});
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
}
