import { TranslateService } from '@ngx-translate/core';
import * as CryptoJS from 'crypto-js';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import * as CountryList from 'countries-list';
import { map } from 'rxjs/operators';
import 'moment-timezone';
import * as moment from 'moment';
import { FormGroup } from '@angular/forms';
import AppConstant from './app-constants';
import { environment } from '../../environments/environment';
import { startOfDay } from 'date-fns';
import {IntroduceType} from "../models/web-setting/introduce.model";
import {LanguageType} from "./app-enum";
import { log } from 'console';

const AppUtil = {
    setStorage(key: string, value: any): void {
        const storageVal = typeof value === 'string'
            ? value
            : JSON.stringify(value);
        localStorage.setItem(key, storageVal);
    },
    getStorage<T = string>(key: string): T {
        const storedItem = localStorage.getItem(key);
        console.log(storedItem);
        if (storedItem !== null) {
            try {
                return JSON.parse(storedItem) as T;
            } catch (error) {
                return storedItem as unknown as T;
            }
        }
        return null;
    },
    getMenus(menuCode?) {
        let menus = JSON.parse(localStorage.getItem('user')).menus;
        if (menuCode) {
            return menus.find((x) => x.menuCode === menuCode);
        }
        return menus;
    },
    removeStorage(key: string): void {
        localStorage.removeItem(key);
    },
    clearStorageAll(): void {
        localStorage.clear();
    },
    initTheme(myVariables: any, isCustom): void {
        if (isCustom == true) {
            Object.entries(myVariables).forEach((v: any) => document.documentElement.style.setProperty(v[0], v[1]));
            return;
        }
        Object.entries(myVariables).forEach((v: any) => document.documentElement.style.removeProperty(v[0]));
    },
    scrollToTop(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    addLeadingZeros(num, totalLength) {
        return String(num).padStart(totalLength, '0');
    },
    toCamelCaseKey({ obj }: { obj: any }): any {
        if (Array.isArray(obj)) {
            return obj.map((v) => AppUtil.toCamelCaseKey({ obj: v }));
        } else if (obj && obj.constructor === Object) {
            return Object.keys(obj).reduce(
                (result, key) => ({
                    ...result,
                    [_.camelCase(key)]: AppUtil.toCamelCaseKey({
                        obj: obj[key],
                    }),
                }),
                {},
            );
        }
        return obj;
    },
    toSnakeCaseKey(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map((v) => AppUtil.toSnakeCaseKey(v));
        } else if (obj && obj.constructor === Object) {
            return Object.keys(obj).reduce(
                (result, key) => ({
                    ...result,
                    [_.snakeCase(key)]: AppUtil.toSnakeCaseKey(obj[key]),
                }),
                {},
            );
        }
        return obj;
    },
    translateWithParams(
        service: TranslateService,
        key: any,
        params: any,
    ): string {
        if (key && key === '') {
            return 'N/A';
        }
        let translateTxt = '';
        service.get(key, params).subscribe((res: string) => {
            translateTxt = res;
        });
        return translateTxt;
    },
    translateWithParams$(
        service: TranslateService,
        key: any,
        params: any,
    ): Observable<string> {
        if (key && key === '') {
            return of('N/A');
        }
        return service.get(key, params);
    },
    translate(service: TranslateService, key: string): string {
        if (!service || !key) {
            return '';
        }
        let translated = '';
        service.get(key).subscribe((s: string) => {
            translated = s;
        });
        return translated;
    },
    translate$(service: TranslateService, key: string): Observable<string> {
        if (!service || !key) {
            return of('');
        }
        let translated = '';
        return service.get(key);
    },

    translateList: function (
        service: TranslateService,
        keys: string[],
        object: Object | undefined,
    ): Observable<any> {
        return service.get(keys, object);
    },
    makeRandomId(length) {
        var result = '';
        var characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength),
            );
        }
        return result;
    },
    isEmpty(obj) {
        return Object.entries(obj).length === 0;
    },
    getBrowserLang() {
        return navigator.language || window.navigator.language;
    },
    hashMD5(text: string | CryptoJS.lib.WordArray): string {
        return CryptoJS.MD5(text).toString();
    },
    generateRandomColorHex() {
        return (
            '#' +
            (
                '00000' +
                Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
            ).slice(-6)
        );
    },
    generateRandomColorRgb() {
        const red = Math.floor(Math.random() * 256);
        const green = Math.floor(Math.random() * 256);
        const blue = Math.floor(Math.random() * 256);
        return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    },
    generateRandomColorHsl() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * (100 + 1)) + '%';
        const lightness = Math.floor(Math.random() * (100 + 1)) + '%';
        return 'hsl(' + hue + ', ' + saturation + ', ' + lightness + ')';
    },
    generateDarkColorHex() {
        let color = '#';
        for (let i = 0; i < 3; i++)
            color += (
                '0' +
                Math.floor((Math.random() * Math.pow(16, 2)) / 2).toString(16)
            ).slice(-2);
        return color;
    },
    generateDarkColorRgb() {
        const red = Math.floor((Math.random() * 256) / 2);
        const green = Math.floor((Math.random() * 256) / 2);
        const blue = Math.floor((Math.random() * 256) / 2);
        return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    },
    generateDarkColorHsl() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * (100 + 1)) + '%';
        const lightness = Math.floor(Math.random() * (100 / 2 + 1)) + '%';
        return 'hsl(' + hue + ', ' + saturation + ', ' + lightness + ')';
    },
    generateLightColorHex() {
        let color = '#';
        for (let i = 0; i < 3; i++)
            color += (
                '0' +
                Math.floor(
                    ((1 + Math.random()) * Math.pow(16, 2)) / 2,
                ).toString(16)
            ).slice(-2);
        return color;
    },
    generateLightColorRgb() {
        const red = Math.floor(((1 + Math.random()) * 256) / 2);
        const green = Math.floor(((1 + Math.random()) * 256) / 2);
        const blue = Math.floor(((1 + Math.random()) * 256) / 2);
        return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    },
    generateLightColorHsl() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * (100 + 1)) + '%';
        const lightness = Math.floor((1 + Math.random()) * (100 / 2 + 1)) + '%';
        return 'hsl(' + hue + ', ' + saturation + ', ' + lightness + ')';
    },
    formatCurrencyVND(value) {
        if (!value) return '0';
        return (
            value
                .toLocaleString('vn-VN', {
                    style: 'currency',
                    currency: 'VND',
                })
                .replace('₫', '') + ' VNĐ'
        );
    },
    formatQuantity(value) {
        if (!value) return '0';
        return value
            .toLocaleString('vn-VN', {
                style: 'currency',
                currency: 'VND',
            })
            .replace('₫', '');
    },
    formatCurrencyUSD(value) {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    },
    readGroup(group: string) {
        var readDigit = [
            ' Không',
            ' Một',
            ' Hai',
            ' Ba',
            ' Bốn',
            ' Năm',
            ' Sáu',
            ' Bảy',
            ' Tám',
            ' Chín',
        ];
        var temp = '';
        if (group == '000') return '';
        //read number hundreds
        temp = readDigit[parseInt(group.substring(0, 1))] + ' Trăm';
        //read number tens
        if (group.substring(1, 2) == '0')
            if (group.substring(2, 3) == '0') return temp;
            else {
                temp += ' Lẻ' + readDigit[parseInt(group.substring(2, 3))];
                return temp;
            }
        else temp += readDigit[parseInt(group.substring(1, 2))] + ' Mươi';
        //read number
        if (group.substring(2, 3) == '5') temp += ' Lăm';
        else if (group.substring(2, 3) != '0')
            temp += readDigit[parseInt(group.substring(2, 3))];
        return temp;
    },
    formatCurrencyVNDString(numInput: number) {
        if (!numInput) {
            return '';
        }
        let num = numInput.toString();
        if (num == null || num == '') return '';
        var temp = '';
        //length <= 18
        while (num.length < 18) {
            num = '0' + num;
        }
        var g1 = num.substring(0, 3);
        var g2 = num.substring(3, 6);
        var g3 = num.substring(6, 9);
        var g4 = num.substring(9, 12);
        var g5 = num.substring(12, 15);
        var g6 = num.substring(15, 18);
        //read group1 ---------------------
        if (g1 != '000') {
            temp = this.readGroup(g1);
            temp += ' Triệu';
        }
        //read group2-----------------------
        if (g2 != '000') {
            temp += this.readGroup(g2);
            temp += ' Nghìn';
        }
        //read group3 ---------------------
        if (g3 != '000') {
            temp += this.readGroup(g3);
            temp += ' Tỷ';
        } else if ('' != temp) {
            temp += ' Tỷ';
        }

        //read group2-----------------------
        if (g4 != '000') {
            temp += this.readGroup(g4);
            temp += ' Triệu';
        }
        //---------------------------------
        if (g5 != '000') {
            temp += this.readGroup(g5);
            temp += ' Nghìn';
        }
        //-----------------------------------
        temp = temp + this.readGroup(g6);
        //---------------------------------
        // Refine
        temp = temp.replace(/Một Mươi/g, 'Mười');
        temp = temp.trim();
        temp = temp.replace(/Không Trăm/g, '');
        //        if (temp.indexOf("Không Trăm") == 0) temp = temp.substring(10);
        temp = temp.trim();
        temp = temp.replace(/Mười Không/g, 'Mười');
        temp = temp.trim();
        temp = temp.replace(/Mươi Không/g, 'Mươi');
        temp = temp.trim();
        if (temp.indexOf('Lẻ') == 0) temp = temp.substring(2);
        temp = temp.trim();
        temp = temp.replace(/Mươi Một/g, 'Mươi Mốt');
        temp = temp.trim();

        //Change Case
        return (
            temp.substring(0, 1).toUpperCase() + temp.substring(1).toLowerCase()
        );
    },
    getCountries() {
        let countryCodes = [];
        for (const key of Object.keys(CountryList.countries)) {
            const country = this.getCountry(key);
            if (country.phone.length < 3) {
                let countryCode = {
                    code: key,
                    prefix: '+' + country.phone,
                    countryCode: country.phone,
                };
                countryCodes.push(countryCode);
            }
        }
        return countryCodes;
    },
    getCountry(code: string): any {
        if (!code) {
            return;
        }
        // @ts-ignore
        return CountryList.countries[code.toUpperCase()];
    },
    convertDateTimeKr(date: string, downline: boolean) {
        if (!date) return '';
        let momentDate = moment(date);
        let dateKr = ['일', '월', '화', '수', '목', '금', '토'];
        let typeTime = momentDate.format('A') === 'AM' ? '오전' : '오후';
        if (!downline) {
            return `${momentDate.format('YY.MM.DD')} (${
                dateKr[parseInt(momentDate.format('d'))]
            }) ${typeTime} ${momentDate.format('HH:mm')}`;
        }
        return `${momentDate.format('YY.MM.DD')} (${
            dateKr[parseInt(momentDate.format('d'))]
        })<br/>${typeTime} ${momentDate.format('HH:mm')}`;
    },
    formatLocalTimezone(date) {
        return moment
            .tz(date, Intl.DateTimeFormat().resolvedOptions().timeZone)
            .format();
    },
    formatMoney(
        amount: string | number = 0,
        decimalCount = 2,
        decimal = '.',
        thousands = ',',
    ): any {
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

            const negativeSign = amount < 0 ? '-' : '';

            let i = parseInt(
                (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)),
            ).toString();
            let j = i.length > 3 ? i.length % 3 : 0;

            return (
                negativeSign +
                (j ? i.substr(0, j) + thousands : '') +
                i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
                (decimalCount
                    ? decimal +
                      // @ts-ignore
                      Math.abs(amount - i)
                          .toFixed(decimalCount)
                          .slice(2)
                    : '')
            );
        } catch (e) {
            // console.log(e);
        }
    },
    formatDateTimeDay(
        dateTime: string,
        service: TranslateService,
        formatDate = 'YYYY.MM.DD',
        formatTime = 'HH:mm',
    ) {
        let dateFormat = moment(dateTime).format(formatDate);
        dateFormat += '(';
        let dayOfWeek = new Date(dateTime).getDay();
        dateFormat +=
            this.translate(service, 'primeng.dayNamesShort')[dayOfWeek] + ') ';
        dateFormat += moment(dateTime).format(formatTime);
        return dateFormat;
    },
    cleanObject(data) {
        let newData = Object.assign({}, data);
        for (var name in newData) {
            if (
                newData.hasOwnProperty(name) &&
                newData[name] == undefined &&
                newData[name] == null &&
                newData[name] !== '0'
            ) {
                console.log(name, typeof newData[name]);
                delete newData[name];
            }
        }
        return newData;
    },
    adjustDateOffset(originalDate) {
        console.log(originalDate);
        let adjustedDate = new Date(originalDate);

        let offsetHoursOfDay = (adjustedDate.getTimezoneOffset() / 60) * -1;

        if (originalDate == null) return null;

        let IncludeOffsetHourOfDay = adjustedDate.getHours() + offsetHoursOfDay;

        if (IncludeOffsetHourOfDay > 23) {
            IncludeOffsetHourOfDay = 23;
        }

        adjustedDate.setHours(IncludeOffsetHourOfDay); // Set hours to 23 (0-based index)
        adjustedDate.setMinutes(59); // Set minutes to 59
        return adjustedDate;
    },
    getLaborCountrySortTypes(translateService: TranslateService): any {
        return this.translateList(
            translateService,
            ['label.id', 'label.fullname', 'label.email', 'label.phone_number'],
            {},
        ).pipe(
            map((trans) => {
                return [
                    {
                        code: 'id',
                        label: trans['label.id'],
                    },
                    {
                        code: 'name',
                        label: trans['label.fullname'],
                    },
                    {
                        code: 'email',
                        label: trans['label.email'],
                    },
                    {
                        code: 'telephoneNumber',
                        label: trans['label.phone_number'],
                    },
                ];
            }),
        );
    },
    getRecruiterTypes(translateService: TranslateService): any {
        return this.translateList(
            translateService,
            [
                'label.recruiter_type_1',
                'label.recruiter_type_2',
                'label.recruiter_type_3',
                'label.recruiter_type_4',
                'label.recruiter_type_5',
                'label.recruiter_type_6',
            ],
            {},
        ).pipe(
            map((trans) => {
                let results = [];
                for (let i = 1; i <= 6; i++) {
                    results.push({
                        code: i - 1,
                        label: trans[`label.recruiter_type_${i}`],
                    });
                }

                return results;
            }),
        );
    },
    getCompanyTypes(): any {
        return {
            businessType: [
                { value: 1, label: 'Thông tư 200/2014/TT-BTC' },
                { value: 2, label: 'Thông tư 133/2016/TT-BTC' },
            ],
            accordingAccountingRegime: [
                { value: 1, label: 'Chứng từ ghi sổ' },
                { value: 2, label: 'Nhật ký chung' },
            ],
            methodCalcExportPrice: [
                {
                    value: 1,
                    label: 'Giá vốn bình quân gia quyền cuối kỳ',
                },
                {
                    value: 2,
                    label: 'Giá vốn bình quân gia quyền tại thời điểm xuất kho',
                },
            ],
        };
    },
    getUserTypes(): any {
        return {
            unionMember: [
                { value: 1, label: 'Không có' },
                { value: 2, label: 'Đoàn viên' },
                { value: 3, label: 'Đảng viên' },
            ],
            isDemobilized: [
                { value: false, label: 'Không có' },
                { value: true, label: 'Bộ đội xuất ngũ' },
            ],
            literacy: [
                {
                    value: 1,
                    label: 'Tốt nghiệp THPT',
                },
                { value: 2, label: 'Tốt nghiệp THCS' },
                {
                    value: 3,
                    label: 'Tốt nghiệp tiểu học',
                },
                { value: 4, label: 'chưa học xong tiểu học' },
            ],
            literacyDetail: [
                { value: 1, label: 'Chưa qua đào tạo' },
                { value: 2, label: 'CNKT Không có bằng' },
                { value: 3, label: 'Sơ cấp' },
                { value: 4, label: 'trung cấp' },
                { value: 5, label: 'cao đẳng' },
                { value: 6, label: 'Đại học' },
                { value: 7, label: 'Thạc sĩ' },
                { value: 8, label: 'Tiến sĩ' },
            ],
            status: [
                { value: false, label: 'Kích hoạt' },
                { value: true, label: 'Hủy kích hoạt' },
            ],
        };
    },
    getBillsTypes(): any {
        return {
            inOut: [
                { value: 0, label: 'Đầu vào' },
                { value: 1, label: 'Đầu ra' },
            ],
        };
    },
    getAriseTypes(): any {
        return {
            internalType: [
                { value: 1, name: '1. Cả hai' },
                { value: 2, name: '2. HT' },
                { value: 3, name: '3. NB' },
                { value: 4, name: '4. LT' },
            ],
            month: [
                { value: 1, label: 'Tháng 1' },
                { value: 2, label: 'Tháng 2' },
                { value: 3, label: 'Tháng 3' },
                { value: 4, label: 'Tháng 4' },
                { value: 5, label: 'Tháng 5' },
                { value: 6, label: 'Tháng 6' },
                { value: 7, label: 'Tháng 7' },
                { value: 8, label: 'Tháng 8' },
                { value: 9, label: 'Tháng 9' },
                { value: 10, label: 'Tháng 10' },
                { value: 11, label: 'Tháng 11' },
                { value: 12, label: 'Tháng 12' },
            ],
            billType: [
                { value: 'BT', label: 'BT' },
                { value: 'HB', label: 'HB' },
            ],
        };
    },
    getAriseReportTypes(): any {
        return {
            month: [
                { value: 1, label: 'Tháng 1' },
                { value: 2, label: 'Tháng 2' },
                { value: 3, label: 'Tháng 3' },
                { value: 4, label: 'Tháng 4' },
                { value: 5, label: 'Tháng 5' },
                { value: 6, label: 'Tháng 6' },
                { value: 7, label: 'Tháng 7' },
                { value: 8, label: 'Tháng 8' },
                { value: 9, label: 'Tháng 9' },
                { value: 10, label: 'Tháng 10' },
                { value: 11, label: 'Tháng 11' },
                { value: 12, label: 'Tháng 12' },
            ],
            print: [
                { value: 0, label: 'In cột lũy kế phát sinh' },
                { value: 1, label: 'In cả chi tiết 1' },
                { value: 2, label: 'In cả chi tiết 2' },
                { value: 3, label: 'Không in những dòng không có số liệu' },
            ],
            bookDetailType: [
                { value: 2, label: 'Sổ có dư 2 bên' },
                { value: 1, label: 'Sổ có dư 1 bên' },
                { value: 3, label: 'Sổ có ngoại tệ' },
                { value: 5, label: 'Sổ quỹ' },
                { value: 6, label: 'Sổ tồn kho tổng hợp' },
                { value: 4, label: 'Số tồn kho chi tiết' },
                { value: 7, label: 'Biên bản công nợ' },
            ],
        };
    },
    getCategoryTypes(): any {
        return {
            category: [
                {
                    value: AppConstant.CATEGORY_TYPE.GOODS_GROUP,
                    label: 'Nhóm sản phẩm',
                },
                {
                    value: AppConstant.CATEGORY_TYPE.GOODS_TYPE,
                    label: 'Loại hàng',
                },
                { value: AppConstant.CATEGORY_TYPE.POSITION, label: 'Vị trí' },
                {
                    value: AppConstant.CATEGORY_TYPE.PRICE_LIST,
                    label: 'Bảng giá',
                },
                {
                    value: AppConstant.CATEGORY_TYPE.MENU_WEB,
                    label: 'Menu web',
                },
                {
                    value: AppConstant.CATEGORY_TYPE.GOODS_ERROR_STATUS,
                    label: 'Trạng thái hàng lỗi',
                },
            ],
        };
    },
    getBeginDeclareTypes(): any {
        return {
            dayType: [
                { value: '-', label: '-' },
                { value: '/', label: '/' },
            ],
            decimalUnit: [
                { value: ',', label: '"," (comma)' },
                { value: '.', label: '"." (dots)' },
            ],
            thousandUnit: [
                { value: '.', label: '"." (dots)' },
                { value: ',', label: '"," (comma)' },
            ],
        };
    },
    getUserSortTypes(translateService: TranslateService): any {
        return this.translateList(
            translateService,
            ['label.id', 'label.full_name', 'label.birthday'],
            {},
        ).pipe(
            map((trans) => {
                return [
                    {
                        code: 'id',
                        label: trans['label.id'],
                    },
                    {
                        code: 'fullName',
                        label: trans['label.full_name'],
                    },
                    {
                        code: 'birthday',
                        label: trans['label.birthday'],
                    },
                ];
            }),
        );
    },
    getCustomerSortTypes(translateService: TranslateService): any {
        return this.translateList(
            translateService,
            ['label.code', 'label.full_name', 'label.phone_number'],
            {},
        ).pipe(
            map((trans) => {
                return [
                    {
                        code: 'code',
                        label: trans['label.code'],
                    },
                    {
                        code: 'fullName',
                        label: trans['label.full_name'],
                    },
                    {
                        code: 'phone_number',
                        label: trans['label.phone_number'],
                    },
                ];
            }),
        );
    },
    getCustomerClassificationSortTypes(
        translateService: TranslateService,
    ): any {
        return this.translateList(
            translateService,
            ['label.customer_value', 'label.customer_type', 'label.color_code'],
            {},
        ).pipe(
            map((trans) => {
                return [
                    {
                        code: 'purchase',
                        label: trans['label.customer_value'],
                    },
                    {
                        code: 'name',
                        label: trans['label.customer_type'],
                    },
                    {
                        code: 'color',
                        label: trans['label.color_code'],
                    },
                ];
            }),
        );
    },
    getCustomerStatusSortTypes(translateService: TranslateService): any {
        return this.translateList(
            translateService,
            ['label.id', 'label.status', 'label.color_code'],
            {},
        ).pipe(
            map((trans) => {
                return [
                    {
                        code: 'id',
                        label: trans['label.id'],
                    },
                    {
                        code: 'name',
                        label: trans['label.status'],
                    },
                    {
                        code: 'color',
                        label: trans['label.color_code'],
                    },
                ];
            }),
        );
    },
    getLanguageTypes() {
        return [
            {
                value: LanguageType.KOREA,
                name: 'Korean',
            },
            {
                value: LanguageType.ENGLISH,
                name: 'English',
            },
            {
                value: LanguageType.VIETNAM,
                name: 'Vietnamese',
            },
        ];
    },
    getIntroduceTypes(): any[] {
        return [
            {
                value: IntroduceType.Post,
                name: 'Giới thiệu',
            },
            {
                value: IntroduceType.Leader,
                name: 'Lãnh đạo',
            },
            {
                value: IntroduceType.PaymentType,
                name: 'Phương thức thanh toán',
            },
            {
                value: IntroduceType.Warranty,
                name: 'Bảo hành',
            },
            {
                value: IntroduceType.Return,
                name: 'Đổi trả',
            },
            {
                value: IntroduceType.Support,
                name: 'Trung tâm hỗ trợ',
            },
            {
                value: IntroduceType.Transport,
                name: 'Vận chuyển',
            },
            {
                value: IntroduceType.Policy,
                name: 'Chính sách',
            },
        ];
    },
    getCustomerJobSortTypes(translateService: TranslateService): any {
        return this.translateList(
            translateService,
            ['label.id', 'label.job_name', 'label.color_code'],
            {},
        ).pipe(
            map((trans) => {
                return [
                    {
                        code: 'id',
                        label: trans['label.id'],
                    },
                    {
                        code: 'name',
                        label: trans['label.job_name'],
                    },
                    {
                        code: 'color',
                        label: trans['label.color_code'],
                    },
                ];
            }),
        );
    },
    getSurchargeSortTypes(translateService: TranslateService): any {
        return this.translateList(
            translateService,
            ['label.id', 'label.name', 'label.type'],
            {},
        ).pipe(
            map((trans) => {
                return [
                    {
                        code: 'id',
                        label: trans['label.id'],
                    },
                    {
                        code: 'name',
                        label: trans['label.name'],
                    },
                    {
                        code: 'color',
                        label: trans['label.type'],
                    },
                ];
            }),
        );
    },
    getRoomTableSortTypes(translateService: TranslateService): any {
        return this.translateList(
            translateService,
            ['label.id', 'label.code', 'label.name'],
            {},
        ).pipe(
            map((trans) => {
                return [
                    {
                        code: 'id',
                        label: trans['label.id'],
                    },
                    {
                        code: 'code',
                        label: trans['label.code'],
                    },
                    {
                        code: 'name',
                        label: trans['label.name'],
                    },
                ];
            }),
        );
    },
    getSortTypes(translateService: TranslateService): any {
        return this.translateList(
            translateService,
            ['label.ascending', 'label.descending'],
            {},
        ).pipe(
            map((trans) => {
                return [
                    {
                        code: false,
                        label: trans['label.ascending'],
                    },
                    {
                        code: true,
                        label: trans['label.descending'],
                    },
                ];
            }),
        );
    },
    getStatusRelatives(): { name?: string; value?: boolean }[] {
        return [
            {
                name: 'Người phụ thuộc',
                value: true,
            },
            {
                name: 'Người thân',
                value: false,
            },
        ];
    },
    getUnionMember(): { value?: number; label?: string }[] {
        return [
            { value: 1, label: 'Không có' },
            { value: 2, label: 'Đoàn viên' },
            { value: 3, label: 'Đảng viên' },
        ];
    },
    cleanFilterTypeReport(filter, showTypes?) {
        let newFilter = Object.assign(filter, {});
        if (!newFilter.accountCode) {
            delete newFilter.accountCode;
        }

        if (newFilter.filterType == 1) {
            delete newFilter.fromDate;
            delete newFilter.toDate;
        }
        if (newFilter.filterType == 2) {
            delete newFilter.fromMonth;
            delete newFilter.toMonth;
        }
        // if (!showTypes.includes('document')) {
        //     delete newFilter.voucherType;
        // } else {
        //     newFilter.voucherType = newFilter.document;
        // }

        if (!showTypes.includes('bookDetailType')) {
            delete newFilter.bookDetailType;
        }
        if (showTypes.includes('fillFullName')) {
            delete newFilter.fillFullName;
        }
        if (showTypes.includes('isNoiBo')) {
            delete newFilter.isNoiBo;
        }
        if (showTypes.includes('preparedBy')) {
            delete newFilter.preparedBy;
        }
        if (showTypes.includes('voteMaker')) {
            delete newFilter.voteMaker;
        }
        if (showTypes.includes('ledgerReportMaker')) {
            delete newFilter.ledgerReportMaker;
        }
        if (showTypes.includes('isCheckName')) {
            delete newFilter.isCheckName;
        }

        // delete by show types
        if (!showTypes.includes('account')) {
            delete newFilter.accountCode;
        }

        if (!showTypes.includes('printType')) {
            delete newFilter.printType;
        } else {
            newFilter.printType = newFilter.printType;
            //handle case print type
            // if (newFilter.printType.length >= 2) {
            //     newFilter.printType = [
            //         newFilter.printType.reduce(
            //             (partialSum, a) => partialSum + a,
            //             0
            //         ),
            //     ];
            // }
        }

        // delete overbalance
        delete newFilter.filterType;
        delete newFilter.dfPreparedBy;
        delete newFilter.bookDetail;
        delete newFilter.document;

        return newFilter;
    },
    // start code acounting report
    setShowReportReceiptHtml(content: string = '') {
        var _idFrameReceipt = document.getElementById(
            'iframe-html-report-balance-account',
        );
        _idFrameReceipt.innerHTML = '';
        const divHTML = document.createElement('div');
        try {
            divHTML.innerHTML = '<div></div>';
            if (content) divHTML.innerHTML = content;

            _idFrameReceipt.appendChild(divHTML);
        } catch (ex) {
            divHTML.innerHTML = '<div>Có lỗi report</div>';
        }
    },
    cleanFilter1TypeReport(filter) {
        let newFilter = Object.assign(filter, {});
        if (!newFilter.accountCode) {
            delete newFilter.accountCode;
        }

        if (newFilter.filterType == 1) {
            delete newFilter.fromDate;
            delete newFilter.toDate;
        }
        if (newFilter.filterType == 2) {
            delete newFilter.fromMonth;
            delete newFilter.toMonth;
        }
        delete newFilter.filterType;
        delete newFilter.accountCode;
        delete newFilter.preparedBy;
        delete newFilter.printType;
        delete newFilter.fillName;
        delete newFilter.documentMonth;
        return newFilter;
    },

    // end code accounting report
    convertStringToDate(date: string): Date {
        const dateNow = new Date();
        if (!date) {
            return new Date(
                dateNow.getFullYear(),
                dateNow.getMonth(),
                dateNow.getDay(),
                0,
                0,
                0,
                0,
            );
        }
        const dateSplit = date?.split('/');
        if (dateSplit?.length >= 3) {
            try {
                return new Date(
                    Number(dateSplit[2]),
                    Number(dateSplit[1]) - 1,
                    Number(dateSplit[0]) + 1,
                );
            } catch (error) {
                return startOfDay(
                    new Date(
                        dateNow.getFullYear(),
                        dateNow.getMonth(),
                        dateNow.getDay(),
                    ),
                );
            }
        } else {
            return startOfDay(
                new Date(
                    dateNow.getFullYear(),
                    dateNow.getMonth(),
                    dateNow.getDay(),
                ),
            );
        }
    },

    fixLengthText(text: string, length: number): string {
        let result = text || '';
        while (result.length <= length) result += ' ';
        return result;
    },

    baseUrlImage(image: string) {
        return `${environment.serverURLImage}/${image}`;
    },

    openDownloadFile(fileName, extension: string) {
        const url = `${environment.serverURL}/api/ReportDownload/DownloadReportFromFile?filename=${fileName}&fileType=${extension}`;
        if (fileName) window.open(url);
    },
    getFileExtension(fileName: string): string {
        const parts = fileName.split('.');
        if (parts.length === 1 || (parts[0] === '' && parts.length === 2)) {
            return ''; // If the file name doesn't have an extension, return an empty string
        }
        return parts.pop()!.toLowerCase(); // Return the lowercase file extension
    },
    isImageFile(fileName: string): boolean {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp']; // List of common image extensions

        const fileExtension = this.getFileExtension(fileName).toLowerCase();
        return imageExtensions.includes(fileExtension);
    },
    contractTypes() {
        return [
            {
                id: 'probationary',
                name: 'Hợp đồng thử việc',
            },
            {
                id: 'labor',
                name: 'Hợp đồng chính thức',
            },
        ];
    },
};

export default AppUtil;

export function cleanData(data: any) {
    Object.keys(data).forEach((key) => {
        if (
            _.isString(data[key]) ||
            _.isNull(data[key]) ||
            _.isUndefined(data[key])
        ) {
            data[key] = _.trim(data[key]);
        } else if (_.isArray(data[key])) {
            const array = data[key];
            for (let index = 0; index < array?.length; index++) {
                array[index] = _.trim(array[index]);
            }
        } else if (_.isObject(data[key])) {
            cleanData(data[key]);
        }
    });
    return data;
}

export function cleanDataForm(formGroup: FormGroup) {
    const data = cleanData(formGroup.getRawValue());
    formGroup.patchValue(data, { emitEvent: false });
    return data;
}
