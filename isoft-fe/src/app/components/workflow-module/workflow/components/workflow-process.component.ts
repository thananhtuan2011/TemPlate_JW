import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-work-flow-process',
    template: `<div *ngIf="item.maxCheckList" class="mt-0 md:-mt-2">
        <p-tag *ngIf="!item.minCheckList" severity="danger" [value]="item.minCheckList + '/' + item.maxCheckList"></p-tag>
        <p-tag *ngIf="item.minCheckList && item.minCheckList < item.maxCheckList" severity="warning" [value]="item.minCheckList + '/' + item.maxCheckList"></p-tag>
        <p-tag *ngIf="item.minCheckList === item.maxCheckList" severity="success" [value]="item.minCheckList + '/' + item.maxCheckList"></p-tag>
    </div>`,
    styles: [``],
})
export class WorkflowProcessComponent {
    @Input() item: any = {};

    constructor() {}
}
