import { Component, OnInit } from '@angular/core';

import * as socketIo from 'socket.io-client';

import { CategoriesService } from '../services/categories.service'
import { Category } from '../models/category';
import { Match } from '../models/match';
import { trigger, state, transition, animate, style, AnimationEvent, query, stagger } from '@angular/animations';
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

  private SERVER_URL = 'https://worldcupofeverything.herokuapp.com/';
  private socket;

  categories: string[] = [];
  category: Category;
  currentMatch: Match;
  nextMatch: Match;
  newRound: boolean = false;
  round: string;
  standing: Team[] = [];
  counter: number = 0;
  players: string[] = []

  homeVotersAnimation: string[];
  awayVotersAnimation: string[];

  showSetup: boolean;
  showMatch: boolean;
  showOverview: boolean;

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
      if (vote.team == 0) {
        this.nextMatch.homeVoters.push(vote.name);
      } else {
        this.nextMatch.awayVoters.push(vote.name)
      }

      if (this.players.length == this.nextMatch.homeVoters.length + this.nextMatch.awayVoters.length) {
        this.round = this.getStage();
        this.currentMatch = this.nextMatch;
        this.animateVotes();
      }
    });

    this.socket.on('userLeft', (username: string) => {
      let index = this.players.findIndex(u => u == username);
      this.players.splice(index, 1);
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
    this.nextMatch = new Match(this.category.teams[homeIndex], this.category.teams[awayIndex]);

    this.socket.emit("playMatch", { home: this.category.teams[homeIndex], away: this.category.teams[awayIndex] })
  }

  async animateVotes() {
    this.homeVotersAnimation = [];
    this.awayVotersAnimation = [];
    await this.delay(1);
    this.homeVotersAnimation = this.currentMatch.homeVoters;
    this.awayVotersAnimation = this.currentMatch.awayVoters;

    this.finishRound();
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  finishRound() {
    let homeIndex = this.counter;
    let awayIndex = this.counter + 1;

    //Remove Losing Team
    if (this.currentMatch.homeVoters.length > this.currentMatch.awayVoters.length) {
      this.category.teams[awayIndex].stage = this.round;
      this.category.teams[awayIndex].knockedOutBy = this.category.teams[homeIndex];
      this.standing.push(this.category.teams[awayIndex])
      this.category.teams.splice(awayIndex, 1);
    } else if (this.currentMatch.awayVoters.length > this.currentMatch.homeVoters.length) {
      this.category.teams[homeIndex].stage = this.round;
      this.category.teams[homeIndex].knockedOutBy = this.category.teams[awayIndex];
      this.standing.push(this.category.teams[homeIndex])
      this.category.teams.splice(homeIndex, 1);
    } else {
      this.category.teams[awayIndex].stage = this.round;
      this.category.teams[awayIndex].knockedOutBy = this.category.teams[homeIndex];
      this.standing.push(this.category.teams[awayIndex])
      this.category.teams.splice(awayIndex, 1);
    }

    //Decide if there's a winner
    if (this.category.teams.length == 1) {
      this.category.teams[0].stage = "Winner";
      this.category.teams[0].knockedOutBy = new Team("no one", "");
      this.standing.push(this.category.teams[0]);
      this.socket.emit("matchOver", this.standing);
      this.showSetup = false;
      this.showMatch = false;
      this.showOverview = true;
    } else {
      if (this.counter >= this.category.teams.length - 1) {
        this.counter = 0;
      } else {
        this.counter++;
      }

      this.socket.emit("newRound", this.getStage());
      this.playMatch();
    }
  }

  async startWorldCup(categoryName: string) {
    this.category = new Category(categoryName);
    this.category.teams = await this.categoryService.getCategoryTeams(categoryName.toLowerCase()).toPromise();

    this.shuffleCategoryTeams();

    this.round = this.getStage();
    this.socket.emit("newRound", this.round);

    this.showSetup = false;
    this.showMatch = true;

    this.playMatch();
  }

  getStage(): string {
    let teamsLeft = this.category.teams.length;
    if (teamsLeft <= 2) {
      return "Final";
    } else if (teamsLeft <= 4) {
      return "Semi Final";
    } else if (teamsLeft <= 8) {
      return "Quarter Final";
    } else if (teamsLeft <= 16) {
      return "Round Of 16";
    } else if (teamsLeft <= 32) {
      return "Round of 32";
    } else if (teamsLeft <= 64) {
      return "Round of 64";
    }
  }
}
