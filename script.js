
// ฟังก์ชันสำหรับคำนวณน้ำเกลือ
class IVCalculator {

  // 1. การแปลงจาก drop/min เป็น cc/hr
  static dropPerMinToCcPerHr(dropPerMin, dropFactor) {
    if (!dropPerMin || !dropFactor) return 0;
    return (dropPerMin * 60) / dropFactor;
  }

  // 2. การแปลงจาก cc/hr เป็น drop/min  
  static ccPerHrToDropPerMin(ccPerHr, dropFactor) {
    if (!ccPerHr || !dropFactor) return 0;
    return (ccPerHr * dropFactor) / 60;
  }

  // 3. คำนวณเวลาที่น้ำเกลือจะหมด (ชั่วโมง)
  static calculateTimeToFinish(totalVolume, ccPerHr) {
    if (!totalVolume || !ccPerHr) return 0;
    return totalVolume / ccPerHr;
  }

  // 4. สูตรลัดสำหรับการคำนวณ drop/min
  static quickDropCalculation(ccPerHr, dropFactor) {
    if (dropFactor === 20) {
      return Math.round(ccPerHr / 3);
    } else if (dropFactor === 15) {
      return Math.round(ccPerHr / 4);
    } else if (dropFactor === 60) {
      // Micro set: ccPerHr = dropPerMin
      return Math.round(ccPerHr);
    } else {
      return this.ccPerHrToDropPerMin(ccPerHr, dropFactor);
    }
  }

  // 5. ฟังก์ชันแปลงเวลาจากชั่วโมงเป็นชั่วโมง:นาที
  static formatTime(hours) {
    if (!hours) return "0 ชั่วโมง 0 นาที";
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours} ชั่วโมง ${minutes} นาที`;
  }

  // 6. ฟังก์ชันคำนวณครบชุด
  static calculateComplete(params) {
    const {
      dropPerMin,
      ccPerHr, 
      totalVolume,
      dropFactor = 20
    } = params;

    const result = {
      dropFactor: dropFactor,
      originalDropPerMin: dropPerMin || 0,
      originalCcPerHr: ccPerHr || 0,
      totalVolume: totalVolume || 0
    };

    // คำนวณค่าที่ขาดหายไป
    if (dropPerMin && !ccPerHr) {
      result.calculatedCcPerHr = this.dropPerMinToCcPerHr(dropPerMin, dropFactor);
    } else if (ccPerHr && !dropPerMin) {
      result.calculatedDropPerMin = this.ccPerHrToDropPerMin(ccPerHr, dropFactor);
      result.quickDropPerMin = this.quickDropCalculation(ccPerHr, dropFactor);
    }

    // คำนวณเวลาที่น้ำเกลือจะหมด
    const finalCcPerHr = result.calculatedCcPerHr || result.originalCcPerHr;
    if (totalVolume && finalCcPerHr) {
      result.timeToFinishHours = this.calculateTimeToFinish(totalVolume, finalCcPerHr);
      result.timeToFinishFormatted = this.formatTime(result.timeToFinishHours);
    }

    return result;
  }

  // 7. ฟังก์ชันตรวจสอบอัตราการไหลปกติ
  static checkFlowRate(ccPerHr, patientWeight, fluidType = 'normal') {
    if (!ccPerHr || !patientWeight) return null;

    const mlPerKgPerHr = ccPerHr / patientWeight;

    let recommendation = '';
    if (fluidType === 'maintenance') {
      // สูตรการให้น้ำเบื้องต้น
      if (mlPerKgPerHr < 1) recommendation = 'อัตราต่ำ - ควรตรวจสอบ';
      else if (mlPerKgPerHr > 4) recommendation = 'อัตราสูง - ควรระวัง';
      else recommendation = 'อัตราปกติ';
    } else {
      if (mlPerKgPerHr > 10) recommendation = 'อัตราสูงมาก - ควรระวัง';
      else if (mlPerKgPerHr > 5) recommendation = 'อัตราค่อนข้างสูง';
      else recommendation = 'อัตราปกติ';
    }

    return {
      mlPerKgPerHr: mlPerKgPerHr.toFixed(2),
      recommendation: recommendation
    };
  }
}

// ฟังก์ชันสำหรับสร้าง UI คำนวณน้ำเกลือ
function createIVCalculatorUI() {
  return `
    <div class="iv-calculator">
      <h3>🩺 เครื่องคำนวณน้ำเกลือ</h3>

      <div class="calc-section">
        <h4>ข้อมูลเริ่มต้น</h4>
        <div class="input-group">
          <label>ปริมาตรน้ำเกลือทั้งหมด (cc/ml):</label>
          <input type="number" id="totalVolume" placeholder="เช่น 1000">
        </div>

        <div class="input-group">
          <label>Drop Factor (หยด/cc):</label>
          <select id="dropFactor">
            <option value="15">15 หยด/cc</option>
            <option value="20" selected>20 หยด/cc</option>
            <option value="10">10 หยด/cc (เด็ก)</option>
          </select>
        </div>

        <div class="input-group">
          <label>น้ำหนักผู้ป่วย (kg) - ไม่บังคับ:</label>
          <input type="number" id="patientWeight" placeholder="เช่น 70">
        </div>
      </div>

      <div class="calc-section">
        <h4>กรอกข้อมูลอย่างใดอย่างหนึ่ง</h4>
        <div class="input-group">
          <label>อัตราการหยด (หยด/นาที):</label>
          <input type="number" id="dropPerMin" placeholder="เช่น 30">
        </div>

        <div class="or-divider">หรือ</div>

        <div class="input-group">
          <label>อัตราการไหล (cc/hr):</label>
          <input type="number" id="ccPerHr" placeholder="เช่น 100">
        </div>
      </div>

      <button onclick="calculateIV()" class="calc-button">คำนวณ</button>

      <div id="ivResults" class="results-section" style="display: none;">
        <h4>ผลลัพธ์</h4>
        <div id="resultsContent"></div>
      </div>
    </div>
  `;
}

// ฟังก์ชันคำนวณและแสดงผล
function calculateIV() {
  const totalVolume = parseFloat(document.getElementById('totalVolume').value) || 0;
  const dropFactor = parseInt(document.getElementById('dropFactor').value) || 20;
  const patientWeight = parseFloat(document.getElementById('patientWeight').value) || 0;
  const dropPerMin = parseFloat(document.getElementById('dropPerMin').value) || 0;
  const ccPerHr = parseFloat(document.getElementById('ccPerHr').value) || 0;

  if (!dropPerMin && !ccPerHr) {
    alert('กรุณากรอกอัตราการหยด หรือ อัตราการไหล');
    return;
  }

  const result = IVCalculator.calculateComplete({
    dropPerMin,
    ccPerHr,
    totalVolume,
    dropFactor
  });

  let resultsHTML = `
    <div class="result-item">
      <strong>Drop Factor:</strong> ${result.dropFactor} หยด/cc
    </div>
  `;

  if (result.calculatedCcPerHr) {
    resultsHTML += `
      <div class="result-item">
        <strong>อัตราการไหล:</strong> ${result.calculatedCcPerHr.toFixed(1)} cc/hr
      </div>
    `;
  }

  if (result.calculatedDropPerMin) {
    resultsHTML += `
      <div class="result-item">
        <strong>อัตราการหยด:</strong> ${result.calculatedDropPerMin.toFixed(1)} หยด/นาที
      </div>
    `;
  }

  if (result.quickDropPerMin) {
    resultsHTML += `
      <div class="result-item">
        <strong>สูตรลัด:</strong> ${result.quickDropPerMin} หยด/นาที
      </div>
    `;
  }

  if (result.timeToFinishFormatted) {
    resultsHTML += `
      <div class="result-item highlight">
        <strong>เวลาที่น้ำเกลือจะหมด:</strong> ${result.timeToFinishFormatted}
      </div>
    `;
  }

  // ตรวจสอบอัตราการไหลถ้ามีน้ำหนัก
  if (patientWeight > 0) {
    const finalCcPerHr = result.calculatedCcPerHr || result.originalCcPerHr;
    const flowCheck = IVCalculator.checkFlowRate(finalCcPerHr, patientWeight);
    if (flowCheck) {
      resultsHTML += `
        <div class="result-item">
          <strong>อัตราต่อน้ำหนัก:</strong> ${flowCheck.mlPerKgPerHr} ml/kg/hr
        </div>
        <div class="result-item ${flowCheck.recommendation.includes('ควรระวัง') ? 'warning' : ''}">
          <strong>คำแนะนำ:</strong> ${flowCheck.recommendation}
        </div>
      `;
    }
  }

  document.getElementById('resultsContent').innerHTML = resultsHTML;
  document.getElementById('ivResults').style.display = 'block';
}

// ฟังก์ชันล้างข้อมูล
function clearIVCalculator() {
  document.getElementById('totalVolume').value = '';
  document.getElementById('dropPerMin').value = '';
  document.getElementById('ccPerHr').value = '';
  document.getElementById('patientWeight').value = '';
  document.getElementById('ivResults').style.display = 'none';
}

// CSS สำหรับ IV Calculator
const ivCalculatorCSS = `
  .iv-calculator {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    margin: 20px 0;
  }

  .calc-section {
    margin-bottom: 20px;
    padding: 15px;
    background: white;
    border-radius: 8px;
    border-left: 4px solid #4caf50;
  }

  .input-group {
    margin-bottom: 15px;
  }

  .input-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
  }

  .input-group input, .input-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
  }

  .or-divider {
    text-align: center;
    margin: 10px 0;
    color: #666;
    font-style: italic;
  }

  .calc-button {
    background: #4caf50;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin-right: 10px;
  }

  .calc-button:hover {
    background: #45a049;
  }

  .results-section {
    margin-top: 20px;
    padding: 15px;
    background: #e8f5e8;
    border-radius: 8px;
  }

  .result-item {
    margin-bottom: 10px;
    padding: 8px;
    background: white;
    border-radius: 5px;
  }

  .result-item.highlight {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
  }

  .result-item.warning {
    background: #f8d7da;
    border-left: 4px solid #dc3545;
  }
`;

// เพิ่ม CSS ลงใน head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = ivCalculatorCSS;
  document.head.appendChild(style);
}

// Export สำหรับใช้งาน
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IVCalculator };
}
