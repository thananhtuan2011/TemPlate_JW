import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page } from '../models/common.model';
import { UnitConvention } from '../models/unit.model';
import AppConstant from '../utilities/app-constants';
import { Helper } from '../utilities/helper.help';

@Injectable({
    providedIn: 'root',
})
export class UnitConventionService {
    private KEY_UNIT_CONVENTION: string = 'unit-convention';
    public unitConventionBehaviorSubject: BehaviorSubject<UnitConvention>;
    public unitConvention: Observable<UnitConvention>;
    constructor(private readonly httpClient: HttpClient) {
        this.unitConventionBehaviorSubject =
            new BehaviorSubject<UnitConvention>(
                JSON.parse(Helper.getStorage(this.KEY_UNIT_CONVENTION)),
            );
        this.unitConvention = this.unitConventionBehaviorSubject.asObservable();
    }
    private readonly _baseUrl = AppConstant.DEFAULT_URLS.API;
    public get unitConventionValue(): UnitConvention {
        return this.unitConventionBehaviorSubject.value;
    }

    public getUnitConvention(param: Page): Observable<UnitConvention> {
        const url: string = this._baseUrl + '/unitconventions';
        return this.httpClient.post(url, param).pipe(
            map((unitConvention: UnitConvention) => {
                Helper.setStorage(
                    this.KEY_UNIT_CONVENTION,
                    JSON.stringify(unitConvention),
                );
                Helper.THOUSAND_UNIT = unitConvention.thousandUnit;
                Helper.DECIMAL_UNIT = unitConvention.decimalUnit;
                Helper.DAY_TYPE = unitConvention.dayType;
                this.unitConventionBehaviorSubject.next(unitConvention);
                return unitConvention;
            }),
        );
    }

    public updateUnitConvention(
        unitConvention: UnitConvention,
    ): Observable<UnitConvention> {
        const url: string = this._baseUrl + `/unitconventions/update`;
        return this.httpClient.post(url, unitConvention).pipe(
            map((unitConvention: UnitConvention) => {
                return unitConvention;
            }),
        );
    }

    roundNumber(number: number, decimal: number): number {
        var exponentialNumber = decimal >= 0 ? decimal : 0;
        var tempPow = Math.pow(10, exponentialNumber);
        return Math.round((number + Number.EPSILON) * tempPow) / tempPow;
    }
    numberWithCommas(x: number, places = ','): string {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, places);
    }
    numberWithoutCommas(x: string, places = ','): string {
        var regex = new RegExp(`\\${places}`, 'g');
        return x.toString().replace(regex, '');
    }
    trueNumber(x: string, places = ',', deciamlPlaces = '.'): number {
        // (`Thực nhận: ${x}`);
        if (!x || x.length <= 0) return 0;
        // (
        //   `Gốc: ${x} - Phần ngàn: ${places} - Phần thập phân: ${deciamlPlaces}`
        // );
        var r = this.numberWithoutCommas(x, places);
        // (`Xóa phần ngàn thu được: ${r}`);
        var regex = new RegExp(`\\${deciamlPlaces}`, 'g');
        r = r.replace(regex, '.');
        // (`Chuyển thành phần thập phân chuẩn: ${r}`);
        return parseFloat(r);
    }
}
