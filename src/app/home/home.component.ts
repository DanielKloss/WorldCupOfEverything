import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import * as socketIo from 'socket.io-client';

import { ServerService } from '../services/server.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  username: string;
  roomNumber: string;
  errorMessage: string;

  private SERVER_URL;
  private socket;

  constructor(private router: Router, private serverService: ServerService) { }

  ngOnInit() {
    this.SERVER_URL = this.serverService.getUrl();
    this.socket = socketIo(this.SERVER_URL);

    this.socket.on("userChecked", (success: boolean) => {
      if (success) {
        this.errorMessage = "";
        this.socket.emit('checkRoom', this.roomNumber);
      } else {
        this.errorMessage = "THAT NAME IS ALREADY TAKEN";
      }
    })

    this.socket.on("joinRoom", (success: boolean) => {
      if (success) {
        this.router.navigate(['/client', this.username, this.roomNumber])
      } else {
        this.errorMessage = "INCORRECT ROOM NUMBER";
      }
    });
  }

  joinRoom() {
    if (this.username == undefined || this.username.length < 1) {
      this.errorMessage = "YOU MUST ENTER A USERNAME";
    } else {
      this.errorMessage = "";
      this.socket.emit('checkUsername', this.username, this.roomNumber)
    }
  }
}
