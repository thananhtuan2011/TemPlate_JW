import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SendMailService } from '../../../service/send-mail.service';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import AppUtil from '../../../utilities/app-util';
import { throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-save-send-mail',
    templateUrl: './save-send-mail.component.html',
})
export class SaveSendMailComponent implements OnInit {
    isEdit = false;
    sendMailForm: FormGroup;
    customerList = [];
    result: any = {};
    _id = '';

    constructor(
        private fb: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private sendMailService: SendMailService,
        private router: Router,
        private translateService: TranslateService,
        private messageService: MessageService,
    ) {
        this._id = this.activatedRoute.snapshot.params?.id;
        const resolveData = this.activatedRoute?.snapshot?.data?.resolveData;
        if (this._id) {
            this.result = resolveData?.data.find((item) => item.id == this._id);
            this.isEdit = true;
        }
        this.customerList = resolveData.customerList;
    }

    ngOnInit(): void {
        this.initForm();
    }

    initForm() {
        this.sendMailForm = this.fb.group({
            title: ['', Validators.required],
            customerId: ['', Validators.required],
            content: ['', Validators.required],
        });
        if (this.result) {
            this.sendMailForm.patchValue(this.result);
        }
    }

    submitForm() {
        // tslint:disable-next-line:forin
        for (const i in this.sendMailForm.controls) {
            this.sendMailForm.controls[i].markAsDirty();
            this.sendMailForm.controls[i].markAllAsTouched();
            this.sendMailForm.controls[i].updateValueAndValidity();
        }

        if (this.sendMailForm.invalid) {
            return;
        }

        (this.isEdit
            ? this.sendMailService.update(this.result.id, {
                  ...this.sendMailForm.value,
              })
            : this.sendMailService.create({ ...this.sendMailForm.value })
        )
            .pipe(
                catchError((err: HttpErrorResponse) => {
                    this.messageService.add({
                        severity: 'error',
                        detail: AppUtil.translate(
                            this.translateService,
                            'error.1',
                        ),
                    });
                    return throwError(err);
                }),
            )
            .subscribe((_) => {
                this.messageService.add({
                    severity: 'success',
                    detail: AppUtil.translate(
                        this.translateService,
                        this._id ? 'success.update' : 'success.create',
                    ),
                });
                this.router.navigate(['/uikit/send-mail']);
            });
    }

    field(name: string) {
        return this.sendMailForm.get(name);
    }

    inValid(name: string): boolean {
        return (
            this.field(name).invalid &&
            (this.field(name).dirty || this.field(name).touched)
        );
    }
    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'F8':
                event.preventDefault();
                await this.submitForm();
                break;
            case 'F6':
                event.preventDefault();
                this.router.navigate(['/uikit/send-mail']);
                break;
        }
    }
}
