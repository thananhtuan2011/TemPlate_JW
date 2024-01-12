import AppConstant from '../../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeData } from '../../models/common.model';
import { map } from 'rxjs/operators';
import { IntroduceModel } from 'src/app/models/web-setting/introduce.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Introduce`;

@Injectable({
    providedIn: 'root',
})
export class IntroduceService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingIntroduce(
        params: any,
    ): Observable<TypeData<IntroduceModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((introduce: TypeData<IntroduceModel>) => {
                return introduce;
            }),
        );
    }

    public getIntroduceDetail(id: number): Observable<IntroduceModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((introduce: IntroduceModel) => {
                return introduce;
            }),
        );
    }

    public createIntroduce(
        textGo: IntroduceModel,
    ): Observable<IntroduceModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, textGo).pipe(
            map((introduce: IntroduceModel) => {
                return introduce;
            }),
        );
    }

    public updateIntroduce(
        Introduce: IntroduceModel,
        id: number,
    ): Observable<IntroduceModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, Introduce).pipe(
            map((introduce: IntroduceModel) => {
                return introduce;
            }),
        );
    }

    public deleteIntroduce(id: number): Observable<IntroduceModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((introduce: IntroduceModel) => {
                return introduce;
            }),
        );
    }

    public uploadFile(formData: any): Observable<any> {
        return null;
    }
}
