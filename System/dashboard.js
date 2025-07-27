import { dataManager } from "./data-manager.js";

  let currentUser = null;
  const MAX_BEDS = window.MAX_BEDS || 8; // จำนวนเตียงทั้งหมด สามารถปรับได้หากมีการเพิ่มเตียงใหม่

// ระบบจัดการ Modal
const modalManager = {
  showToast: function(options) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${options.type === 'success' ? '#22c55e' : options.type === 'error' ? '#ef4444' : '#0ea5e9'};
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      font-weight: 600;
      z-index: 10001;
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      min-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease-out;
    `;

    toast.textContent = options.message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, options.duration || 4000);
  }
};

// เริ่มต้นระบบ
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('userInfo').innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="
        background: ${currentUser.role === 'admin' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #22c55e, #16a34a)'};
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
      ">${currentUser.role === 'admin' ? 'ADMIN' : 'NURSE'}</div>
      <span>👤 ${currentUser.fullname}</span>
    </div>
  `;

  document.getElementById('adminControls').style.display = 'flex';
  const bedCountElem = document.getElementById('bedCountText');
  if (bedCountElem) {
    bedCountElem.textContent = MAX_BEDS;
  }
  setupBedSelectors();
  document.getElementById('quickAddBtn')?.addEventListener('click', showQuickAdd);
  document.getElementById('quickIOBtn')?.addEventListener('click', showIOEntry);
  document.getElementById('bedsOverviewBtn')?.addEventListener('click', showBedsOverview);
}

function setupBedSelectors() {
  const bedSelect = document.getElementById('bedSelect');
  const ioBedSelect = document.getElementById('ioBedSelect');

  if (bedSelect) {
    bedSelect.innerHTML = '<option value="">เลือกเตียง</option>';
    for (let i = 1; i <= MAX_BEDS; i++) {
      bedSelect.innerHTML += `<option value="${i}">เตียง ${i}</option>`;
    }
  }

  if (ioBedSelect) {
    ioBedSelect.innerHTML = '<option value="">เลือกเตียง</option>';
    for (let i = 1; i <= MAX_BEDS; i++) {
      const bedData = dataManager.getPatient(i);
      if (bedData && bedData.patient_id) {
        ioBedSelect.innerHTML += `<option value="${i}">เตียง ${i} - ${bedData.patient_id}</option>`;
      } else {
        ioBedSelect.innerHTML += `<option value="${i}">เตียง ${i} - ว่าง</option>`;
      }
    }
  }
}

function showQuickAdd() {
  document.getElementById('patientModal').style.display = 'flex';
}

function showIOEntry() {
  showNewIOModal();
}

function showBedsOverview() {
  loadBedsOverview();
  document.getElementById('bedsModal').style.display = 'flex';
}

function loadBedsOverview() {
  const content = document.getElementById('bedsOverviewContent');
  let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">';

  for (let i = 1; i <= MAX_BEDS; i++) {
    const bedData = dataManager.getPatient(i);
    const ioRecords = JSON.parse(localStorage.getItem(`io_records_bed_${i}`) || '[]');

    if (bedData && bedData.patient_id) {
      html += `
        <div style="
          background: white;
          border-radius: 15px;
          padding: 20px;
          border: 2px solid #22c55e;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        ">
          <h4 style="color: #1e293b; margin-bottom: 15px;">🛏️ เตียง ${i}</h4>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
            <div><strong>👤 ${bedData.patient_id}</strong></div>
            <div style="font-size: 14px; color: #64748b;">💊 ${bedData.medication || 'ไม่ระบุ'}</div>
            <div style="font-size: 14px; color: #64748b;">💧 ${bedData.volume || 'ไม่ระบุ'} mL</div>
            <div style="font-size: 14px; color: #64748b;">⚡ ${bedData.rate || 'ไม่ระบุ'} ดรอป/นาที</div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button onclick="window.location.href='chart.html?bed=${i}'" class="btn btn-primary" style="font-size: 12px; padding: 8px 12px;">
              👀 ดูรายละเอียด
            </button>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 10px;">
            บันทึก I/O: ${ioRecords.length} รายการ
          </div>
        </div>
      `;
    } else {
      html += `
        <div style="
          background: white;
          border-radius: 15px;
          padding: 20px;
          border: 2px dashed #cbd5e1;
          text-align: center;
          color: #64748b;
        ">
          <h4 style="margin-bottom: 15px;">🛏️ เตียง ${i}</h4>
          <div style="font-size: 48px; margin-bottom: 10px; opacity: 0.5;">➕</div>
          <div>เตียงว่าง</div>
          <div style="font-size: 12px; margin-top: 10px;">พร้อมรับผู้ป่วยใหม่</div>
        </div>
      `;
    }
  }

  html += '</div>';
  content.innerHTML = html;
}

function calculateIOBalance() {
  const inputOral = parseFloat(document.getElementById('inputOral').value) || 0;
  const inputIV = parseFloat(document.getElementById('inputIV').value) || 0;
  const inputTube = parseFloat(document.getElementById('inputTube').value) || 0;
  const inputOther = parseFloat(document.getElementById('inputOther').value) || 0;

  const outputUrine = parseFloat(document.getElementById('outputUrine').value) || 0;
  const outputVomit = parseFloat(document.getElementById('outputVomit').value) || 0;
  const outputDrain = parseFloat(document.getElementById('outputDrain').value) || 0;
  const outputStool = parseFloat(document.getElementById('outputStool').value) || 0;
  const outputOther = parseFloat(document.getElementById('outputOther').value) || 0;

  const totalInput = inputOral + inputIV + inputTube + inputOther;
  const totalOutput = outputUrine + outputVomit + outputDrain + outputStool + outputOther;
  const balance = totalInput - totalOutput;

  document.getElementById('totalInput').textContent = `${totalInput} ml`;
  document.getElementById('totalOutput').textContent = `${totalOutput} ml`;

  const balanceElement = document.getElementById('ioBalance');
  const statusElement = document.getElementById('balanceStatus');

  balanceElement.textContent = `${balance > 0 ? '+' : ''}${balance} ml`;

  // เปลี่ยนสีตามผลลัพธ์
  balanceElement.className = 'balance-value';
  if (Math.abs(balance) <= 200) {
    balanceElement.classList.add('neutral');
    statusElement.textContent = 'สมดุล';
  } else if (balance > 200) {
    balanceElement.classList.add('positive');
    statusElement.textContent = 'น้ำเข้ามากกว่า';
  } else {
    balanceElement.classList.add('negative');
    statusElement.textContent = 'น้ำออกมากกว่า';
  }
}

function clearIOForm() {
  const inputs = ['inputOral', 'inputIV', 'inputTube', 'inputOther', 
                 'outputUrine', 'outputVomit', 'outputDrain', 'outputStool', 'outputOther'];
  inputs.forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('ioNote').value = '';
  calculateIOBalance();
}

function saveIO() {
  const bedId = document.getElementById('ioBedSelect').value;

  if (!bedId) {
    modalManager.showToast({
      message: 'กรุณาเลือกเตียง',
      type: 'error'
    });
    return;
  }

  const ioData = {
    inputOral: parseFloat(document.getElementById('inputOral').value) || 0,
    inputIV: parseFloat(document.getElementById('inputIV').value) || 0,
    inputTube: parseFloat(document.getElementById('inputTube').value) || 0,
    inputOther: parseFloat(document.getElementById('inputOther').value) || 0,
    outputUrine: parseFloat(document.getElementById('outputUrine').value) || 0,
    outputVomit: parseFloat(document.getElementById('outputVomit').value) || 0,
    outputDrain: parseFloat(document.getElementById('outputDrain').value) || 0,
    outputStool: parseFloat(document.getElementById('outputStool').value) || 0,
    outputOther: parseFloat(document.getElementById('outputOther').value) || 0,
    note: document.getElementById('ioNote').value
  };

  ioData.totalInput = ioData.inputOral + ioData.inputIV + ioData.inputTube + ioData.inputOther;
  ioData.totalOutput = ioData.outputUrine + ioData.outputVomit + ioData.outputDrain + ioData.outputStool + ioData.outputOther;
  ioData.balance = ioData.totalInput - ioData.totalOutput;

  // ตรวจสอบว่ามีข้อมูลอย่างน้อย 1 รายการ
  if (ioData.totalInput === 0 && ioData.totalOutput === 0) {
    modalManager.showToast({
      message: 'กรุณากรอกข้อมูล Input หรือ Output อย่างน้อย 1 รายการ',
      type: 'error'
    });
    return;
  }

  try {
    dataManager.saveIORecord(bedId, ioData);
    modalManager.showToast({
      message: '✅ บันทึก I/O เรียบร้อยแล้ว',
      type: 'success'
    });
    closeModal('ioModal');
    clearIOForm();
  } catch (error) {
    modalManager.showToast({
      message: 'เกิดข้อผิดพลาดในการบันทึก',
      type: 'error'
    });
  }
}

function savePatient() {
  const bedId = document.getElementById('bedSelect').value;
  const patientId = document.getElementById('patientId').value.trim();
  const patientName = document.getElementById('patientName').value.trim();
  const medication = document.getElementById('medication').value;
  const volume = document.getElementById('volume').value;
  const rate = document.getElementById('rate').value;

  if (!bedId || !patientId || !medication || !volume || !rate) {
    modalManager.showToast({
      message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      type: 'error'
    });
    return;
  }

  const patientData = {
    patient_id: patientId,
    name: patientName,
    medication: medication,
    volume: volume,
    rate: parseFloat(rate)
  };

  try {
    dataManager.savePatient(bedId, patientData);
    modalManager.showToast({
      message: '✅ บันทึกข้อมูลผู้ป่วยเรียบร้อยแล้ว',
      type: 'success'
    });
    closeModal('patientModal');

    // ล้างฟอร์ม
    document.getElementById('bedSelect').value = '';
    document.getElementById('patientId').value = '';
    document.getElementById('patientName').value = '';
    document.getElementById('medication').value = '';
    document.getElementById('volume').value = '';
    document.getElementById('rate').value = '';

    setupBedSelectors(); // อัพเดท bed selectors
  } catch (error) {
    modalManager.showToast({
      message: 'เกิดข้อผิดพลาดในการบันทึก',
      type: 'error'
    });
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function logout() {
  if (confirm('ต้องการออกจากระบบ?')) {
    sessionStorage.removeItem('currentUser');
    showToast('ออกจากระบบเรียบร้อย', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

// ===============================
// New I/O Modal Functions
// ===============================

let selectedBedId = null;

function showNewIOModal() {
  const modal = document.getElementById('ioModalNew');
  modal.classList.add('show');
  generateBedCards();
  setupIOEventListeners();
  document.body.style.overflow = 'hidden';
}

function closeIOModal() {
  const modal = document.getElementById('ioModalNew');
  modal.classList.remove('show');
  resetIOForm();
  document.body.style.overflow = 'auto';
}

function generateBedCards() {
  const bedGrid = document.getElementById('ioBedGrid');
  bedGrid.innerHTML = '';

  for (let i = 1; i <= MAX_BEDS; i++) {
    const patientData = dataManager.getPatient(i);
    const bedCard = document.createElement('div');
    bedCard.className = `io-bed-card ${patientData ? 'occupied' : ''}`;
    bedCard.dataset.bedId = i;

    bedCard.innerHTML = `
      <div class="io-bed-number">เตียง ${i}</div>
      <div class="io-bed-status">${patientData ? 'มีผู้ป่วย' : 'ว่าง'}</div>
      ${patientData ? `<div class="io-bed-patient">${patientData.patient_id}</div>` : ''}
    `;

    bedCard.addEventListener('click', () => selectBed(i));
    bedGrid.appendChild(bedCard);
  }
}

function selectBed(bedId) {
  // Remove previous selection
  document.querySelectorAll('.io-bed-card').forEach(card => {
    card.classList.remove('selected');
  });

  // Select new bed
  const selectedCard = document.querySelector(`[data-bed-id="${bedId}"]`);
  selectedCard.classList.add('selected');
  selectedBedId = bedId;

  // Show patient info
  const patientData = dataManager.getPatient(bedId);
  const patientInfo = document.getElementById('ioPatientInfo');
  const form = document.getElementById('ioForm');

  if (patientData) {
    document.getElementById('ioPatientName').textContent = patientData.name || 'ไม่ระบุชื่อ';
    document.getElementById('ioPatientId').textContent = patientData.patient_id || '';
    patientInfo.style.display = 'block';
    form.style.display = 'block';
  } else {
    patientInfo.style.display = 'none';
    form.style.display = 'none';
    showToast('เตียงนี้ไม่มีผู้ป่วย', 'warning');
  }
}

function setupIOEventListeners() {
  const inputs = document.querySelectorAll('#ioForm input[type="number"]');
  inputs.forEach(input => {
    input.addEventListener('input', calculateIOTotals);
  });

  const form = document.getElementById('ioForm');
  form.addEventListener('submit', handleIOSubmit);
}

function calculateIOTotals() {
  // Calculate INPUT total
  const inputOral = parseFloat(document.getElementById('inputOral').value) || 0;
  const inputIV = parseFloat(document.getElementById('inputIV').value) || 0;
  const inputTube = parseFloat(document.getElementById('inputTube').value) || 0;
  const inputOther = parseFloat(document.getElementById('inputOther').value) || 0;
  const totalInput = inputOral + inputIV + inputTube + inputOther;

  // Calculate OUTPUT total
  const outputUrine = parseFloat(document.getElementById('outputUrine').value) || 0;
  const outputVomit = parseFloat(document.getElementById('outputVomit').value) || 0;
  const outputDrain = parseFloat(document.getElementById('outputDrain').value) || 0;
  const outputStool = parseFloat(document.getElementById('outputStool').value) || 0;
  const outputOther = parseFloat(document.getElementById('outputOther').value) || 0;
  const totalOutput = outputUrine + outputVomit + outputDrain + outputStool + outputOther;

  // Calculate balance
  const balance = totalInput - totalOutput;

  // Update display
  document.getElementById('inputTotal').textContent = `${totalInput.toLocaleString()} ml`;
  document.getElementById('outputTotal').textContent = `${totalOutput.toLocaleString()} ml`;
  document.getElementById('balanceValue').textContent = `${balance > 0 ? '+' : ''}${balance.toLocaleString()} ml`;

  // Update balance status and color
  const balanceCard = document.getElementById('balanceCard');
  const balanceStatus = document.getElementById('balanceStatus');

  balanceCard.className = 'balance-card';
  balanceStatus.className = 'balance-status';

  if (Math.abs(balance) <= 200) {
    balanceCard.classList.add('balanced');
    balanceStatus.classList.add('balanced');
    balanceStatus.textContent = 'สมดุลดี';
  } else if (balance > 200) {
    balanceCard.classList.add('positive');
    balanceStatus.classList.add('positive');
    balanceStatus.textContent = 'น้ำเข้ามากกว่า';
  } else {
    balanceCard.classList.add('negative');
    balanceStatus.classList.add('negative');
    balanceStatus.textContent = 'น้ำออกมากกว่า';
  }
}

function handleIOSubmit(e) {
  e.preventDefault();

  if (!selectedBedId) {
    showToast('กรุณาเลือกเตียงก่อน', 'error');
    return;
  }

  const ioData = {
    inputOral: parseFloat(document.getElementById('inputOral').value) || 0,
    inputIV: parseFloat(document.getElementById('inputIV').value) || 0,
    inputTube: parseFloat(document.getElementById('inputTube').value) || 0,
    inputOther: parseFloat(document.getElementById('inputOther').value) || 0,
    outputUrine: parseFloat(document.getElementById('outputUrine').value) || 0,
    outputVomit: parseFloat(document.getElementById('outputVomit').value) || 0,
    outputDrain: parseFloat(document.getElementById('outputDrain').value) || 0,
    outputStool: parseFloat(document.getElementById('outputStool').value) || 0,
    outputOther: parseFloat(document.getElementById('outputOther').value) || 0,
    note: document.getElementById('ioNoteNew').value.trim()
  };

  ioData.totalInput = ioData.inputOral + ioData.inputIV + ioData.inputTube + ioData.inputOther;
  ioData.totalOutput = ioData.outputUrine + ioData.outputVomit + ioData.outputDrain + ioData.outputStool + ioData.outputOther;
  ioData.balance = ioData.totalInput - ioData.totalOutput;

  // Validate at least one input
  if (ioData.totalInput === 0 && ioData.totalOutput === 0) {
    showToast('กรุณากรอกข้อมูล Input หรือ Output อย่างน้อย 1 รายการ', 'error');
    return;
  }

  try {
    // Save using dataManager with fallback
    if (typeof dataManager !== 'undefined') {
      dataManager.saveIORecord(selectedBedId, ioData);
    } else {
      // Fallback method
      const records = JSON.parse(localStorage.getItem(`io_records_bed_${selectedBedId}`) || '[]');
      const record = {
        id: Date.now().toString(),
        bedId: parseInt(selectedBedId),
        ...ioData,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleString('th-TH'),
        recordedBy: currentUser?.fullname || 'ไม่ทราบ'
      };
      records.unshift(record);
      localStorage.setItem(`io_records_bed_${selectedBedId}`, JSON.stringify(records));
    }

    showToast('✅ บันทึก I/O เรียบร้อยแล้ว', 'success');
    closeIOModal();

  } catch (error) {
    console.error('Error saving I/O:', error);
    showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
  }
}

function resetIOForm() {
  selectedBedId = null;
  document.getElementById('ioForm').reset();
  document.getElementById('ioPatientInfo').style.display = 'none';
  document.getElementById('ioForm').style.display = 'none';
  calculateIOTotals();
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#0ea5e9'};
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    font-weight: 600;
    z-index: 10001;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    min-width: 300px;
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
  `;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 18px;">${icons[type] || icons.info}</span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);

  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
