import { Component, OnInit } from '@angular/core';
import { CategoriesService } from '../services/categories.service'
import { Category } from '../models/category';
import { Match } from '../models/match';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.scss']
})
export class ServerComponent implements OnInit {

  gameNumber: number;
  categories: string[] = [];
  category: Category;
  currentMatch: Match;
  counter = 0;

  constructor(private categoryService: CategoriesService) { }

  ngOnInit() {
    //this.generateGameNumber();
    this.getCategories();
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

    //wait for votes
    let homeVotes = 0;
    let awayVotes = 0;

    if (homeVotes > awayVotes) {
      this.category.items.splice(awayIndex, 1);
    } else if (awayVotes > homeVotes) {
      this.category.items.splice(homeIndex, 1);
    } else {
      this.category.items.splice(awayIndex, 1);
    }

    this.counter++;
  }

  async startServer(categoryName: string) {
    this.category = new Category(categoryName);
    this.category.items = await this.categoryService.getCategoryItems(categoryName.toLowerCase()).toPromise();

    this.shuffleCategoryItems()

    this.categories = [];

    for (let i = 0; i <= this.category.items.length; i++) {
      this.playMatch();
    }
  }
}
