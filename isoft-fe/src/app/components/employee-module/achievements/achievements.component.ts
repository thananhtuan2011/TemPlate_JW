import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TypeData } from 'src/app/models/common.model';
import { environment } from 'src/environments/environment';
import AppUtil from 'src/app/utilities/app-util';
import { TranslateService } from '@ngx-translate/core';
import AppConstant from 'src/app/utilities/app-constants';
import {
    PageFilterBranch,
    BranchService,
} from 'src/app/service/branch.service';
import { Branch } from 'src/app/models/branch.model';
import { Router } from '@angular/router';
import { DecideService } from 'src/app/service/decide.service';
import { AchievementService } from 'src/app/service/achievement.service';
import { AchievementFormComponent } from './components/achievement-form/achievement-form.component';
import { UserRoleCRUD } from 'src/app/models/user-role.model';
@Component({
    selector: 'app-achievements',
    templateUrl: './achievements.component.html',
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
            
            :host ::ng-deep .group-td {
                float:left;
                display: flex; 
                flex-direction:row; 
                align-items: center;
                width: 50%;
            }
        `,
    ],
})
export class AchievementsComponent implements OnInit {
    public appConstant = AppConstant;
    @ViewChild('decideForm') AchievementFormComponent:
        | AchievementFormComponent
        | undefined;

    loading: boolean = true;

    sortFields: any[] = [];
    sortTypes: any[] = [];

    first = 0;

    public getParams: PageFilterBranch = {
        page: 0,
        pageSize: 10,
        searchText: '',
    };
    public totalRecords = 0;
    public totalPages = 0;

    public isLoading: boolean = false;

    public lstAchi: Branch[] = [];

    display: boolean = false;

    isMobile = screen.width <= 1199;

    formData: any = {};
    isEdit: boolean = false;
    isReset: boolean = false;

    pendingRequest: any;
    cols: any[] = [
        {
            header: 'label.date',
            value: 'date',
            width: 'width:10%;',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.code_achi',
            value: `code`,
            width: 'width:10%;',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.employee_name',
            value: 'fullName',
            width: 'width:15%;',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
       
        {
            header: 'label.name_achi',
            value: `name`,
            width: 'width:15%;',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.files',
            value: `fileUrl`,
            width: 'width:20%;',
            display: true,
            classify: 'personal_info',
            optionHide: false,
        },
        {
            header: 'label.description',
            value: 'description',
            width: 'width:20%;',
            display: true,
            classify: 'personal_info',
            optionHide: true,
        },
      
        {
            header: 'label.note',
            value: 'note',
            width: 'width:20%;',
            display: true,
            classify: 'personal_info',
            optionHide: true,
        },
    ];
    constructor(
        private messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly achievementService: AchievementService,
        private router: Router,
    ) { }

    ngOnInit() {
        AppUtil.getUserSortTypes(this.translateService).subscribe((res) => {
            this.sortFields = res;
        });
        AppUtil.getSortTypes(this.translateService).subscribe((res) => {
            this.sortTypes = res;
        });
    }

    onSearch(event) {
        if (event.key === 'Enter') {
            this.getAchievement();
        }
    }

    onChangeSort(event, type) {
        if (type === 'sortType') {
            this.getParams.isSort = event.value;
        }
        this.getAchievement();
    }

    getAchievement(event?: any, isExport: boolean = false): void {
        if (this.pendingRequest) {
            this.pendingRequest.unsubscribe();
        }
        this.loading = true;
        if (event) {
            this.getParams.page = event.first / event.rows;
            this.getParams.pageSize = event.rows;
        }
        if (isExport) {
            this.achievementService
                .getExcelReport(this.getParams)
                .subscribe((res: any) => {
                    AppUtil.scrollToTop();
                    this.openDownloadFile(res.data, 'excel');
                });
        }
        // remove undefined value
        Object.keys(this.getParams).forEach(
            (k) => this.getParams[k] == null && delete this.getParams[k],
        );
        this.pendingRequest = this.achievementService
            .getListAchi(this.getParams)
            .subscribe((response: TypeData<Branch>) => {
                AppUtil.scrollToTop();
                this.lstAchi = response.data;
                console.log(this.lstAchi);

                this.totalRecords = response.totalItems || 0;
                this.totalPages = response.totalItems / response.pageSize + 1;
                this.loading = false;
            });
    }

    getDetail(achi) {
        // this.formData = achi;
        // console.log(achi);

        // this.isEdit = true;
        // this.showDialog();
        this.achievementService
            .getDetail(achi.id)
            .subscribe((response: Branch) => {
                this.formData = response;
                this.isEdit = true;
                this.showDialog();
            });
    }

    onAddDecide() {
        this.isEdit = false;
        this.showDialog();
    }

    onDelete(decideId) {
        let message;
        let header;
        this.translateService
            .get('question.delete_decide_content')
            .subscribe((res) => {
                message = res;
            });
        this.translateService
            .get('question.delete_decide_header')
            .subscribe((res) => {
                header = res;
            });
        this.confirmationService.confirm({
            header: header,
            message: message,
            accept: () => {
                this.achievementService
                    .deleteDecide(decideId)
                    .subscribe((response: any) => {
                        this.getAchievement();
                    });
            },
        });
    }

    private openDownloadFile(_fileName: string, _ft: string) {
        try {
            this.isLoading = false;
            var _l = this.achievementService.getFolderPathDownload(
                _fileName,
                _ft,
            );
            if (_l) window.open(_l);
        } catch (ex) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: 'File invalid',
            });
        }
    }

    baseUrlImage(image) {
        return `${environment.serverURL}/${image}`;
    }

    showDialog() {
        this.AchievementFormComponent.onReset();
        this.display = true;
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
