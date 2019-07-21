import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ServerService {
    //private serverUrl = "https://worldcupofeverything.herokuapp.com/";
    private serverUrl = "http://localhost:5000";

    getUrl(): string {
        return this.serverUrl;
    }
}