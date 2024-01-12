import { Component, HostListener, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Page, TypeData } from '../../../models/common.model';
import { CareerModel } from '../../../models/web-setting/career.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { CareerService } from '../../../service/web-setting/career.service';
import AppUtil from '../../../utilities/app-util';
import {
    CareerGroupType,
    WorkingMethodType,
} from '../../../utilities/app-enum';
import AppConstant from '../../../utilities/app-constants';

@Component({
    selector: 'app-recruit-web',
    templateUrl: './recruit-web.component.html',
    styles: [``],
    providers: [MessageService, ConfirmationService],
})
export class RecruitWebComponent implements OnInit {
    appConstant = AppConstant;
    serverImage = `${environment.serverURLImage}/`;
    display: boolean = false;
    formData = {};
    loading: boolean = false;
    result: TypeData<CareerModel> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };
    param: Page = {
        page: 1,
        pageSize: 20,
    };
    isMobile = screen.width <= 1199;
    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly careerService: CareerService,
    ) {}

    ngOnInit(): void {
        this.getCareers();
    }

    getCareers(event?: any) {
        if (event) {
            this.param.page = event.first / event.rows;
            this.param.pageSize = event.rows;
        }
        this.careerService.getPagingCareer(this.param).subscribe(
            (res) => {
                AppUtil.scrollToTop();
                this.result = {
                    ...res,
                    data: res?.data?.map((item) => {
                        return {
                            ...item,
                            groupName:
                                item.group === CareerGroupType.Office
                                    ? 'Văn phòng'
                                    : item.group === CareerGroupType.Sale
                                    ? 'Bán hàng'
                                    : '',
                            workingMethodName:
                                item.workingMethod ===
                                WorkingMethodType.FullTime
                                    ? 'Toàn thời gian'
                                    : item.workingMethod ===
                                      WorkingMethodType.PartTime
                                    ? 'Bán thời gian'
                                    : item.workingMethod ===
                                      WorkingMethodType.Shift
                                    ? 'Ca'
                                    : '',
                        };
                    }),
                };
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    onAddCareer() {
        this.display = true;
        this.formData = {};
    }

    getCareerDetail(item) {
        this.display = true;
        this.formData = item;
    }

    onDeleteCareer(item) {
        let message;
        this.translateService
            .get('question.delete_web_career_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.careerService.deleteCareer(item?.id).subscribe(
                    (res) => {
                        AppUtil.scrollToTop();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.getCareers();
                    },
                    (error) => {
                        this.messageService.add({
                            severity: 'error',
                            detail: AppUtil.translate(
                                this.translateService,
                                'error.0',
                            ),
                        });
                    },
                );
            },
        });
    }

    onCancelForm(event) {
        this.display = false;
        this.formData = {};
        this.getCareers();
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddCareer();
                break;
        }
    }
}
