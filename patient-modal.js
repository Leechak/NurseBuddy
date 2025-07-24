// Global patient modal for dashboard and chart pages
(function(){
  if (typeof document === 'undefined') return;

  // create modal HTML if not present
  if (!document.getElementById('globalPatientModal')) {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="modal" id="globalPatientModal">
        <div class="modal-content">
          <div class="modal-title">👤 ข้อมูลผู้ป่วย</div>
          <div class="input-group">
            <label>เตียงที่:</label>
            <select id="globalBedSelect"></select>
          </div>
          <div class="input-group">
            <label>รหัสผู้ป่วย:</label>
            <input type="text" id="globalPatientId" placeholder="P001234">
          </div>
          <div class="input-group">
            <label>ยา/สารน้ำ:</label>
            <select id="globalMedication">
              <option value="Normal Saline">Normal Saline (0.9% NSS)</option>
              <option value="Dextrose 5%">Dextrose 5% in Water</option>
              <option value="Lactated Ringer's">Lactated Ringer's Solution</option>
              <option value="Dextrose 5% in NSS">D5NSS</option>
              <option value="Half Normal Saline">0.45% NSS</option>
            </select>
          </div>
          <div class="input-row">
            <div class="input-group">
              <label>ปริมาณ (mL):</label>
              <input type="number" id="globalVolume" placeholder="500">
            </div>
            <div class="input-group">
              <label>อัตรา (ดรอป/นาที):</label>
              <input type="number" id="globalRate" placeholder="20">
            </div>
          </div>
          <button class="btn btn-primary" id="globalPatientSave">💾 บันทึก</button>
          <button class="btn btn-secondary" id="globalPatientCancel">ยกเลิก</button>
        </div>
      </div>`;
    document.body.appendChild(div.firstElementChild);
  }

  const modal = document.getElementById('globalPatientModal');
  const bedSelect = modal.querySelector('#globalBedSelect');
  const patientIdInput = modal.querySelector('#globalPatientId');
  const medSelect = modal.querySelector('#globalMedication');
  const volumeInput = modal.querySelector('#globalVolume');
  const rateInput = modal.querySelector('#globalRate');

  // populate bed list
  function populateBeds() {
    if (!bedSelect.options.length) {
      for (let i = 1; i <= 8; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `เตียง ${i}`;
        bedSelect.appendChild(opt);
      }
    }
  }

  // show modal, optionally lock bed
  window.openPatientModal = function(bedId) {
    populateBeds();
    if (bedId) {
      bedSelect.value = bedId;
      bedSelect.disabled = true;
    } else {
      bedSelect.disabled = false;
      bedSelect.value = '';
    }

    const data = dataManager.getPatient(bedId);
    if (data) {
      patientIdInput.value = data.patient_id || '';
      medSelect.value = data.medication || 'Normal Saline';
      volumeInput.value = parseInt(data.volume) || '';
      rateInput.value = data.rate || '';
    } else {
      patientIdInput.value = '';
      medSelect.selectedIndex = 0;
      volumeInput.value = '';
      rateInput.value = '';
    }

    modal.style.display = 'flex';
  };

  function closeModal() {
    modal.style.display = 'none';
  }

  modal.querySelector('#globalPatientCancel').addEventListener('click', closeModal);

  modal.querySelector('#globalPatientSave').addEventListener('click', function(){
    const bedId = bedSelect.value;
    const patientId = patientIdInput.value.trim();
    const medication = medSelect.value;
    const volume = volumeInput.value;
    const rate = rateInput.value;

    if (!bedId || !patientId || !volume || !rate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const data = {
      patient_id: patientId,
      medication: medication,
      volume: volume + 'mL',
      rate: parseInt(rate)
    };

    const saved = dataManager.savePatient(bedId, data);
    window.dispatchEvent(new CustomEvent('patientSaved', {detail:{bedId:bedId,patient:saved}}));
    closeModal();
    alert('✅ บันทึกข้อมูลผู้ป่วยเรียบร้อย');
  });
})();
