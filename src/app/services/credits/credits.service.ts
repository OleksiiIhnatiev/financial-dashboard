import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Credit } from '../../models/credit/credit.model';

@Injectable({
  providedIn: 'root',
})
export class CreditsService {
  private apiUrl = environment.creditsApiUrl;

  constructor(private http: HttpClient) {}

  getCredits(): Observable<Credit[]> {
    return this.http.get<Credit[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error loading credits:', error);
        return of([]);
      })
    );
  }
  calculateStats(credits: Credit[]): any {
    const stats: any = {};
    const userStats: any = {};

    credits.forEach((credit) => {
      const monthYear = new Date(credit.issuance_date).toLocaleString(
        'default',
        {
          month: 'short',
          year: 'numeric',
        }
      );

      if (!stats[monthYear]) {
        stats[monthYear] = {
          totalCredits: 0,
          totalAmount: 0,
          totalPercent: 0,
          totalReturned: 0,
          averageAmount: 0,
        };
      }

      stats[monthYear].totalCredits += 1;
      stats[monthYear].totalAmount += credit.body;
      stats[monthYear].totalPercent += credit.percent;
      if (credit.actual_return_date) {
        stats[monthYear].totalReturned += 1;
      }

      const user = credit.user;
      if (!userStats[user]) {
        userStats[user] = {
          totalCredits: 0,
          totalPercent: 0,
          totalBody: 0,
          totalReturned: 0,
        };
      }

      userStats[user].totalCredits += 1;
      userStats[user].totalBody += credit.body;
      userStats[user].totalPercent += credit.percent;
      if (credit.actual_return_date) {
        userStats[user].totalReturned += 1;
      }
    });

    Object.keys(stats).forEach((monthYear) => {
      stats[monthYear].averageAmount =
        stats[monthYear].totalAmount / stats[monthYear].totalCredits;
    });

    const topUsersByCredits = Object.keys(userStats)
      .sort((a, b) => userStats[b].totalCredits - userStats[a].totalCredits)
      .slice(0, 10);

    const topUsersByPercent = Object.keys(userStats)
      .filter((user) => userStats[user].totalReturned > 0)
      .sort((a, b) => userStats[b].totalPercent - userStats[a].totalPercent)
      .slice(0, 10);

    const topUsersByRatio = Object.keys(userStats)
      .filter((user) => userStats[user].totalReturned > 0)
      .sort(
        (a, b) =>
          userStats[b].totalPercent / userStats[b].totalBody -
          userStats[a].totalPercent / userStats[a].totalBody
      )
      .slice(0, 10);

    return { stats, topUsersByCredits, topUsersByPercent, topUsersByRatio };
  }
}
