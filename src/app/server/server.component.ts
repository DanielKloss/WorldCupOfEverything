import { Component, OnInit } from '@angular/core';

import * as socketIo from 'socket.io-client';
import { Observable } from 'rxjs/internal/Observable';

import { CategoriesService } from '../services/categories.service'
import { Category } from '../models/category';
import { Match } from '../models/match';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { Vote } from '../models/vote';
import { delay } from 'q';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.scss'],
  animations: [
    trigger('showNewRound', [
      state('noNewRound', style({ top: '100%' })),
      state('newRound', style({ top: '0%' })),
      transition('noNewRound => newRound', [
        animate('2s')
      ]),
      transition('newRound => noNewRound', [
        animate('0.5s 1.5s')
      ])
    ]),
    trigger('items', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),  // initial
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)',
          style({ transform: 'scale(1)', opacity: 1 }))  // final
      ])
    ])
  ]
})
export class ServerComponent implements OnInit {

  private SERVER_URL = 'http://localhost:5000';
  private socket;

  categories: string[] = [];
  category: Category;
  currentMatch: Match;
  newRound: boolean = false;
  round: string;
  standing: Array<string>[] = [];
  counter: number = 0;
  players: string[] = []

  homeVoters: string[] = [];
  awayVoters: string[] = [];
  homeVotersAnimation: string[] = [];
  awayVotersAnimation: string[] = [];

  showSetup: boolean;
  showMatch: boolean;

  constructor(private categoryService: CategoriesService) { }

  ngOnInit() {
    this.showSetup = true;

    this.socket = socketIo(this.SERVER_URL);
    this.socket.emit("serverJoin")
    this.getCategories();

    this.socket.on('userJoined', (username: string) => {
      this.players.push(username);
    });

    this.socket.on('playerVoted', (vote: Vote) => {
      console.log(vote);
      if (vote.team == 0) {
        this.homeVoters.push(vote.name);
      } else {
        this.awayVoters.push(vote.name)
      }

      if (this.homeVoters.length + this.awayVoters.length == this.players.length) {
        this.countHomeVotes();
      }
    });
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

  playMatch() {
    let homeIndex = this.counter;
    let awayIndex = this.counter + 1;
    this.currentMatch = new Match(this.category.teams[homeIndex], this.category.teams[awayIndex]);

    this.socket.emit("playMatch", { home: this.category.teams[homeIndex], away: this.category.teams[awayIndex] })
  }

  countHomeVotes() {
    if (this.homeVoters.length > 0) {
      for (let i = 0; i < this.homeVoters.length; i++) {
        this.homeVotersAnimation.push(this.homeVoters[i]);
      }
    } else {
      this.countAwayVotes();
    }
  }

  countAwayVotes() {
    if (this.awayVoters.length > 0) {
      for (let i = 0; i < this.awayVoters.length; i++) {
        this.awayVotersAnimation.push(this.awayVoters[i]);
      }
    } else {
      this.finishRound();
    }
  }

  async finishRound() {
    await delay(5000);
    let homeIndex = this.counter;
    let awayIndex = this.counter + 1;

    //Remove Losing Team
    if (this.homeVoters.length > this.awayVoters.length) {
      this.standing.push([this.category.teams[awayIndex].name, "1"])
      this.category.teams.splice(awayIndex, 1);
    } else if (this.awayVoters.length > this.homeVoters.length) {
      this.standing.push([this.category.teams[homeIndex].name, "1"])
      this.category.teams.splice(homeIndex, 1);
    } else {
      this.standing.push([this.category.teams[awayIndex].name, "1"])
      this.category.teams.splice(awayIndex, 1);
    }

    //Decide if there's a winner
    if (this.category.teams.length == 1) {
      this.standing.push([this.category.teams[0].name, "1"]);
      console.log("The winner is: " + this.category.teams[0]);
      this.socket.emit("matchOver", this.standing);
      return;
    } else {
      if (this.counter >= this.category.teams.length - 1) {
        this.counter = 0;
      } else {
        this.counter++;
      }
    }

    //Reset votes
    this.homeVoters = [];
    this.awayVoters = [];
    this.homeVotersAnimation = [];
    this.awayVotersAnimation = [];

    //Decide if there's a new round
    let teamsLeft = this.category.teams.length;
    if ((teamsLeft + this.standing.length) % teamsLeft == 0) {
      if (teamsLeft == 2) {
        this.round = "Final";
      } else if (teamsLeft == 4) {
        this.round = "Semi Final";
      } else if (teamsLeft == 8) {
        this.round = "Quarter Final";
      } else if (teamsLeft == 16) {
        this.round = "Round of 16";
      } else if (teamsLeft == 32) {
        this.round = "Round of 32";
      }
      this.newRound = true;
      this.socket.emit("newRound", this.round);
    } else {
      this.playMatch();
    }
  }

  async startWorldCup(categoryName: string) {
    this.category = new Category(categoryName);
    this.category.teams = await this.categoryService.getCategoryTeams(categoryName.toLowerCase()).toPromise();

    this.shuffleCategoryTeams();

    this.showSetup = false;
    this.showMatch = true;

    this.playMatch();
  }

  onAnimationEvent(event: AnimationEvent) {
    if (event.triggerName == "showNewRound" && event.toState == "newRound") {
      this.newRound = false;
    } else if (event.triggerName == "showNewRound" && event.toState == "noNewRound") {
      if (this.category != null) {
        this.playMatch();
      }
    } else if (event.triggerName == "items" && event.element.id == "homeVoters" && event.fromState == "void") {
      this.countAwayVotes();
    } else if (event.triggerName == "items" && event.element.id == "awayVoters" && event.fromState == "void") {
      this.finishRound();
    }
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
