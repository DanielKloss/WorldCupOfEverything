import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
<<<<<<< HEAD
import { Team } from '../models/team';
=======
import { Category } from '../models/category';
>>>>>>> e0c723bf6b58469b7e45758755af840a0914b137

@Injectable({ providedIn: 'root' })
export class CategoriesService {
    private categoryLocation = "./assets/categories.json";

    constructor(private http: HttpClient) { }

    getCategories(): Observable<string[]> {
        return this.http.get<string[]>(this.categoryLocation);
    }

<<<<<<< HEAD
    getCategoryTeams(categoryName: string): Observable<Team[]> {
        return this.http.get<Team[]>("./assets/" + categoryName + ".json").pipe(map(result => result["teams"]));
=======
    getCategoryItems(categoryName: string): Observable<string[]> {
        return this.http.get<string[]>("./assets/" + categoryName + ".json");
>>>>>>> e0c723bf6b58469b7e45758755af840a0914b137
    }
}