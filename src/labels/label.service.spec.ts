import { LabelService } from './label.service';

describe('LabelService', () => {
  it('commandCodes is non-empty', () => {
    expect(LabelService.commandCodes().length).toBeGreaterThan(0);
  });
});
