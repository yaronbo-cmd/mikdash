/* The mini-games of the service, by id (see ../data.js GAMES for what each one teaches). */
import { makePayis } from './payis.js';
import { kiddush } from './kiddush.js';
import { deshen } from './deshen.js';
import { maaracha } from './maaracha.js';
import { barkai } from './barkai.js';
import { taleh } from './taleh.js';
import { heichal } from './heichal.js';
import { zerika } from './zerika.js';
import { evarim } from './evarim.js';
import { ketoret } from './ketoret.js';
import { birkat } from './birkat.js';
import { shir } from './shir.js';
import { korbanot } from './korbanot.js';
import { musaf } from './musaf.js';
import { erev } from './erev.js';
import { neirot } from './neirot.js';
import { aravot } from './aravot.js';
import { shoevah } from './shoevah.js';
import { lechem } from './lechem.js';
import { chavitin, shaarim, kelim, machar, neilah } from './day.js';   // ── avoda12 ── the day in detail (wave 12)
import { pitum } from './pitum.js';   // ── service13 ── פיטום הקטורת at Beit Avtinas (wave 13)
import { dir } from './dir.js';   // ── service13 ── the pens and the lambs' chamber (wave 13)

export const MINIGAMES = {
  payis1: makePayis('payis1'), kiddush, deshen, maaracha, payis2: makePayis('payis2'), barkai, taleh, heichal,
  zerika, evarim, payis3: makePayis('payis3'), ketoret, birkat, shir, korbanot, musaf, erev, neirot, aravot, shoevah, lechem,
  chavitin, shaarim, kelim, machar, neilah,   // ── avoda12 ──
  pitum, dir,   // ── service13 ──
};
