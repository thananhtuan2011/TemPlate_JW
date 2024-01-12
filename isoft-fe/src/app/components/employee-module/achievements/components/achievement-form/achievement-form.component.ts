import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DecideService } from 'src/app/service/decide.service';
import { UserService } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppUtil from 'src/app/utilities/app-util';
import * as moment from 'moment';
import { AchievementService } from 'src/app/service/achievement.service';

@Component({
    selector: 'app-achievement-form',
    templateUrl: './achievement-form.component.html',
    styles: [
        `
            :host ::ng-deep {
            }
        `,
    ],
})
export class AchievementFormComponent implements OnInit {
    public appConstant = AppConstant;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';

    achievementForm: FormGroup = this.fb.group({
        id: [''],
        userId: ['', [Validators.required]],
        description: [''],
        name: [''],
        date: [''],
        note: [''],
        code: [''],
    });

    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;
    types: any[] = [
        { id: 1, name: 'Loại quyết định mới' },
        { id: 2, name: 'ádasd' },
    ];
    employees: any[] = [];
    decideTypes: any[] = [
        {
            id: 1,
            name: 'Loại quyết định mới',
            description: null,
            status: true,
            createAt: '2020-12-14T11:25:47.397',
            updateAt: '2020-12-14T13:59:12.187',
            deleteAt: null,
            isDelete: false,
            userCreated: 665,
            userUpdated: 665,
        },
        {
            id: 2,
            name: 'ádasd',
            description: null,
            status: true,
            createAt: '2020-12-14T14:54:22.733',
            updateAt: '2020-12-14T14:54:22.733',
            deleteAt: null,
            isDelete: false,
            userCreated: 665,
            userUpdated: 665,
        },
    ];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private readonly userService: UserService,
        private readonly achievementService: AchievementService, // private router: Router,
        // private route: ActivatedRoute
    ) {

    }
    ngOnChanges(changes: SimpleChanges): void {
        this.getAllUserActive();
        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.achievementForm.patchValue({
                id: this.formData.id,
                userId: this.employees.filter((data) => {
                    return this.formData.userId == data.id;
                })[0],
                code: this.formData.code,
                name: this.formData.name,
                date: moment(this.formData.date).format(
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ),
                note: this.formData.note,
                description: this.formData.description,
            });
            console.log(this.achievementForm.value);
        }
    }

    onReset() {
        this.isInvalidForm = false;
        this.achievementForm.reset();
    }

    ngOnInit() { }

    getAllUserActive() {
        this.userService.getAllUserActive().subscribe((res: any) => {
            this.employees = res.data;
        });
    }

    checkValidValidator(fieldName: string) {
        return ((this.achievementForm.controls[fieldName].dirty ||
            this.achievementForm.controls[fieldName].touched) &&
            this.achievementForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.achievementForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }

    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.achievementForm.invalid) {
            this.messageService.add({
                severity: 'error',
                detail: AppUtil.translate(
                    this.translateService,
                    'info.please_check_again',
                ),
            });
            this.isInvalidForm = true;
            this.isSubmitted = false;
            return;
        }

        let date = moment(
            AppUtil.adjustDateOffset(this.achievementForm.value.date),
        ).format('YYYY-MM-DD');

        this.achievementForm.value.date =
            date == 'Invalid date'
                ? moment(
                    this.achievementForm.value.date,
                    AppConstant.FORMAT_DATE.VN_DATE_PIPE_SHORT_DATE,
                ).format(AppConstant.FORMAT_DATE.T_DATE)
                : date;

        let newData = this.cleanObject(
            AppUtil.cleanObject(this.achievementForm.value),
        );

        this.onCancel.emit({});
        const payload = new FormData()
        Object.keys(newData).forEach(t => {
            payload.append(t, newData[t])
        })

        // Append file attached`
        if(this.selectedFile) {
            payload.append('file', this.selectedFile)
        }

        // Insert or update action
        let doAction = this.isEdit 
            ? this.achievementService.updateAchievement(this.achievementForm.value.id, payload)
            : this.achievementService.createAchievement(payload);

        doAction.subscribe((res: any) => {
            const { code } = res;

            // Not OK status
            if (code != 200) {
                this.messageService.add({
                    severity: 'error',
                    detail: res?.msg || '',
                });
                return;
            }

            this.messageService.add({
                severity: 'success',
                detail: `${this.isEdit ? 'Thêm mới': 'Cập nhật'  } thành công`,
            });
            this.onCancel.emit({})
        })
    }

    onBack() {
        this.onCancel.emit({});
    }
    selectedFile = null
    doAttachFile(event: any): void {
        if (event) {
            this.selectedFile = event.target?.files[0];
        }
    }

    cleanObject(data) {
        let newData = Object.assign({}, data);
        console.log(newData);
        if (true) {
            newData.userId = this.achievementForm.value.userId.id;
            newData.description = this.achievementForm.value.description;
            newData.name = this.achievementForm.value.name;
            newData.note = this.achievementForm.value.note;
            newData.date = this.achievementForm.value.date
                ? moment(this.achievementForm.value.date).format('YYYY-MM-DD')
                : null;
            newData.code = this.achievementForm.value.code;
        }
        return newData;
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.onSubmit();
                break;
            case 'F6':
                event.preventDefault();
                this.onCancel.emit({});
                break;
        }
    }
}
