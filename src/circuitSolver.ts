export interface BananaWire {
  id: string;
  from: string;
  to: string;
  color: 'red' | 'blue';
}

export type CircuitFaultType =
  | 'NONE'
  | 'OPEN_CIRCUIT'
  | 'MISSING_BATTERY_BRIDGE'
  | 'WRONG_BATTERY_POLARITY'
  | 'SWITCH_OPEN'
  | 'MISSING_SWITCH_FOR_RHEOSTAT'
  | 'INVALID_RHEOSTAT_WIRING'
  | 'INVALID_CIRCUIT_TOPOLOGY'
  | 'NO_BATTERY'
  | 'VOLTMETER_IN_SERIES'
  | 'SHORT_CIRCUIT'
  | 'REVERSE_POLARITY'
  | 'WRONG_METER_TERMINALS'
  | 'OVER_RANGE';

export interface CircuitSolverInput {
  wires: BananaWire[];
  switchClosed: boolean;
  rheostatOhm: number; // 0..20 Ohm (sliderRatio * 20)
  battery1Inserted: boolean; // Có pin trong Ngăn 1 của Giá đỡ 2 pin (SLOT_1)
  battery2Inserted: boolean; // Có pin trong Ngăn 2 của Giá đỡ 2 pin (SLOT_2)
  singleBattery1Inserted?: boolean; // Có pin trong Giá đỡ 1 pin #1 (SINGLE_SLOT_1)
  singleBattery2Inserted?: boolean; // Có pin trong Giá đỡ 1 pin #2 (SINGLE_SLOT_2)
}

export interface CircuitSolution {
  isClosedLoop: boolean;
  batteryCount: number;
  emfV: number;
  rInternalOhm: number;
  rRheostatActiveOhm: number;
  rBulbOhm: number;
  rTotalOhm: number;
  mainCurrentA: number;
  ammeterCurrentA: number;
  ammeterReadingA: number;
  ammeterScaleMax: 0.6 | 3.0;
  ammeterReverse: boolean;
  ammeterOverRange: boolean;
  voltmeterReadingV: number;
  voltmeterScaleMax: 6.0 | 12.0;
  voltmeterReverse: boolean;
  voltmeterOverRange: boolean;
  bulbVoltageV: number;
  bulbCurrentA: number;
  bulbPowerW: number;
  bulbBrightness: number; // 0..1.5
  shortCircuit: boolean;
  voltmeterInSeries: boolean;
  wrongMeterTerminals: boolean;
  missingBatteryBridge: boolean;
  faultType: CircuitFaultType;
  statusLevel: 'ok' | 'warn' | 'error' | 'idle';
  statusMessage: string;
  diagnostics: string[];
}

export const TERMINAL_META: Record<
  string,
  { label: string; device: string; color: 'red' | 'black' | 'green' | 'blue' }
> = {
  // Giá đỡ 2 pin (Battery Holder) - 2 ngăn độc lập (SLOT_1, SLOT_2)
  BAT1_POS: { label: 'BAT1_POS (+ Pin 1 Đỏ Trái)', device: 'Giá đỡ 2 pin', color: 'red' },
  BAT1_NEG: { label: 'BAT1_NEG (- Pin 1 Đen Phải)', device: 'Giá đỡ 2 pin', color: 'black' },
  BAT2_NEG: { label: 'BAT2_NEG (- Pin 2 Đen Trái)', device: 'Giá đỡ 2 pin', color: 'black' },
  BAT2_POS: { label: 'BAT2_POS (+ Pin 2 Đỏ Phải)', device: 'Giá đỡ 2 pin', color: 'red' },

  // Giá đỡ 1 pin #1 (Single Battery Holder #1)
  SBAT1_POS: { label: 'SBAT1_POS (+ Giá đỡ 1 pin #1 Đỏ)', device: 'Giá đỡ 1 pin #1', color: 'red' },
  SBAT1_NEG: { label: 'SBAT1_NEG (- Giá đỡ 1 pin #1 Đen)', device: 'Giá đỡ 1 pin #1', color: 'black' },

  // Giá đỡ 1 pin #2 (Single Battery Holder #2)
  SBAT2_POS: { label: 'SBAT2_POS (+ Giá đỡ 1 pin #2 Đỏ)', device: 'Giá đỡ 1 pin #2', color: 'red' },
  SBAT2_NEG: { label: 'SBAT2_NEG (- Giá đỡ 1 pin #2 Đen)', device: 'Giá đỡ 1 pin #2', color: 'black' },

  // Cầu dao K / Công tắc (Switch)
  SW_RED: { label: 'SW_RED (Cọc Đỏ Công tắc K)', device: 'Cầu dao K', color: 'red' },
  SW_GREEN: { label: 'SW_GREEN (Cọc Xanh Công tắc K)', device: 'Cầu dao K', color: 'green' },

  // Bóng đèn sợi đốt / dây tóc (Bulb) - Chốt A & Chốt B không phân biệt cực
  BULB_NEG: { label: 'BULB_NEG (Chốt B - Đen Trái Bóng đèn)', device: 'Bóng đèn', color: 'black' },
  BULB_POS: { label: 'BULB_POS (Chốt A - Đỏ Phải Bóng đèn)', device: 'Bóng đèn', color: 'red' },

  // Biến trở con chạy 20Ω (Rheostat) - 2 chốt dưới (cuộn dây) & 2 chốt trên (thanh kim loại)
  RHEO_IN: { label: 'RHEO_IN (Chốt dưới trái - Đầu cuộn dây)', device: 'Biến trở 20Ω', color: 'red' },
  RHEO_COIL_END: { label: 'RHEO_COIL_END (Chốt dưới phải - Cuối cuộn dây)', device: 'Biến trở 20Ω', color: 'blue' },
  RHEO_RAIL_L: { label: 'RHEO_RAIL_L (Chốt trên trái - Thanh kim loại)', device: 'Biến trở 20Ω', color: 'green' },
  RHEO_WIPER: { label: 'RHEO_WIPER (Chốt trên phải - Thanh kim loại)', device: 'Biến trở 20Ω', color: 'green' },

  // Ampe kế DC (Ammeter - R_A = 0.05Ω)
  AM_NEG: { label: 'AM_NEG (- Âm chung Ampe kế)', device: 'Ampe kế DC', color: 'black' },
  AM_06A: { label: 'AM_06A (+ Thang 0.6A Ampe kế)', device: 'Ampe kế DC', color: 'red' },
  AM_3A: { label: 'AM_3A (+ Thang 3A Ampe kế)', device: 'Ampe kế DC', color: 'red' },

  // Vôn kế DC (Voltmeter - R_V = 10000Ω)
  VM_NEG: { label: 'VM_NEG (- Âm chung Vôn kế)', device: 'Vôn kế DC', color: 'black' },
  VM_6V: { label: 'VM_6V (+ Thang 6V Vôn kế)', device: 'Vôn kế DC', color: 'red' },
  VM_12V: { label: 'VM_12V (+ Thang 12V Vôn kế)', device: 'Vôn kế DC', color: 'red' },
};

// Bản mẫu mạch điện nối tiếp chuẩn (PHẦN B - Trường hợp 3: 2 pin nối tiếp + Công tắc + Biến trở Kiểu 1 + Đèn)
export const DEFAULT_SERIES_WIRES: BananaWire[] = [
  { id: 'w1', from: 'BAT1_NEG', to: 'BAT2_POS', color: 'blue' },
  { id: 'w2', from: 'BAT1_POS', to: 'SW_RED', color: 'red' },
  { id: 'w3', from: 'SW_GREEN', to: 'RHEO_IN', color: 'red' },
  { id: 'w4', from: 'RHEO_WIPER', to: 'AM_06A', color: 'red' },
  { id: 'w5', from: 'AM_NEG', to: 'BULB_POS', color: 'blue' },
  { id: 'w6', from: 'BULB_NEG', to: 'BAT2_NEG', color: 'blue' },
  { id: 'w7', from: 'BULB_POS', to: 'VM_6V', color: 'red' },
  { id: 'w8', from: 'BULB_NEG', to: 'VM_NEG', color: 'blue' },
];

class DisjointSet {
  parent: Record<string, string> = {};
  constructor(items: string[]) {
    for (const item of items) this.parent[item] = item;
  }
  find(x: string): string {
    if (this.parent[x] === undefined) this.parent[x] = x;
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent[rb] = ra;
  }
}

interface BatterySlotState {
  slotId: string;
  label: string;
  posTerm: string;
  negTerm: string;
  inserted: boolean;
  touched: boolean;
  active: boolean;
}

export function solveElectricalCircuit(input: CircuitSolverInput): CircuitSolution {
  const allTerminals = Object.keys(TERMINAL_META);
  const R_BULB = 4.8; // Điện trở bóng đèn sợi đốt (dây tóc)
  const R_AMMETER = 0.05; // Điện trở Ampe kế DC
  const R_CELL_INTERNAL = 0.12; // Điện trở trong mỗi viên pin 1.5V

  const wireDegree: Record<string, number> = {};
  for (const t of allTerminals) wireDegree[t] = 0;
  for (const w of input.wires) {
    if (wireDegree[w.from] !== undefined) wireDegree[w.from]++;
    if (wireDegree[w.to] !== undefined) wireDegree[w.to]++;
  }

  const dsu = new DisjointSet(allTerminals);
  for (const w of input.wires) {
    if (TERMINAL_META[w.from] && TERMINAL_META[w.to]) {
      dsu.union(w.from, w.to);
    }
  }

  // Kiểm tra lỗi cắm đồng hồ đo: cắm cả 2 dây vào 2 cọc dương (+) mà bỏ trống cọc âm (-)
  const ammeterBothRedNoNeg =
    wireDegree['AM_NEG'] === 0 && wireDegree['AM_06A'] > 0 && wireDegree['AM_3A'] > 0;
  const voltmeterBothRedNoNeg =
    wireDegree['VM_NEG'] === 0 && wireDegree['VM_6V'] > 0 && wireDegree['VM_12V'] > 0;
  const wrongMeterTerminals = ammeterBothRedNoNeg || voltmeterBothRedNoNeg;

  let ammeterScaleMax: 0.6 | 3.0 = 0.6;
  if (wireDegree['AM_3A'] > 0 && wireDegree['AM_06A'] === 0) {
    ammeterScaleMax = 3.0;
  }

  let voltmeterScaleMax: 6.0 | 12.0 = 6.0;
  if (wireDegree['VM_12V'] > 0 && wireDegree['VM_6V'] === 0) {
    voltmeterScaleMax = 12.0;
  }

  // Danh sách 4 khay lắp pin (2 ngăn của Giá đỡ 2 pin + 2 Giá đỡ 1 pin)
  const slotStates: BatterySlotState[] = [
    {
      slotId: 'SLOT_1',
      label: 'Pin 1 (Giá đỡ 2 pin - Ngăn 1)',
      posTerm: 'BAT1_POS',
      negTerm: 'BAT1_NEG',
      inserted: Boolean(input.battery1Inserted),
      touched: wireDegree['BAT1_POS'] > 0 || wireDegree['BAT1_NEG'] > 0,
      active:
        Boolean(input.battery1Inserted) &&
        wireDegree['BAT1_POS'] > 0 &&
        wireDegree['BAT1_NEG'] > 0,
    },
    {
      slotId: 'SLOT_2',
      label: 'Pin 2 (Giá đỡ 2 pin - Ngăn 2)',
      posTerm: 'BAT2_POS',
      negTerm: 'BAT2_NEG',
      inserted: Boolean(input.battery2Inserted),
      touched: wireDegree['BAT2_POS'] > 0 || wireDegree['BAT2_NEG'] > 0,
      active:
        Boolean(input.battery2Inserted) &&
        wireDegree['BAT2_POS'] > 0 &&
        wireDegree['BAT2_NEG'] > 0,
    },
    {
      slotId: 'SINGLE_SLOT_1',
      label: 'Giá đỡ 1 pin #1',
      posTerm: 'SBAT1_POS',
      negTerm: 'SBAT1_NEG',
      inserted: Boolean(input.singleBattery1Inserted),
      touched: wireDegree['SBAT1_POS'] > 0 || wireDegree['SBAT1_NEG'] > 0,
      active:
        Boolean(input.singleBattery1Inserted) &&
        wireDegree['SBAT1_POS'] > 0 &&
        wireDegree['SBAT1_NEG'] > 0,
    },
    {
      slotId: 'SINGLE_SLOT_2',
      label: 'Giá đỡ 1 pin #2',
      posTerm: 'SBAT2_POS',
      negTerm: 'SBAT2_NEG',
      inserted: Boolean(input.singleBattery2Inserted),
      touched: wireDegree['SBAT2_POS'] > 0 || wireDegree['SBAT2_NEG'] > 0,
      active:
        Boolean(input.singleBattery2Inserted) &&
        wireDegree['SBAT2_POS'] > 0 &&
        wireDegree['SBAT2_NEG'] > 0,
    },
  ];

  const totalInsertedBatteries = slotStates.filter((s) => s.inserted).length;
  const touchedSlots = slotStates.filter((s) => s.touched);
  const activeSlots = slotStates.filter((s) => s.active);

  // Điện trở con chạy hiện tại (0..20Ω)
  const sliderOhm = Math.max(0.0, Math.min(20.0, input.rheostatOhm));

  // Kiểm tra cách nối Biến trở con chạy (Kiểu 1, Kiểu 2, Kiểu 3)
  const rheoLowerLeft = wireDegree['RHEO_IN'] > 0;
  const rheoLowerRight = wireDegree['RHEO_COIL_END'] > 0;
  const rheoUpperLeft = wireDegree['RHEO_RAIL_L'] > 0;
  const rheoUpperRight = wireDegree['RHEO_WIPER'] > 0;
  const rheoTouched =
    rheoLowerLeft || rheoLowerRight || rheoUpperLeft || rheoUpperRight;

  // Якщо cả 2 chốt trên đều có dây, trên thực tế thanh kim loại nối liền RHEO_RAIL_L và RHEO_WIPER
  type RheostatMode =
    | 'NONE'
    | 'TYPE_1_STANDARD' // Kiểu 1: 1 dây chốt trên (thanh ray) + 1 dây chốt dưới (cuộn dây)
    | 'TYPE_2_FIXED_COIL' // Kiểu 2: 2 dây vào 2 chốt dưới (điện trở cố định 20Ω)
    | 'TYPE_3_TOP_RAIL_SHORT' // Kiểu 3: 2 dây vào 2 chốt trên (dây dẫn thường, R = 0Ω)
    | 'INVALID';

  let rheoMode: RheostatMode = 'NONE';
  let rRheostatActiveOhm = sliderOhm;
  let rheoTermA = '';
  let rheoTermB = '';
  let rheoModeLabel = '';

  const lowerCount = (rheoLowerLeft ? 1 : 0) + (rheoLowerRight ? 1 : 0);
  const upperCount = (rheoUpperLeft ? 1 : 0) + (rheoUpperRight ? 1 : 0);
  const totalRheoWires =
    wireDegree['RHEO_IN'] +
    wireDegree['RHEO_COIL_END'] +
    wireDegree['RHEO_RAIL_L'] +
    wireDegree['RHEO_WIPER'];

  if (rheoTouched) {
    if (lowerCount === 1 && upperCount === 1) {
      // Kiểu 1 (Mắc đúng chuẩn): 1 dây chốt trên + 1 dây chốt dưới
      rheoMode = 'TYPE_1_STANDARD';
      rheoTermA = rheoLowerLeft ? 'RHEO_IN' : 'RHEO_COIL_END';
      rheoTermB = rheoUpperLeft ? 'RHEO_RAIL_L' : 'RHEO_WIPER';
      rRheostatActiveOhm = rheoLowerLeft ? sliderOhm : 20.0 - sliderOhm;
      rheoModeLabel = `Biến trở Kiểu 1 (Chuẩn: R = ${rRheostatActiveOhm.toFixed(1)}Ω)`;
    } else if (lowerCount === 2 && upperCount === 0) {
      // Kiểu 2 (Cắm sai thành điện trở cố định): 2 dây vào 2 chốt dưới
      rheoMode = 'TYPE_2_FIXED_COIL';
      rheoTermA = 'RHEO_IN';
      rheoTermB = 'RHEO_COIL_END';
      rRheostatActiveOhm = 20.0;
      rheoModeLabel = 'Biến trở Kiểu 2 (2 chốt dưới - Điện trở cố định 20Ω, đèn sáng yếu)';
    } else if (
      lowerCount === 0 &&
      ((rheoUpperLeft && rheoUpperRight) || (upperCount === 1 && totalRheoWires >= 2))
    ) {
      // Kiểu 3 (Cắm sai thành dây dẫn thường): 2 dây vào 2 chốt trên (thanh kim loại)
      rheoMode = 'TYPE_3_TOP_RAIL_SHORT';
      rheoTermA = rheoUpperLeft ? 'RHEO_RAIL_L' : 'RHEO_WIPER';
      rheoTermB = rheoUpperRight ? 'RHEO_WIPER' : 'RHEO_RAIL_L';
      rRheostatActiveOhm = 0.0;
      rheoModeLabel = 'Biến trở Kiểu 3 (2 chốt trên thanh kim loại - R = 0Ω, đèn sáng rực nhất)';
    } else {
      rheoMode = 'INVALID';
    }
  }

  // Hàm trả về kết quả khi đèn KHÔNG THỂ SÁNG (không thuộc các trường hợp hợp lệ của Phần A & Phần B)
  const buildOffSolution = (
    faultType: CircuitFaultType,
    statusLevel: 'warn' | 'error' | 'idle',
    statusMessage: string,
    extra?: Partial<CircuitSolution>
  ): CircuitSolution => ({
    isClosedLoop: false,
    batteryCount: activeSlots.length,
    emfV: 0,
    rInternalOhm: 0,
    rRheostatActiveOhm: Math.round(rRheostatActiveOhm * 100) / 100,
    rBulbOhm: R_BULB,
    rTotalOhm: Infinity,
    mainCurrentA: 0,
    ammeterCurrentA: 0,
    ammeterReadingA: 0,
    ammeterScaleMax,
    ammeterReverse: false,
    ammeterOverRange: false,
    voltmeterReadingV: 0,
    voltmeterScaleMax,
    voltmeterReverse: false,
    voltmeterOverRange: false,
    bulbVoltageV: 0,
    bulbCurrentA: 0,
    bulbPowerW: 0,
    bulbBrightness: 0,
    shortCircuit: false,
    voltmeterInSeries: false,
    wrongMeterTerminals,
    missingBatteryBridge: faultType === 'MISSING_BATTERY_BRIDGE',
    faultType,
    statusLevel,
    statusMessage,
    diagnostics: [statusMessage],
    ...extra,
  });

  if (input.wires.length === 0) {
    return buildOffSolution(
      'OPEN_CIRCUIT',
      'idle',
      'Chọn Dây Đỏ hoặc Dây Xanh rồi click vào các cọc cắm để lắp mạch theo Phần A (1 Pin) hoặc Phần B (2 Pin).'
    );
  }

  if (wrongMeterTerminals) {
    return buildOffSolution(
      'WRONG_METER_TERMINALS',
      'error',
      'SAI: Đồng hồ đo phải cắm 1 cọc âm (-) và 1 cọc dương (+), đèn không sáng!'
    );
  }

  // Kiểm tra nếu có khay pin được cắm dây nhưng chưa lắp viên pin vào khay đó
  const touchedEmptySlot = touchedSlots.find((s) => !s.inserted);
  if (touchedEmptySlot) {
    return buildOffSolution(
      'NO_BATTERY',
      'warn',
      `Chưa lắp pin vào ${touchedEmptySlot.label}: Hãy kéo viên pin rà vào giá đỡ (hiện màu xanh) để lắp pin!`
    );
  }

  if (totalInsertedBatteries === 0 || activeSlots.length === 0) {
    return buildOffSolution(
      'NO_BATTERY',
      'warn',
      'Nguồn điện chưa kín: Hãy lắp pin vào giá đỡ và cắm đủ cả 2 cực Dương (+) và Âm (-) của nguồn pin.'
    );
  }

  // Nếu có khay pin chỉ mới cắm 1 đầu dây (chưa kín cả + và -)
  if (touchedSlots.length !== activeSlots.length) {
    return buildOffSolution(
      'OPEN_CIRCUIT',
      'warn',
      'Mạch hở ở nguồn pin: Mỗi viên pin tham gia vào mạch bắt buộc phải được nối dây ở cả cực Dương (+) và cực Âm (-).'
    );
  }

  // =========================================================================
  // XÁC ĐỊNH CẤU HÌNH NGUỒN ĐIỆN: PHẦN A (1 PIN) HOẶC PHẦN B (2 PIN NỐI TIẾP / SONG SONG)
  // =========================================================================
  let sourceTypeLabel = '';
  let sourcePosNode = '';
  let sourceNegNode = '';
  let totalEmfV = 0;
  let totalRInternal = 0;

  if (activeSlots.length === 1) {
    // PHẦN A: NGUỒN ĐIỆN 1 PIN
    const slot = activeSlots[0];
    const pNode = dsu.find(slot.posTerm);
    const nNode = dsu.find(slot.negTerm);
    if (pNode === nNode) {
      return buildOffSolution(
        'SHORT_CIRCUIT',
        'error',
        'NGUY HIỂM: Hai cực Dương (+) và Âm (-) của viên pin đang bị nối tắt (chập mạch), đèn không thể sáng!',
        { shortCircuit: true }
      );
    }
    sourceTypeLabel = 'PHẦN A (Nguồn 1 Pin 1.5V)';
    sourcePosNode = pNode;
    sourceNegNode = nNode;
    totalEmfV = 1.5;
    totalRInternal = R_CELL_INTERNAL;
  } else if (activeSlots.length === 2) {
    // PHẦN B: NGUỒN ĐIỆN 2 PIN (Cấu hình Nối tiếp hoặc Cấu hình Song song)
    const b1 = activeSlots[0];
    const b2 = activeSlots[1];

    const p1 = dsu.find(b1.posTerm);
    const n1 = dsu.find(b1.negTerm);
    const p2 = dsu.find(b2.posTerm);
    const n2 = dsu.find(b2.negTerm);

    if (p1 === n1 || p2 === n2) {
      return buildOffSolution(
        'SHORT_CIRCUIT',
        'error',
        'NGUY HIỂM: Cực Dương (+) và Âm (-) của pin đang bị nối tắt trực tiếp, đèn không thể sáng!',
        { shortCircuit: true }
      );
    }

    // Kiểm tra Cấu hình Song Song: Cực (+) pin 1 nối cực (+) pin 2 VÀ Cực (-) pin 1 nối cực (-) pin 2
    const isParallel = p1 === p2 && n1 === n2 && p1 !== n1;

    // Kiểm tra Cấu hình Nối Tiếp:
    // TH Nối tiếp A: Cực (+) pin 1 nối với cực (-) pin 2 -> Hai đầu dư ra là Cực (+) pin 2 và Cực (-) pin 1
    // TH Nối tiếp B: Cực (-) pin 1 nối với cực (+) pin 2 -> Hai đầu dư ra là Cực (+) pin 1 và Cực (-) pin 2
    const externalTerminals = [
      'SW_RED',
      'SW_GREEN',
      'BULB_POS',
      'BULB_NEG',
      'RHEO_IN',
      'RHEO_COIL_END',
      'RHEO_RAIL_L',
      'RHEO_WIPER',
      'AM_NEG',
      'AM_06A',
      'AM_3A',
    ];
    const hasExternalOnNode = (nodeId: string) =>
      externalTerminals.some((t) => wireDegree[t] > 0 && dsu.find(t) === nodeId);

    const isSeries12 =
      p1 === n2 &&
      p2 !== n1 &&
      p1 !== p2 &&
      p1 !== n1 &&
      !hasExternalOnNode(p1); // Điểm nối giữa 2 pin chỉ nối nội bộ giữa (+) pin 1 và (-) pin 2

    const isSeries21 =
      n1 === p2 &&
      p1 !== n2 &&
      n1 !== p1 &&
      n1 !== n2 &&
      !hasExternalOnNode(n1); // Điểm nối giữa 2 pin chỉ nối nội bộ giữa (-) pin 1 và (+) pin 2

    if (isParallel) {
      sourceTypeLabel = 'PHẦN B (Nguồn 2 Pin Song Song 1.5V)';
      sourcePosNode = p1; // Cụm Dương
      sourceNegNode = n1; // Cụm Âm
      totalEmfV = 1.5;
      totalRInternal = R_CELL_INTERNAL / 2;
    } else if (isSeries12) {
      sourceTypeLabel = 'PHẦN B (Nguồn 2 Pin Nối Tiếp 3.0V)';
      sourcePosNode = p2; // Cực (+) pin 2
      sourceNegNode = n1; // Cực (-) pin 1
      totalEmfV = 3.0;
      totalRInternal = 2 * R_CELL_INTERNAL;
    } else if (isSeries21) {
      sourceTypeLabel = 'PHẦN B (Nguồn 2 Pin Nối Tiếp 3.0V)';
      sourcePosNode = p1; // Cực (+) pin 1
      sourceNegNode = n2; // Cực (-) pin 2
      totalEmfV = 3.0;
      totalRInternal = 2 * R_CELL_INTERNAL;
    } else {
      // Kiểm tra xem người dùng có nối nhầm 2 cực cùng dấu mà không nối cặp cực còn lại (mắc xung đối)
      if ((p1 === p2 && n1 !== n2) || (n1 === n2 && p1 !== p2)) {
        return buildOffSolution(
          'WRONG_BATTERY_POLARITY',
          'error',
          'SAI CẤU HÌNH 2 PIN: Muốn mắc NỐI TIẾP phải nối (+) pin 1 với (-) pin 2; muốn mắc SONG SONG phải nối cả (+) với (+) VÀ (-) với (-). Đèn không sáng!'
        );
      }
      return buildOffSolution(
        'MISSING_BATTERY_BRIDGE',
        'warn',
        'Nguồn 2 pin chưa đúng chuẩn Phần B: Hãy mắc NỐI TIẾP (cực + pin này nối cực - pin kia) hoặc SONG SONG (+ nối +, - nối -)!'
      );
    }
  } else {
    return buildOffSolution(
      'INVALID_CIRCUIT_TOPOLOGY',
      'warn',
      'Chỉ hỗ trợ Nguồn 1 Pin (Phần A) hoặc Nguồn 2 Pin (Phần B).'
    );
  }

  // =========================================================================
  // KIỂM TRA CÁC LINH KIỆN TRONG MẠCH NGOÀI THEO ĐÚNG 3 TRƯỜNG HỢP CỦA PHẦN A & PHẦN B
  // =========================================================================
  const bulbTouched = wireDegree['BULB_POS'] > 0 || wireDegree['BULB_NEG'] > 0;
  const bulbBothWired =
    wireDegree['BULB_POS'] > 0 &&
    wireDegree['BULB_NEG'] > 0 &&
    dsu.find('BULB_POS') !== dsu.find('BULB_NEG');

  if (!bulbTouched || !bulbBothWired) {
    return buildOffSolution(
      'OPEN_CIRCUIT',
      'idle',
      'Bóng đèn chưa được nối kín 2 chốt (Chốt A và Chốt B): Đèn không thể sáng.',
      { emfV: totalEmfV, rInternalOhm: totalRInternal }
    );
  }

  const switchTouched = wireDegree['SW_RED'] > 0 || wireDegree['SW_GREEN'] > 0;
  const switchBothWired =
    wireDegree['SW_RED'] > 0 &&
    wireDegree['SW_GREEN'] > 0 &&
    dsu.find('SW_RED') !== dsu.find('SW_GREEN');

  // Nếu có dây cắm vào Công tắc:
  if (switchTouched) {
    if (!switchBothWired) {
      return buildOffSolution(
        'OPEN_CIRCUIT',
        'warn',
        'Công tắc (Cầu dao K) mới chỉ cắm 1 chốt hoặc cắm trùng chốt: Phải cắm qua 2 chốt của công tắc, đèn không sáng!',
        { emfV: totalEmfV, rInternalOhm: totalRInternal }
      );
    }
    if (!input.switchClosed) {
      return buildOffSolution(
        'SWITCH_OPEN',
        'idle',
        'Công tắc đang MỞ: Điều kiện bắt buộc ở Trường hợp 2 & 3 là Công tắc phải ở trạng thái ĐÓNG thì đèn mới sáng!',
        { emfV: totalEmfV, rInternalOhm: totalRInternal }
      );
    }
  }

  // Nếu có dây cắm vào Biến trở (Trường hợp 3):
  if (rheoTouched) {
    // Theo quy định Phần A & Phần B: Trường hợp 3 gồm Pin + Bóng đèn + Công tắc + Biến trở (bắt buộc có Công tắc ĐÓNG)
    if (!switchTouched) {
      return buildOffSolution(
        'MISSING_SWITCH_FOR_RHEOSTAT',
        'warn',
        'Không thuộc trường hợp đèn sáng: Khi dùng Biến trở (Trường hợp 3), mạch bắt buộc phải có thêm Công tắc (ở trạng thái ĐÓNG) mắc nối tiếp!',
        { emfV: totalEmfV, rInternalOhm: totalRInternal }
      );
    }
    if (rheoMode === 'INVALID' || rheoMode === 'NONE') {
      return buildOffSolution(
        'INVALID_RHEOSTAT_WIRING',
        'error',
        'Biến trở cắm sai quy tắc: Chỉ sáng khi cắm Kiểu 1 (1 chốt trên + 1 chốt dưới), Kiểu 2 (2 chốt dưới) hoặc Kiểu 3 (2 chốt trên)!',
        { emfV: totalEmfV, rInternalOhm: totalRInternal }
      );
    }
  }

  // Kiểm tra Vôn kế có bị mắc nối tiếp vào mạch chính hay không
  const vmTouched =
    wireDegree['VM_NEG'] > 0 || wireDegree['VM_6V'] > 0 || wireDegree['VM_12V'] > 0;
  const vmPosTerm = wireDegree['VM_6V'] > 0 ? 'VM_6V' : wireDegree['VM_12V'] > 0 ? 'VM_12V' : '';
  const vmActive = wireDegree['VM_NEG'] > 0 && vmPosTerm !== '';

  // Kiểm tra Ampe kế nếu người dùng có mắc thêm vào mạch
  const amTouched =
    wireDegree['AM_NEG'] > 0 || wireDegree['AM_06A'] > 0 || wireDegree['AM_3A'] > 0;
  const amPosTerm = wireDegree['AM_06A'] > 0 ? 'AM_06A' : wireDegree['AM_3A'] > 0 ? 'AM_3A' : '';
  const amActive = wireDegree['AM_NEG'] > 0 && amPosTerm !== '';
  if (amTouched && !amActive) {
    return buildOffSolution(
      'OPEN_CIRCUIT',
      'warn',
      'Ampe kế chưa cắm đủ 2 cọc (-) và (+): Mạch hở, đèn không sáng!',
      { emfV: totalEmfV, rInternalOhm: totalRInternal }
    );
  }

  // =========================================================================
  // KIỂM TRA ĐỒ THỊ MẠCH NGOÀI PHẢI ĐÚNG LÀ MẠCH NỐI TIẾP KHÉP KÍN GIỮA SRC_POS VÀ SRC_NEG
  // (Trường hợp 1: Pin + Đèn | Trường hợp 2: Pin + Đèn + Công tắc | Trường hợp 3: Pin + Đèn + Công tắc + Biến trở)
  // =========================================================================
  interface SeriesElement {
    id: string;
    nodeU: string;
    nodeV: string;
    termU: string;
    termV: string;
    r: number;
  }

  const seriesElements: SeriesElement[] = [
    {
      id: 'BULB',
      nodeU: dsu.find('BULB_POS'),
      nodeV: dsu.find('BULB_NEG'),
      termU: 'BULB_POS',
      termV: 'BULB_NEG',
      r: R_BULB,
    },
  ];

  if (switchTouched && switchBothWired && input.switchClosed) {
    seriesElements.push({
      id: 'SWITCH',
      nodeU: dsu.find('SW_RED'),
      nodeV: dsu.find('SW_GREEN'),
      termU: 'SW_RED',
      termV: 'SW_GREEN',
      r: 0.005,
    });
  }

  if (rheoTouched && rheoMode !== 'NONE' && rheoMode !== 'INVALID') {
    seriesElements.push({
      id: 'RHEO',
      nodeU: dsu.find(rheoTermA),
      nodeV: dsu.find(rheoTermB),
      termU: rheoTermA,
      termV: rheoTermB,
      r: rRheostatActiveOhm,
    });
  }

  if (amActive) {
    seriesElements.push({
      id: 'AMMETER',
      nodeU: dsu.find(amPosTerm),
      nodeV: dsu.find('AM_NEG'),
      termU: amPosTerm,
      termV: 'AM_NEG',
      r: R_AMMETER,
    });
  }

  // Kiểm tra xem có linh kiện nào bị tự nối tắt 2 đầu của chính nó không
  // (Ngoại trừ Kiểu 3 của Biến trở khi người dùng cắm chung vào chốt trên thanh kim loại)
  for (const el of seriesElements) {
    if (el.nodeU === el.nodeV && !(el.id === 'RHEO' && rheoMode === 'TYPE_3_TOP_RAIL_SHORT')) {
      if (el.id === 'AMMETER') {
        return buildOffSolution(
          'SHORT_CIRCUIT',
          'error',
          'SAI: Ampe kế đang bị nối tắt hoặc mắc song song gây chập mạch, đèn không sáng!',
          { shortCircuit: true, emfV: totalEmfV, rInternalOhm: totalRInternal }
        );
      }
      return buildOffSolution(
        'INVALID_CIRCUIT_TOPOLOGY',
        'error',
        `Hai chốt của ${el.id === 'BULB' ? 'Bóng đèn' : 'Linh kiện'} đang bị nối chập vào nhau, đèn không thể sáng!`,
        { emfV: totalEmfV, rInternalOhm: totalRInternal }
      );
    }
  }

  // Nếu Kiểu 3 biến trở cắm vào 2 chốt trên khác nhau (RHEO_RAIL_L và RHEO_WIPER), nó là 1 cạnh nối giữa 2 supernode đó.
  // Nếu người dùng cắm 2 dây vào cùng 1 chốt trên duy nhất, nodeU === nodeV nên không tạo cạnh trung gian.
  const graphEdges = seriesElements.filter((el) => el.nodeU !== el.nodeV);

  // Duyệt tìm đường đi nối tiếp đơn (Simple Series Path) từ sourcePosNode đến sourceNegNode đi qua TẤT CẢ các phần tử trong graphEdges
  const adj: Record<string, { edgeIdx: number; to: string }[]> = {};
  for (let i = 0; i < graphEdges.length; i++) {
    const e = graphEdges[i];
    if (!adj[e.nodeU]) adj[e.nodeU] = [];
    if (!adj[e.nodeV]) adj[e.nodeV] = [];
    adj[e.nodeU].push({ edgeIdx: i, to: e.nodeV });
    adj[e.nodeV].push({ edgeIdx: i, to: e.nodeU });
  }

  // Kiểm tra bậc của từng nút trong mạch chính:
  // Trong mạch nối tiếp thuần túy (Trường hợp 1, 2, 3), sourcePosNode và sourceNegNode phải có bậc = 1,
  // và mọi nút trung gian trên đường nối tiếp phải có bậc = 2 (không có nhánh rẽ song song làm sai cấu hình).
  let isPureSeriesChain = true;
  if (!adj[sourcePosNode] || adj[sourcePosNode].length !== 1) {
    isPureSeriesChain = false;
  }
  if (!adj[sourceNegNode] || adj[sourceNegNode].length !== 1) {
    isPureSeriesChain = false;
  }
  for (const [nodeId, list] of Object.entries(adj)) {
    if (nodeId !== sourcePosNode && nodeId !== sourceNegNode && list.length !== 2) {
      isPureSeriesChain = false;
    }
  }

  // Đi dọc theo chuỗi nối tiếp từ sourcePosNode tới sourceNegNode để kiểm tra tính liên thông và chiều dòng điện
  const visitedEdges = new Set<number>();
  const edgeDirectionPositive: Record<string, boolean> = {};
  let currNode = sourcePosNode;
  while (isPureSeriesChain && currNode !== sourceNegNode) {
    const neighbors = adj[currNode] || [];
    const nextStep = neighbors.find((nb) => !visitedEdges.has(nb.edgeIdx));
    if (!nextStep) {
      isPureSeriesChain = false;
      break;
    }
    visitedEdges.add(nextStep.edgeIdx);
    const edgeObj = graphEdges[nextStep.edgeIdx];
    edgeDirectionPositive[edgeObj.id] = edgeObj.nodeU === currNode;
    currNode = nextStep.to;
  }

  if (!isPureSeriesChain || currNode !== sourceNegNode || visitedEdges.size !== graphEdges.length) {
    // Kiểm tra xem có phải do người dùng mắc Vôn kế nối tiếp làm hở mạch chính không
    if (vmActive) {
      const vmNodeA = dsu.find(vmPosTerm);
      const vmNodeB = dsu.find('VM_NEG');
      if (vmNodeA !== vmNodeB) {
        return buildOffSolution(
          'VOLTMETER_IN_SERIES',
          'error',
          'SAI: Vôn kế đang mắc nối tiếp trong mạch hoặc dây nối chưa tạo thành vòng khép kín qua đèn! Đèn không sáng.',
          { voltmeterInSeries: true, emfV: totalEmfV, rInternalOhm: totalRInternal }
        );
      }
    }

    return buildOffSolution(
      'INVALID_CIRCUIT_TOPOLOGY',
      'warn',
      'Mạch chưa khép kín đúng các trường hợp chuẩn (Trường hợp 1: Pin + Đèn; Trường hợp 2: Pin + Đèn + Công tắc; Trường hợp 3: Pin + Đèn + Công tắc + Biến trở). Đèn không sáng!',
      { emfV: totalEmfV, rInternalOhm: totalRInternal }
    );
  }

  // =========================================================================
  // MẠCH HỢP LỆ THEO ĐÚNG PHẦN A HOẶC PHẦN B (TRƯỜNG HỢP 1, 2, HOẶC 3) -> GIẢI DÒNG ĐIỆN & ĐỘ SÁNG ĐÈN
  // =========================================================================
  const totalSeriesResistance =
    totalRInternal +
    seriesElements.reduce((sum, el) => sum + el.r, 0);

  const mainCurrentA = totalEmfV / Math.max(0.05, totalSeriesResistance);
  const bulbCurrentA = mainCurrentA;
  const bulbVoltageV = bulbCurrentA * R_BULB;
  const bulbPowerW = bulbCurrentA * bulbCurrentA * R_BULB;

  // Độ sáng đèn:
  // - Kiểu 3 (Biến trở chập 2 chốt trên, R = 0Ω) hoặc không có biến trở -> dòng lớn, đèn sáng rực nhất
  // - Kiểu 2 (Biến trở 2 chốt dưới cố định 20Ω) -> dòng nhỏ, đèn sáng yếu hơn
  // - Kiểu 1 (1 chốt trên + 1 chốt dưới) -> độ sáng thay đổi theo vị trí con chạy
  const bulbBrightness = Math.min(1.6, Math.max(0.12, bulbCurrentA / 0.32));

  // Tính số chỉ Ampe kế (nếu có mắc trong chuỗi nối tiếp)
  let ammeterReadingA = 0;
  let ammeterReverse = false;
  if (amActive) {
    const isForward = edgeDirectionPositive['AMMETER'] ?? true;
    ammeterReadingA = isForward ? mainCurrentA : -mainCurrentA;
    ammeterReverse = !isForward;
  }
  const ammeterOverRange = Math.abs(ammeterReadingA) > ammeterScaleMax + 0.005;

  // Tính điện thế tại từng nút dọc theo mạch nối tiếp để xác định số chỉ Vôn kế (nếu mắc song song)
  const nodePotentials: Record<string, number> = {};
  nodePotentials[sourcePosNode] = totalEmfV - mainCurrentA * totalRInternal;
  let walkNode = sourcePosNode;
  const walkVisited = new Set<number>();
  while (walkNode !== sourceNegNode) {
    const step = (adj[walkNode] || []).find((nb) => !walkVisited.has(nb.edgeIdx));
    if (!step) break;
    walkVisited.add(step.edgeIdx);
    const edgeObj = graphEdges[step.edgeIdx];
    const nextV = (nodePotentials[walkNode] ?? 0) - mainCurrentA * edgeObj.r;
    nodePotentials[step.to] = Math.max(0, nextV);
    walkNode = step.to;
  }
  nodePotentials[sourceNegNode] = 0;

  let voltmeterReadingV = 0;
  let voltmeterReverse = false;
  if (vmActive) {
    const vmPosNode = dsu.find(vmPosTerm);
    const vmNegNode = dsu.find('VM_NEG');
    if (
      nodePotentials[vmPosNode] !== undefined &&
      nodePotentials[vmNegNode] !== undefined
    ) {
      voltmeterReadingV = nodePotentials[vmPosNode] - nodePotentials[vmNegNode];
      voltmeterReverse = voltmeterReadingV < -0.02;
    }
  }
  const voltmeterOverRange = Math.abs(voltmeterReadingV) > voltmeterScaleMax + 0.05;

  // Xác định tên Trường hợp (1, 2, hoặc 3) để hiển thị rõ ràng cho người dùng
  let caseDescription = '';
  if (!switchTouched && !rheoTouched) {
    caseDescription = 'Trường hợp 1 (Nguồn Pin + Bóng đèn sợi đốt)';
  } else if (switchTouched && !rheoTouched) {
    caseDescription = 'Trường hợp 2 (Nguồn Pin + Bóng đèn + Công tắc ĐÓNG)';
  } else {
    caseDescription = `Trường hợp 3 (Nguồn Pin + Đèn + Công tắc ĐÓNG + ${rheoModeLabel})`;
  }

  let faultType: CircuitFaultType = 'NONE';
  let statusLevel: 'ok' | 'warn' | 'error' | 'idle' = 'ok';
  let statusMessage = `ĐÈN SÁNG • ${sourceTypeLabel} — ${caseDescription} | I = ${bulbCurrentA.toFixed(
    3
  )}A, U_đèn = ${bulbVoltageV.toFixed(2)}V`;

  if (ammeterReverse || voltmeterReverse) {
    faultType = 'REVERSE_POLARITY';
    statusLevel = 'warn';
    statusMessage = `ĐÈN SÁNG (${caseDescription}) — Chú ý: Đồng hồ đo đang cắm ngược cực (+) và (-)!`;
  } else if (ammeterOverRange) {
    faultType = 'OVER_RANGE';
    statusLevel = 'warn';
    statusMessage = `ĐÈN SÁNG (${caseDescription}) — Chú ý: Dòng điện vượt thang đo ${ammeterScaleMax}A của Ampe kế!`;
  }

  return {
    isClosedLoop: true,
    batteryCount: activeSlots.length,
    emfV: totalEmfV,
    rInternalOhm: Math.round(totalRInternal * 100) / 100,
    rRheostatActiveOhm: Math.round(rRheostatActiveOhm * 100) / 100,
    rBulbOhm: R_BULB,
    rTotalOhm: Math.round(totalSeriesResistance * 100) / 100,
    mainCurrentA: Math.round(mainCurrentA * 10000) / 10000,
    ammeterCurrentA: Math.round(Math.abs(ammeterReadingA) * 10000) / 10000,
    ammeterReadingA: Math.round(ammeterReadingA * 10000) / 10000,
    ammeterScaleMax,
    ammeterReverse,
    ammeterOverRange,
    voltmeterReadingV: Math.round(voltmeterReadingV * 1000) / 1000,
    voltmeterScaleMax,
    voltmeterReverse,
    voltmeterOverRange,
    bulbVoltageV: Math.round(bulbVoltageV * 1000) / 1000,
    bulbCurrentA: Math.round(bulbCurrentA * 1000) / 1000,
    bulbPowerW: Math.round(bulbPowerW * 1000) / 1000,
    bulbBrightness: Math.round(bulbBrightness * 1000) / 1000,
    shortCircuit: false,
    voltmeterInSeries: false,
    wrongMeterTerminals: false,
    missingBatteryBridge: false,
    faultType,
    statusLevel,
    statusMessage,
    diagnostics: [statusMessage],
  };
}
