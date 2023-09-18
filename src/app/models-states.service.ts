import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ConstructionWork} from './models/construction-work.model';
import { Signs} from './models/signs.model';

@Injectable({
  providedIn: 'root'
})
export class ModelsStatesService {

  private constructionWorksSubject = new BehaviorSubject<ConstructionWork[]>([]);
  constructionWorks$ = this.constructionWorksSubject.asObservable();

  private signsSubject = new BehaviorSubject<Signs[]>([]);
  signs$ = this.signsSubject.asObservable();

  constructor() { }

  setConstructionWorks(works: ConstructionWork[]) {
    const signs = this.signsSubject.value; // Get all signs
    const updatedWorks = works.map(work => {
      const workSigns = signs.filter(sign => sign.csId === work.id);
      const hasSignIssues = workSigns.some(sign => sign.issue !== 'OK' && sign.issue !== null );
  
      return {
        ...work,
        status: hasSignIssues
      };
    });
    console.log("Updated logs",updatedWorks)
    this.constructionWorksSubject.next(updatedWorks);
    sessionStorage.setItem('constructionWorks', JSON.stringify(updatedWorks));
  }
  

  getConstructionWorks(): ConstructionWork[] {
    return this.constructionWorksSubject.value;
  }

  setSigns(signs: Signs[]) {
    const signsWithIssue = signs.map(sign => ({
      ...sign,
      issue: sign.issue
    }));
    this.signsSubject.next(signsWithIssue);
    sessionStorage.setItem('signs', JSON.stringify(signsWithIssue));
  }

  getSigns():Signs[] {
    return this.signsSubject.value;
  }

  getSignsByWorkID(workId: number):Signs[] {
    const allSigns = this.signsSubject.value;
    // console.log("all signs from shared sercice")
    // console.log(allSigns)
    return allSigns.filter(sign => sign.csId === workId);
  }

  updateConstructionWork(work: ConstructionWork) {
    const currentWorks = this.constructionWorksSubject.value;
    const index = currentWorks.findIndex(w => w.id === work.id);
    if (index !== -1) {
      currentWorks[index] = work;
      this.constructionWorksSubject.next(currentWorks);
    }
  }
}
