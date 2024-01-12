import AppConstant from '../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LookupValueModel } from '../models/lookup-value.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/LookupValues`;

@Injectable({
    providedIn: 'root',
})
export class LookupValuesService {
    constructor(private readonly httpClient: HttpClient) {}

    lookupValues(params?: any): Observable<LookupValueModel[]> {
        return this.httpClient.get(_prefix, { params }).pipe(
            map((data: any) => {
                return data as LookupValueModel[];
            }),
        );
    }
}
