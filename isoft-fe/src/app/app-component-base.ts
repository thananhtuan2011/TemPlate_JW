import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

@Injectable()
export class AppComponentBase {
    translateService: TranslateService;
    messageService: MessageService;

    constructor(protected injector: Injector) {
        this.translateService = injector.get(TranslateService);
        this.messageService = injector.get(MessageService);
    }
}
