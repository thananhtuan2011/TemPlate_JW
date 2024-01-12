import AppConstant from '../../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeData } from '../../models/common.model';
import { map } from 'rxjs/operators';
import { CareerModel } from 'src/app/models/web-setting/career.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/WebCareer`;

@Injectable({
    providedIn: 'root',
})
export class CareerService {
    constructor(private readonly httpClient: HttpClient) {}
    public getPagingCareer(params: any): Observable<TypeData<CareerModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((career: TypeData<CareerModel>) => {
                return career;
            }),
        );
    }
    public getCareerDetail(id: number): Observable<CareerModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((career: CareerModel) => {
                return career;
            }),
        );
    }

    public createCareer(career: CareerModel): Observable<CareerModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, career).pipe(
            map((career: CareerModel) => {
                return career;
            }),
        );
    }

    public updateCareer(
        career: CareerModel,
        id: number,
    ): Observable<CareerModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, career).pipe(
            map((career: CareerModel) => {
                return career;
            }),
        );
    }

    public deleteCareer(id: number): Observable<CareerModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((career: CareerModel) => {
                return career;
            }),
        );
    }
}
