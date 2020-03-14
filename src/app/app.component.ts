import { Component } from '@angular/core';
import Chatkit from '@pusher/chatkit-client';
import axios from 'axios';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Angular Chatroom';
  messages = [];
  users = [];
  currentUser: any;
  currentRoom = {};

  _username: string = '';
  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }

  _message: string = '';
  get message(): string {
    return this._message;
  }

  set message(value: string) {
    this._message = value;
  }

  sendMessage() {
    const { message, currentUser } = this;
    currentUser.sendMessage({
      text: message,
      roomId: '07ffe357-0767-4cee-b0d7-8151b43a0718',
    });
    
    this.message = '';
  }

  addUser() {
    const { username } = this;
    axios.post('http://localhost:5200/users', { username })
      .then(() => {
        const tokenProvider = new Chatkit.TokenProvider({
          url: 'http://localhost:5200/authenticate'
        });

        const chatManager = new Chatkit.ChatManager({
          instanceLocator: 'v1:us1:c6dc7a32-01e8-451d-ba15-3f57608c9f74',
          userId: username,
          tokenProvider
        });

        return chatManager
          .connect()
          .then(currentUser => {
            currentUser.subscribeToRoom({
              roomId: '07ffe357-0767-4cee-b0d7-8151b43a0718',
              messageLimit: 100,
              hooks: {
                onMessage: message => {
                  this.messages.push(message);
                },
                onPresenceChanged: (state, user) => {
                  this.users = currentUser.users.sort((a) => {
                    if (a.presence.state === 'online') return -1;
                    
                    return 1;
                  });
                },
              },
            });

            this.currentUser = currentUser;
            this.users = currentUser.users;
            
          });
      })
        .catch(error => console.error(error))
  }
}
