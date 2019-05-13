import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Category } from '../models/category';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
    private categoryLocation = "./assets/categories.json";

    constructor(private http: HttpClient) { }

    getCategories(): Observable<string[]> {
        return this.http.get<string[]>(this.categoryLocation);
    }

    getCategoryItems(categoryName: string): Observable<string[]> {
        return this.http.get<string[]>("./assets/" + categoryName + ".json");
    }
}