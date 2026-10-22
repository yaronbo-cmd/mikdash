import sys, subprocess
import numpy as np
from scipy import signal
import pyloudnorm as pyln
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
SR = 44100

def export(npy, name):
    x = np.load(npy)
    pcm = (np.clip(x, -1, 1).T * 32767).astype(np.int16)
    from scipy.io import wavfile
    wavfile.write(name + '.wav', SR, pcm)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', name + '.wav', '-codec:a', 'libmp3lame', '-b:a', '192k', name + '.mp3'], check=True)
    return x

def report(x, name, title):
    m = pyln.Meter(SR)
    lufs = m.integrated_loudness(x.T)
    peak = 20 * np.log10(np.max(np.abs(x)) + 1e-12)
    mono = x.mean(0)
    f, P = signal.welch(mono, SR, nperseg=8192)
    def band(a, b):
        k = (f >= a) & (f < b); return 10 * np.log10(np.sum(P[k]) + 1e-20)
    tot = 10 * np.log10(np.sum(P))
    bands = [(20, 150), (150, 400), (400, 1500), (1500, 4000), (4000, 8000), (8000, 20000)]
    rel = {f'{a}-{b}': round(band(a, b) - tot, 1) for a, b in bands}
    # short-term loudness per 2 s
    blk = SR * 2
    st = [m.integrated_loudness(x[:, i:i + blk].T) if np.max(np.abs(x[:, i:i + blk])) > 1e-4 else -70 for i in range(0, x.shape[1] - blk + 1, blk)]
    fig, ax = plt.subplots(2, 1, figsize=(14, 7))
    ax[0].plot(np.arange(len(st)) * 2, st, marker='o'); ax[0].set_ylabel('LUFS / 2 s'); ax[0].grid(True)
    ax[0].set_title(f'{title}: {lufs:.1f} LUFS, peak {peak:.1f} dBFS, bands rel. {rel}', fontsize=8)
    ff, tt, Sxx = signal.spectrogram(mono, SR, nperseg=4096, noverlap=2048)
    ax[1].pcolormesh(tt, ff, 10 * np.log10(Sxx + 1e-12), shading='auto', vmin=-120, vmax=-40)
    ax[1].set_yscale('symlog', linthresh=200); ax[1].set_ylim(40, 16000); ax[1].set_xlabel('s')
    plt.tight_layout(); plt.savefig(name + '.png', dpi=70)
    # loop seam: compare the last 50 ms and the first 50 ms levels
    seam = 20 * np.log10(np.sqrt(np.mean(x[:, -2205:] ** 2)) + 1e-9), 20 * np.log10(np.sqrt(np.mean(x[:, :2205] ** 2)) + 1e-9)
    print(name, f'LUFS {lufs:.1f} peak {peak:.1f}', rel, 'seam end/start dB', [round(v, 1) for v in seam])

if __name__ == '__main__':
    npy, name, title = sys.argv[1], sys.argv[2], sys.argv[3]
    x = export(npy, name)
    report(x, name, title)
