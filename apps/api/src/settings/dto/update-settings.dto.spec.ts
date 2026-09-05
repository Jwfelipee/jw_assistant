import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateSettingsDto } from './update-settings.dto';

describe('UpdateSettingsDto', () => {
  it('rejects invalid weekday', async () => {
    const dto = plainToInstance(UpdateSettingsDto, {
      congregationName: 'Teste',
      meetingWeekday: 'NOTADAY',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'meetingWeekday')).toBe(true);
  });

  it('rejects empty congregation name', async () => {
    const dto = plainToInstance(UpdateSettingsDto, {
      congregationName: '',
      meetingWeekday: 'THURSDAY',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'congregationName')).toBe(true);
  });

  it('accepts valid payload', async () => {
    const dto = plainToInstance(UpdateSettingsDto, {
      congregationName: 'Congregação Centro',
      meetingWeekday: 'WEDNESDAY',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
