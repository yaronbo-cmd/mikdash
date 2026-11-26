import { register, mount } from './lab.js';
import { TAIM_ACT } from '../../src/game/h137/taim.js';
register('taim', TAIM_ACT);
mount(['taim1', 'taim2', 'taim3']);
