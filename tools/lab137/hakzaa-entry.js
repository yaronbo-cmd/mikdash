import { register, mount } from './lab.js';
import { HAKZAA_ACT } from '../../src/game/h137/hakzaa.js';
register('hakzaa', HAKZAA_ACT);
mount(['hakzaa1', 'hakzaa2', 'hakzaa3']);
