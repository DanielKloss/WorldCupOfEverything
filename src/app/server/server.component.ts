import { Component, OnInit } from '@angular/core';

import * as socketIo from 'socket.io-client';
import { Observable } from 'rxjs/internal/Observable';

import { CategoriesService } from '../services/categories.service'
import { Category } from '../models/category';
import { Match } from '../models/match';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.scss']
})
export class ServerComponent implements OnInit {

  private SERVER_URL = 'http://localhost:5000';
  private socket;

  categories: string[] = [];
  category: Category;
  currentMatch: Match;
  standing: Array<string>[] = [];
  counter: number = 0;
  players: string[] = []
  homeVotes: number = 0;
  awayVotes: number = 0;

  constructor(private categoryService: CategoriesService) { }

  ngOnInit() {
    this.socket = socketIo(this.SERVER_URL);
    this.socket.emit("serverJoin")
    this.getCategories();

    this.socket.on('userJoined', (username) => {
      this.players.push(username);
    });

    this.socket.on('playerVoted', (vote) => {
      if (vote == 0) {
        this.homeVotes++;
      } else {
        this.awayVotes++;
      }

      if (this.homeVotes + this.awayVotes == this.players.length) {
        this.countVotes();
      }
    });

    this.socket.on('newRound', (round) => {
      //animation for new round
    });

    this.socket.on('readyForNextMatch', () => {
      this.playMatch();
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

  countVotes() {
    let homeIndex = this.counter;
    let awayIndex = this.counter + 1;

    //Remove Losing Team
    if (this.homeVotes > this.awayVotes) {
      this.standing.push([this.category.teams[awayIndex].name, "1"])
      this.category.teams.splice(awayIndex, 1);
    } else if (this.awayVotes > this.homeVotes) {
      this.standing.push([this.category.teams[homeIndex].name, "1"])
      this.category.teams.splice(homeIndex, 1);
    } else {
      this.standing.push([this.category.teams[awayIndex].name, "1"])
      this.category.teams.splice(awayIndex, 1);
    }

    //results animation

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
    this.homeVotes = 0;
    this.awayVotes = 0;

    //Decide if there's a new round
    let teamsLeft = this.category.teams.length;
    let round = "";
    if ((teamsLeft + this.standing.length) % teamsLeft == 0) {
      if (teamsLeft == 2) {
        round = "Final";
      } else if (teamsLeft == 4) {
        round = "Semi Final";
      } else if (teamsLeft == 8) {
        round = "Quarter Final";
      } else if (teamsLeft == 16) {
        round = "Round of 16";
      } else if (teamsLeft == 32) {
        round = "Round of 32";
      }
      this.socket.emit("newRound", round);
    } else {
      this.playMatch();
    }
  }

  async startWorldCup(categoryName: string) {
    this.category = new Category(categoryName);
    this.category.teams = await this.categoryService.getCategoryTeams(categoryName.toLowerCase()).toPromise();

    this.shuffleCategoryTeams();

    this.categories = [];

    this.playMatch();
  }
}
