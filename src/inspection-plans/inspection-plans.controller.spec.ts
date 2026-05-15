import { Test, TestingModule } from '@nestjs/testing';
import { InspectionPlansController } from './inspection-plans.controller';

describe('InspectionPlansController', () => {
  let controller: InspectionPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InspectionPlansController],
    }).compile();

    controller = module.get<InspectionPlansController>(InspectionPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
