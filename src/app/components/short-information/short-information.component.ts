import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { CreditsService } from '../../services/credits/credits.service';
import { Credit } from '../../models/credit/credit.model';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-short-information',
  standalone: true,
  templateUrl: './short-information.component.html',
  styleUrls: ['./short-information.component.scss'],
  imports: [CommonModule],
})
export class ShortInformationComponent implements OnInit {
  private creditsSubject = new BehaviorSubject<Credit[]>([]);
  credits$ = this.creditsSubject.asObservable();

  statsSignal = signal<{ [key: string]: any }>({});
  monthlyStats = signal<{ [key: string]: any }>({});
  filteredTopUsers = signal<string[]>([]);
  topUsersByCredits: string[] = [];
  topUsersByPercent: string[] = [];
  topUsersByRatio: string[] = [];
  showMainContent = true;
  currentFilter: string = 'користувачів';

  constructor(private creditsService: CreditsService) {}

  ngOnInit(): void {
    this.loadData();
    this.credits$
      .pipe(map((credits) => this.calculateStats(credits)))
      .subscribe(
        ({ stats, topUsersByCredits, topUsersByPercent, topUsersByRatio }) => {
          this.monthlyStats.set(stats);
          this.topUsersByCredits = topUsersByCredits;
          this.topUsersByPercent = topUsersByPercent;
          this.topUsersByRatio = topUsersByRatio;
          this.filteredTopUsers.set(topUsersByCredits);
        }
      );
  }

  loadData(): void {
    this.creditsService.getCredits().subscribe((data) => {
      this.creditsSubject.next(data);
    });
  }

  calculateStats(credits: Credit[]): any {
    const { stats, topUsersByCredits, topUsersByPercent, topUsersByRatio } =
      this.creditsService.calculateStats(credits);
    return { stats, topUsersByCredits, topUsersByPercent, topUsersByRatio };
  }

  filterStats(type: string): void {
    this.showMainContent = false;

    switch (type) {
      case 'credits':
        this.currentFilter = 'по кількості кредитів';
        this.filteredTopUsers.set(this.topUsersByCredits);
        break;
      case 'percent':
        this.currentFilter = 'по сумі сплачених відсотків';
        this.filteredTopUsers.set(this.topUsersByPercent);
        break;
      case 'ratio':
        this.currentFilter = 'по співвідношенню відсотків до суми кредиту';
        this.filteredTopUsers.set(this.topUsersByRatio);
        break;
      default:
        this.currentFilter = 'користувачів';
        this.filteredTopUsers.set(this.topUsersByCredits);
        break;
    }
  }

  resetFilter(): void {
    this.showMainContent = true;
    this.currentFilter = 'користувачів';
    this.filteredTopUsers.set(this.topUsersByCredits);
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
