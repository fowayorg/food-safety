import { Test, TestingModule } from '@nestjs/testing';
import { InspectionPlansService } from './inspection-plans.service';

describe('InspectionPlansService', () => {
  let service: InspectionPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InspectionPlansService],
    }).compile();

    service = module.get<InspectionPlansService>(InspectionPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
