import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, TypeData } from '../models/common.model';
import { User } from '../models/user.model';
import { map } from 'rxjs/operators';
import { IncomingTextModel } from '../models/incoming-text.model';
import AppConstant from '../utilities/app-constants';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/DocumentType1`;

@Injectable({
    providedIn: 'root',
})
export class IncomingTextService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingIncomingText(
        params: any,
    ): Observable<TypeData<IncomingTextModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((doc: TypeData<IncomingTextModel>) => {
                return doc;
            }),
        );
    }

    public getIncomingTextDetail(id: number): Observable<IncomingTextModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((incomingText: IncomingTextModel) => {
                return incomingText;
            }),
        );
    }

    public createIncomingText(
        incomingText: FormData,
    ): Observable<IncomingTextModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, incomingText).pipe(
            map((incomingText: IncomingTextModel) => {
                return incomingText;
            }),
        );
    }

    public updateIncomingText(
        incomingText: FormData,
        id: number,
    ): Observable<IncomingTextModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, incomingText).pipe(
            map((incomingText: IncomingTextModel) => {
                return incomingText;
            }),
        );
    }

    public deleteIncomingText(
        id: number,
    ): Observable<IncomingTextModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((incomingText: IncomingTextModel) => {
                return incomingText;
            }),
        );
    }
}
