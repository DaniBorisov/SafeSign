import { Component, HostListener, OnInit } from '@angular/core';
import { ConstructionWorkService } from '../construction-work.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {


  selectedConstructionWork: any;
  selectedCard: any;
  isMobileView: boolean = false;
  
  // leftSideWidth = '30%';
  // rightSideWidth = '70%';
  leftSideFlex = '0 0 30%';
  rightSideFlex = '1 1 70%';

  searchText: string = '';

  constructionWorks: ConstructionWork[] = [];
  allSigns:Signs[] =[];
  retrievedSigns: Signs[] = [];

  constructor(private constructionWorkService: ConstructionWorkService) { }

  ngOnInit(): void {
    this.getConstructionWorks();
    this.getSigns()
    this.checkViewport();
  }

  ngOnUpdate():void {
    this.getConstructionWorks();
    this.getSigns()
  }

  getConstructionWorks() {
    this.constructionWorkService.getAllConstructionWork()
      .subscribe((works: ConstructionWork[]) => {
        this.constructionWorks = works
        console.log("get all C Works" +this.constructionWorks);
      });
  }

  getSigns() {
    this.constructionWorkService.getAllSigns()
      .subscribe((signs: Signs[]) => {
        this.allSigns = signs.map(sign => ({ ...sign, issue: 'OK' }));
        console.log("get all signs : " + this.allSigns[0].issue);
        this.constructionWorks.forEach(work => {
          if (this.hasIssues(work.id)) {
            work.status = "Angle Issue";
          }
        });
      });
  }

  retrieveSignsByWorkId(card: any) {
    this.selectedConstructionWork = card;
    this.constructionWorkService.getSignsByWorkId(card.id)
      .subscribe((signs) => {
        this.retrievedSigns = signs.map(sign => {
          if (Math.abs(sign.currAngle - sign.ogAngle) > 5) {
            sign.issue = "Angle Issue";
          } else {
            sign.issue = "OK";
          }
          return sign;
        });
  
        // Update the issue and status fields for the selected construction work
        this.selectedConstructionWork.status = this.retrievedSigns.some(sign => sign.issue === "Angle Issue") ? "Angle Issue" : "OK";
      });
  }

  get filteredConstructionWorks(): ConstructionWork[] {
    if (!this.searchText) {
      return this.constructionWorks;
    } else {
      // Search text entered, filter construction works based on the search text
      const searchText = this.searchText.toLowerCase();
      return this.constructionWorks.filter(work => {
        return work.street.toLowerCase().includes(searchText) || work.city.toLowerCase().includes(searchText);
      });
    }
  }

  startResize(event: MouseEvent) {
    event.preventDefault();
    document.addEventListener('mousemove', this.resize);
    document.addEventListener('mouseup', this.stopResize);
  }

  resize = (event: MouseEvent) => {
    const splitPageWidth = document.querySelector('.split-page')?.clientWidth || 0;
    const x = event.pageX;
    const leftSideWidth = ((x / splitPageWidth) * 100).toFixed(2);
    this.leftSideFlex = `0 0 ${leftSideWidth}%`;
    this.rightSideFlex = `1 1 ${100 - Number(leftSideWidth)}%`;
  };

  stopResize = () => {
    document.removeEventListener('mousemove', this.resize);
    document.removeEventListener('mouseup', this.stopResize);
  };

  showDetails(card: any) {
    console.log(card)
    this.selectedCard = card;
  }

  showSigns(card:any){

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkViewport();
  }

  checkViewport() {
    this.isMobileView = window.innerWidth <= 767; // Adjust the breakpoint as needed
  }

  goBack() {
    this.selectedCard = null;

  }

  goBackSigns() {
    this.hasIssues(this.selectedConstructionWork.id);
    this.selectedConstructionWork = null;
    this.selectedCard = null;
    this.retrievedSigns = [];
  }

  // hasIssues(workId: number): boolean {
  //   // this.getSigns();
  //   const selectedWork = this.constructionWorks.filter(work => work.id === workId);
  //   const relatedSigns = this.allSigns.filter(sign => sign.csId === workId);
  //   // return relatedSigns.some(sign => sign.issue.trim() !== 'None');
  //   return relatedSigns.some(sign => {
  //     // if (sign.issue.trim() !== 'None') {
  //     //   console.log("sign id  : " +sign.id);
  //     //   selectedWork[0].status == "Angle Issue";
  //     //   return true;
  //     // }
  //     console.log("curr angle" + sign.currAngle)
  //     if (sign.currAngle !== sign.ogAngle) {
  //       sign.issue = "Angle Issue";
  //       // console.log("/n issue " + sign.issue)
  //       selectedWork[0].status == "Angle Issue";
  //       return true;
        
  //     }
  //     selectedWork[0].status =="OK";
  //     return false;
  //   });
  // }

  hasIssues(workId: number): boolean {
    const selectedWork = this.constructionWorks.find(work => work.id === workId);
    const relatedSigns = this.allSigns.filter(sign => sign.csId === workId);
    
    let hasIssue = false;
  
    relatedSigns.forEach(sign => {
      if (Math.abs(sign.currAngle - sign.ogAngle) > 5) {
        sign.issue = "Angle Issue";
        hasIssue = true;
      } else {
        sign.issue = "OK";
      }
    });
  
    if(selectedWork)
    selectedWork.status = hasIssue ? "Angle Issue" : "OK";
  
    return hasIssue;
  }


  // fixIssue(Id:number,workId:number) {
  //   var signId = Id
  //   const selectedSign = this.allSigns.filter(sign => sign.csId === workId && sign.id === signId);
  //   selectedSign[0].issue = "None"
  //   selectedSign[0].currAngle == selectedSign[0].ogAngle
  //   const selectedWork = this.constructionWorks.filter(work => work.id === workId);
  //   const relatedSigns = this.allSigns.filter(sign => sign.csId === workId);
  //   if (!relatedSigns.some(sign => sign.issue !== 'None'))
  //   {
  //     selectedWork[0].status = "OK"
  //   }
  //   console.log(workId,signId,selectedSign[0]);
  // }

  UpdateAngle(Id: number, workId: number){
    const selectedSign = this.allSigns.filter(sign => sign.csId === workId && sign.id === Id);
    console.log('Updated sign id:' + Id + "  workid  " + workId); // Debug line
    console.log('Updated selectedSign:', selectedSign); // Debug line


    return selectedSign.some(sign => {
      if (sign) {
        console.log("ANGLES Og and curr  "  +  sign.ogAngle + sign.currAngle )
        sign.currAngle = sign.ogAngle;
        this.constructionWorkService.updateSign(sign).subscribe(() => {
          console.log("Sign updated successfully!");
          this.hasIssues(workId);
        });

        this.constructionWorkService.checkSignAngle(sign).subscribe(() => {
          console.log("Sign angle Correct!");
        });
      }
    });

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
