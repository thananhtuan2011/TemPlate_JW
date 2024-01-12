import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

import AppUtil from '../utilities/app-util';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { SpinnerOverlayService } from '../shared/spinner-overlay/spinner-overlay.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private messageService: MessageService,
        private translateService: TranslateService,
        private router: Router,
        private readonly spinnerOverlayService: SpinnerOverlayService,
    ) {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {
        request = request.clone({
            url: `${request.url}`,
            setHeaders: {
                // 'Auth-Token': `${this.authService.token}`,
                Authorization: `Bearer ${this.authService.token}`,
                dbName: `${this.authService.dbName}`,
                yearFilter: `${this.authService.yearFilter}`,
            },
        });
        // }

        this.spinnerOverlayService.show();
        return next.handle(request).pipe(
            map((event: any) => {
                if (event && event.body) {
                    event.body = AppUtil.toCamelCaseKey({ obj: event.body });
                    if (
                        event.status > 200 ||
                        (event.body.status && event.body.status > 200)
                    ) {
                        this.messageService.add({
                            severity: 'error',
                            detail: AppUtil.translate(
                                this.translateService,
                                `error.${event.body.status}`,
                            ),
                        });
                    }
                }
                return event;
            }),
        );
    }
}
