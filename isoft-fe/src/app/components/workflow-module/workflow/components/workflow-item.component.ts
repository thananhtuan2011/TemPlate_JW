import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
@Component({
    selector: 'app-workflow-item',
    templateUrl: './workflow-item.component.html',
    styles: [``],
})
export class WorkflowItemComponent implements OnInit {
    @Input('item') item: any = {};
    @Input('commandMenuItems') commandMenuItems: any[];
    @Input('mainColor') mainColor: string = '';

    @Output() onSelect = new EventEmitter<any>();

    serverImg = environment.serverURLImage + '/';

    constructor() {}

    ngOnInit(): void {}
}
