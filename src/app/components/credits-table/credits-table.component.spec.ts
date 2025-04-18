import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditsTableComponent } from './credits-table.component';
import { of } from 'rxjs';
import { CreditsService } from '../../services/credits/credits.service';
import { Credit } from '../../models/credit/credit.model';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('CreditsTableComponent', () => {
  let component: CreditsTableComponent;
  let fixture: ComponentFixture<CreditsTableComponent>;
  let creditsServiceSpy: jasmine.SpyObj<CreditsService>;

  const mockCredits: Credit[] = [
    {
      id: 1,
      user: 'User1',
      body: 1000,
      percent: 100,
      issuance_date: '2025-04-01T00:00:00Z',
      return_date: '2025-04-10T00:00:00Z',
      actual_return_date: '2025-04-09T00:00:00Z',
    },
    {
      id: 2,
      user: 'User2',
      body: 1500,
      percent: 200,
      issuance_date: '2025-04-05T00:00:00Z',
      return_date: '2025-04-08T00:00:00Z',
      actual_return_date: '',
    },
    {
      id: 3,
      user: 'User3',
      body: 1200,
      percent: 150,
      issuance_date: '2025-03-25T00:00:00Z',
      return_date: '2025-04-01T00:00:00Z',
      actual_return_date: '2025-04-05T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CreditsService', ['getCredits']);

    await TestBed.configureTestingModule({
      imports: [CreditsTableComponent, FormsModule],
      providers: [{ provide: CreditsService, useValue: spy }, CurrencyPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditsTableComponent);
    component = fixture.componentInstance;

    creditsServiceSpy = TestBed.inject(
      CreditsService
    ) as jasmine.SpyObj<CreditsService>;
    creditsServiceSpy.getCredits.and.returnValue(of(mockCredits));

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load and apply filters on init', () => {
    expect(component.credits().length).toBe(3);
    expect(component.allFilteredCredits().length).toBe(3);
    expect(component.pagedCredits().length).toBe(3);
    expect(component.totalPages()).toBe(1);
  });

  it('should filter by overdue correctly', () => {
    component.filters.overdue = true;
    component.applyFilters();

    const filtered = component.allFilteredCredits();
    expect(filtered.length).toBe(1);
    expect(filtered[0].status).toBe('Overdue');
  });

  it('should calculate correct status', () => {
    const overdue = mockCredits[2];
    const returned = mockCredits[0];
    const unreturned = mockCredits[1];

    expect(component.calculateStatus(overdue)).toBe('Overdue');
    expect(component.calculateStatus(returned)).toBe('Returned');
    expect(component.calculateStatus(unreturned)).toBe('Unreturned');
  });

  it('should reset filters and show all credits', () => {
    component.filters.overdue = true;
    component.applyFilters();
    expect(component.allFilteredCredits().length).toBe(1);

    component.resetFilters();
    expect(component.allFilteredCredits().length).toBe(3);
  });

  it('should change page correctly', () => {
    component.pageSize.set(2);
    component.applyFilters();

    component.changePage(2);
    const page2 = component.pagedCredits();
    expect(page2.length).toBe(1);
  });
});
