import { TestBed } from '@angular/core/testing';
import { CreditsService } from './credits.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Credit } from '../../models/credit/credit.model';
import { environment } from '../../../environments/environment';

describe('CreditsService', () => {
  let service: CreditsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CreditsService],
    });
    service = TestBed.inject(CreditsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCredits', () => {
    it('should return expected credits (HttpClient called once)', () => {
      const mockCredits: Credit[] = [
        {
          id: 1,
          user: 'user1',
          body: 1000,
          percent: 100,
          issuance_date: '2025-04-01T00:00:00Z',
          return_date: '2025-04-20T00:00:00Z',
          actual_return_date: '2025-04-10T00:00:00Z',
        },
      ];

      service.getCredits().subscribe((credits) => {
        expect(credits).toEqual(mockCredits);
      });

      const req = httpMock.expectOne(environment.creditsApiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockCredits);
    });

    it('should return empty array on error', () => {
      service.getCredits().subscribe((credits) => {
        expect(credits).toEqual([]);
      });

      const req = httpMock.expectOne(environment.creditsApiUrl);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('calculateStats', () => {
    it('should calculate stats correctly', () => {
      const input: Credit[] = [
        {
          id: 1,
          user: 'user1',
          body: 1000,
          percent: 100,
          issuance_date: '2025-03-15T00:00:00Z',
          return_date: '2025-04-01T00:00:00Z',
          actual_return_date: '2025-03-25T00:00:00Z',
        },
        {
          id: 2,
          user: 'user1',
          body: 500,
          percent: 50,
          issuance_date: '2025-03-20T00:00:00Z',
          return_date: '2025-04-10T00:00:00Z',
          actual_return_date: '',
        },
        {
          id: 3,
          user: 'user2',
          body: 1500,
          percent: 200,
          issuance_date: '2025-04-01T00:00:00Z',
          return_date: '2025-04-20T00:00:00Z',
          actual_return_date: '2025-04-15T00:00:00Z',
        },
      ];

      const result = service.calculateStats(input);

      expect(result.stats['Mar 2025'].totalCredits).toBe(2);
      expect(result.stats['Mar 2025'].totalAmount).toBe(1500);
      expect(result.stats['Mar 2025'].totalReturned).toBe(1);
      expect(result.stats['Mar 2025'].averageAmount).toBe(750);

      expect(result.stats['Apr 2025'].totalCredits).toBe(1);
      expect(result.stats['Apr 2025'].totalAmount).toBe(1500);

      expect(result.topUsersByCredits[0]).toBe('user1');
      expect(result.topUsersByPercent[0]).toBe('user2');
      expect(result.topUsersByRatio[0]).toBe('user2');
    });
  });
});
