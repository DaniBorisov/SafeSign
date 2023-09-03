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

  login(username: string,password: string){

    if (username === 'Admin' && password === 'Admin') {
          this.loginFail = false;
          this.router.navigate(['/dashboard']);
        } else {
          this.loginFail = true;
          alert('Invalid credentials. Please try again.' +"username: "+ username + " "  + "  Password: " + password);
          username = '';
          password = '';
        }
  }
}