export class Team {

    public name: string;
    public colour: string;

    public knockedOutBy: Team;
    public stage: string;

    constructor(name: string, colour: string) {
        this.name = name;
        this.colour = colour;
    }
}