import { Team } from "./team";

export class Match {

    public home: Team;
    public away: Team;
    public homeVoters: string[];
    public awayVoters: string[];

    constructor(hometeam: Team, awayTeam: Team) {
        this.home = hometeam;
        this.away = awayTeam;
        this.homeVoters = [];
        this.awayVoters = [];
    }
}