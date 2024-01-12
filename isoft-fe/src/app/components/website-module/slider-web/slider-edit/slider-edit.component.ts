import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import {
    SliderModel,
    SliderViewModel,
} from '../../../../models/web-setting/slider.model';
import {LanguageType, SliderPosition} from '../../../../utilities/app-enum';
import AppUtil from '../../../../utilities/app-util';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { SliderService } from '../../../../service/web-setting/slider.service';
import { FileService } from '../../../../service/file.service';

@Component({
    selector: 'app-slider-edit',
    templateUrl: './slider-edit.component.html',
    styleUrls: [],
})
export class SliderEditComponent implements OnInit {
    @Input() display = false;

    @Input() set formData(value) {
        if (value?.id) {
            this.isEdit = true;
            this.sliderModel = Object.assign(this.sliderModel, value);
            this.sliderModel.image = value.img;
            this.sliderModel.imageUrl = value.img;
        } else {
            this.isEdit = false;
            this.sliderModel = {
                type: 2,
            };
        }
    }

    @Output() onCancel = new EventEmitter();
    isEdit = false;
    sliderModel: SliderViewModel = {
        createAt: new Date()
    };
    languageTypes = [];
    adsensePositions = [];
    file: any;

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly sliderService: SliderService,
        private readonly fileService: FileService,
    ) {}

    ngOnInit(): void {
        this.languageTypes = AppUtil.getLanguageTypes();
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

    onUploadFile(event) {
        this.file = event.currentFiles[0];
        let reader = new FileReader();
        reader.readAsDataURL(this.file);
        reader.onload = (event) => {
            this.sliderModel.image = event.target.result;
            this.sliderModel.imageUrl = event.target.result;
        };
    }

    async onSave() {
        let requestModel: SliderModel = {
            id: this.sliderModel.id,
            type: this.sliderModel.type,
            name: this.sliderModel.name,
            img: this.sliderModel.image || '',
            adsensePosition: this.sliderModel.adsensePosition || 0,
            createAt: new Date(),
        };
        console.log(this.sliderModel)
        if (this.file) {
            requestModel.img = await this.fileService.uploadMedia(
                this.file,
                'Sliders',
            );
        }
        if (requestModel.id) {
            this.sliderService
                .updateSlider(requestModel, requestModel.id)
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
                        this.file = null;
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
        } else {
            this.sliderService.createSlider(requestModel).subscribe(
                (res) => {
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.create',
                        ),
                    });
                    this.onCancel.emit({});
                    this.file = null;
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
