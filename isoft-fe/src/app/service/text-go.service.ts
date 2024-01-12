import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, TypeData } from '../models/common.model';
import { User } from '../models/user.model';
import { map } from 'rxjs/operators';
import AppConstant from '../utilities/app-constants';
import { TextGoModel } from '../models/text-go.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/DocumentType2`;

@Injectable({
    providedIn: 'root',
})
export class TextGoService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingTextGo(params: any): Observable<TypeData<TextGoModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((doc: TypeData<TextGoModel>) => {
                return doc;
            }),
        );
    }

    public getTextGoDetail(id: number): Observable<TextGoModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((textGo: TextGoModel) => {
                return textGo;
            }),
        );
    }

    public createTextGo(textGo: FormData): Observable<TextGoModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, textGo).pipe(
            map((textGo: TextGoModel) => {
                return textGo;
            }),
        );
    }

    public updateTextGo(textGo: FormData, id: number): Observable<TextGoModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, textGo).pipe(
            map((textGo: TextGoModel) => {
                return textGo;
            }),
        );
    }

    public deleteTextGo(id: number): Observable<TextGoModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((textGo: TextGoModel) => {
                return textGo;
            }),
        );
    }
}
