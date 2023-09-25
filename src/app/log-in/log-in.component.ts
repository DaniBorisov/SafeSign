import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {

  constructor(private router: Router) { }
  username: string = '';  
  password: string = '';
  loginFail: boolean = false;

  ngOnInit(): void {
    
  }

  login(){

    if (this.username === 'Admin' && this.password === 'Admin') {
          this.loginFail = false;
          this.router.navigate(['/dashboard']);
        } else {
          this.loginFail = true;
          alert('Invalid credentials. Please try again.' +"username: "+ this.username + " "  + "  Password: " + this.password);
          this.username = '';
          this.password = '';
        }
  }

  onEnter() {
    if (this.username && this.password) {
      this.login();
    }
  }

}