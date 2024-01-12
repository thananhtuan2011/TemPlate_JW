import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
// import {AuthService} from '../app/services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private messageService: MessageService,
        private translate: TranslateService,
        private authService: AuthService,
        private router: Router,
    ) {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((err) => {
                let errorMessage = '';
                console.log(err);
                this.translate.get(`error.${err.status}`).subscribe((s) => {
                    errorMessage = s;
                });

                // If Response return error message
                if(err.error != null && err.error.message.length > 0) {
                    errorMessage = err.error.message;
                }
                
                this.messageService.add({
                    severity: 'error',
                    detail: errorMessage || err.error.message || err.error,
                });

                // Handle for 401 Status. Internal login when token expired
                if (err.status === 401) {
                    //auto logout if 401 or 403 response returned from api
                    this.authService.internalLogin();
                }

                // Other error statuses
                if ([403].includes(err.status)) {
                    //auto logout if 401 or 403 response returned from api
                    this.authService.clearSession();
                    this.router.navigate(['']);
                }

                const error =
                    (err && err.error && err.error.message) ||
                    err.error ||
                    err.statusText;
                return throwError(error);
            }),
        );
    }
}
