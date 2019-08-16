import { Team } from "./team";

export class Match {

    public home: Team;
    public away: Team;
    public homeVoters: string[];
    public awayVoters: string[];
    public round: string;

    constructor(hometeam: Team, awayTeam: Team, round: string) {
        this.home = hometeam;
        this.away = awayTeam;
        this.homeVoters = [];
        this.awayVoters = [];
        this.round = round;
    }
}