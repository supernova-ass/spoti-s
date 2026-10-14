FOLDER AUDIO SPOTIS
====================
Simpan file MP3 asli di dalam folder ini:
public/audio/<nama_lagu>.mp3

Contoh:
- public/audio/manuk_dadali.mp3
- public/audio/bubuy_bulan.mp3
- public/audio/es_lilin.mp3

File di folder ini dapat diakses secara statis oleh Next.js di path:
/audio/<nama_lagu>.mp3

Dan daftarkan di lib/sunda-songs.ts:
audioUrl: '/audio/manuk_dadali.mp3'
