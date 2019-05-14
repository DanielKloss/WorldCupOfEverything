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
  counter = 0;
  numberOfPlayers = 0;
  homeVotes = 0;
  awayVotes = 0;

  constructor(private categoryService: CategoriesService) { }

  ngOnInit() {
    this.socket = socketIo(this.SERVER_URL);
    this.socket.emit("serverJoin")
    this.getCategories();

    this.socket.on('userJoined', (username) => {
      console.log(username + " joined");
      this.numberOfPlayers++;
    });

    this.socket.on('playerVoted', (vote) => {
      if (vote == 0) {
        this.homeVotes++;
      } else {
        this.awayVotes++;
      }

      console.log("Player voted for " + vote);
      console.log("home votes " + this.homeVotes);
      console.log("away votes " + this.awayVotes);

      if (this.homeVotes + this.awayVotes == this.numberOfPlayers) {
        this.countVotes();
      }
    });
  }

  getCategories(): void {
    this.categoryService.getCategories().subscribe(data => this.categories = data);
  }

  shuffleCategoryItems() {
    for (let i = this.category.items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.category.items[i], this.category.items[j]] = [this.category.items[j], this.category.items[i]];
    }
  }

  playMatch() {
    let homeIndex = this.counter;
    let awayIndex = this.counter + 1;
    this.currentMatch = new Match(this.category.items[homeIndex], this.category.items[awayIndex]);

    this.socket.emit("playMatch", { home: this.category.items[homeIndex], away: this.category.items[awayIndex] })
  }

  countVotes() {
    let homeIndex = this.counter;
    let awayIndex = this.counter + 1;

    if (this.homeVotes > this.awayVotes) {
      this.standing.push([this.category.items[awayIndex], "1"])
      this.category.items.splice(awayIndex, 1);
    } else if (this.awayVotes > this.homeVotes) {
      this.standing.push([this.category.items[homeIndex], "1"])
      this.category.items.splice(homeIndex, 1);
    } else {
      this.standing.push([this.category.items[awayIndex], "1"])
      this.category.items.splice(awayIndex, 1);
    }

    if (this.category.items.length == 1) {
      this.standing.push([this.category.items[0], "1"]);
      console.log("The winner is: " + this.category.items[0]);
      this.socket.emit("matchOver", this.standing);
      return;
    } else {
      if (this.counter >= this.category.items.length - 1) {
        this.counter = 0;
      } else {
        this.counter++;
      }
    }

    this.homeVotes = 0;
    this.awayVotes = 0;
    this.playMatch();
  }

  async startWorldCup(categoryName: string) {
    this.category = new Category(categoryName);
    this.category.items = await this.categoryService.getCategoryItems(categoryName.toLowerCase()).toPromise();

    this.shuffleCategoryItems();

    this.categories = [];

    this.playMatch();
  }
}
