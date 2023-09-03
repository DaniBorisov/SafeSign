import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConstructionWorkService } from '../construction-work.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  hasError: boolean = false;
  csRetrived: boolean = false;

  cards = [
    {img: '../../assets/icons8-plus.svg', content: 'New RoadWork'},
    {img: '../../assets/icons8-close.svg', content: 'Close Roadwork'},
    {img: '../../assets/icons8-list-48.png', content: 'Log Overview'},
    {img: '../../assets/icons8-user-account-26.png', content: 'Contact List'},
    {img: '../../assets/icons8-settings.svg', content: 'App Settings'},
    {img: '../../assets/icons8-account-50.png', content: 'Account Settings'},
  ]

  constructionWorks: ConstructionWork[] = [];

  constructor(private router: Router, private constructionWorkService: ConstructionWorkService) {}

  ngOnInit(): void {
    this.getConstructionWorks();
    // this.subscribeToChanges();
  }

  isStatusOK(): boolean {
    console.log(this.csRetrived)
    if (this.csRetrived)
    {
      for (let work of this.constructionWorks) {
        console.log("work with id " + work.id + " has staus : " + work.status)
        if ( work.status == undefined) 
          break
        if (work.status !== 'OK' && work.status !== undefined) {
          return false;
        }
      }
    }
    return true;
  }

  // subscribeToChanges(): void {
  //   const changesEndpoint = 'http://localhost:3000/api/changes'; // Change to your API endpoint
  //   const eventSource = new EventSource(changesEndpoint);

  //   eventSource.onmessage = (event) => {
  //     const change = JSON.parse(event.data);
  //     // Handle the change and update your UI accordingly
  //     console.log('Change received:', change);
  //     // Update your data or perform relevant actions based on the change
  //   };
  // }

  getConstructionWorks() {
    this.constructionWorkService.getAllConstructionWork()
      .subscribe((works: ConstructionWork[]) => {
        this.constructionWorks = works;
        console.log("COnstruction works subscribe ")
        // Iterate through constructionWorks to update status
        for (let work of this.constructionWorks) {
          this.constructionWorkService.getSignsByWorkId(work.id)
            .subscribe((signs: Signs[]) => {
              const hasAngleIssue = signs.some(sign => Math.abs(sign.ogAngle - sign.currAngle) > 5);
              console.log("sign  subscribe ")
              if (hasAngleIssue) {
                work.status = 'Angle issue';
              } else {
                work.status = 'OK';
              }
              this.csRetrived = true;
            });
        }
      });
  }

  handleCardClick(card: any): void {
    switch (card.content) {
      case 'New RoadWork': {
        this.router.navigate(['/add-roadwork']);
        break;
      }
      case 'Close Roadwork': {
        this.router.navigate(['/close-roadwork']);
        break;
      }
      case 'Contact List': {
        // this.router.navigate(['/add-roadwork']);
        alert('Card clicked' + card.content);
        break;
      }
      case 'App Settings': {
        // this.router.navigate(['/add-roadwork']);
        alert('Card clicked' + card.content);
        break;
      }
      case 'Account Settings': {
        // this.router.navigate(['/add-roadwork']);
        alert('Card clicked' + card.content);
        break;
      }
    }
  }

  handleCardClickStatus(): void {
    this.router.navigate(['/status']);
  }
}

interface ConstructionWork {
  id: number;
  planId: number;
  street: string;
  city: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Signs {
  id: number;
  csId: number;
  planId: number;
  ogAngle: number;
  currAngle: number;
  issue?: string;
}
