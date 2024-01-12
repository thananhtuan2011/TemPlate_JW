import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { WorkflowService } from '../../../../service/workflow.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
    selector: 'app-change-workflow-status',
    template: `
        <p-dropdown
            #dropdown
            id="dropdown"
            [autoZIndex]="true"
            [disabled]="isChanged"
            [(ngModel)]="data.isStatusForManager"
            [ngModelOptions]="{ 'standalone': true }"
            (onChange)="onChangeStatus($event)"
            [options]="commandMenuItems"
            [optionLabel]="'name'"
            [autoDisplayFirst]="false"
            [optionValue]="'id'"
            appendTo="body"
        >
            <ng-template let-item pTemplate="selectedItem" class="p-2">
                <span class="title" [ngStyle]=" { backgroundColor: item.color }">{{ item.name }}</span>
            </ng-template>
        </p-dropdown>`,
    styles: [`
        .title {
            padding: 1px 4px;
            border-radius: 4px;
            color: white;
        }
        :host ::ng-deep {
            .p-dropdown {
                padding: 2px;
                width: 120px;
            }

            .p-inputtext {
                padding: 2px 6px;
                font-size: 12px;
            }

            .p-dropdown .p-dropdown-trigger {
                display: none;
            }
        }
    `],
})
export class ChangeWorkflowStatusComponent {
    @Input() data: any = {};
    @ViewChild('dropdown') dropdownComponent: ElementRef;
    className: string = '';
    icon: string = '';
    statusName: string = '';
    @Input() commandMenuItems: any[] = [];
    selectedItem: any = null;
    isChanged: boolean = true;
    constructor(
        private readonly workflowService: WorkflowService,
        private readonly messageService: MessageService,
        private readonly authService: AuthService,
    ) {
    }
    ngOnInit(): void {
        console.log(this.data)
        if (this.data.status == 4 && this.data.isSupervisor) {
            this.isChanged = false;
        }
    }
    onChangeStatus(event) {
        let currentItem = this.commandMenuItems.find(item => item.id === event.value);
        this.workflowService
            .changeStatusTaskForManager(this.data.id, currentItem.id)
            .subscribe((res: any) => {
                this.data.isStatusForManager = currentItem.id;
                this.messageService.add({
                    severity: 'success',
                    detail: `Đã cập nhật trạng thái [${currentItem.name}]`,
                });
            });
    }
}
