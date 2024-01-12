import { Component, HostListener, OnInit } from '@angular/core';
import { LanguagePage, Page, TypeData } from '../../../models/common.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import AppUtil from '../../../utilities/app-util';
import { SliderService } from '../../../service/web-setting/slider.service';
import { SliderViewModel } from '../../../models/web-setting/slider.model';
import { LanguageType, SliderPosition } from '../../../utilities/app-enum';
import { environment } from '../../../../environments/environment';
import AppConstant from '../../../utilities/app-constants';

@Component({
    selector: 'app-slider-web',
    templateUrl: './slider-web.component.html',
    styles: [``],
    providers: [MessageService, ConfirmationService],
})
export class SliderWebComponent implements OnInit {
    appConstant = AppConstant;
    serverImage = `${environment.serverURLImage}/`;
    display: boolean = false;
    formData = {};
    loading: boolean = false;
    result: TypeData<SliderViewModel> = {
        data: [],
        currentPage: 0,
        nextStt: 0,
        pageSize: 20,
        totalItems: 0,
    };

    languageTypes = AppUtil.getLanguageTypes();
    adsensePositions = [];
    param: any = {
        page: 1,
        pageSize: 20,
        Type: 2,
        AdsensePosition: 0,
    };
    isMobile = screen.width <= 1199;
    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly sliderService: SliderService,
    ) { }

    ngOnInit(): void {
        this.getSliders();
        this.adsensePositions = [
            {
                value: SliderPosition.LARGE_SLIDER,
                name: 'Slider lớn',
            },
            {
                value: SliderPosition.SMALL_IMAGE,
                name: 'Hình nhỏ',
            },
            {
                value: SliderPosition.PRIORITY_IMAGE,
                name: 'Ảnh tuyên ngôn giá trị',
            },
            {
                value: SliderPosition.SLIDE_ONE_PAGE,
                name: 'Slider One Page',
            },
            {
                value: SliderPosition.NEW_SLIDER,
                name: 'Slider mới',
            }
        ];
    }

    getSliders(event?: any) {
        if (event) {
            this.param.page = event.first / event.rows;
            this.param.pageSize = event.rows;
        }
        this.sliderService.getPagingSlider(this.param).subscribe(
            (res) => {
                AppUtil.scrollToTop();
                this.result = {
                    ...res,
                    data: res?.data?.map((item) => {
                        return {
                            id: item.id,
                            type: item.type,
                            typeName: AppUtil.getLanguageTypes().find(x => x.value === item.type).name,
                            name: item.name,
                            image: item.img,
                            imageUrl: item.img
                                ? this.serverImage + item.img
                                : '',
                            createAt: item.createAt,
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

    onAddSlider() {
        this.display = true;
        this.formData = {};
    }

    getSliderDetail(item) {
        this.display = true;
        this.sliderService.getSliderDetail(item.id).subscribe(
            (res) => {
                this.formData = res;
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    detail: 'Lỗi lấy dữ liệu',
                });
            },
        );
    }

    getLanguage(type) {
        let temp = this.languageTypes.find(x => x.value === type);
        return temp ? temp.name : '';
    }

    onDeleteSlider(item) {
        let message;
        this.translateService
            .get('question.delete_web_slider_content')
            .subscribe((res) => {
                message = res;
            });
        this.confirmationService.confirm({
            message: message,
            accept: () => {
                this.sliderService.deleteSlider(item.id).subscribe(
                    (res) => {
                        AppUtil.scrollToTop();
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.delete',
                            ),
                        });
                        this.getSliders();
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
        this.getSliders();
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F7':
                event.preventDefault();
                await this.onAddSlider();
                break;
        }
    }
}
