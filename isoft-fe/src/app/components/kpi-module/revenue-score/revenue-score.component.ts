import {
    Component,
    OnInit,
    ViewChild,
    ChangeDetectorRef,
    HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'lodash';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Branch } from 'src/app/models/branch.model';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
import { PageFilterBranch } from 'src/app/service/branch.service';
import { KPIScoreService } from 'src/app/service/kpi-score.service';
import AppUtil from 'src/app/utilities/app-util';
import { RevenueScoreFormComponent } from './components/revenue-score-form/revenue-score-form.component';
import { KPIScore } from '../../../utilities/app-enum';
import AppConstants from '../../../utilities/app-constants';

@Component({
    selector: 'app-revenue-score',
    templateUrl: './revenue-score.component.html',
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
    providers: [ConfirmationService],
})
export class RevenueScoreComponent implements OnInit {
    appConstant = AppConstants;

    @ViewChild('decideForm') RevenueScoreFormComponent:
        | RevenueScoreFormComponent
        | undefined;
    display: boolean = false;
    loading: boolean = false;
    isMobile = screen.width <= 1199;
    first = 0;
    formData: any = {};
    isReset: boolean = false;
    isEdit: boolean = false;
    listData = [];
    cols: any[] = [
        {
            header: 'label.kpi_code',
            value: 'code',
            width: 'w-2',
            display: true,
            classify: 'personal_info',
            optionHide: false,
            type: '',
        },
        {
            header: 'label.name_kpi',
            value: 'name',
            width: 'w-3',
            display: true,
            classify: 'personal_info',
            optionHide: false,
            type: '',
        },
        {
            header: 'label.revenue_from',
            value: 'fromValue',
            width: 'w-2 justify-content-end',
            display: true,
            classify: 'personal_info',
            optionHide: false,
            type: 'number',
        },
        {
            header: 'label.revenue_to',
            value: 'toValue',
            width: 'w-2 justify-content-end',
            display: true,
            classify: 'personal_info',
            optionHide: false,
            type: 'number',
        },
        {
            header: 'label.kpi_score',
            value: 'point',
            width: 'w-2 justify-content-end',
            display: true,
            classify: 'personal_info',
            optionHide: false,
            type: 'number',
        },
        {
            header: '',
            value: 'decideTypeId',
            width: 'w-1',
            display: false,
            classify: 'account',
            optionHide: false,
            type: '',
        },
    ];
    pendingRequest: any;
    public totalRecords = 0;
    public totalPages = 0;
    public getParams: any = {
        page: 1,
        pageSize: 10,
        searchText: '',
        type: KPIScore.RevenueScore,
    };

    constructor(
        private messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private kpiScoreService: KPIScoreService,
        private cdr: ChangeDetectorRef,
        private router: Router,
    ) {}

    ngOnInit(): void {}

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    getRevenueScore(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows + 1;
            this.getParams.pageSize = event.rows;
        }
        this.pendingRequest = this.kpiScoreService
            .getPagingKPIScore(this.getParams)
            .subscribe((response) => {
                AppUtil.scrollToTop();
                // this.listData = filter(response.data, ['type', 1]);
                this.listData = response.data;
                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    onAdd() {
        this.isEdit = false;
        this.formData = {};
        this.showDialog();
    }

    onSearch(event) {
        // if (event.key === 'Enter') {
        //     this.getAchievement();
        // }
    }

    showDialog() {
        this.RevenueScoreFormComponent.onReset();
        this.display = true;
    }

    getDetail(item): void {
        this.display = true;
        this.formData = item;
        this.isEdit = true;
    }

    onDelete(id): void {
        this.confirmationService.confirm({
            message: AppUtil.translate(
                this.translateService,
                'Bạn có muốn xóa điểm doanh số này?',
            ),
            header: AppUtil.translate(
                this.translateService,
                'Xóa Điểm doanh số',
            ),
            accept: () => {
                this.kpiScoreService.deleteKPIScore(id).subscribe((res) => {
                    AppUtil.scrollToTop();
                    this.getRevenueScore();
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.delete',
                        ),
                    });
                });
            },
        });
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAdd();
                break;
        }
    }

    protected readonly AppConstants = AppConstants;
}
