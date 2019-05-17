import { Team } from "./team";

export class Match {

    public home: Team;
    public away: Team;

    constructor(hometeam: Team, awayTeam: Team) {
        this.home = hometeam;
        this.away = awayTeam;
    }
}