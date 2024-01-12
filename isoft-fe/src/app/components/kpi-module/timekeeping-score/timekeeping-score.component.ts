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
import { TimekeepingScoreFormComponent } from './components/timekeeping-score-form/timekeeping-score-form.component';
import { KPIScore } from '../../../utilities/app-enum';
import AppConstants from '../../../utilities/app-constants';

@Component({
    selector: 'app-timekeeping-score',
    templateUrl: './timekeeping-score.component.html',
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
export class TimekeepingScoreComponent implements OnInit {
    appConstant = AppConstants;
    @ViewChild('decideForm') TimekeepingScoreFormComponent:
        | TimekeepingScoreFormComponent
        | undefined;
    display: boolean = false;
    loading: boolean = false;
    isMobile = screen.width <= 1199;
    first = 0;
    formData: any = {};
    isReset: boolean = false;
    isEdit: boolean = false;
    public lstAchi: Branch[] = [];
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
            header: 'label.go_late',
            value: 'fromValue',
            width: 'w-2 justify-content-end',
            display: true,
            classify: 'personal_info',
            optionHide: false,
            type: 'number',
        },
        {
            header: 'label.go_soon',
            value: `toValue`,
            width: 'w-2 justify-content-end',
            display: true,
            classify: 'personal_info',
            optionHide: false,
            type: 'number',
        },
        {
            header: 'label.kpi_score',
            value: `point`,
            width: 'w-2 justify-content-end',
            display: true,
            classify: 'personal_info',
            optionHide: false,
            type: 'number',
        },
        {
            header: '',
            value: 'decideTypeId',
            width: 'w-2',
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
        type: KPIScore.TimekeepingScore,
    };
    listData = [];

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

    getTimeKeepingScore(event?: any, isExport: boolean = false): void {
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
                this.listData = filter(response.data, ['type', 0]);
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
        this.TimekeepingScoreFormComponent.onReset();
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
                    this.getTimeKeepingScore();
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
}
