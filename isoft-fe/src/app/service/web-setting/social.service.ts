import AppConstant from '../../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeData } from '../../models/common.model';
import { map } from 'rxjs/operators';
import { SocialModel } from 'src/app/models/web-setting/social.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Social`;

@Injectable({
    providedIn: 'root',
})
export class SocialService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingSocial(params: any): Observable<TypeData<SocialModel>> {
        return this.httpClient.get(`${_prefix}/list`, { params }).pipe(
            map((socials: TypeData<SocialModel>) => {
                return socials;
            }),
        );
    }
    public getSocialDetail(id: number): Observable<SocialModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((socials: SocialModel) => {
                return socials;
            }),
        );
    }

    public createSocial(textGo:any): Observable<SocialModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, textGo).pipe(
            map((socials: SocialModel) => {
                return socials;
            }),
        );
    }

    public getDetail(id:number): Observable<any | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.get(`${url}/${id}`).pipe(
            map((socials: any) => {
                return socials;
            }),
        );
    }

    public updateSocial(socials: any, id: number): Observable<any> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, socials).pipe(
            map((socials: any) => {
                return socials;
            }),
        );
    }

    public deleteSocial(id: number): Observable<SocialModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((socials: SocialModel) => {
                return socials;
            }),
        );
    }

    public uploadFile(formData: any): Observable<any> {
        return null;
    }
}
