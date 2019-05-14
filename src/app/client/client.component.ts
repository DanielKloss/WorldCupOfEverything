import { Component, OnInit } from '@angular/core';

import * as socketIo from 'socket.io-client';
import { Observable } from 'rxjs/internal/Observable';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

  username: string;
  home: string;
  away: string;

  private SERVER_URL = 'http://localhost:5000';
  private socket;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.socket = socketIo(this.SERVER_URL);

    this.username = this.route.snapshot.paramMap.get('username');

    this.socket.emit("username", this.username);

    this.socket.on('playMatch', (match) => {
      console.log("Match Started");
      console.log(match.home + " vs " + match.away);
      this.home = match.home;
      this.away = match.away;
    });
  }

  castVote(vote: number) {
    this.socket.emit("playerVote", vote);
    console.log("voted for " + vote);
  }
}
