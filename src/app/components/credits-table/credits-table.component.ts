import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CreditsService } from '../../services/credits/credits.service';
import { Credit } from '../../models/credit/credit.model';

@Component({
  selector: 'app-credits-table',
  templateUrl: './credits-table.component.html',
  styleUrls: ['./credits-table.component.scss'],
  imports: [FormsModule, CurrencyPipe, CommonModule],
})
export class CreditsTableComponent {
  credits = signal<Credit[]>([]);
  allFilteredCredits = signal<Credit[]>([]);
  pagedCredits = signal<Credit[]>([]);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  filters = {
    issuance_date: { start: '', end: '' },
    actual_return_date: { start: '', end: '' },
    overdue: false,
  };

  constructor(private creditsService: CreditsService) {}

  ngOnInit(): void {
    this.loadCredits();
  }

  loadCredits(): void {
    this.creditsService.getCredits().subscribe((data) => {
      this.credits.set(data);
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = this.credits();

    if (this.filters.issuance_date.start) {
      filtered = filtered.filter(
        (credit) =>
          new Date(credit.issuance_date) >=
          new Date(this.filters.issuance_date.start)
      );
    }
    if (this.filters.issuance_date.end) {
      filtered = filtered.filter(
        (credit) =>
          new Date(credit.issuance_date) <=
          new Date(this.filters.issuance_date.end)
      );
    }

    filtered = filtered.map((credit) => ({
      ...credit,
      status: this.calculateStatus(credit),
    }));

    if (this.filters.overdue) {
      filtered = filtered.filter((credit) => credit.status === 'Overdue');
    }

    this.allFilteredCredits.set(filtered);
    this.totalPages.set(Math.max(1, Math.ceil(filtered.length / 10)));
    this.updatePagedCredits();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updatePagedCredits();
    }
  }

  updatePagedCredits(): void {
    const startIndex = (this.currentPage() - 1) * 10;
    const endIndex = startIndex + 10;
    this.pagedCredits.set(
      this.allFilteredCredits().slice(startIndex, endIndex)
    );
  }

  calculateStatus(credit: Credit): string {
    if (!credit.actual_return_date) return 'Unreturned';

    const actual = new Date(credit.actual_return_date);
    const expected = new Date(credit.return_date);

    return actual > expected ? 'Overdue' : 'Returned';
  }

  resetFilters(): void {
    this.filters = {
      issuance_date: { start: '', end: '' },
      actual_return_date: { start: '', end: '' },
      overdue: false,
    };
    this.applyFilters();
  }
}
