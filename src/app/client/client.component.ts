import { Component, OnInit } from '@angular/core';

import * as socketIo from 'socket.io-client';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, transition, animate, keyframes, animation, AnimationEvent } from '@angular/animations';
import { ServerService } from '../services/server.service';
import { Team } from '../models/team';
import { Match } from '../models/match';
import { Vote } from '../models/vote';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  animations: [
    trigger('voteFlyIn', [
      state('out', style({
        height: '0%'
      })),
      state('in', style({
        height: '100%'
      })),
      transition('out => in', [
        animate('1s')
      ]),
      transition('in => out', [
        animate('1s')
      ])
    ])
  ]
})
export class ClientComponent implements OnInit {

  newVote: boolean;
  newRound: boolean;
  round: string;
  username: string;
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

    this.socket.emit("username", this.username);

    this.socket.on('playMatch', (match: Match) => {
      this.newVote = true;
      this.home = match.home;
      this.away = match.away;
    });

    this.socket.on('newRound', (round: string) => {
      this.round = round;
    });
  }

  castVote(vote: number) {
    this.vote = new Vote(this.username, vote);
    this.newVote = false;
  }

  onAnimationEvent(event: AnimationEvent) {
    if (event.triggerName == "voteFlyIn" && event.toState == "out") {
      this.socket.emit("playerVote", this.vote);
    }
  }
}
