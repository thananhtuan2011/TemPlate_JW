import AppConstant from '../../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeData } from '../../models/common.model';
import { map } from 'rxjs/operators';
import { SliderModel } from '../../models/web-setting/slider.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/Slider`;

@Injectable({
    providedIn: 'root',
})
export class SliderService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingSlider(params: any): Observable<TypeData<SliderModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((slider: TypeData<SliderModel>) => {
                return slider;
            }),
        );
    }

    public getSliderDetail(id: number): Observable<SliderModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((slider: SliderModel) => {
                return slider;
            }),
        );
    }

    public createSlider(slider: any): Observable<SliderModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, slider).pipe(
            map((slider: SliderModel) => {
                return slider;
            }),
        );
    }

    public updateSlider(slider: any, id: number): Observable<SliderModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, slider).pipe(
            map((slider: SliderModel) => {
                return slider;
            }),
        );
    }

    public deleteSlider(id: number): Observable<SliderModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((slider: SliderModel) => {
                return slider;
            }),
        );
    }
}
