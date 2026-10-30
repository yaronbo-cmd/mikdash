"""Track 2 — "עבודת הבוקר" (the work loop): 125 BPM, A Nahawand / harmonic minor (the Hijaz turn on E), 56 bars (107.5 s),
a seamless loop. A syncopated bass, a Saidi groove, a kanun riff (the hook), a ney call, and a groove-only stretch that leaves
room for the game's own sounds. Original."""
import sys
from seq import *

S = Song(bpm=125, bars=56, tonic=220.0)
Am, G, F, E = [0, 300, 700], [-200, 200, 500], [-400, 0, 300], [-500, -100, 200]
CYC = [Am, G, F, E]
SAIDI = 'DT.DD.T.'
SAIDI_G = 'DTkDDkTk'

R1a = [(1200, .5), (1100, .25), (1200, .25), (1500, .5), (1200, .5), (1100, .5), (800, .5), (700, 1)]
R1b = [(800, .5), (700, .5), (500, .5), (300, .5), (200, .5), (300, .5), (0, 1)]
R2b = [(800, .5), (1100, .5), (1200, 1), (1100, .5), (800, .5), (700, 1)]

def riff8(bar, vel=1.0, gain=1.0, dbl=0.35):
    for k, r in enumerate((R1a, R1b, R1a, R2b)):
        S.melody_pluck(bar + k, r, octave=0, vel=vel, pan=0.2, gain=gain, dbl=dbl, ring=0.75, decay=0.75, bright=1.3)

def bass_bar(bar, ch, var=False):
    r = ch[0]
    hits = [(0, r, .5), (.75, r, .25), (1.5, r, .5), (2, r + 700, .5), (2.75, r + 700, .25), (3.5, r + 1200, .5)]
    if var:
        hits = [(0, r, .75), (1, r + 1200, .25), (1.5, r, .5), (2.5, r + 700, .5), (3, r + 1000 if r == 0 else r + 700, .5), (3.5, r, .25)]
    S.bassline(bar, hits, octave=-1, gain=1.0)

NEY = [(700, 1.5), (800, .5), (700, 1), (500, 1), (300, 2), (200, 1), (300, 1), (500, 1.5), (700, .5), (800, 1), (700, 1), (1100, 2), (700, 2),
       (1200, 1.5), (1100, .5), (800, 1), (700, 1), (800, 1), (700, 1), (500, 1), (300, 1), (200, 1), (300, .5), (200, .5), (-100, 1), (0, 1), (0, 4)]
LONG = [(700, 4), (800, 4), (700, 2), (500, 2), (-100, 2), (0, 2)]

for bar in range(1, 57):
    ch = CYC[(bar - 1) % 4]
    intro = bar <= 4; A = 5 <= bar <= 12; B = 13 <= bar <= 20; brk = 21 <= bar <= 24; build = 25 <= bar <= 28
    full = 29 <= bar <= 36; groove = 37 <= bar <= 44; A2 = 45 <= bar <= 52; out = bar >= 53
    # comp: offbeat plucked chords (the "skank"), soft
    if not brk:
        S.arp(bar, ch, [None, 0, None, 1, None, 2, None, 1], octave=0, vel=0.32, pan=-0.35, ring=0.35, decay=0.35, step=0.5)
    # pad
    if intro or brk or groove or out or bar in (25, 26):
        S.pad(bar, ch, bars=1, octave=-1, vel=0.75, gain=0.85)
    # drums
    if intro or out:
        S.drums(bar, 'F...F...' if bar % 2 else 'F...F.t.', gain=0.75)
    elif A or B or full or A2 or groove:
        pat = SAIDI_G if (full or A2) else SAIDI
        if bar % 8 == 4:
            pat = 'DTkDD.TTTT'[:8]
        S.drums(bar, pat, gain=0.9)
        S.drums(bar, 'F...F...', gain=0.6)
        if B or full or A2:
            S.drums(bar, '..C...C.', gain=0.75)
        if full:
            S.drums(bar, 'rrRrrrRr', step=0.5, gain=0.8)
    elif brk:
        S.drums(bar, 'F.......', gain=0.6)
    elif build:
        if bar == 25: S.drums(bar, 't.t.t.t.', gain=0.7)
        if bar == 26: S.drums(bar, 'd.t.d.t.', gain=0.8)
        if bar == 27: S.drums(bar, SAIDI, gain=0.85)
        if bar == 28: S.drums(bar, 'TTTTTTTTTTTTTTTT', step=0.25, gain=0.65)
    if bar == 29: S.drums(bar, 'B', gain=0.75)
    # bass
    if A or B or full or A2 or groove or bar in (27, 28):
        bass_bar(bar, ch, var=groove)
    elif intro or out:
        S.bassline(bar, [(0, ch[0], 1.5), (2, ch[0], 1.5)], octave=-1, gain=0.8)
    elif brk or bar in (25, 26):
        S.bassline(bar, [(0, ch[0], 3.6)], octave=-1, gain=0.75)

riff8(5); riff8(9, vel=1.05)
S.melody_ney(13, NEY, octave=1, vel=1.0, pan=-0.1)
S.melody_pluck(16, [(None, 2), (1100, .5), (1200, .5), (700, 1)], octave=0, vel=0.7, pan=0.3, dbl=0, ring=0.6)   # the riff answers the ney
S.melody_pluck(20, [(None, 2), (800, .5), (700, .5), (0, 1)], octave=0, vel=0.7, pan=0.3, dbl=0, ring=0.6)
S.melody_ney(21, LONG, octave=1, vel=0.6, pan=0.1)
S.riser(27, bars=2)
riff8(29, vel=1.1); riff8(33, vel=1.1)
S.melody_ney(29, LONG, octave=2, vel=0.45, pan=-0.25)
S.melody_ney(33, LONG, octave=2, vel=0.45, pan=-0.25)
riff8(45, vel=1.0)
S.melody_ney(49, NEY[:13], octave=1, vel=0.9, pan=-0.1)

out = S.mix.render(rt60=1.1, lufs=-18.0, presence=4.5)
np.save(sys.argv[1] if len(sys.argv) > 1 else 'track2.npy', out.astype(np.float32))
print('ok', out.shape[1] / SR)
