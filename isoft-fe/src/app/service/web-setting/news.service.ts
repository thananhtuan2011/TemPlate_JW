import AppConstant from '../../utilities/app-constants';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeData } from '../../models/common.model';
import { map } from 'rxjs/operators';
import { NewsModel } from '../../models/web-setting/news.model';

let _prefix = `${AppConstant.DEFAULT_URLS.API}/WebNews`;

@Injectable({
    providedIn: 'root',
})
export class NewsService {
    constructor(private readonly httpClient: HttpClient) {}

    public getPagingNews(params: any): Observable<TypeData<NewsModel>> {
        return this.httpClient.get(`${_prefix}`, { params }).pipe(
            map((news: TypeData<NewsModel>) => {
                return news;
            }),
        );
    }
    public getNewsDetail(id: number): Observable<NewsModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.get(url, {}).pipe(
            map((news: NewsModel) => {
                return news;
            }),
        );
    }

    public createNews(textGo: NewsModel): Observable<NewsModel | null> {
        const url: string = `${_prefix}`;
        return this.httpClient.post(url, textGo).pipe(
            map((news: NewsModel) => {
                return news;
            }),
        );
    }

    public updateNews(news: NewsModel, id: number): Observable<NewsModel> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.put(url, news).pipe(
            map((news: NewsModel) => {
                return news;
            }),
        );
    }

    public deleteNews(id: number): Observable<NewsModel | null> {
        const url: string = `${_prefix}/${id}`;
        return this.httpClient.delete(url, {}).pipe(
            map((news: NewsModel) => {
                return news;
            }),
        );
    }

    public uploadFile(formData: any): Observable<any> {
        return null;
    }
}
