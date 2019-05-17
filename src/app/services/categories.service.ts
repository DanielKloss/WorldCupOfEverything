import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Team } from '../models/team';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
    private categoryLocation = "./assets/categories.json";

    constructor(private http: HttpClient) { }

    getCategories(): Observable<string[]> {
        return this.http.get<string[]>(this.categoryLocation);
    }

    getCategoryTeams(categoryName: string): Observable<Team[]> {
        return this.http.get<Team[]>("./assets/" + categoryName + ".json").pipe(map(result => result["teams"]));
    }
}