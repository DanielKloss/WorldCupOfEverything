import { Component, OnInit } from '@angular/core';

import * as socketIo from 'socket.io-client';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

  username: string;
  gameNumber: string;

  private SERVER_URL = 'http://localhost:5000';
  private socket;

  constructor() { }

  ngOnInit() {
    this.socket = socketIo(this.SERVER_URL);
    this.socket.emit("username", "Emily");

    this.socket.on('playMatch', (match) => {
      console.log("Match Started");
      console.log(match.home + " vs " + match.away);
    });
  }

  castVote(vote: number) {
    this.socket.emit("playerVote", vote);
    console.log("voted for " + vote);
  }
}
