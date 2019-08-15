import { Component, OnInit } from '@angular/core';

import * as socketIo from 'socket.io-client';
import { ActivatedRoute } from '@angular/router';
import { ServerService } from '../services/server.service';
import { Team } from '../models/team';
import { Match } from '../models/match';
import { Vote } from '../models/vote';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
})
export class ClientComponent implements OnInit {
  round: string;
  username: string;
  roomNumber: string;
  vote: Vote;
  home: Team;
  away: Team;

  private SERVER_URL;
  private socket;

  constructor(private route: ActivatedRoute, private serverService: ServerService) { }

  ngOnInit() {
    this.SERVER_URL = this.serverService.getUrl();
    this.socket = socketIo(this.SERVER_URL);

    this.username = this.route.snapshot.paramMap.get('username').toUpperCase();
    this.roomNumber = this.route.snapshot.paramMap.get('roomNumber');
    this.socket.emit("username", this.username, this.roomNumber);

    this.socket.on('playMatch', (match: Match) => {
      this.vote = null;
      this.home = match.home;
      this.away = match.away;
    });

    this.socket.on('newRound', (round: string) => {
      this.round = round;
    });
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }

  castVote(vote: number) {
    if (vote == 0) {
      this.away.colour = "grey";
    } else {
      this.home.colour = "grey";
    }
    
    this.vote = new Vote(this.username, vote);
    this.socket.emit("playerVote", this.vote, this.roomNumber);
  }
}
