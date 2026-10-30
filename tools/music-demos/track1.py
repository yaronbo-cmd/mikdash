"""Track 1 — "נושא הבית" (the opening theme): 120 BPM, D Hijaz, 48 bars (96 s), a seamless loop.
A kanun-like hook, a darbuka maqsum, a bass, a ney answer. Original melody."""
import sys
from seq import *

S = Song(bpm=120, bars=48, tonic=293.66)
I, bII, VII, iv = [0, 400, 700], [100, 500, 800], [-200, 100, 500], [500, 800, 1200]
OST = [0, 2, 10, 2, 11, 2, 10, 2]
cycleA = [I, I, bII, I]
cycleB = [I, VII, bII, I]
MAQSUM = 'DT.TD.T.'
MAQSUM_G = 'DTkTDkTk'
FILL = 'D.TTTTTT'

def bass_bar(bar, ch):
    r = ch[0]
    S.bassline(bar, [(0, r, 0.9), (1.5, r, 0.4), (2, r + 700, 0.9), (3, r + 1200, 0.4), (3.5, r + 700, 0.4)], gain=1.0)

H1 = [(700, .5), (700, .5), (800, .75), (700, .25), (500, 1), (400, 1), (500, .5), (400, .5), (100, .5), (400, .5), (0, 2)]
H2 = [(700, .5), (700, .5), (800, .75), (700, .25), (500, 1), (400, 1), (500, .5), (700, .5), (800, .5), (1000, .5), (1200, 2)]
H3 = [(1200, .5), (1000, .5), (800, .75), (700, .25), (500, 1), (400, 1), (500, .5), (400, .5), (100, .5), (400, .5), (0, 2)]
H4 = [(400, .5), (500, .5), (700, 1), (400, .5), (100, .5), (0, 1), (None, 4)]

def hook8(bar, vel=1.0, gain=1.0):
    for k, h in enumerate((H1, H2, H3, H4)):
        S.melody_pluck(bar + 2 * k, h, octave=1, vel=vel, pan=0.15, gain=gain, dbl=0.4, ring=1.0, decay=1.0, bright=1.3)

NEY_B = [(700, 2), (800, 1), (700, 1), (500, 1.5), (400, .5), (500, 2), (700, 1), (800, .5), (700, .5), (500, 1), (400, 1), (100, 2), (0, 2),
         (400, 1), (500, 1), (700, 2), (800, 1), (1000, 1), (800, 1), (700, 1), (500, .5), (700, .5), (500, .5), (400, .5), (100, 1), (400, 1), (0, 4)]
COUNTER = [(1200, 2), (1000, 2), (800, 2), (700, 2), (500, 2), (400, 2), (100, 2), (0, 2)]

for bar in range(1, 49):
    ch = cycleA[(bar - 1) % 4]
    # sections
    intro = bar <= 4; A = 5 <= bar <= 12; B = 13 <= bar <= 20; A2 = 21 <= bar <= 28
    brk = 29 <= bar <= 32; build = 33 <= bar <= 36; A3 = 37 <= bar <= 44; out = bar >= 45
    if B:
        ch = cycleB[(bar - 1) % 4]
    # ostinato (kanun-ish, lower register)
    if not brk:
        S.arp(bar, ch, OST, octave=0, vel=0.55 if (intro or out) else 0.42, pan=-0.3, accents=(0, 3), ring=0.7, decay=0.7)
    else:
        S.arp(bar, ch, [0, None, 2, None, 10, None, 11, None], octave=0, vel=0.5, pan=-0.3, ring=1.4, decay=1.4)
    # pad
    if intro or brk or out or B:
        S.pad(bar, ch, bars=1, octave=-1, vel=0.9 if (brk or intro) else 0.55, gain=0.9)
    # drums
    if intro:
        if bar == 3: S.drums(bar, 'F...F...', gain=0.7)
        if bar == 4: S.drums(bar, 'F...' + 'TTTT', step=0.5, gain=0.8)
    elif A or B or A2 or A3:
        pat = MAQSUM_G if (A3 or A2) else MAQSUM
        if bar % 8 == 4 and not (bar == 44):
            pat = 'DTkTD.' + 'TT'
        S.drums(bar, pat, gain=0.95)
        if A2 or A3:
            S.drums(bar, '..C...C.', gain=0.8)
        if A3:
            S.drums(bar, '.r.r.r.r', step=0.5, gain=0.9)
    elif build:
        if bar == 33: S.drums(bar, '.t.t.t.t', gain=0.8)
        if bar == 34: S.drums(bar, 'd.t.d.t.', gain=0.85)
        if bar == 35: S.drums(bar, MAQSUM, gain=0.9)
        if bar == 36: S.drums(bar, 'TTTTTTTTTTTTTTTT', step=0.25, gain=0.7)
    elif out:
        if bar in (45, 46): S.drums(bar, 'D...D.T.', gain=0.7)
    if bar == 37:
        S.drums(bar, 'B', gain=0.8)
    if bar == 5:
        S.drums(bar, 'B', gain=0.55)
    # bass
    if A or B or A2 or A3 or bar in (35, 36, 45):
        bass_bar(bar, ch)
    elif brk:
        S.bassline(bar, [(0, ch[0], 3.6)], gain=0.85)

# melodies
hook8(5, vel=1.0)
S.melody_ney(13, NEY_B, octave=1, vel=1.0, pan=-0.05, gain=1.0)
hook8(21, vel=1.05)
S.riser(35, bars=2, vel=1.0)
hook8(37, vel=1.08)
S.melody_ney(37, COUNTER, octave=1, vel=0.75, pan=-0.2)
S.melody_ney(41, COUNTER[:6] + [(400, 1), (100, 1), (0, 2)], octave=1, vel=0.75, pan=-0.2)

out = S.mix.render(rt60=1.3, lufs=-18.0)
np.save(sys.argv[1] if len(sys.argv) > 1 else 'track1.npy', out.astype(np.float32))
print('ok', out.shape, out.shape[1] / SR)
