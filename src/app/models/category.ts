<<<<<<< HEAD
import { Team } from "./team";

export class Category {

    public name: string;
    public teams: Team[];
=======
export class Category {

    public name: string;
    public items: string[];
>>>>>>> e0c723bf6b58469b7e45758755af840a0914b137

    constructor(name: string) {
        this.name = name;
    }
}