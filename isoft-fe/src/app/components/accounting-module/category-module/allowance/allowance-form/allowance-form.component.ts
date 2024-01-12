import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { SocialModel } from '../../../../../models/web-setting/social.model';
import { AllowanceModel } from '../../../../../models/allowance.model';
import { AllowanceService } from '../../../../../service/allowance.service';
import { CompanyService } from '../../../../../service/company.service';
import { BehaviorSubject, debounceTime, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import AppUtil from '../../../../../utilities/app-util';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-allowance-form',
    templateUrl: './allowance-form.component.html',
    styleUrls: [],
})
export class AllowanceFormComponent implements OnInit {
    @Input() display = false;

    @Input() set formData(value) {
        if (value?.id) {
            this.isEdit = true;
            this.allowanceModel = Object.assign(this.allowanceModel, value);
            if (this.allowanceModel.companyId)
                this.getCompanyById(this.allowanceModel.companyId);
        } else {
            this.isEdit = false;
            this.allowanceModel = {};
            this.getCompanies('');
        }
    }

    @Output() onCancel = new EventEmitter();
    isEdit = false;
    allowanceModel: AllowanceModel = {};
    statuses = [
        {
            value: true,
            label: 'Active',
        },
        {
            value: false,
            label: 'InActive',
        },
    ];
    companies = [];
    companyTextSearch = new Subject<string>();

    constructor(
        private readonly companyService: CompanyService,
        private readonly allowanceService: AllowanceService,
        private readonly translateService: TranslateService,
        private readonly messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.companyTextSearch.pipe(debounceTime(400)).subscribe((value) => {
            this.getCompanies(value);
        });
    }

    onSave(): void {
        if (this.allowanceModel?.id)
            this.allowanceService
                .updateAllowance(this.allowanceModel, this.allowanceModel.id)
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
            this.allowanceService
                .createAllowance(this.allowanceModel)
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

    getCompanies(keyword?: string): void {
        const params = {
            page: 1,
            pageSize: 20,
            searchText: keyword || '',
        };
        this.companyService.getListCompany(params).subscribe((res) => {
            this.companies = res?.data || [];
        });
    }

    getCompanyById(id: number): void {
        this.companyService.getCompanyDetail(id).subscribe((res) => {
            this.companies.push(res);
        });
    }

    onSearchCompany(event): void {
        this.companyTextSearch.next(event.filter);
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.onSave();
                break;
            case 'F6':
                event.preventDefault();
                this.onCancel.emit({});
                break;
        }
    }
}
