"""Track 3 — "חגיגה" (the festival): 6/8, dotted quarter = 104, D Bayati (the half-flat E), 72 bars (83 s), a seamless loop.
Riq and claps, a kanun hook with the Bayati turn F–E½–D, a ney melody, a dancing bass. Original."""
import sys
from seq import *

# one "beat" = an eighth note; six per bar
S = Song(bpm=312, bars=72, beats_per_bar=6, tonic=293.66)
Dm, Gm, C5 = [0, 300, 700], [500, 800, 1200], [-200, 500, 1000]
CYA = [Dm, Dm, C5, Dm]
CYB = [Gm, Dm, C5, Dm]

H1 = [(1200, 1.5), (1000, .5), (800, 1), (700, 2), (500, 1)]
H2 = [(800, 1), (700, 1), (500, 1), (300, 1.5), (150, .5), (0, 1)]
H2v = [(800, 1), (1000, 1), (1200, 2), (None, 2)]
H3 = [(700, 1), (800, 1), (700, 1), (500, 1), (300, 1), (500, 1)]

def hook8(bar, vel=1.0):
    for k, h in enumerate((H1, H2v, H1, H2, H3, H2, H1, H2)):
        S.melody_pluck(bar + k, h, octave=1, vel=vel, pan=0.18, dbl=0.4, ring=0.8, decay=0.8, bright=1.35)

NEY = [(700, 3), (800, 1.5), (700, 1.5), (500, 3), (300, 3), (500, 1.5), (700, 1.5), (800, 3), (700, 6),
       (1000, 3), (800, 1.5), (700, 1.5), (500, 2), (300, 1), (150, 1), (300, 2), (150, 1), (0, 5)]
# sum: 3+1.5+1.5+3+3+1.5+1.5+3+6 = 24; 3+1.5+1.5+2+1+1+2+1+5 = 18 -> 42 eighths = 7 bars; pad to 8 bars with a rest
NEY = NEY + [(None, 6)]

def bass_bar(bar, ch):
    r = ch[0]
    S.bassline(bar, [(0, r, 1.6), (3, r + 700, 1.6), (5, r + 1200, 0.8)], octave=-1, gain=1.0)

for bar in range(1, 73):
    intro = bar <= 8; A = 9 <= bar <= 24; B = 25 <= bar <= 32; brk = 33 <= bar <= 40; build = 41 <= bar <= 44
    A2 = 45 <= bar <= 60; out = bar >= 61
    ch = (CYB if B else CYA)[(bar - 1) % 4]
    # plucked accompaniment: 6/8 arpeggio
    if not brk:
        S.arp(bar, ch, [0, 2, 10, 2, 11, 2], octave=0, vel=0.4 if not intro else 0.5, pan=-0.3, ring=0.55, decay=0.55, step=1)
    else:
        S.arp(bar, ch, [0, None, None, 10, None, None], octave=0, vel=0.5, pan=-0.3, ring=1.2, decay=1.2, step=1)
    if intro or brk or out:
        S.pad(bar, ch, bars=1, octave=-1, vel=0.7, gain=0.8)
    # drums (one step = an eighth)
    if intro:
        if bar >= 5:
            S.drums(bar, 'D..T..' if bar < 8 else 'D.TTTT', step=1, gain=0.8)
    elif A or B or A2:
        S.drums(bar, 'D.tDTt' if bar % 4 else 'D.TDTT', step=1, gain=0.9)
        S.drums(bar, 'rrRrrR', step=1, gain=0.8)
        if B or A2:
            S.drums(bar, '...C..', step=1, gain=0.8)
    elif brk:
        if bar >= 37: S.drums(bar, 'F.....', step=1, gain=0.6)
    elif build:
        S.drums(bar, 't.t.t.' if bar < 43 else 'TTTTTT', step=1, gain=0.75)
    elif out:
        if bar <= 64: S.drums(bar, 'D..T..', step=1, gain=0.7)
    if bar == 45: S.drums(bar, 'B', gain=0.7)
    # bass
    if A or B or A2 or bar in (43, 44) or (intro and bar >= 5) or (out and bar <= 64):
        bass_bar(bar, ch)
    elif brk:
        S.bassline(bar, [(0, ch[0], 5.5)], octave=-1, gain=0.75)

hook8(9); hook8(17, vel=1.05)
S.melody_ney(25, NEY, octave=1, vel=1.0, pan=-0.1)
S.melody_ney(33, [(700, 6), (800, 6), (700, 6), (500, 6), (300, 6), (150, 6), (0, 12)], octave=1, vel=0.6, pan=0.1, vib=10)
S.riser(43, bars=2)
hook8(45, vel=1.1); hook8(53, vel=1.1)
S.melody_ney(53, NEY, octave=1, vel=0.7, pan=-0.25)

out = S.mix.render(rt60=1.2, lufs=-18.0)
np.save(sys.argv[1] if len(sys.argv) > 1 else 'track3.npy', out.astype(np.float32))
print('ok', out.shape[1] / SR)
