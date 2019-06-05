import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ServerService {
    private serverUrl = "https://worldcupofeverything.herokuapp.com/";

    getUrl(): string {
        return this.serverUrl;
    }
}