import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { CreditsService } from '../../services/credits/credits.service';
import { Credit } from '../../models/credit/credit.model';

@Component({
  selector: 'app-short-information',
  templateUrl: './short-information.component.html',
  styleUrls: ['./short-information.component.scss'],
  imports: [CommonModule],
})
export class ShortInformationComponent implements OnInit {
  credits: Credit[] = [];
  monthlyStats = signal<{ [key: string]: any }>({});
  topUsersByCredits: string[] = [];
  topUsersByPercent: string[] = [];
  topUsersByRatio: string[] = [];
  filteredTopUsers: string[] = [];
  showMainContent = true;
  currentFilter: string = 'користувачів';

  constructor(private creditsService: CreditsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.creditsService.getCredits().subscribe((data) => {
      this.credits = data;
      this.calculateStats();
    });
  }

  calculateStats(): void {
    const { stats, topUsersByCredits, topUsersByPercent, topUsersByRatio } =
      this.creditsService.calculateStats(this.credits);

    this.monthlyStats.set(stats);
    this.topUsersByCredits = topUsersByCredits;
    this.topUsersByPercent = topUsersByPercent;
    this.topUsersByRatio = topUsersByRatio;

    this.filteredTopUsers = this.topUsersByCredits;
  }

  filterStats(type: string): void {
    this.showMainContent = false;

    switch (type) {
      case 'credits':
        this.currentFilter = 'по кількості кредитів';
        this.filteredTopUsers = this.topUsersByCredits;
        break;
      case 'percent':
        this.currentFilter = 'по сумі сплачених відсотків';
        this.filteredTopUsers = this.topUsersByPercent;
        break;
      case 'ratio':
        this.currentFilter = 'по співвідношенню відсотків до суми кредиту';
        this.filteredTopUsers = this.topUsersByRatio;
        break;
      default:
        this.currentFilter = 'користувачів';
        this.filteredTopUsers = this.topUsersByCredits;
        break;
    }
  }

  resetFilter(): void {
    this.showMainContent = true;
    this.currentFilter = 'користувачів';
    this.filteredTopUsers = this.topUsersByCredits;
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
