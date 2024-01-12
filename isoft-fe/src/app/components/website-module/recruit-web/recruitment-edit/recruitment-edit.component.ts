import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CareerModel } from '../../../../models/web-setting/career.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { NewsService } from '../../../../service/web-setting/news.service';
import { CareerService } from '../../../../service/web-setting/career.service';
import {
    CareerGroupType,
    LanguageType,
    WorkingMethodType,
} from '../../../../utilities/app-enum';
import AppUtil from '../../../../utilities/app-util';

@Component({
    selector: 'app-recruitment-edit',
    templateUrl: './recruitment-edit.component.html',
    styleUrls: [],
})
export class RecruitmentEditComponent implements OnInit {
    @Input() display = false;

    @Input() set formData(value) {
        if (value?.id) {
            this.isEdit = true;
            this.newsModel = Object.assign(this.newsModel, value);
        } else {
            this.isEdit = false;
            this.newsModel = {
                expiredApply: new Date(),
                type: 2
            };
        }
    }

    @Output() onCancel = new EventEmitter();
    serverImg = environment.serverURLImage;
    isEdit = false;
    newsModel: CareerModel = {};
    languageTypes = [];
    careerGroupTypes = [];
    workingMethodTypes = [];

    constructor(
        private readonly messageService: MessageService,
        private readonly translateService: TranslateService,
        private readonly confirmationService: ConfirmationService,
        private readonly careerService: CareerService,
    ) {}

    ngOnInit(): void {
        this.languageTypes = AppUtil.getLanguageTypes();
        this.careerGroupTypes = [
            {
                value: CareerGroupType.Office,
                name: 'Văn phòng',
            },
            {
                value: CareerGroupType.Sale,
                name: 'Bán hàng',
            },
        ];
        this.workingMethodTypes = [
            {
                value: WorkingMethodType.Shift,
                name: 'Ca',
            },
            {
                value: WorkingMethodType.FullTime,
                name: 'Toàn thời gian',
            },
            {
                value: WorkingMethodType.PartTime,
                name: 'Bán thời gian',
            },
        ];
    }

    onSave() {
        if (this.newsModel.id) {
            this.careerService
                .updateCareer(this.newsModel, this.newsModel.id)
                .subscribe(
                    (res) => {
                        if (res) {
                            this.messageService.add({
                                severity: 'success',
                                detail: AppUtil.translate(
                                    this.translateService,
                                    'success.update',
                                ),
                            });
                            this.onCancel.emit({});
                        }
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
            this.careerService.createCareer(this.newsModel).subscribe(
                (res) => {
                    if (res) {
                        this.messageService.add({
                            severity: 'success',
                            detail: AppUtil.translate(
                                this.translateService,
                                'success.create',
                            ),
                        });
                        this.onCancel.emit({});
                    }
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
