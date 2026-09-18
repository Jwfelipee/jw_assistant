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

  it('rejects empty congregation name when provided', async () => {
    const dto = plainToInstance(UpdateSettingsDto, {
      congregationName: '',
      meetingWeekday: 'THURSDAY',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'congregationName')).toBe(true);
  });

  it('accepts valid full payload', async () => {
    const dto = plainToInstance(UpdateSettingsDto, {
      congregationName: 'Congregação Centro',
      meetingWeekday: 'WEDNESDAY',
      publicLinkCurrentWeekEnabled: true,
      publicLinkNextWeekEnabled: false,
      publicLinkCurrentMonthEnabled: true,
      publicLinkNextMonthEnabled: false,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts public link toggles without congregation name', async () => {
    const dto = plainToInstance(UpdateSettingsDto, {
      publicLinkCurrentWeekEnabled: false,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts boolean public link fields', async () => {
    const dto = plainToInstance(UpdateSettingsDto, {
      publicLinkCurrentWeekEnabled: false,
      publicLinkNextWeekEnabled: true,
      publicLinkCurrentMonthEnabled: false,
      publicLinkNextMonthEnabled: true,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects non-boolean public link fields', async () => {
    const dto = plainToInstance(UpdateSettingsDto, {
      publicLinkCurrentWeekEnabled: 'false',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'publicLinkCurrentWeekEnabled')).toBe(
      true,
    );
  });

  it('allows omitted fields without validation errors', async () => {
    const dto = plainToInstance(UpdateSettingsDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
