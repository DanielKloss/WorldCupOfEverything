import { Component, OnInit } from '@angular/core';

import * as socketIo from 'socket.io-client';
import 'simplebar';

import { CategoriesService } from '../services/categories.service'
import { ServerService } from '../services/server.service'
import { Category } from '../models/category';
import { Match } from '../models/match';
import { trigger, transition, animate, style, query, stagger } from '@angular/animations';
import { Vote } from '../models/vote';
import { Team } from '../models/team';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ transform: 'scale(0.5)', opacity: 0 }),
          stagger(100, [
            animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)',
              style({ transform: 'scale(1)', opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ServerComponent implements OnInit {

  private SERVER_URL;
  private socket;

  roomNumber: string;
  categories: string[] = [];
  category: Category;
  currentMatch: Match;
  nextMatch: Match;
  round: string;
  standing: Team[] = [];
  counter: number = 0;
  players: string[] = []

  voted: string[] = [];

  showSetup: boolean;
  showMatch: boolean;
  showOverview: boolean;
  finishButton: boolean;

  constructor(private categoryService: CategoriesService, private serverService: ServerService) { }

  ngOnInit() {
    this.SERVER_URL = this.serverService.getUrl();

    this.showSetup = true;

    this.socket = socketIo(this.SERVER_URL);
    this.socket.emit("serverJoin")
    this.getCategories();

    this.socket.on('roomNumber', (roomNumber: string) => {
      this.roomNumber = roomNumber;
    })

    this.socket.on('userJoined', (username: string) => {
      this.players.push(username);
    });

    this.socket.on('playerVoted', (vote: Vote) => {
      if (this.voted.findIndex(v => v == vote.name) != -1) {
        return;
      }

      this.voted.push(vote.name);

      if (vote.team == 0) {
        this.nextMatch.homeVoters.push(vote.name);
      } else {
        this.nextMatch.awayVoters.push(vote.name)
      }

      if (this.players.length == this.nextMatch.homeVoters.length + this.nextMatch.awayVoters.length) {
        this.voted = [];
        this.round = this.getStage();
        this.displayResults();
        this.RemoveLosingTeam();
        this.checkForWinner();
      }
    });

    this.socket.on('userLeft', (username: string) => {
      let index = this.players.findIndex(u => u == username);
      this.players.splice(index, 1);
    });
  }

  private checkForWinner() {
    if (this.category.teams.length == 1) {
      this.finishButton = true;
    } else {
      if (this.counter >= this.category.teams.length - 1) {
        this.counter = 0;
      }
      else {
        this.counter++;
      }
      this.socket.emit("newRound", this.getStage(), this.roomNumber);
      this.playMatch();
    }
  }

  private RemoveLosingTeam() {
    let homeIndex = this.counter;
    let awayIndex = this.counter + 1;

    if (this.currentMatch.homeVoters.length > this.currentMatch.awayVoters.length) { //home win
      this.category.teams[awayIndex].stage = this.round;
      this.category.teams[awayIndex].knockedOutBy = this.category.teams[homeIndex];
      this.standing.push(this.category.teams[awayIndex]);
      this.category.teams.splice(awayIndex, 1);
    }
    else if (this.currentMatch.awayVoters.length > this.currentMatch.homeVoters.length) { //away win
      this.category.teams[homeIndex].stage = this.round;
      this.category.teams[homeIndex].knockedOutBy = this.category.teams[awayIndex];
      this.standing.push(this.category.teams[homeIndex]);
      this.category.teams.splice(homeIndex, 1);
    }
    else {//draw
      this.category.teams[awayIndex].stage = this.round;
      this.category.teams[awayIndex].knockedOutBy = this.category.teams[homeIndex];
      this.standing.push(this.category.teams[awayIndex]);
      this.category.teams.splice(awayIndex, 1);
    }
  }

  private displayResults() {
    this.currentMatch = new Match(this.nextMatch.home, this.nextMatch.away);
    this.currentMatch.homeVoters = this.nextMatch.homeVoters;
    this.currentMatch.awayVoters = this.nextMatch.awayVoters;
  }

  getCategories(): void {
    this.categoryService.getCategories().subscribe(data => this.categories = data);
  }

  shuffleCategoryTeams() {
    for (let i = this.category.teams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.category.teams[i], this.category.teams[j]] = [this.category.teams[j], this.category.teams[i]];
    }
  }

  convertTeamsToUpperCase() {
    for (let i = 0; i < this.category.teams.length; i++) {
      this.category.teams[i].name = this.category.teams[i].name.toUpperCase();
    }
  }

  playMatch() {
    let homeIndex = this.counter;
    let awayIndex = this.counter + 1;
    this.nextMatch = new Match(this.category.teams[homeIndex], this.category.teams[awayIndex]);

    this.socket.emit("playMatch", { home: this.category.teams[homeIndex], away: this.category.teams[awayIndex] }, this.roomNumber)
  }

  showFinalResult() {
    this.category.teams[0].stage = "WINNER";
    this.category.teams[0].knockedOutBy = new Team("no one", "");
    this.standing.push(this.category.teams[0]);
    this.socket.emit("matchOver", this.standing, this.roomNumber);
    this.showSetup = false;
    this.showMatch = false;
    this.showOverview = true;
  }

  async startWorldCup(categoryName: string) {
    this.category = new Category(categoryName);
    this.category.teams = await this.categoryService.getCategoryTeams(categoryName.toLowerCase()).toPromise();

    this.shuffleCategoryTeams();
    this.convertTeamsToUpperCase();

    this.round = this.getStage();
    this.socket.emit("newRound", this.round, this.roomNumber);

    this.showSetup = false;
    this.showMatch = true;

    this.playMatch();
  }

  getStage(): string {
    let teamsLeft = this.category.teams.length;
    if (teamsLeft <= 2) {
      return "FINAL";
    } else if (teamsLeft <= 4) {
      return "SEMI FINAL";
    } else if (teamsLeft <= 8) {
      return "QUARTER FINAL";
    } else if (teamsLeft <= 16) {
      return "ROUND OF 16";
    } else if (teamsLeft <= 32) {
      return "ROUND OF 32";
    } else if (teamsLeft <= 64) {
      return "ROUND OF 64";
    }
  }
}