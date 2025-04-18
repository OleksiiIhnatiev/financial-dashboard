import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShortInformationComponent } from './short-information.component';
import { of } from 'rxjs';
import { Credit } from '../../models/credit/credit.model';
import { CreditsService } from '../../services/credits/credits.service';
import { CommonModule } from '@angular/common';

describe('ShortInformationComponent', () => {
  let component: ShortInformationComponent;
  let fixture: ComponentFixture<ShortInformationComponent>;
  let creditsServiceSpy: jasmine.SpyObj<CreditsService>;

  const mockCredits: Credit[] = [
    {
      id: 1,
      user: 'user1',
      body: 1000,
      percent: 100,
      issuance_date: '2025-04-01T00:00:00Z',
      return_date: '2025-04-10T00:00:00Z',
      actual_return_date: '2025-04-08T00:00:00Z',
    },
    {
      id: 2,
      user: 'user2',
      body: 1500,
      percent: 200,
      issuance_date: '2025-04-05T00:00:00Z',
      return_date: '2025-04-20T00:00:00Z',
      actual_return_date: '',
    },
  ];

  const mockStatsResult = {
    stats: {
      'Apr 2025': {
        totalCredits: 2,
        totalAmount: 2500,
        totalPercent: 300,
        totalReturned: 1,
        averageAmount: 1250,
      },
    },
    topUsersByCredits: ['user1', 'user2'],
    topUsersByPercent: ['user2'],
    topUsersByRatio: ['user1'],
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CreditsService', [
      'getCredits',
      'calculateStats',
    ]);

    await TestBed.configureTestingModule({
      imports: [CommonModule, ShortInformationComponent],
      providers: [{ provide: CreditsService, useValue: spy }],
    }).compileComponents();

    creditsServiceSpy = TestBed.inject(
      CreditsService
    ) as jasmine.SpyObj<CreditsService>;
    creditsServiceSpy.getCredits.and.returnValue(of(mockCredits));
    creditsServiceSpy.calculateStats.and.returnValue(mockStatsResult);

    fixture = TestBed.createComponent(ShortInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load credits and calculate stats on init', () => {
    expect(creditsServiceSpy.getCredits).toHaveBeenCalled();
    expect(creditsServiceSpy.calculateStats).toHaveBeenCalledWith(mockCredits);

    expect(component.credits.length).toBe(2);
    expect(component.topUsersByCredits).toEqual(['user1', 'user2']);
    expect(component.monthlyStats()).toEqual(mockStatsResult.stats);
    expect(component.filteredTopUsers).toEqual(['user1', 'user2']);
  });

  it('should filter stats by type', () => {
    component.filterStats('percent');
    expect(component.filteredTopUsers).toEqual(['user2']);
    expect(component.showMainContent).toBeFalse();

    component.filterStats('ratio');
    expect(component.filteredTopUsers).toEqual(['user1']);

    component.filterStats('credits');
    expect(component.filteredTopUsers).toEqual(['user1', 'user2']);
  });

  it('should reset filter', () => {
    component.resetFilter();
    expect(component.filteredTopUsers).toEqual(['user1', 'user2']);
    expect(component.showMainContent).toBeTrue();
  });

  it('should return object keys correctly', () => {
    const obj = { a: 1, b: 2 };
    expect(component.objectKeys(obj)).toEqual(['a', 'b']);
  });
});
