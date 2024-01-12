import {
    AfterViewInit,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { User } from 'src/app/models/user.model';
import { RelationService } from 'src/app/service/relation.service';
import { UserService } from 'src/app/service/user.service';
import AppConstant from 'src/app/utilities/app-constants';
import AppData from 'src/app/utilities/app-data';
import {
    default as AppUtil,
    default as appUtil,
} from 'src/app/utilities/app-util';

@Component({
    selector: 'app-relation-form',
    templateUrl: './relation-form.component.html',
    styles: [
        `
            :host ::ng-deep {
                #phonePrefix .p-dropdown {
                    width: 93px;
                }
                .p-calendar {
                    width: 100%;
                }
            }
        `,
    ],
})
export class RelationFormComponent implements OnInit, OnChanges, AfterViewInit {
    public appConstant = AppConstant;
    public appUtil = appUtil;
    @Input('formData') formData: any = {};
    @Input('isReset') isReset: boolean = false;
    @Input('isEdit') isEdit: boolean = false;
    @Input('display') display: boolean = false;
    @Output() onCancel = new EventEmitter();
    title: string = '';
    RelationForm: FormGroup = new FormGroup({});
    optionCountries = AppData.COUNTRIES;
    countryCodes: any[] = [];
    isSubmitted = false;
    isInvalidForm = false;
    failPassword: boolean = false;
    typeLists = [
        { name: 'Trong công ty', value: 1 },
        { name: 'Ngoài công ty', value: 2 },
    ];
    userLists: User[] = [];
    listInCompany = [];

    constructor(
        private fb: FormBuilder,
        private translateService: TranslateService,
        private messageService: MessageService,
        private RelationService: RelationService,
        private userService: UserService,
    ) {
        this.RelationForm = this.fb.group({
            id: [0],
            employeeId: [0, Validators.required],
            employeeName: [''],
            personOppositeId: [0, Validators.required],
            personOppositeName: [''],
            claimingYourself: ['', Validators.required],
            proclaimedOpposite: ['', Validators.required],
            type: 1,
            userId: [514],
        });
    }
    ngAfterViewInit(): void {
        this.RelationForm.controls['type'].valueChanges.subscribe((data) => {
            console.log(data);
        });
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (
            this.isEdit &&
            this.formData &&
            Object.keys(this.formData).length > 0
        ) {
            this.title = AppUtil.translate(
                this.translateService,
                'label.relation_update',
            );
            this.RelationForm.patchValue({
                id: this.formData.id,
                employeeId: this.formData.code,
                employeeName: this.formData.name,
                personOppositeId: this.formData.personOppositeId,
                personOppositeName: this.formData.personOppositeName,
                claimingYourself: this.formData.claimingYourself,
                proclaimedOpposite: this.formData.proclaimedOpposite,
                type: this.formData.type,
                userId: this.formData.userId,
            });
        } else {
            this.title = AppUtil.translate(
                this.translateService,
                'label.shift_add',
            );
        }
    }
    onReset() {
        this.isInvalidForm = false;
        this.RelationForm.reset();
    }
    ngOnInit() {
        this.getAllUser();
        this.RelationService.getAllUserActive().subscribe(
            (res) => (this.userLists = res.data || []),
        );
    }
    checkValidValidator(fieldName: string) {
        return ((this.RelationForm.controls[fieldName].dirty ||
            this.RelationForm.controls[fieldName].touched) &&
            this.RelationForm.controls[fieldName].invalid) ||
            (this.isInvalidForm &&
                this.RelationForm.controls[fieldName].invalid)
            ? 'ng-invalid ng-dirty'
            : '';
    }
    checkValidMultiValidator(fieldNames: string[]) {
        for (let i = 0; i < fieldNames.length; i++) {
            if (
                ((this.RelationForm.controls[fieldNames[i]].dirty ||
                    this.RelationForm.controls[fieldNames[i]].touched) &&
                    this.RelationForm.controls[fieldNames[i]].invalid) ||
                (this.isInvalidForm &&
                    this.RelationForm.controls[fieldNames[i]].invalid)
            ) {
                return true;
            }
        }
        return false;
    }
    onSubmit() {
        this.isSubmitted = true;
        this.isInvalidForm = false;
        if (this.RelationForm.invalid) {
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
        let newData = this.cleanObject(
            AppUtil.cleanObject(this.RelationForm.value),
        );
        this.onCancel.emit({});
        if (this.isEdit) {
            this.RelationService.updateRelation(
                newData,
                this.formData.id,
            ).subscribe((res) => {
                this.onCancel.emit({});
            });
        } else {
            this.RelationService.createRelation(newData).subscribe((res) => {
                this.onCancel.emit({});
            });
        }
    }
    cleanObject(data) {
        let newData = Object.assign({}, data);
        if (!(newData.id > 0)) {
            newData.id = 0;
        }
        newData.employeeName = newData.employeeId
            ? this.listInCompany.find((item) => item.id === newData.employeeId)
                  ?.fullName
            : '';
        if (newData?.type === 1) {
            newData.personOppositeName = newData.personOppositeId
                ? this.listInCompany.find(
                      (item) => item.id === newData.personOppositeId,
                  )?.fullName
                : '';
        } else {
            newData.personOppositeName = newData.personOppositeId
                ? this.userLists.find(
                      (item) => item.id === newData.personOppositeId,
                  )?.fullName
                : '';
        }

        return newData;
    }
    onBack() {
        this.onCancel.emit({});
    }

    getAllUser() {
        this.userService.getAllUserActive().subscribe((res) => {
            this.listInCompany = res.data;
        });
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
