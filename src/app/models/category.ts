import { Team } from "./team";

export class Category {

    public name: string;
    public teams: Team[];

    constructor(name: string) {
        this.name = name;
    }
}