import {
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { SocialModel } from '../../../../models/web-setting/social.model';
import { SocialService } from 'src/app/service/web-setting/social.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';

@Component({
    selector: 'app-social-network-edit',
    templateUrl: './social-network-edit.component.html',
    styles: [
        `
            :host ::ng-deep {
                .input-error {
                    border: red 1px solid;
                }
            }
        `,
    ],
})
export class SocialNetworkEditComponent implements OnInit {
    @Input() display = false;

    @Input() item: SocialModel = undefined;
    isSubmit = false;
    socialForm: FormGroup = new FormGroup({});
    @Output() onCancel = new EventEmitter();
    isEdit = false;
    file: any;
    fileName: string = '';

    constructor(
        private readonly socialService: SocialService,
        private fb: FormBuilder,
    ) {
        this.socialForm = this.fb.group({
            title: ['', [Validators.required]],
            shortContent: ['', [Validators.required]],
            content: ['', [Validators.required]],
        })
    }

    ngOnInit(): void {
        this.socialForm.setValue({
            title: this.item.title,
            shortContent: this.item.shortContent,
            content: this.item.content
        })
        this.fileName = this.item.image;
    }

    onSave(): void {
        this.isSubmit = true
        if (this.item != undefined) {
            if (this.socialForm.valid) {
                let social: SocialModel = {
                    id: this.item.id,
                    title: this.socialForm.value.title,
                    shortContent: this.socialForm.value.shortContent,
                    content: this.socialForm.value.content,
                    type: 1,
                    image: this.file.name,
                    file: this.file

                }
                const payload = new FormData()
                Object.keys(social).forEach(t => {
                    payload.append(t, social[t])
                })
                this.socialService.updateSocial(payload, this.item?.id).subscribe(() => {
                    this.onCancel.emit({});
                });
            }
        } else {
            if (this.socialForm.valid) {
                let social: SocialModel = {
                    title: this.socialForm.value.title,
                    shortContent: this.socialForm.value.shortContent,
                    content: this.socialForm.value.content,
                    type: 1,
                    image: this.file.name,
                    file: this.file
                }
                const payload = new FormData()
                Object.keys(social).forEach(t => {
                    payload.append(t, social[t])
                })
                this.socialService.createSocial(payload).subscribe(() => {
                    this.onCancel.emit({});
                });
            }
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

    onUploadFiles(event: any): void {
        if (event) {
            this.file= event.target?.files[0];
            this.fileName = this.file.name;
        }
    }

    removeFile() {
        this.fileName = '';
        this.file = null;
    }
}
