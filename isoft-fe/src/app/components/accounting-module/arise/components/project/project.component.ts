import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { ProjectCrudComponent } from './project-crud/project-crud.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import AppUtil from 'src/app/utilities/app-util';
import { ProjectCodeService } from 'src/app/service/project.service';

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss'],
})
export class ProjectComponent {
    scrolHeight = '50vh';
    @Input('projectList') projectList: any[];
    @Output('onGetListProject') onGetListProject = new EventEmitter<any>();
    @ViewChild('projectCrudComponent')
    projectCrudComponent!: ProjectCrudComponent;

    constructor(
        private confirmationService: ConfirmationService,
        private translateService: TranslateService,
        private projectCodeService: ProjectCodeService,
        private messageService: MessageService,
    ) {}

    onDelete(item: any) {
        if (!item) return;
    }

    onCrud(data: any | null) {
        this.projectCrudComponent.show(data);
    }

    onCloseCrudForm(isReload) {
        if (isReload) {
            this.onGetListProject.emit(null);
        }
    }

    onRemove(data) {
        if (!data || !data.allowDelete) return;
        this.confirmationService.confirm({
            header: 'Xóa dữ liệu',
            message: `Bạn có chắc chắn muốn xóa dự án ${data.code} hay không ?`,
            acceptLabel: AppUtil.translate(this.translateService, 'label.yes'),
            rejectLabel: AppUtil.translate(this.translateService, 'label.no'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.projectCodeService.delete(data.id).subscribe((_) => {
                    this.onGetListProject.emit(null);
                    this.messageService.add({
                        severity: 'success',
                        detail: AppUtil.translate(
                            this.translateService,
                            'success.delete',
                        ),
                    });
                });
            },
        });
    }
}
