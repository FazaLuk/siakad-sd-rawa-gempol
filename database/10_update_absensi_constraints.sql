ALTER TABLE absensi
DROP CONSTRAINT IF EXISTS absensi_status_check;

UPDATE absensi
SET status = 'Alpha'
WHERE status = 'Alfa';

ALTER TABLE absensi
ADD CONSTRAINT absensi_status_check
CHECK (status IN ('Hadir', 'Izin', 'Sakit', 'Alpha'));

CREATE UNIQUE INDEX IF NOT EXISTS absensi_id_siswa_tanggal_key
ON absensi(id_siswa, tanggal);
