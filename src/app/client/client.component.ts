import { Component, OnInit } from '@angular/core';

import * as socketIo from 'socket.io-client';
import { Observable } from 'rxjs/internal/Observable';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
<<<<<<< HEAD
import { Team } from '../models/team';
=======
>>>>>>> e0c723bf6b58469b7e45758755af840a0914b137

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

  username: string;
<<<<<<< HEAD
  home: Team;
  away: Team;
=======
  home: string;
  away: string;
>>>>>>> e0c723bf6b58469b7e45758755af840a0914b137

  private SERVER_URL = 'http://localhost:5000';
  private socket;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.socket = socketIo(this.SERVER_URL);

<<<<<<< HEAD
    this.username = this.route.snapshot.paramMap.get('username').toUpperCase();
=======
    this.username = this.route.snapshot.paramMap.get('username');
>>>>>>> e0c723bf6b58469b7e45758755af840a0914b137

    this.socket.emit("username", this.username);

    this.socket.on('playMatch', (match) => {
<<<<<<< HEAD
      console.log("Match Started " + match.home.name);
      console.log(match.home.colour + " vs " + match.away.colour);
      this.home = new Team(match.home.name, match.home.colour);
      this.away = new Team(match.away.name, match.away.colour);
=======
      console.log("Match Started");
      console.log(match.home + " vs " + match.away);
      this.home = match.home;
      this.away = match.away;
>>>>>>> e0c723bf6b58469b7e45758755af840a0914b137
    });
  }

  castVote(vote: number) {
    this.socket.emit("playerVote", vote);
    console.log("voted for " + vote);
  }
}
