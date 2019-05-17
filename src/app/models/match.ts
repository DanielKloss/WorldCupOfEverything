<<<<<<< HEAD
import { Team } from "./team";

export class Match {

    public home: Team;
    public away: Team;

    constructor(hometeam: Team, awayTeam: Team) {
        this.home = hometeam;
        this.away = awayTeam;
=======
export class Match {

    public teamOne: string;
    public teamTwo: string;

    constructor(teamOne: string, teamTwo) {
        this.teamOne = teamOne;
        this.teamTwo = teamTwo;
>>>>>>> e0c723bf6b58469b7e45758755af840a0914b137
    }
}