import {Component, Input} from '@angular/core';
import {environment} from 'src/environments/environment';

@Component({
    selector: 'app-workflow-items',
    templateUrl: './workflow-items.component.html',
    styles: [`
      .border-green {
          border-bottom: 2px solid var(--green-400);
      }
      .border-blue {
          border-bottom: 2px solid var(--blue-400);
      }
    `],
})
export class WorkflowItemsComponent {
    @Input('item') item: any = {};
    @Input('showCheck') showCheck = false;
    @Input('type') type = 'group';
    serverImg = environment.serverURLImage + '/';
}
