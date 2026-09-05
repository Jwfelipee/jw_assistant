import { AssignmentRole, SlotMode } from '@jw/database';
import {
  rolesForUserCatalogSlot,
  slugPartTypeCode,
} from './catalog.helpers';

describe('catalog.helpers', () => {
  it('maps slot modes to roles', () => {
    expect(rolesForUserCatalogSlot(SlotMode.ONE)).toEqual([
      AssignmentRole.TITULAR,
    ]);
    expect(rolesForUserCatalogSlot(SlotMode.TWO)).toEqual([
      AssignmentRole.TITULAR,
      AssignmentRole.AJUDANTE,
    ]);
  });

  it('slugifies labels into codes', () => {
    expect(slugPartTypeCode('FSM', 'Iniciando conversas')).toBe(
      'FSM_INICIANDO_CONVERSAS',
    );
  });
});
