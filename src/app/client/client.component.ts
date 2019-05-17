import { Component, OnInit } from '@angular/core';

import * as socketIo from 'socket.io-client';
import { Observable } from 'rxjs/internal/Observable';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Team } from '../models/team';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

  username: string;
  home: Team;
  away: Team;

  private SERVER_URL = 'http://localhost:5000';
  private socket;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.socket = socketIo(this.SERVER_URL);

    this.username = this.route.snapshot.paramMap.get('username').toUpperCase();

    this.socket.emit("username", this.username);

    this.socket.on('playMatch', (match) => {
      console.log("Match Started " + match.home.name);
      console.log(match.home.colour + " vs " + match.away.colour);
      this.home = new Team(match.home.name, match.home.colour);
      this.away = new Team(match.away.name, match.away.colour);
    });
  }

  castVote(vote: number) {
    this.socket.emit("playerVote", vote);
    console.log("voted for " + vote);
  }
}
