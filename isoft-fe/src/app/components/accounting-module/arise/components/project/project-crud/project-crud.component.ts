import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isValid } from 'date-fns';
import { id } from 'date-fns/locale';
import { ProjectCodeService } from 'src/app/service/project.service';

@Component({
    selector: 'app-project-crud',
    templateUrl: './project-crud.component.html',
    styleUrls: ['./project-crud.component.scss'],
})
export class ProjectCrudComponent {
    title;
    display: boolean = false;
    form: FormGroup;
    @Input('projectList') projectList: any[];
    @Output('onCloseCrudForm') onCloseCrudForm = new EventEmitter<boolean>();

    constructor(
        private fb: FormBuilder,
        private projectCodeService: ProjectCodeService,
    ) {}

    private getDetail(id, callBack) {
        if (!id) {
            callBack();
            return;
        }
        this.projectCodeService.get(id).subscribe((res) => {
            callBack(res);
        });
    }

    get allowChangeCode() {
        return this.form.get('allowUpdateCode').value;
    }

    get isFormValid() {
        return this.form?.valid && this.checkProjectCode;
    }

    get isNew() {
        return this.form.get('id').value === 0;
    }

    get checkProjectCode() {
        return (
            this.projectList.findIndex((f) => {
                return (
                    f.code === this.form.get('code').value &&
                    f.id != this.form.get('id').value
                );
            }) === -1
        );
    }

    show(data: any) {
        this.getDetail(data?.id, (res) => {
            this.form = this.fb.group({
                id: this.fb.control(res?.id || 0),
                code: this.fb.control(res?.code, [Validators.required]),
                name: this.fb.control(res?.name, [Validators.required]),
                allowUpdateCode: this.fb.control(
                    res ? res.allowUpdateCode : true,
                ),
            });
            this.title = !this.isNew ? 'Sửa dự án' : 'Thêm mới dự án';
            this.display = true;
        });
    }

    onSave() {
        if (!this.isFormValid) {
            return;
        }
        let input = this.form.value;
        const $api = this.isNew
            ? this.projectCodeService.create(input)
            : this.projectCodeService.update(input.id, input);
        $api.subscribe((res) => {
            this.onClose(true);
        });
    }

    onClose(isReload: boolean) {
        this.display = false;
        this.form = null;
        this.onCloseCrudForm.emit(isReload);
    }
}
