const form = document.querySelector('form');
const result = document.getElementById('result');
const submitButton = form.querySelector('.submit-button');
const spreadsheetUrl = 'https://script.google.com/macros/s/AKfycbzollMSa2VHK0_iZKwJsk0lznyQiruawbYPy9KZSFjjxN4eu_ge6NC59641p2p9TAqRTw/exec';

const matchingChoices = [
  'A. Musyawarah Keluarga',
  'B. Hak Peserta Musyawarah',
  'C. Musyawarah Masyarakat',
  'D. Menghargai Pendapat',
  'E. Aklamasi',
  'F. Pancasila',
  'G. Kewajiban Peserta Musyawarah',
  'H. Konsensus',
  'I. Manfaat Musyawarah',
  'J. Musyawarah Sekolah'
];

form.querySelectorAll('select[name^="jodoh"]').forEach((select) => {
  matchingChoices.forEach((choice, index) => {
    const option = document.createElement('option');
    option.value = String.fromCharCode(65 + index);
    option.textContent = choice;
    select.append(option);
  });
});

const correctAnswers = {
  pg1: 'C', pg2: 'B', pg3: 'C', pg4: 'A', pg5: 'C',
  pg6: 'B', pg7: 'A', pg8: 'B', pg9: 'C', pg10: 'B',
  pg11: 'C', pg12: 'A', pg13: 'B', pg14: 'B', pg15: 'C',
  bs1: 'B', bs2: 'S', bs3: 'B', bs4: 'S', bs5: 'B',
  bs6: 'S', bs7: 'B', bs8: 'B', bs9: 'S', bs10: 'B',
  jodoh1: 'E', jodoh2: 'H', jodoh3: 'F', jodoh4: 'A', jodoh5: 'J',
  jodoh6: 'C', jodoh7: 'B', jodoh8: 'G', jodoh9: 'D', jodoh10: 'I'
};

const pointValues = {
  ...Object.fromEntries(Array.from({ length: 15 }, (_, i) => [`pg${i + 1}`, 2])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`bs${i + 1}`, 3])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`jodoh${i + 1}`, 4]))
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  result.hidden = false;
  result.textContent = 'Menghitung nilai dan mengirim jawaban...';

  let score = 0;
  let correctCount = 0;
  let answered = 0;
  const answers = {};

  for (const [name, correctAnswer] of Object.entries(correctAnswers)) {
    const response = form.elements[name].value;
    answers[name] = response;
    if (response) answered++;
    if (response === correctAnswer) {
      score += pointValues[name];
      correctCount++;
    }
  }

  const total = Object.keys(correctAnswers).length;
  const payload = {
    waktuKirim: new Date().toISOString(),
    nama: form.elements.nama.value,
    kelas: form.elements.kelas.value,
    tanggalLahir: form.elements['tanggal-lahir'].value,
    mataPelajaran: form.elements['mata-pelajaran'].value,
    bab: form.elements.bab.value,
    jawaban: answers,
    nilai: score,
    jawabanBenar: correctCount,
    totalSoal: total,
    jawabanTerisi: answered
  };

  try {
    await fetch(spreadsheetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    result.textContent = `Tes selesai! Nilai: ${score} dari 100. Jawaban benar: ${correctCount} dari ${total}. Jawaban terisi: ${answered} dari ${total}. Permintaan penyimpanan telah dikirim ke spreadsheet.`;
    form.querySelectorAll('input, select, button').forEach((control) => {
      control.disabled = true;
    });
  } catch (error) {
    result.textContent = `Nilai: ${score} dari 100. Pengiriman ke spreadsheet gagal. Periksa koneksi internet lalu coba kumpulkan kembali.`;
    submitButton.disabled = false;
  }
});