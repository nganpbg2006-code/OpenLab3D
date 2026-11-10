import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Zap,
  Download,
  AlertTriangle,
  CheckCircle2,
  Cable,
  Trash2,
  Eye,
  EyeOff,
  PackageOpen,
  Layers,
  X,
  Info,
  Archive,
  RotateCcw,
  PenTool,
  Code2,
  Copy,
  Check,
  FileCode,
  Upload,
  Database,
  Save,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react';
import {
  BananaWire,
  DEFAULT_SERIES_WIRES,
  TERMINAL_META,
  solveElectricalCircuit,
} from './circuitSolver';
import {
  EXPORTABLE_MODULES,
  ExportableEquipmentSpec,
  generateStandaloneEquipmentHtml,
} from './standaloneExporter';
import {
  StoredHtmlEquipmentModule,
  ValidatedHtmlEquipmentModule,
  CompiledEquipmentModuleRuntime,
  loadStoredHtmlModules,
  saveStoredHtmlModule,
  removeStoredHtmlModule,
  parseAndValidateHtmlModule,
} from './htmlModuleImporter';
import { HtmlImportStudioModal } from './HtmlImportStudioModal';
import { UnderShelfDrawerModal } from './UnderShelfDrawerModal';

declare global {
  interface Window {
    OL3D_EQUIPMENT_MODULE?: {
      slug?: string;
      version?: string;
      buildEquipmentMesh: (THREE_NS: typeof THREE, options?: Record<string, unknown>) => THREE.Group;
      updateEquipmentState: (
        rootNode: THREE.Group,
        state: Record<string, unknown>,
        dt?: number
      ) => void;
      playEquipmentSound: (
        actionName: string,
        state?: Record<string, unknown> | number | boolean,
        audioContext?: AudioContext
      ) => void;
      rebuildWires3D?: (rootObject: THREE.Group, wireList: unknown[]) => void;
    };
  }
}

export type BatteryCellId =
  | 'battery_cell_1'
  | 'battery_cell_2'
  | 'battery_cell_3'
  | 'battery_cell_4';

export type BuiltInWorkbenchItemId =
  | 'battery_holder'
  | 'single_battery_holder_1'
  | 'single_battery_holder_2'
  | BatteryCellId
  | 'knife_switch'
  | 'bulb_126'
  | 'rheostat_20'
  | 'ammeter_dc'
  | 'voltmeter_dc';

export type WorkbenchItemId = BuiltInWorkbenchItemId | string;

const isBatteryCellId = (id: WorkbenchItemId): id is BatteryCellId =>
  id === 'battery_cell_1' ||
  id === 'battery_cell_2' ||
  id === 'battery_cell_3' ||
  id === 'battery_cell_4';

export interface EquipmentDetailedSpec {
  id: WorkbenchItemId;
  nodeName: string;
  unitKey: string;
  name: string;
  modelCode: string;
  category: string;
  shortDesc: string;
  introduction: string;
  workingPrinciple: string;
  specs: { label: string; value: string }[];
  terminals: { code: string; desc: string }[];
  tableDefaultPos: [number, number, number];
  cabinetSlotPos: [number, number, number];
  labelOffsetY: number;
  // Kích thước khối đặc ("ruột") để chống xuyên thấu giữa các thiết bị và dây dẫn
  solidHalfW: number;
  solidHalfD: number;
  solidHeight: number;
  isImportedHtml?: boolean;
  importedModule?: StoredHtmlEquipmentModule;
}

const EQUIPMENT_CATALOG: EquipmentDetailedSpec[] = [
  {
    id: 'battery_holder',
    nodeName: 'unit_battery_holder',
    unitKey: 'battery_holder',
    name: 'Giá Đỡ 2 Pin Trong Suốt',
    modelCode: 'OL3D-BH2-V2.4',
    category: 'Nguồn điện một chiều (DC)',
    shortDesc: 'Đế nhựa Acrylic trong suốt 2 ngăn độc lập (SLOT_1 & SLOT_2)',
    introduction:
      'Giá đỡ 2 viên pin đại (cỡ D / R20) bằng nhựa polycarbonate trong suốt giúp quan sát trực quan hai ngăn pin và 4 cọc đấu điện ở 4 góc.',
    workingPrinciple:
      'Nếu chỉ dùng 1 pin ở 1 ngăn: nối dây trực tiếp vào cực Dương (+) và cực Âm (-) của ngăn đó (1.5V). Nếu dùng cả 2 pin để có 3.0V: bắt buộc phải nối 1 dây cầu giữa cực Âm (-) của pin này với cực Dương (+) của pin kia (ví dụ BAT1_NEG ↔ BAT2_POS), và lấy 2 đầu dây nguồn ra ở cực Dương của pin thứ nhất (BAT1_POS) và cực Âm của pin thứ hai (BAT2_NEG).',
    specs: [
      { label: 'Số ngăn chứa pin', value: '2 ngăn độc lập (SLOT_1, SLOT_2)' },
      { label: 'Điện áp 1 pin', value: '1.5 V DC (nối 2 cực của 1 ngăn)' },
      { label: 'Điện áp 2 pin nối tiếp', value: '3.0 V DC (nối cực + pin này với cực - pin kia)' },
      { label: 'Kích thước chuẩn SI', value: '140 × 88 × 42 mm' },
    ],
    terminals: [
      { code: 'BAT1_POS', desc: 'Cọc Đỏ trái (+ Ngăn 1)' },
      { code: 'BAT1_NEG', desc: 'Cọc Đen phải (- Ngăn 1)' },
      { code: 'BAT2_NEG', desc: 'Cọc Đen trái (- Ngăn 2)' },
      { code: 'BAT2_POS', desc: 'Cọc Đỏ phải (+ Ngăn 2)' },
    ],
    tableDefaultPos: [-0.36, 0, -0.12],
    cabinetSlotPos: [-0.62, 0.222, -0.68],
    labelOffsetY: 0.085,
    solidHalfW: 0.074,
    solidHalfD: 0.048,
    solidHeight: 0.046,
  },
  {
    id: 'single_battery_holder_1',
    nodeName: 'unit_single_battery_holder_1',
    unitKey: 'single_battery_holder_1',
    name: 'Giá Đỡ 1 Pin #1',
    modelCode: 'OL3D-BH1-V2.4-1',
    category: 'Nguồn điện một chiều (DC)',
    shortDesc: 'Giá đỡ đơn 1 viên pin đại 1.5V (SBAT1_POS & SBAT1_NEG)',
    introduction:
      'Giá đỡ 1 viên pin đại bằng nhựa Acrylic trong suốt có 2 cọc cắm Đỏ (+) và Đen (-). Khi kéo viên pin rà vào khay sẽ hiện màu xanh lá và tự động khớp pin vào đúng chiều.',
    workingPrinciple:
      'Lắp 1 viên pin 1.5V vào khay để dùng làm nguồn 1 pin (Phần A), hoặc kết hợp với Giá đỡ 1 pin #2 để mắc nối tiếp / song song 2 pin (Phần B).',
    specs: [
      { label: 'Số ngăn chứa pin', value: '1 ngăn đơn (SINGLE_SLOT_1)' },
      { label: 'Điện áp định mức', value: '1.5 V DC' },
      { label: 'Số cọc cắm', value: '2 cọc: SBAT1_POS (+) & SBAT1_NEG (-)' },
      { label: 'Kích thước chuẩn SI', value: '140 × 48 × 42 mm' },
    ],
    terminals: [
      { code: 'SBAT1_POS', desc: 'Cọc Đỏ trái (+ Cực Dương Giá đỡ 1 pin #1)' },
      { code: 'SBAT1_NEG', desc: 'Cọc Đen phải (- Cực Âm Giá đỡ 1 pin #1)' },
    ],
    tableDefaultPos: [-0.66, 0, -0.18],
    cabinetSlotPos: [-0.36, 0.222, -0.68],
    labelOffsetY: 0.08,
    solidHalfW: 0.074,
    solidHalfD: 0.028,
    solidHeight: 0.045,
  },
  {
    id: 'single_battery_holder_2',
    nodeName: 'unit_single_battery_holder_2',
    unitKey: 'single_battery_holder_2',
    name: 'Giá Đỡ 1 Pin #2',
    modelCode: 'OL3D-BH1-V2.4-2',
    category: 'Nguồn điện một chiều (DC)',
    shortDesc: 'Giá đỡ đơn 1 viên pin đại 1.5V (SBAT2_POS & SBAT2_NEG)',
    introduction:
      'Giá đỡ 1 viên pin đại thứ hai bằng nhựa Acrylic trong suốt có 2 cọc cắm Đỏ (+) và Đen (-). Khi kéo viên pin rà vào khay sẽ hiện màu xanh lá và tự động khớp pin vào đúng chỗ.',
    workingPrinciple:
      'Lắp 1 viên pin 1.5V vào khay để dùng độc lập (Phần A) hoặc nối với Giá đỡ 1 pin #1 theo cấu hình Nối tiếp (3.0V) hay Song song (1.5V) ở Phần B.',
    specs: [
      { label: 'Số ngăn chứa pin', value: '1 ngăn đơn (SINGLE_SLOT_2)' },
      { label: 'Điện áp định mức', value: '1.5 V DC' },
      { label: 'Số cọc cắm', value: '2 cọc: SBAT2_POS (+) & SBAT2_NEG (-)' },
      { label: 'Kích thước chuẩn SI', value: '140 × 48 × 42 mm' },
    ],
    terminals: [
      { code: 'SBAT2_POS', desc: 'Cọc Đỏ trái (+ Cực Dương Giá đỡ 1 pin #2)' },
      { code: 'SBAT2_NEG', desc: 'Cọc Đen phải (- Cực Âm Giá đỡ 1 pin #2)' },
    ],
    tableDefaultPos: [-0.66, 0, 0.06],
    cabinetSlotPos: [-0.1, 0.222, -0.68],
    labelOffsetY: 0.08,
    solidHalfW: 0.074,
    solidHalfD: 0.028,
    solidHeight: 0.045,
  },
  {
    id: 'battery_cell_1',
    nodeName: 'unit_battery_1',
    unitKey: 'battery_1',
    name: 'Viên Pin Đại Con Ó 1.5V #1',
    modelCode: 'PINACO-R20S-1',
    category: 'Nguồn điện hóa học',
    shortDesc: 'Pin đại R20S 1.5V (kéo rà vào ngăn giá đỡ sẽ hiện màu xanh để lắp)',
    introduction:
      'Pin đại Con Ó R20S 1.5V là nguồn điện một chiều thông dụng. Đầu có núm nhô kim loại là cực Dương (+), đáy phẳng là cực Âm (-).',
    workingPrinciple:
      'Khi kéo viên pin rà vào Giá đỡ pin, ngăn tương ứng sẽ sáng màu xanh lá. Khi thả chuột, viên pin tự động khớp vào ngăn theo đúng chiều ngang/dọc của giá đỡ và di chuyển theo giá đỡ.',
    specs: [
      { label: 'Suất điện động (E)', value: '1.50 V DC' },
      { label: 'Điện trở trong (r)', value: '0.12 Ω' },
      { label: 'Loại pin', value: 'R20S / Cỡ D (Kẽm - Carbon)' },
      { label: 'Kích thước chuẩn SI', value: 'Ø31 × 90 mm' },
    ],
    terminals: [
      { code: 'SLOT_1 / SLOT_2', desc: 'Kéo thả vào ngăn sáng xanh trên Giá đỡ pin' },
    ],
    tableDefaultPos: [-0.36, 0, -0.142],
    cabinetSlotPos: [-0.22, 0.222, -0.68],
    labelOffsetY: 0.065,
    solidHalfW: 0.048,
    solidHalfD: 0.018,
    solidHeight: 0.034,
  },
  {
    id: 'battery_cell_2',
    nodeName: 'unit_battery_2',
    unitKey: 'battery_2',
    name: 'Viên Pin Đại Con Ó 1.5V #2',
    modelCode: 'PINACO-R20S-2',
    category: 'Nguồn điện hóa học',
    shortDesc: 'Pin đại R20S 1.5V (kéo rà vào ngăn giá đỡ sẽ hiện màu xanh để lắp)',
    introduction:
      'Viên pin đại Con Ó R20S 1.5V thứ hai dùng để ghép bộ nguồn nối tiếp 3.0V hoặc dùng độc lập.',
    workingPrinciple:
      'Khi kéo viên pin rà vào Giá đỡ pin, ngăn trống sẽ hiện màu xanh lá. Khi thả ra, viên pin tự động nằm gọn vào ngăn theo đúng hướng của giá đỡ.',
    specs: [
      { label: 'Suất điện động (E)', value: '1.50 V DC' },
      { label: 'Điện trở trong (r)', value: '0.12 Ω' },
      { label: 'Loại pin', value: 'R20S / Cỡ D (Kẽm - Carbon)' },
      { label: 'Kích thước chuẩn SI', value: 'Ø31 × 90 mm' },
    ],
    terminals: [
      { code: 'SLOT_1 / SLOT_2', desc: 'Kéo thả vào ngăn sáng xanh trên Giá đỡ pin' },
    ],
    tableDefaultPos: [-0.36, 0, -0.098],
    cabinetSlotPos: [0.12, 0.222, -0.68],
    labelOffsetY: 0.065,
    solidHalfW: 0.048,
    solidHalfD: 0.018,
    solidHeight: 0.034,
  },
  {
    id: 'battery_cell_3',
    nodeName: 'unit_battery_3',
    unitKey: 'battery_3',
    name: 'Viên Pin Đại Con Ó 1.5V #3',
    modelCode: 'PINACO-R20S-3',
    category: 'Nguồn điện hóa học',
    shortDesc: 'Pin đại R20S 1.5V (kéo rà vào ngăn giá đỡ sẽ hiện màu xanh để lắp)',
    introduction:
      'Viên pin đại Con Ó R20S 1.5V thứ ba dùng để lắp vào Giá đỡ 1 pin hoặc Giá đỡ 2 pin.',
    workingPrinciple:
      'Khi kéo viên pin rà vào Giá đỡ 1 pin hoặc Giá đỡ 2 pin, ngăn tương ứng sẽ sáng màu xanh lá. Khi thả chuột, viên pin tự động khớp vào ngăn theo đúng chiều ngang/dọc của giá đỡ và di chuyển theo giá đỡ.',
    specs: [
      { label: 'Suất điện động (E)', value: '1.50 V DC' },
      { label: 'Điện trở trong (r)', value: '0.12 Ω' },
      { label: 'Loại pin', value: 'R20S / Cỡ D (Kẽm - Carbon)' },
      { label: 'Kích thước chuẩn SI', value: 'Ø31 × 90 mm' },
    ],
    terminals: [
      { code: 'SLOT', desc: 'Kéo thả vào ngăn sáng xanh trên bất kỳ Giá đỡ pin nào' },
    ],
    tableDefaultPos: [-0.66, 0, -0.27],
    cabinetSlotPos: [0.28, 0.222, -0.68],
    labelOffsetY: 0.065,
    solidHalfW: 0.048,
    solidHalfD: 0.018,
    solidHeight: 0.034,
  },
  {
    id: 'battery_cell_4',
    nodeName: 'unit_battery_4',
    unitKey: 'battery_4',
    name: 'Viên Pin Đại Con Ó 1.5V #4',
    modelCode: 'PINACO-R20S-4',
    category: 'Nguồn điện hóa học',
    shortDesc: 'Pin đại R20S 1.5V (kéo rà vào ngăn giá đỡ sẽ hiện màu xanh để lắp)',
    introduction:
      'Viên pin đại Con Ó R20S 1.5V thứ tư dùng để lắp vào Giá đỡ 1 pin hoặc Giá đỡ 2 pin.',
    workingPrinciple:
      'Khi kéo viên pin rà vào Giá đỡ 1 pin hoặc Giá đỡ 2 pin, ngăn tương ứng sẽ sáng màu xanh lá. Khi thả chuột, viên pin tự động khớp vào ngăn theo đúng chiều ngang/dọc của giá đỡ và di chuyển theo giá đỡ.',
    specs: [
      { label: 'Suất điện động (E)', value: '1.50 V DC' },
      { label: 'Điện trở trong (r)', value: '0.12 Ω' },
      { label: 'Loại pin', value: 'R20S / Cỡ D (Kẽm - Carbon)' },
      { label: 'Kích thước chuẩn SI', value: 'Ø31 × 90 mm' },
    ],
    terminals: [
      { code: 'SLOT', desc: 'Kéo thả vào ngăn sáng xanh trên bất kỳ Giá đỡ pin nào' },
    ],
    tableDefaultPos: [-0.66, 0, 0.15],
    cabinetSlotPos: [0.4, 0.222, -0.68],
    labelOffsetY: 0.065,
    solidHalfW: 0.048,
    solidHalfD: 0.018,
    solidHeight: 0.034,
  },
  {
    id: 'knife_switch',
    nodeName: 'unit_switch',
    unitKey: 'switch',
    name: 'Cầu Dao Đóng Ngắt K',
    modelCode: 'OL3D-SWK-V2.4',
    category: 'Khí cụ đóng cắt mạch',
    shortDesc: 'Cầu dao đơn đế cam 2 cọc SW_RED (Đỏ) & SW_GREEN (Xanh lá)',
    introduction:
      'Cầu dao đơn K có đế bằng nhựa cách điện màu cam, tay nắm nhựa đen cách điện và lưỡi dao đồng đóng khít vào ngàm kẹp chữ U khi đóng mạch.',
    workingPrinciple:
      'Khi đóng cầu dao, lưỡi dao kim loại hạ sát khít vào ngàm kẹp bên phải giúp dòng điện đi qua giữa SW_RED và SW_GREEN.',
    specs: [
      { label: 'Điện trở tiếp xúc (đóng)', value: '0.005 Ω (tiếp xúc khít)' },
      { label: 'Điện trở cách điện (mở)', value: '∞ (Mạch hở)' },
      { label: 'Số cực đấu dây', value: '2 cọc bắp chuối Ø4mm' },
      { label: 'Kích thước chuẩn SI', value: '112 × 68 × 45 mm' },
    ],
    terminals: [
      { code: 'SW_RED', desc: 'Cọc Đỏ (bên trái - nối bản lề lưỡi dao)' },
      { code: 'SW_GREEN', desc: 'Cọc Xanh lá (bên phải - nối ngàm kẹp tiếp điểm)' },
    ],
    tableDefaultPos: [-0.06, 0, -0.14],
    cabinetSlotPos: [0.52, 0.222, -0.68],
    labelOffsetY: 0.075,
    solidHalfW: 0.06,
    solidHalfD: 0.038,
    solidHeight: 0.045,
  },
  {
    id: 'bulb_126',
    nodeName: 'unit_bulb',
    unitKey: 'bulb',
    name: 'Bóng Đèn Dây Tóc',
    modelCode: 'OL3D-BULB-V2.4',
    category: 'Phụ tải tiêu thụ điện',
    shortDesc: 'Bóng đèn dây tóc vonfram, độ sáng tăng giảm mạnh theo cường độ dòng điện',
    introduction:
      'Bóng đèn dây tóc vonfram gắn trên đế cách điện trắng kèm đui xoáy đồng và hai cọc cắm bắp chuối Đen - Đỏ.',
    workingPrinciple:
      'Khi cường độ dòng điện I qua đèn càng lớn, công suất P = I²R càng mạnh làm dây tóc và bầu thủy tinh phát sáng rực rỡ tương ứng.',
    specs: [
      { label: 'Điện trở dây tóc (R_bulb)', value: '4.80 Ω' },
      { label: 'Điện áp định mức', value: '1.5 V – 3.0 V DC' },
      { label: 'Độ sáng', value: 'Tỉ lệ trực tiếp với I và P = I²R' },
      { label: 'Kích thước chuẩn SI', value: '92 × 56 × 65 mm' },
    ],
    terminals: [
      { code: 'BULB_NEG', desc: 'Cọc Đen (bên trái của đế đèn)' },
      { code: 'BULB_POS', desc: 'Cọc Đỏ (bên phải của đế đèn)' },
    ],
    tableDefaultPos: [-0.05, 0, 0.14],
    cabinetSlotPos: [-0.58, 0.025, -0.68],
    labelOffsetY: 0.095,
    solidHalfW: 0.05,
    solidHalfD: 0.032,
    solidHeight: 0.068,
  },
  {
    id: 'rheostat_20',
    nodeName: 'unit_rheostat',
    unitKey: 'rheostat',
    name: 'Biến Trở Con Chạy 20Ω',
    modelCode: 'OL3D-RHEO20-V2.4',
    category: 'Linh kiện điều chỉnh dòng điện',
    shortDesc: 'Cuộn dây 20Ω có 2 chốt dưới (cuộn dây) và 2 chốt trên (thanh ray kim loại)',
    introduction:
      'Biến trở con chạy 20Ω gồm cuộn dây hợp kim có 2 chốt dưới (RHEO_IN, RHEO_COIL_END) và thanh kim loại phía trên có 2 chốt trên (RHEO_RAIL_L, RHEO_WIPER) cùng con chạy trượt dọc.',
    workingPrinciple:
      'Kiểu 1 (Đúng chuẩn): Cắm 1 dây vào chốt trên và 1 dây vào chốt dưới -> kéo con chạy để thay đổi điện trở. Kiểu 2 (Điện trở cố định): Cắm 2 dây vào 2 chốt dưới -> điện trở cố định 20Ω, đèn sáng yếu hơn. Kiểu 3 (Dây dẫn thường): Cắm 2 dây vào 2 chốt trên -> R = 0Ω, đèn sáng rực nhất.',
    specs: [
      { label: 'Dải điện trở điều chỉnh', value: '0.0 Ω – 20.0 Ω' },
      { label: 'Dòng điện định mức tối đa', value: '2.0 A' },
      { label: 'Số chốt đấu nối', value: '4 chốt (2 chốt dưới cuộn dây + 2 chốt trên thanh ray)' },
      { label: 'Kích thước chuẩn SI', value: '176 × 68 × 75 mm' },
    ],
    terminals: [
      { code: 'RHEO_IN', desc: 'Chốt dưới trái (Đỏ - Đầu cuộn dây)' },
      { code: 'RHEO_COIL_END', desc: 'Chốt dưới phải (Xanh - Cuối cuộn dây)' },
      { code: 'RHEO_RAIL_L', desc: 'Chốt trên trái (Xanh lá - Thanh ray kim loại)' },
      { code: 'RHEO_WIPER', desc: 'Chốt trên phải (Xanh lá - Thanh ray kim loại)' },
    ],
    tableDefaultPos: [0.24, 0, -0.14],
    cabinetSlotPos: [-0.16, 0.025, -0.68],
    labelOffsetY: 0.095,
    solidHalfW: 0.092,
    solidHalfD: 0.038,
    solidHeight: 0.076,
  },
  {
    id: 'ammeter_dc',
    nodeName: 'unit_ammeter',
    unitKey: 'ammeter',
    name: 'Ampe Kế Kim DC (0.6A / 3A)',
    modelCode: 'OL3D-AMDC-V2.4',
    category: 'Dụng cụ đo cường độ dòng điện',
    shortDesc: 'Hộp đen mặt nghiêng, dải cọc Xanh lá (AM_NEG, AM_06A, AM_3A)',
    introduction:
      'Ampe kế từ điện một chiều hai thang đo (0.6A và 3A) dùng để đo cường độ dòng điện chạy trong mạch.',
    workingPrinciple:
      'Điện trở trong rất nhỏ (R_A = 0.05Ω), mắc nối tiếp trong mạch. Khi cường độ dòng điện mạnh (giảm biến trở hoặc dùng 2 pin nối tiếp), kim Ampe kế quay góc lớn tương ứng với chỉ số dòng điện thực.',
    specs: [
      { label: 'Điện trở trong (R_A)', value: '0.05 Ω (rất nhỏ)' },
      { label: 'Thang đo 1 (AM_06A)', value: '0 – 0.6 A' },
      { label: 'Thang đo 2 (AM_3A)', value: '0 – 3.0 A' },
      { label: 'Cách mắc bắt buộc', value: 'Mắc NỐI TIẾP trong mạch chính' },
    ],
    terminals: [
      { code: 'AM_NEG', desc: 'Cọc Đen (-) chung bên trái trên dải Xanh lá' },
      { code: 'AM_06A', desc: 'Cọc Đỏ (+) giữa — Thang đo 0.6A' },
      { code: 'AM_3A', desc: 'Cọc Đỏ (+) phải — Thang đo 3A' },
    ],
    tableDefaultPos: [0.26, 0, 0.14],
    cabinetSlotPos: [0.24, 0.025, -0.68],
    labelOffsetY: 0.115,
    solidHalfW: 0.054,
    solidHalfD: 0.052,
    solidHeight: 0.105,
  },
  {
    id: 'voltmeter_dc',
    nodeName: 'unit_voltmeter',
    unitKey: 'voltmeter',
    name: 'Vôn Kế Kim DC (6V / 12V)',
    modelCode: 'OL3D-VMDC-V2.4',
    category: 'Dụng cụ đo hiệu điện thế',
    shortDesc: 'Hộp đen mặt nghiêng, dải cọc Xanh dương (VM_NEG, VM_6V, VM_12V)',
    introduction:
      'Vôn kế từ điện một chiều hai thang đo (6V và 12V) dùng để đo hiệu điện thế giữa hai đầu bóng đèn hoặc hai cực nguồn điện.',
    workingPrinciple:
      'Điện trở trong rất lớn (R_V = 10000Ω), mắc song song với hai đầu bóng đèn hoặc nguồn điện cần đo.',
    specs: [
      { label: 'Điện trở trong (R_V)', value: '10,000 Ω (10 kΩ)' },
      { label: 'Thang đo 1 (VM_6V)', value: '0 – 6.0 V' },
      { label: 'Thang đo 2 (VM_12V)', value: '0 – 12.0 V' },
      { label: 'Cách mắc bắt buộc', value: 'Mắc SONG SONG với tải hoặc nguồn' },
    ],
    terminals: [
      { code: 'VM_NEG', desc: 'Cọc Đen (-) chung bên trái trên dải Xanh dương' },
      { code: 'VM_6V', desc: 'Cọc Đỏ (+) giữa — Thang đo 6V' },
      { code: 'VM_12V', desc: 'Cọc Đỏ (+) phải — Thang đo 12V' },
    ],
    tableDefaultPos: [-0.36, 0, 0.14],
    cabinetSlotPos: [0.58, 0.025, -0.68],
    labelOffsetY: 0.115,
    solidHalfW: 0.054,
    solidHalfD: 0.052,
    solidHeight: 0.105,
  },
];

const TERMINAL_TO_ITEM_ID: Record<string, WorkbenchItemId> = {
  BAT1_POS: 'battery_holder',
  BAT1_NEG: 'battery_holder',
  BAT2_NEG: 'battery_holder',
  BAT2_POS: 'battery_holder',
  SBAT1_POS: 'single_battery_holder_1',
  SBAT1_NEG: 'single_battery_holder_1',
  SBAT2_POS: 'single_battery_holder_2',
  SBAT2_NEG: 'single_battery_holder_2',
  SW_RED: 'knife_switch',
  SW_GREEN: 'knife_switch',
  BULB_NEG: 'bulb_126',
  BULB_POS: 'bulb_126',
  RHEO_IN: 'rheostat_20',
  RHEO_COIL_END: 'rheostat_20',
  RHEO_RAIL_L: 'rheostat_20',
  RHEO_WIPER: 'rheostat_20',
  AM_NEG: 'ammeter_dc',
  AM_06A: 'ammeter_dc',
  AM_3A: 'ammeter_dc',
  VM_NEG: 'voltmeter_dc',
  VM_6V: 'voltmeter_dc',
  VM_12V: 'voltmeter_dc',
};

interface ProjectedLabel {
  id: WorkbenchItemId;
  x: number;
  y: number;
  visible: boolean;
  inCabinet: boolean;
  onSideShelf?: boolean;
}

// 12 vị trí đặt ngay ngắn trên 2 chiếc kệ gỗ 2 bên (Kệ Trái x = -1.52 & Kệ Phải x = +1.52, mỗi kệ có Tầng trên y = 0.26m và Mặt kệ to ở dưới y = 0.0m)
const SIDE_SHELF_SLOTS: { x: number; y: number; z: number; side: 'left' | 'right'; tier: 'upper' | 'lower' }[] = [
  // Kệ bên Trái - Mặt kệ to tầng 1 (y = 0.0m)
  { x: -1.78, y: 0.0, z: 0.04, side: 'left', tier: 'lower' },
  { x: -1.52, y: 0.0, z: 0.04, side: 'left', tier: 'lower' },
  { x: -1.26, y: 0.0, z: 0.04, side: 'left', tier: 'lower' },
  // Kệ bên Trái - Kệ tầng 2 (y = 0.26m)
  { x: -1.78, y: 0.26, z: -0.35, side: 'left', tier: 'upper' },
  { x: -1.52, y: 0.26, z: -0.35, side: 'left', tier: 'upper' },
  { x: -1.26, y: 0.26, z: -0.35, side: 'left', tier: 'upper' },
  // Kệ bên Phải - Mặt kệ to tầng 1 (y = 0.0m)
  { x: 1.26, y: 0.0, z: 0.04, side: 'right', tier: 'lower' },
  { x: 1.52, y: 0.0, z: 0.04, side: 'right', tier: 'lower' },
  { x: 1.78, y: 0.0, z: 0.04, side: 'right', tier: 'lower' },
  // Kệ bên Phải - Kệ tầng 2 (y = 0.26m)
  { x: 1.26, y: 0.26, z: -0.35, side: 'right', tier: 'upper' },
  { x: 1.52, y: 0.26, z: -0.35, side: 'right', tier: 'upper' },
  { x: 1.78, y: 0.26, z: -0.35, side: 'right', tier: 'upper' },
];

const SAVED_EXPERIMENT_STORAGE_KEY = 'ol3d_saved_experiment_state_v1';

interface SavedExperimentState {
  version: number;
  savedAt: number;
  appMode: 'custom_build' | 'template_demo';
  wires: BananaWire[];
  switchClosed: boolean;
  rheostatOhm: number;
  slot1Occupant: BatteryCellId | null;
  slot2Occupant: BatteryCellId | null;
  singleSlot1Occupant: BatteryCellId | null;
  singleSlot2Occupant: BatteryCellId | null;
  inCabinetMap: Record<WorkbenchItemId, boolean>;
  inUnderCabinetMap: Record<WorkbenchItemId, boolean>;
  cabinetStorageSideMap?: Record<WorkbenchItemId, 'left' | 'right' | null>;
  onSideShelfMap: Record<WorkbenchItemId, boolean>;
  customDeviceValues: Record<string, number>;
  itemTransforms: Record<
    WorkbenchItemId,
    { pos: [number, number, number]; rotY: number }
  >;
  boardTitle: string;
  boardContent: string;
  boardChalkColor: 'white' | 'yellow' | 'cyan' | 'green';
  cameraPos?: [number, number, number];
  controlsTarget?: [number, number, number];
}

const DEFAULT_CAMERA_POS: [number, number, number] = [0.0, 0.72, 1.08];
const DEFAULT_CAMERA_TARGET: [number, number, number] = [0.0, 0.06, -0.08];

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const equipmentRootRef = useRef<THREE.Group | null>(null);
  const labTableGroupRef = useRef<THREE.Group | null>(null);
  const sideShelvesGroupRef = useRef<THREE.Group | null>(null);
  const underCabinetsGroupRef = useRef<THREE.Group | null>(null);
  const wireGroupRef = useRef<THREE.Group | null>(null);
  const terminalHighlightRef = useRef<THREE.Mesh | null>(null);
  const gizmoGroupRef = useRef<THREE.Group | null>(null);
  const blackboardGroupRef = useRef<THREE.Group | null>(null);
  const chalkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chalkTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const cameraResetAnimRef = useRef<{
    active: boolean;
    startTime: number;
    durationMs: number;
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
  } | null>(null);

  // Lưu trạng thái viên pin nào đang gắn trong 4 khay pin:
  // - slot1Occupant, slot2Occupant: Ngăn 1 & Ngăn 2 của Giá đỡ 2 pin
  // - singleSlot1Occupant: Giá đỡ 1 pin #1
  // - singleSlot2Occupant: Giá đỡ 1 pin #2
  const [slot1Occupant, setSlot1Occupant] = useState<BatteryCellId | null>(
    'battery_cell_1'
  );
  const [slot2Occupant, setSlot2Occupant] = useState<BatteryCellId | null>(
    'battery_cell_2'
  );
  const [singleSlot1Occupant, setSingleSlot1Occupant] = useState<BatteryCellId | null>(null);
  const [singleSlot2Occupant, setSingleSlot2Occupant] = useState<BatteryCellId | null>(null);

  const slot1OccupantRef = useRef(slot1Occupant);
  const slot2OccupantRef = useRef(slot2Occupant);
  const singleSlot1OccupantRef = useRef(singleSlot1Occupant);
  const singleSlot2OccupantRef = useRef(singleSlot2Occupant);

  useEffect(() => {
    slot1OccupantRef.current = slot1Occupant;
  }, [slot1Occupant]);
  useEffect(() => {
    slot2OccupantRef.current = slot2Occupant;
  }, [slot2Occupant]);
  useEffect(() => {
    singleSlot1OccupantRef.current = singleSlot1Occupant;
  }, [singleSlot1Occupant]);
  useEffect(() => {
    singleSlot2OccupantRef.current = singleSlot2Occupant;
  }, [singleSlot2Occupant]);

  // Danh sách các thiết bị .HTML do người dùng nạp và lưu trong localStorage
  const [storedHtmlModules, setStoredHtmlModules] = useState<StoredHtmlEquipmentModule[]>(() =>
    loadStoredHtmlModules()
  );
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [customDeviceValues, setCustomDeviceValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    loadStoredHtmlModules().forEach((m) => {
      initial[m.id] = m.controls.defaultValue;
    });
    return initial;
  });
  const customDeviceValuesRef = useRef<Record<string, number>>(customDeviceValues);
  useEffect(() => {
    customDeviceValuesRef.current = customDeviceValues;
  }, [customDeviceValues]);

  const customRuntimesRef = useRef<
    Record<
      string,
      {
        runtime: CompiledEquipmentModuleRuntime;
        assetArg: Record<string, unknown>;
        group: THREE.Group;
      }
    >
  >({});

  // Gộp danh mục 12 thiết bị gốc + các thiết bị .HTML đã nạp từ Bộ lưu trữ
  const allEquipmentCatalog = useMemo<EquipmentDetailedSpec[]>(() => {
    const importedSpecs: EquipmentDetailedSpec[] = storedHtmlModules.map((mod, idx) => {
      const upperSlug = mod.slug
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toUpperCase()
        .slice(0, 12);
      const terms: { code: string; desc: string }[] = [];
      if (mod.addBindingPosts) {
        terms.push(
          { code: `IMP_${upperSlug}_NEG`, desc: `Cọc Đen (-) của ${mod.nameVi}` },
          { code: `IMP_${upperSlug}_POS`, desc: `Cọc Đỏ (+) của ${mod.nameVi}` }
        );
      }

      const slot = SIDE_SHELF_SLOTS[idx % SIDE_SHELF_SLOTS.length];
      const tableX = slot ? slot.x : Math.min(0.86, 0.56 + (idx % 2) * 0.22);
      const tableY = slot ? slot.y : 0;
      const tableZ = slot ? slot.z : Math.min(0.38, -0.22 + Math.floor(idx / 2) * 0.18);
      const cabX = Math.max(-0.72, Math.min(0.72, 0.42 + idx * 0.14));
      const cabY = idx % 2 === 0 ? 0.222 : 0.024;

      return {
        id: mod.id,
        nodeName: `unit_${mod.id}`,
        unitKey: mod.id,
        name: mod.nameVi,
        modelCode: mod.assetId,
        category: mod.category || 'Thiết bị .HTML đã nạp',
        shortDesc: mod.summaryVi,
        introduction: mod.summaryVi,
        workingPrinciple: `Thiết bị 3D được nạp trực tiếp từ file ${mod.filename} (Chuẩn OpenLab 3D). Có thể đặt ngay ngắn trên 2 kệ hai bên, kéo thả trên bàn gỗ 2.0m × 1.0m, cất vào tủ dưới kệ 2 bên hoặc tủ kính 2 tầng, mở 2 trục Chuột phải (Nâng cao & Xoay), tự rơi theo trọng lực, điều chỉnh thanh trượt "${mod.controls.labelVi}" và cắm dây bắp chuối Đỏ/Xanh.`,
        specs: [
          { label: 'Mã tài sản (Asset ID)', value: mod.assetId },
          {
            label: 'Kích thước chuẩn SI',
            value: `${(mod.dimensionsM[0] * 1000).toFixed(0)} × ${(
              mod.dimensionsM[2] * 1000
            ).toFixed(0)} × ${(mod.dimensionsM[1] * 1000).toFixed(0)} mm`,
          },
          { label: 'Khối lượng tham chiếu', value: `${mod.massG} g` },
          {
            label: 'Thông số điều khiển',
            value: `${mod.controls.labelVi} (${mod.controls.min} – ${mod.controls.max} ${mod.controls.unit})`,
          },
        ],
        terminals:
          terms.length > 0
            ? terms
            : [{ code: 'TRỰC TIẾP', desc: 'Điều khiển trực tiếp trên nhãn 3D hoặc cọc nội bộ' }],
        tableDefaultPos: [tableX, tableY, tableZ],
        cabinetSlotPos: [cabX, cabY, -0.68],
        labelOffsetY: Math.max(0.085, mod.dimensionsM[1] + 0.032),
        solidHalfW: Math.max(0.036, mod.dimensionsM[0] * 0.52),
        solidHalfD: Math.max(0.032, mod.dimensionsM[2] * 0.52),
        solidHeight: Math.max(0.042, mod.dimensionsM[1]),
        isImportedHtml: true,
        importedModule: mod,
      };
    });
    return [...EQUIPMENT_CATALOG, ...importedSpecs];
  }, [storedHtmlModules]);

  const allCatalogRef = useRef<EquipmentDetailedSpec[]>(allEquipmentCatalog);
  useEffect(() => {
    allCatalogRef.current = allEquipmentCatalog;
  }, [allEquipmentCatalog]);

  // Bản đồ tra cứu cọc cắm -> ID thiết bị (gồm cả cọc gốc và cọc của thiết bị .HTML đã nạp)
  const [dynamicTerminalToItem, setDynamicTerminalToItem] = useState<
    Record<string, WorkbenchItemId>
  >(TERMINAL_TO_ITEM_ID);
  const allTerminalToItemRef = useRef<Record<string, WorkbenchItemId>>(TERMINAL_TO_ITEM_ID);
  useEffect(() => {
    allTerminalToItemRef.current = dynamicTerminalToItem;
  }, [dynamicTerminalToItem]);

  const [dynamicTerminalMeta, setDynamicTerminalMeta] = useState<
    Record<string, { label: string }>
  >(TERMINAL_META);

  // Vật lý rơi tự do (Gravity state cho từng vật phẩm)
  const physicsRef = useRef<
    Record<
      WorkbenchItemId,
      {
        vy: number;
        falling: boolean;
        restingY: number;
      }
    >
  >({
    battery_holder: { vy: 0, falling: false, restingY: 0 },
    single_battery_holder_1: { vy: 0, falling: false, restingY: 0 },
    single_battery_holder_2: { vy: 0, falling: false, restingY: 0 },
    battery_cell_1: { vy: 0, falling: false, restingY: 0 },
    battery_cell_2: { vy: 0, falling: false, restingY: 0 },
    battery_cell_3: { vy: 0, falling: false, restingY: 0 },
    battery_cell_4: { vy: 0, falling: false, restingY: 0 },
    knife_switch: { vy: 0, falling: false, restingY: 0 },
    bulb_126: { vy: 0, falling: false, restingY: 0 },
    rheostat_20: { vy: 0, falling: false, restingY: 0 },
    ammeter_dc: { vy: 0, falling: false, restingY: 0 },
    voltmeter_dc: { vy: 0, falling: false, restingY: 0 },
  });

  // Trạng thái thiết bị đang ở trong Tủ Kính 2 tầng đối diện hay trên Mặt bàn 2.0m × 1.0m
  const [inCabinetMap, setInCabinetMap] = useState<Record<WorkbenchItemId, boolean>>({
    battery_holder: false,
    single_battery_holder_1: false,
    single_battery_holder_2: false,
    battery_cell_1: false,
    battery_cell_2: false,
    battery_cell_3: false,
    battery_cell_4: false,
    knife_switch: false,
    bulb_126: false,
    rheostat_20: false,
    ammeter_dc: false,
    voltmeter_dc: false,
  });
  const inCabinetRef = useRef(inCabinetMap);
  useEffect(() => {
    inCabinetRef.current = inCabinetMap;
  }, [inCabinetMap]);

  // Trạng thái vật phẩm đang cất trong 2 tủ riêng biệt: Tủ Vật Phẩm Trái ('left') hoặc Tủ Vật Phẩm Phải ('right')
  const [cabinetStorageSideMap, setCabinetStorageSideMap] = useState<
    Record<WorkbenchItemId, 'left' | 'right' | null>
  >(() => {
    const init: Record<WorkbenchItemId, 'left' | 'right' | null> = {};
    loadStoredHtmlModules().forEach((mod, idx) => {
      if (idx >= SIDE_SHELF_SLOTS.length) {
        init[mod.id] = idx % 2 === 0 ? 'left' : 'right';
      }
    });
    return init;
  });
  const cabinetStorageSideRef = useRef(cabinetStorageSideMap);
  useEffect(() => {
    cabinetStorageSideRef.current = cabinetStorageSideMap;
  }, [cabinetStorageSideMap]);

  const [inUnderCabinetMap, setInUnderCabinetMap] = useState<Record<WorkbenchItemId, boolean>>(
    () => {
      const init: Record<WorkbenchItemId, boolean> = {};
      loadStoredHtmlModules().forEach((mod, idx) => {
        if (idx >= SIDE_SHELF_SLOTS.length) {
          init[mod.id] = true;
        }
      });
      return init;
    }
  );
  const inUnderCabinetRef = useRef(inUnderCabinetMap);
  useEffect(() => {
    inUnderCabinetRef.current = inUnderCabinetMap;
  }, [inUnderCabinetMap]);

  // Trạng thái vật phẩm đang đặt trên 2 chiếc kệ hai bên (Left / Right Side Shelves)
  const [onSideShelfMap, setOnSideShelfMap] = useState<Record<WorkbenchItemId, boolean>>(() => {
    const init: Record<WorkbenchItemId, boolean> = {};
    loadStoredHtmlModules().forEach((mod, idx) => {
      if (idx < SIDE_SHELF_SLOTS.length) {
        init[mod.id] = true;
      }
    });
    return init;
  });
  const onSideShelfRef = useRef(onSideShelfMap);
  useEffect(() => {
    onSideShelfRef.current = onSideShelfMap;
  }, [onSideShelfMap]);

  // Ẩn bớt thanh công cụ ở trên theo mặc định, chỉ khi người dùng bấm "Hiện Thanh Công Cụ" mới hiện
  const [showTopToolbar, setShowTopToolbar] = useState<boolean>(false);

  // Tủ nào đang được mở: 'left' (Tủ Vật Phẩm Trái), 'right' (Tủ Vật Phẩm Phải), hoặc null
  const [activeCabinetModalSide, setActiveCabinetModalSide] = useState<'left' | 'right' | null>(
    null
  );

  // Thông báo trạng thái Lưu thí nghiệm / Cất vào tủ
  const [toastBanner, setToastBanner] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(SAVED_EXPERIMENT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedExperimentState;
        return parsed.savedAt || null;
      }
    } catch {
      // ignore
    }
    return null;
  });
  const savedTransformPendingRef = useRef<Record<
    WorkbenchItemId,
    { pos: [number, number, number]; rotY: number }
  > | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastBanner(msg);
  }, []);

  useEffect(() => {
    if (!toastBanner) return;
    const t = window.setTimeout(() => setToastBanner(null), 3200);
    return () => window.clearTimeout(t);
  }, [toastBanner]);

  const [appMode, setAppMode] = useState<'custom_build' | 'template_demo'>('custom_build');

  // Trạng thái mạch điện
  const [wires, setWires] = useState<BananaWire[]>([]);
  const [switchClosed, setSwitchClosed] = useState<boolean>(false);
  const [rheostatOhm, setRheostatOhm] = useState<number>(6.0);

  // Dây cắm bắp chuối
  const [wireColor, setWireColor] = useState<'red' | 'blue'>('red');
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null);
  const [hoveredTerminal, setHoveredTerminal] = useState<string | null>(null);

  // Hiển thị thông tin trực tiếp trên từng thiết bị 3D
  const [showDeviceOverlays, setShowDeviceOverlays] = useState<boolean>(true);
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);

  // Vật phẩm đang mở trục Chuột Phải
  const [gizmoTargetId, setGizmoTargetId] = useState<WorkbenchItemId | null>(null);
  const gizmoTargetRef = useRef<WorkbenchItemId | null>(null);
  useEffect(() => {
    gizmoTargetRef.current = gizmoTargetId;
  }, [gizmoTargetId]);

  // Vật phẩm được Nhấp Đúp Chuột (Double-click)
  const [inspectedItem, setInspectedItem] = useState<EquipmentDetailedSpec | null>(null);

  const [showWirePopover, setShowWirePopover] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Nội dung Bảng Đen do người dùng tự nhập
  const [showBlackboardModal, setShowBlackboardModal] = useState<boolean>(false);
  const [boardTitle, setBoardTitle] = useState<string>(
    'PHÒNG THÍ NGHIỆM VẬT LÝ — MẠCH ĐIỆN MỘT CHIỀU'
  );
  const [boardContent, setBoardContent] = useState<string>(
    'Định luật Ôm: I = U / R     •     Công suất: P = U · I = I² · R\nGhép nối tiếp 2 nguồn: E_bộ = E1 + E2  (Nối cực + pin này với cực - pin kia)'
  );
  const [boardChalkColor, setBoardChalkColor] = useState<'white' | 'yellow' | 'cyan' | 'green'>(
    'white'
  );

  // Kiểm tra các ngăn pin trên bàn có viên pin thực sự đang gắn bên trong không
  const effectiveBat1 =
    !inCabinetMap.battery_holder &&
    !inUnderCabinetMap.battery_holder &&
    slot1Occupant !== null &&
    !inCabinetMap[slot1Occupant] &&
    !inUnderCabinetMap[slot1Occupant];
  const effectiveBat2 =
    !inCabinetMap.battery_holder &&
    !inUnderCabinetMap.battery_holder &&
    slot2Occupant !== null &&
    !inCabinetMap[slot2Occupant] &&
    !inUnderCabinetMap[slot2Occupant];
  const effectiveSingleBat1 =
    !inCabinetMap.single_battery_holder_1 &&
    !inUnderCabinetMap.single_battery_holder_1 &&
    singleSlot1Occupant !== null &&
    !inCabinetMap[singleSlot1Occupant] &&
    !inUnderCabinetMap[singleSlot1Occupant];
  const effectiveSingleBat2 =
    !inCabinetMap.single_battery_holder_2 &&
    !inUnderCabinetMap.single_battery_holder_2 &&
    singleSlot2Occupant !== null &&
    !inCabinetMap[singleSlot2Occupant] &&
    !inUnderCabinetMap[singleSlot2Occupant];

  const activeWires = useMemo(() => {
    return wires.filter((w) => {
      const devA = dynamicTerminalToItem[w.from];
      const devB = dynamicTerminalToItem[w.to];
      return (
        devA &&
        devB &&
        !inCabinetMap[devA] &&
        !inCabinetMap[devB] &&
        !inUnderCabinetMap[devA] &&
        !inUnderCabinetMap[devB]
      );
    });
  }, [wires, inCabinetMap, inUnderCabinetMap, dynamicTerminalToItem]);

  const solution = useMemo(
    () =>
      solveElectricalCircuit({
        wires: activeWires,
        switchClosed:
          !inCabinetMap.knife_switch && !inUnderCabinetMap.knife_switch
            ? switchClosed
            : false,
        rheostatOhm,
        battery1Inserted: effectiveBat1,
        battery2Inserted: effectiveBat2,
        singleBattery1Inserted: effectiveSingleBat1,
        singleBattery2Inserted: effectiveSingleBat2,
      }),
    [
      activeWires,
      switchClosed,
      rheostatOhm,
      effectiveBat1,
      effectiveBat2,
      effectiveSingleBat1,
      effectiveSingleBat2,
      inCabinetMap,
      inUnderCabinetMap,
    ]
  );

  const playSound = useCallback((action: string, val?: number | boolean) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      window.OL3D_EQUIPMENT_MODULE?.playEquipmentSound(
        action,
        val,
        audioCtxRef.current || undefined
      );
    } catch {
      // Ignore audio policy errors
    }
  }, []);

  const getEquipmentObject = useCallback((id: WorkbenchItemId): THREE.Object3D | null => {
    const root = equipmentRootRef.current;
    if (!root) return null;
    const spec = allCatalogRef.current.find((s) => s.id === id);
    if (!spec) return null;
    return root.getObjectByName(spec.nodeName) || null;
  }, []);

  // Hàm đồng bộ vị trí & góc xoay của viên pin đang gắn trong Giá đỡ 2 pin hoặc 2 Giá đỡ 1 pin:
  // Chiều ngang theo chiều ngang, chiều dọc theo chiều dọc, di chuyển và nâng hạ cùng Giá đỡ pin!
  const syncInsertedBatteriesToHolder = useCallback(() => {
    const holderObj = getEquipmentObject('battery_holder');
    if (holderObj) {
      const s1 = slot1OccupantRef.current;
      if (s1 && !inCabinetRef.current[s1]) {
        const bat1Obj = getEquipmentObject(s1);
        if (bat1Obj) {
          const offset1 = new THREE.Vector3(0, 0, -0.022).applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            holderObj.rotation.y
          );
          bat1Obj.position.copy(holderObj.position).add(offset1);
          // Ngăn 1 có cực (+) bên trái (-X): chỉ battery_cell_2 có núm (+) ở +X, còn lại (#1, #3, #4) đều có núm (+) ở -X
          bat1Obj.rotation.y =
            s1 !== 'battery_cell_2' ? holderObj.rotation.y : holderObj.rotation.y + Math.PI;
        }
      }

      const s2 = slot2OccupantRef.current;
      if (s2 && !inCabinetRef.current[s2]) {
        const bat2Obj = getEquipmentObject(s2);
        if (bat2Obj) {
          const offset2 = new THREE.Vector3(0, 0, 0.022).applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            holderObj.rotation.y
          );
          bat2Obj.position.copy(holderObj.position).add(offset2);
          // Ngăn 2 có cực (+) bên phải (+X): battery_cell_2 có núm (+) ở +X, còn lại (#1, #3, #4) có núm (+) ở -X
          bat2Obj.rotation.y =
            s2 === 'battery_cell_2' ? holderObj.rotation.y : holderObj.rotation.y + Math.PI;
        }
      }
    }

    const single1Obj = getEquipmentObject('single_battery_holder_1');
    const ss1 = singleSlot1OccupantRef.current;
    if (single1Obj && ss1 && !inCabinetRef.current[ss1]) {
      const batObj = getEquipmentObject(ss1);
      if (batObj) {
        batObj.position.copy(single1Obj.position);
        batObj.rotation.y =
          ss1 !== 'battery_cell_2' ? single1Obj.rotation.y : single1Obj.rotation.y + Math.PI;
      }
    }

    const single2Obj = getEquipmentObject('single_battery_holder_2');
    const ss2 = singleSlot2OccupantRef.current;
    if (single2Obj && ss2 && !inCabinetRef.current[ss2]) {
      const batObj = getEquipmentObject(ss2);
      if (batObj) {
        batObj.position.copy(single2Obj.position);
        batObj.rotation.y =
          ss2 !== 'battery_cell_2' ? single2Obj.rotation.y : single2Obj.rotation.y + Math.PI;
      }
    }
  }, [getEquipmentObject]);

  // Hàm kiểm tra và đẩy chống xuyên thấu ("ruột đặc") giữa các vật phẩm
  const resolveSolidCollisions = useCallback(
    (movingId: WorkbenchItemId) => {
      const movingObj = getEquipmentObject(movingId);
      const movingSpec = allCatalogRef.current.find((s) => s.id === movingId);
      if (!movingObj || !movingSpec) return;

      const isMovingBattery = isBatteryCellId(movingId);
      const isAnyBatteryHolder = (id: WorkbenchItemId) =>
        id === 'battery_holder' ||
        id === 'single_battery_holder_1' ||
        id === 'single_battery_holder_2';
      const isSeatedBattery = (id: WorkbenchItemId) =>
        id === slot1OccupantRef.current ||
        id === slot2OccupantRef.current ||
        id === singleSlot1OccupantRef.current ||
        id === singleSlot2OccupantRef.current;

      // Lấy bán kính bao hiệu dụng theo góc xoay hiện tại
      const getEffectiveHalfExtents = (
        spec: EquipmentDetailedSpec,
        rotY: number
      ): [number, number] => {
        const c = Math.abs(Math.cos(rotY));
        const s = Math.abs(Math.sin(rotY));
        return [
          spec.solidHalfW * c + spec.solidHalfD * s,
          spec.solidHalfW * s + spec.solidHalfD * c,
        ];
      };

      for (let iter = 0; iter < 3; iter++) {
        const [mHalfX, mHalfZ] = getEffectiveHalfExtents(
          movingSpec,
          movingObj.rotation.y
        );

        allCatalogRef.current.forEach((otherSpec) => {
          if (otherSpec.id === movingId) return;

          // Cho phép viên pin đi vào các Giá đỡ pin để lắp vào ngăn
          if (isMovingBattery && isAnyBatteryHolder(otherSpec.id)) return;
          if (isAnyBatteryHolder(movingId) && isSeatedBattery(otherSpec.id)) {
            return;
          }
          // Bỏ qua các viên pin đang nằm trong Giá đỡ pin khi xét va chạm với thiết bị khác
          if (!isMovingBattery && isSeatedBattery(otherSpec.id)) {
            return;
          }

          const otherObj = getEquipmentObject(otherSpec.id);
          if (!otherObj || !otherObj.visible) return;

          // Kiểm tra giao nhau theo chiều cao Y
          const mBottom = movingObj.position.y;
          const mTop = mBottom + movingSpec.solidHeight;
          const oBottom = otherObj.position.y;
          const oTop = oBottom + otherSpec.solidHeight;
          if (mTop <= oBottom + 0.004 || mBottom >= oTop - 0.004) return;

          const [oHalfX, oHalfZ] = getEffectiveHalfExtents(
            otherSpec,
            otherObj.rotation.y
          );
          const minDistX = mHalfX + oHalfX + 0.006;
          const minDistZ = mHalfZ + oHalfZ + 0.006;

          const dx = movingObj.position.x - otherObj.position.x;
          const dz = movingObj.position.z - otherObj.position.z;
          const overlapX = minDistX - Math.abs(dx);
          const overlapZ = minDistZ - Math.abs(dz);

          if (overlapX > 0 && overlapZ > 0) {
            if (overlapX < overlapZ) {
              const signX = dx >= 0 ? 1 : -1;
              movingObj.position.x += signX * overlapX;
            } else {
              const signZ = dz >= 0 ? 1 : -1;
              movingObj.position.z += signZ * overlapZ;
            }
          }
        });
      }

      if (isAnyBatteryHolder(movingId)) {
        syncInsertedBatteriesToHolder();
      }
    },
    [getEquipmentObject, syncInsertedBatteriesToHolder]
  );

  // Kích hoạt rơi tự do (Gravity Drop) khi nhấp chuột ra ngoài
  const triggerGravityFallForAll = useCallback(() => {
    allCatalogRef.current.forEach((spec) => {
      if (inUnderCabinetRef.current[spec.id]) return;
      // Nếu viên pin đang gắn trong Giá đỡ pin thì rơi theo Giá đỡ pin
      if (
        spec.id === slot1OccupantRef.current ||
        spec.id === slot2OccupantRef.current ||
        spec.id === singleSlot1OccupantRef.current ||
        spec.id === singleSlot2OccupantRef.current
      ) {
        return;
      }
      const obj = getEquipmentObject(spec.id);
      if (!obj || !obj.visible) return;
      if (!physicsRef.current[spec.id]) {
        physicsRef.current[spec.id] = { vy: 0, falling: false, restingY: 0 };
      }
      const inCab = inCabinetRef.current[spec.id];
      const onShelf = onSideShelfRef.current[spec.id];
      // Nếu đang ở trong kệ tủ kính hoặc kệ gỗ 2 bên, rơi xuống đúng bề mặt bên dưới
      const restY = inCab
        ? obj.position.y >= 0.19
          ? 0.222
          : 0.024
        : onShelf
        ? obj.position.y >= 0.2 && obj.position.z <= -0.22
          ? 0.26
          : 0.0
        : 0;
      physicsRef.current[spec.id].restingY = restY;
      if (obj.position.y > restY + 0.002) {
        physicsRef.current[spec.id].falling = true;
      }
    });
  }, [getEquipmentObject]);

  // Hàm đưa Camera mượt mà về góc nhìn tổng thể ban đầu (khi nhấp đúp vào mặt bàn hoặc bấm nút Góc nhìn chuẩn)
  const resetCameraToOverview = useCallback(() => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    cameraResetAnimRef.current = {
      active: true,
      startTime: performance.now(),
      durationMs: 520,
      fromPos: cam.position.clone(),
      toPos: new THREE.Vector3(...DEFAULT_CAMERA_POS),
      fromTarget: ctrl.target.clone(),
      toTarget: new THREE.Vector3(...DEFAULT_CAMERA_TARGET),
    };
    playSound('plug');
    showToast('Đã đưa góc nhìn về vị trí tổng thể ban đầu');
  }, [playSound, showToast]);

  // Tìm vị trí trống ngay ngắn trên kệ gỗ 2 bên (ưu tiên đúng bên kệ `preferredSide` nếu được truyền vào)
  const findFreeSideShelfSlot = useCallback(
    (
      excludeId?: WorkbenchItemId,
      preferredSide?: 'left' | 'right'
    ): { x: number; y: number; z: number; side: 'left' | 'right' } | null => {
      const orderedSlots = preferredSide
        ? [
            ...SIDE_SHELF_SLOTS.filter((s) => s.side === preferredSide),
            ...SIDE_SHELF_SLOTS.filter((s) => s.side !== preferredSide),
          ]
        : SIDE_SHELF_SLOTS;

      for (const slot of orderedSlots) {
        let occupied = false;
        for (const spec of allCatalogRef.current) {
          if (spec.id === excludeId) continue;
          if (inUnderCabinetRef.current[spec.id] || inCabinetRef.current[spec.id]) continue;
          const obj = getEquipmentObject(spec.id);
          if (!obj || !obj.visible) continue;
          const dx = Math.abs(obj.position.x - slot.x);
          const dy = Math.abs(obj.position.y - slot.y);
          const dz = Math.abs(obj.position.z - slot.z);
          if (dx < 0.13 && dy < 0.12 && dz < 0.13) {
            occupied = true;
            break;
          }
        }
        if (!occupied) {
          return { x: slot.x, y: slot.y, z: slot.z, side: slot.side };
        }
      }
      return null;
    },
    [getEquipmentObject]
  );

  // Cất một vật phẩm vào Tủ Vật Phẩm Trái ('left') hoặc Tủ Vật Phẩm Phải ('right') — 2 tủ hoàn toàn riêng biệt
  const storeItemInUnderCabinet = useCallback(
    (id: WorkbenchItemId, side: 'left' | 'right' = 'left', silent?: boolean) => {
      const spec = allCatalogRef.current.find((s) => s.id === id);
      const obj = getEquipmentObject(id);
      if (obj) {
        obj.visible = false;
      }
      if (physicsRef.current[id]) {
        physicsRef.current[id].falling = false;
        physicsRef.current[id].vy = 0;
      }
      setCabinetStorageSideMap((prev) => ({ ...prev, [id]: side }));
      setInUnderCabinetMap((prev) => ({ ...prev, [id]: true }));
      setInCabinetMap((prev) => ({ ...prev, [id]: false }));
      setOnSideShelfMap((prev) => ({ ...prev, [id]: false }));
      cabinetStorageSideRef.current = { ...cabinetStorageSideRef.current, [id]: side };
      inUnderCabinetRef.current = { ...inUnderCabinetRef.current, [id]: true };
      inCabinetRef.current = { ...inCabinetRef.current, [id]: false };
      onSideShelfRef.current = { ...onSideShelfRef.current, [id]: false };

      setWires((prev) =>
        prev.filter(
          (w) =>
            allTerminalToItemRef.current[w.from] !== id &&
            allTerminalToItemRef.current[w.to] !== id
        )
      );
      if (slot1OccupantRef.current === id) {
        slot1OccupantRef.current = null;
        setSlot1Occupant(null);
      }
      if (slot2OccupantRef.current === id) {
        slot2OccupantRef.current = null;
        setSlot2Occupant(null);
      }
      if (singleSlot1OccupantRef.current === id) {
        singleSlot1OccupantRef.current = null;
        setSingleSlot1Occupant(null);
      }
      if (singleSlot2OccupantRef.current === id) {
        singleSlot2OccupantRef.current = null;
        setSingleSlot2Occupant(null);
      }
      if (id === 'battery_holder') {
        slot1OccupantRef.current = null;
        slot2OccupantRef.current = null;
        setSlot1Occupant(null);
        setSlot2Occupant(null);
      }
      if (id === 'single_battery_holder_1') {
        singleSlot1OccupantRef.current = null;
        setSingleSlot1Occupant(null);
      }
      if (id === 'single_battery_holder_2') {
        singleSlot2OccupantRef.current = null;
        setSingleSlot2Occupant(null);
      }
      if (gizmoTargetRef.current === id) {
        setGizmoTargetId(null);
      }
      if (!silent) {
        playSound('plug');
        const cabLabel = side === 'left' ? 'Tủ Vật Phẩm Trái' : 'Tủ Vật Phẩm Phải';
        showToast(`Đã cất "${spec?.name || id}" vào ${cabLabel}`);
      }
    },
    [getEquipmentObject, playSound, showToast]
  );

  // Đặt vật phẩm lên Kệ ở trên của Tủ đó (Kệ Trái cho Tủ Trái, Kệ Phải cho Tủ Phải)
  const placeItemOnSideShelf = useCallback(
    (id: WorkbenchItemId, preferredSide?: 'left' | 'right', silent?: boolean): boolean => {
      const spec = allCatalogRef.current.find((s) => s.id === id);
      const obj = getEquipmentObject(id);
      if (!spec || !obj) return false;

      const freeSlot = findFreeSideShelfSlot(id, preferredSide);
      if (!freeSlot) {
        const targetSide = preferredSide || 'left';
        storeItemInUnderCabinet(id, targetSide, true);
        if (!silent) {
          playSound('plug');
          const cabLabel = targetSide === 'left' ? 'Tủ Vật Phẩm Trái' : 'Tủ Vật Phẩm Phải';
          showToast(`Kệ đã đầy! "${spec.name}" đã được cất vào ${cabLabel}.`);
        }
        return false;
      }

      obj.visible = true;
      obj.position.set(freeSlot.x, freeSlot.y, freeSlot.z);
      obj.rotation.set(0, 0, 0);

      if (!physicsRef.current[id]) {
        physicsRef.current[id] = { vy: 0, falling: false, restingY: freeSlot.y };
      } else {
        physicsRef.current[id].falling = false;
        physicsRef.current[id].vy = 0;
        physicsRef.current[id].restingY = freeSlot.y;
      }

      setCabinetStorageSideMap((prev) => ({ ...prev, [id]: null }));
      setInUnderCabinetMap((prev) => ({ ...prev, [id]: false }));
      setInCabinetMap((prev) => ({ ...prev, [id]: false }));
      setOnSideShelfMap((prev) => ({ ...prev, [id]: true }));
      cabinetStorageSideRef.current = { ...cabinetStorageSideRef.current, [id]: null };
      inUnderCabinetRef.current = { ...inUnderCabinetRef.current, [id]: false };
      inCabinetRef.current = { ...inCabinetRef.current, [id]: false };
      onSideShelfRef.current = { ...onSideShelfRef.current, [id]: true };

      resolveSolidCollisions(id);
      if (!silent) {
        playSound('plug');
        const shelfLabel = freeSlot.side === 'left' ? 'Kệ bên trái' : 'Kệ bên phải';
        showToast(`Đã đặt "${spec.name}" lên ${shelfLabel}`);
      }
      return true;
    },
    [
      getEquipmentObject,
      findFreeSideShelfSlot,
      storeItemInUnderCabinet,
      resolveSolidCollisions,
      playSound,
      showToast,
    ]
  );

  // Đặt một vật phẩm vào Kệ kính 2 tầng (chọn tầng bất kỳ) hoặc lấy ra bàn 2.0m × 1.0m
  const moveItemBetweenTableAndCabinet = useCallback(
    (id: WorkbenchItemId, toCabinet: boolean, customTierY?: number) => {
      const spec = allCatalogRef.current.find((s) => s.id === id);
      const obj = getEquipmentObject(id);
      if (!spec || !obj) return;

      if (!physicsRef.current[id]) {
        physicsRef.current[id] = { vy: 0, falling: false, restingY: 0 };
      }

      obj.visible = true;
      setCabinetStorageSideMap((prev) => ({ ...prev, [id]: null }));
      setInUnderCabinetMap((prev) => ({ ...prev, [id]: false }));
      setOnSideShelfMap((prev) => ({ ...prev, [id]: false }));
      setInCabinetMap((prev) => ({ ...prev, [id]: toCabinet }));
      cabinetStorageSideRef.current = { ...cabinetStorageSideRef.current, [id]: null };
      inUnderCabinetRef.current = { ...inUnderCabinetRef.current, [id]: false };
      onSideShelfRef.current = { ...onSideShelfRef.current, [id]: false };
      inCabinetRef.current = { ...inCabinetRef.current, [id]: toCabinet };

      physicsRef.current[id].falling = false;
      physicsRef.current[id].vy = 0;

      if (toCabinet) {
        const targetTierY =
          customTierY !== undefined ? customTierY : spec.cabinetSlotPos[1];
        obj.position.set(
          spec.cabinetSlotPos[0],
          targetTierY,
          spec.cabinetSlotPos[2]
        );
        obj.rotation.set(0, 0, 0);
        physicsRef.current[id].restingY = targetTierY;
        resolveSolidCollisions(id);
        setWires((prev) =>
          prev.filter(
            (w) =>
              allTerminalToItemRef.current[w.from] !== id &&
              allTerminalToItemRef.current[w.to] !== id
          )
        );
        if (slot1OccupantRef.current === id) setSlot1Occupant(null);
        if (slot2OccupantRef.current === id) setSlot2Occupant(null);
        if (singleSlot1OccupantRef.current === id) setSingleSlot1Occupant(null);
        if (singleSlot2OccupantRef.current === id) setSingleSlot2Occupant(null);
        if (id === 'battery_holder') {
          setSlot1Occupant(null);
          setSlot2Occupant(null);
        }
        if (id === 'single_battery_holder_1') {
          setSingleSlot1Occupant(null);
        }
        if (id === 'single_battery_holder_2') {
          setSingleSlot2Occupant(null);
        }
      } else {
        // Nếu là vật phẩm .HTML mới nạp có tableDefaultPos trên kệ 2 bên nhưng người dùng bấm "Đưa ra bàn chính", đặt lên vùng trống trên bàn chính
        const isDefaultOnSideShelf = Math.abs(spec.tableDefaultPos[0]) > 1.02;
        const targetX = isDefaultOnSideShelf ? 0.62 : spec.tableDefaultPos[0];
        const targetZ = isDefaultOnSideShelf ? 0.18 : spec.tableDefaultPos[2];
        obj.position.set(targetX, 0, targetZ);
        physicsRef.current[id].restingY = 0;
        resolveSolidCollisions(id);
      }

      if (gizmoTargetRef.current === id) {
        setGizmoTargetId(null);
      }
      playSound('plug');
    },
    [getEquipmentObject, resolveSolidCollisions, playSound]
  );

  // Cất toàn bộ vật phẩm vào Tủ Kính 2 tầng
  const putAllIntoCabinet = useCallback(() => {
    setAppMode('custom_build');
    setWires([]);
    setSwitchClosed(false);
    setSelectedTerminal(null);
    setGizmoTargetId(null);
    setSlot1Occupant(null);
    setSlot2Occupant(null);
    setSingleSlot1Occupant(null);
    setSingleSlot2Occupant(null);
    slot1OccupantRef.current = null;
    slot2OccupantRef.current = null;
    singleSlot1OccupantRef.current = null;
    singleSlot2OccupantRef.current = null;

    const nextMap: Record<WorkbenchItemId, boolean> = {};
    const nextFalseMap: Record<WorkbenchItemId, boolean> = {};
    const nextNullSideMap: Record<WorkbenchItemId, 'left' | 'right' | null> = {};
    allCatalogRef.current.forEach((spec) => {
      nextMap[spec.id] = true;
      nextFalseMap[spec.id] = false;
      nextNullSideMap[spec.id] = null;
    });
    setInCabinetMap(nextMap);
    setInUnderCabinetMap(nextFalseMap);
    setCabinetStorageSideMap(nextNullSideMap);
    setOnSideShelfMap(nextFalseMap);
    inCabinetRef.current = nextMap;
    inUnderCabinetRef.current = nextFalseMap;
    cabinetStorageSideRef.current = nextNullSideMap;
    onSideShelfRef.current = nextFalseMap;

    allCatalogRef.current.forEach((spec) => {
      const obj = getEquipmentObject(spec.id);
      if (obj) {
        obj.visible = true;
        obj.position.set(
          spec.cabinetSlotPos[0],
          spec.cabinetSlotPos[1],
          spec.cabinetSlotPos[2]
        );
        obj.rotation.set(0, 0, 0);
        physicsRef.current[spec.id] = {
          vy: 0,
          falling: false,
          restingY: spec.cabinetSlotPos[1],
        };
      }
    });
    playSound('switch', false);
  }, [getEquipmentObject, playSound]);

  // Đưa toàn bộ vật phẩm từ Kệ Kính ra Mặt bàn 2.0m × 1.0m (chưa nối dây, giữ nguyên trạng thái công tắc)
  const placeAllOnTableUnwired = useCallback(() => {
    setAppMode('custom_build');
    setWires([]);
    setSelectedTerminal(null);
    setGizmoTargetId(null);
    setSlot1Occupant('battery_cell_1');
    setSlot2Occupant('battery_cell_2');
    setSingleSlot1Occupant(null);
    setSingleSlot2Occupant(null);
    slot1OccupantRef.current = 'battery_cell_1';
    slot2OccupantRef.current = 'battery_cell_2';
    singleSlot1OccupantRef.current = null;
    singleSlot2OccupantRef.current = null;

    const nextMap: Record<WorkbenchItemId, boolean> = {};
    const nextShelfMap: Record<WorkbenchItemId, boolean> = {};
    const nextNullSideMap: Record<WorkbenchItemId, 'left' | 'right' | null> = {};
    allCatalogRef.current.forEach((spec) => {
      nextMap[spec.id] = false;
      nextShelfMap[spec.id] = Math.abs(spec.tableDefaultPos[0]) > 1.02;
      nextNullSideMap[spec.id] = null;
    });
    setInCabinetMap(nextMap);
    setInUnderCabinetMap(nextMap);
    setCabinetStorageSideMap(nextNullSideMap);
    setOnSideShelfMap(nextShelfMap);
    inCabinetRef.current = nextMap;
    inUnderCabinetRef.current = nextMap;
    cabinetStorageSideRef.current = nextNullSideMap;
    onSideShelfRef.current = nextShelfMap;

    allCatalogRef.current.forEach((spec) => {
      const obj = getEquipmentObject(spec.id);
      if (obj) {
        obj.visible = true;
        obj.position.set(
          spec.tableDefaultPos[0],
          spec.tableDefaultPos[1],
          spec.tableDefaultPos[2]
        );
        obj.rotation.set(0, 0, 0);
        physicsRef.current[spec.id] = {
          vy: 0,
          falling: false,
          restingY: spec.tableDefaultPos[1],
        };
      }
    });
    syncInsertedBatteriesToHolder();
    playSound('plug');
  }, [getEquipmentObject, syncInsertedBatteriesToHolder, playSound]);

  // Chuyển sang Mục Phụ: Bản mẫu mạch điện nối tiếp hoạt động ngay
  const activateReferenceTemplateMode = useCallback(() => {
    setAppMode('template_demo');
    setSelectedTerminal(null);
    setGizmoTargetId(null);
    setSlot1Occupant('battery_cell_1');
    setSlot2Occupant('battery_cell_2');
    setSingleSlot1Occupant(null);
    setSingleSlot2Occupant(null);
    slot1OccupantRef.current = 'battery_cell_1';
    slot2OccupantRef.current = 'battery_cell_2';
    singleSlot1OccupantRef.current = null;
    singleSlot2OccupantRef.current = null;
    setRheostatOhm(4.0);
    setSwitchClosed(true);

    const nextMap: Record<WorkbenchItemId, boolean> = {};
    const nextShelfMap: Record<WorkbenchItemId, boolean> = {};
    const nextNullSideMap: Record<WorkbenchItemId, 'left' | 'right' | null> = {};
    allCatalogRef.current.forEach((spec) => {
      nextMap[spec.id] = false;
      nextShelfMap[spec.id] = Math.abs(spec.tableDefaultPos[0]) > 1.02;
      nextNullSideMap[spec.id] = null;
    });
    setInCabinetMap(nextMap);
    setInUnderCabinetMap(nextMap);
    setCabinetStorageSideMap(nextNullSideMap);
    setOnSideShelfMap(nextShelfMap);
    inCabinetRef.current = nextMap;
    inUnderCabinetRef.current = nextMap;
    cabinetStorageSideRef.current = nextNullSideMap;
    onSideShelfRef.current = nextShelfMap;

    allCatalogRef.current.forEach((spec) => {
      const obj = getEquipmentObject(spec.id);
      if (obj) {
        obj.visible = true;
        obj.position.set(
          spec.tableDefaultPos[0],
          spec.tableDefaultPos[1],
          spec.tableDefaultPos[2]
        );
        obj.rotation.set(0, 0, 0);
        physicsRef.current[spec.id] = {
          vy: 0,
          falling: false,
          restingY: spec.tableDefaultPos[1],
        };
      }
    });

    syncInsertedBatteriesToHolder();
    setWires(DEFAULT_SERIES_WIRES);
    playSound('switch', true);
  }, [getEquipmentObject, syncInsertedBatteriesToHolder, playSound]);

  // Lưu trạng thái thí nghiệm vào localStorage để khi truy cập lại không bị reset
  const handleSaveExperiment = useCallback(() => {
    try {
      const itemTransforms: Record<
        WorkbenchItemId,
        { pos: [number, number, number]; rotY: number }
      > = {};
      allCatalogRef.current.forEach((spec) => {
        const obj = getEquipmentObject(spec.id);
        if (obj) {
          itemTransforms[spec.id] = {
            pos: [
              Number(obj.position.x.toFixed(4)),
              Number(obj.position.y.toFixed(4)),
              Number(obj.position.z.toFixed(4)),
            ],
            rotY: Number(obj.rotation.y.toFixed(4)),
          };
        }
      });

      const cam = cameraRef.current;
      const ctrl = controlsRef.current;
      const now = Date.now();
      const payload: SavedExperimentState = {
        version: 1,
        savedAt: now,
        appMode,
        wires,
        switchClosed,
        rheostatOhm,
        slot1Occupant,
        slot2Occupant,
        singleSlot1Occupant,
        singleSlot2Occupant,
        inCabinetMap: inCabinetRef.current,
        inUnderCabinetMap: inUnderCabinetRef.current,
        cabinetStorageSideMap: cabinetStorageSideRef.current,
        onSideShelfMap: onSideShelfRef.current,
        customDeviceValues: customDeviceValuesRef.current,
        itemTransforms,
        boardTitle,
        boardContent,
        boardChalkColor,
        cameraPos: cam
          ? [
              Number(cam.position.x.toFixed(4)),
              Number(cam.position.y.toFixed(4)),
              Number(cam.position.z.toFixed(4)),
            ]
          : undefined,
        controlsTarget: ctrl
          ? [
              Number(ctrl.target.x.toFixed(4)),
              Number(ctrl.target.y.toFixed(4)),
              Number(ctrl.target.z.toFixed(4)),
            ]
          : undefined,
      };
      localStorage.setItem(SAVED_EXPERIMENT_STORAGE_KEY, JSON.stringify(payload));
      setLastSavedAt(now);
      playSound('plug');
      showToast('Đã lưu thí nghiệm! Khi truy cập lại sẽ giữ nguyên trạng thái hiện tại.');
    } catch {
      showToast('Không thể lưu thí nghiệm vào bộ nhớ trình duyệt.');
    }
  }, [
    appMode,
    wires,
    switchClosed,
    rheostatOhm,
    slot1Occupant,
    slot2Occupant,
    singleSlot1Occupant,
    singleSlot2Occupant,
    boardTitle,
    boardContent,
    boardChalkColor,
    getEquipmentObject,
    playSound,
    showToast,
  ]);

  // Vẽ dây cắm bắp chuối 3D CÓ TRÁNH VẬT CẢN ("vòng dây qua" chứ không xuyên qua ruột thiết bị)
  const rebuild3DWires = useCallback((currentWires: BananaWire[]) => {
    const root = equipmentRootRef.current;
    const wireGroup = wireGroupRef.current;
    if (!root || !wireGroup) return;

    while (wireGroup.children.length > 0) {
      const child = wireGroup.children[0] as THREE.Mesh;
      wireGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    root.updateMatrixWorld(true);
    const rootInv = new THREE.Matrix4().copy(root.matrixWorld).invert();

    const redWireMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.35,
      metalness: 0.06,
    });
    const blueWireMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.35,
      metalness: 0.06,
    });
    const brassTipMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.18,
      metalness: 0.92,
    });

    // Thu thập danh sách các khối đặc (bounding boxes) của thiết bị trên bàn để dây tự động vòng qua
    interface ObstacleBox {
      id: WorkbenchItemId;
      cx: number;
      cz: number;
      bottomY: number;
      topY: number;
      halfX: number;
      halfZ: number;
    }
    const obstacles: ObstacleBox[] = [];
    allCatalogRef.current.forEach((spec) => {
      if (spec.id === 'battery_cell_1' || spec.id === 'battery_cell_2') return;
      if (inCabinetRef.current[spec.id]) return;
      const obj = root.getObjectByName(spec.nodeName);
      if (!obj || !obj.visible) return;
      const c = Math.abs(Math.cos(obj.rotation.y));
      const s = Math.abs(Math.sin(obj.rotation.y));
      obstacles.push({
        id: spec.id,
        cx: obj.position.x,
        cz: obj.position.z,
        bottomY: obj.position.y,
        topY: obj.position.y + spec.solidHeight,
        halfX: spec.solidHalfW * c + spec.solidHalfD * s + 0.012,
        halfZ: spec.solidHalfW * s + spec.solidHalfD * c + 0.012,
      });
    });

    // Đẩy điểm điều khiển dây ra ngoài hoặc vòng qua trên/bên cạnh nếu chạm vào "ruột" thiết bị
    const pushWirePointAroundObstacles = (pt: THREE.Vector3) => {
      for (const ob of obstacles) {
        if (
          pt.x > ob.cx - ob.halfX &&
          pt.x < ob.cx + ob.halfX &&
          pt.z > ob.cz - ob.halfZ &&
          pt.z < ob.cz + ob.halfZ &&
          pt.y < ob.topY + 0.018
        ) {
          const distLeft = Math.abs(pt.x - (ob.cx - ob.halfX));
          const distRight = Math.abs(ob.cx + ob.halfX - pt.x);
          const distFront = Math.abs(ob.cz + ob.halfZ - pt.z);
          const distBack = Math.abs(pt.z - (ob.cz - ob.halfZ));
          const distTop = ob.topY + 0.022 - pt.y;

          const minSide = Math.min(distLeft, distRight, distFront, distBack);
          if (minSide < distTop * 1.15) {
            if (minSide === distLeft) pt.x = ob.cx - ob.halfX - 0.012;
            else if (minSide === distRight) pt.x = ob.cx + ob.halfX + 0.012;
            else if (minSide === distFront) pt.z = ob.cz + ob.halfZ + 0.012;
            else pt.z = ob.cz - ob.halfZ - 0.012;
          } else {
            pt.y = ob.topY + 0.024;
          }
        }
      }
      pt.y = Math.max(0.012, pt.y);
    };

    currentWires.forEach((w, idx) => {
      const termA =
        root.getObjectByName('terminal_' + w.from) || root.getObjectByName('term_' + w.from);
      const termB =
        root.getObjectByName('terminal_' + w.to) || root.getObjectByName('term_' + w.to);
      if (!termA || !termB) return;

      const worldA = new THREE.Vector3();
      const worldB = new THREE.Vector3();
      termA.getWorldPosition(worldA);
      termB.getWorldPosition(worldB);

      const pA = worldA.applyMatrix4(rootInv);
      const pB = worldB.applyMatrix4(rootInv);

      const dist = pA.distanceTo(pB);
      const arcHeight = Math.min(0.11, Math.max(0.036, dist * 0.28)) + (idx % 3) * 0.006;

      const p1 = pA.clone().add(new THREE.Vector3(0, 0.028, 0));
      const p2 = pA
        .clone()
        .lerp(pB, 0.28)
        .add(new THREE.Vector3(0, arcHeight, (idx % 2 === 0 ? 1 : -1) * 0.022));
      const pMid = pA
        .clone()
        .lerp(pB, 0.5)
        .add(new THREE.Vector3(0, arcHeight * 1.1, (idx % 2 === 0 ? 1 : -1) * 0.028));
      const p3 = pA
        .clone()
        .lerp(pB, 0.72)
        .add(new THREE.Vector3(0, arcHeight, (idx % 2 === 0 ? 1 : -1) * 0.022));
      const p4 = pB.clone().add(new THREE.Vector3(0, 0.028, 0));

      // Tránh xuyên qua bất kỳ thiết bị nào trên bàn
      pushWirePointAroundObstacles(p2);
      pushWirePointAroundObstacles(pMid);
      pushWirePointAroundObstacles(p3);

      const curve = new THREE.CatmullRomCurve3([pA, p1, p2, pMid, p3, p4, pB]);
      const tubeGeo = new THREE.TubeGeometry(curve, 44, 0.0024, 10, false);
      const mat = w.color === 'red' ? redWireMat : blueWireMat;
      const wireMesh = new THREE.Mesh(tubeGeo, mat);
      wireMesh.castShadow = true;
      wireMesh.userData = { wireId: w.id };
      wireGroup.add(wireMesh);

      [pA, pB].forEach((pos) => {
        const boot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0045, 0.004, 0.018, 14),
          mat
        );
        boot.position.copy(pos).add(new THREE.Vector3(0, 0.018, 0));
        wireGroup.add(boot);

        const pin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0022, 0.0022, 0.01, 12),
          brassTipMat
        );
        pin.position.copy(pos).add(new THREE.Vector3(0, 0.007, 0));
        wireGroup.add(pin);
      });
    });
  }, []);

  // Khởi tạo Cảnh 3D:
  // 1. Bàn thí nghiệm nằm ngang kích thước 2.0m (dài) × 1.0m (rộng), màu gỗ nâu tự nhiên không kẻ ô
  // 2. Tủ kính 2 tầng đối diện (không chia vách ngăn)
  // 3. Không gian xung quanh giống như một phòng thí nghiệm (bàn phụ, kệ tường, chai lọ hóa chất, bình tam giác... chỉ để tượng trưng)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131c2e);
    scene.fog = new THREE.FogExp2(0x131c2e, 0.075);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.01, 30);
    camera.position.set(...DEFAULT_CAMERA_POS);
    cameraRef.current = camera;

    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    const debugInfo = gl ? gl.getExtension('WEBGL_debug_renderer_info') : null;
    const rendererStr =
      gl && debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|Microsoft Basic Render/i.test(rendererStr);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.68);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.55);
    keyLight.position.set(1.2, 2.3, 1.4);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.camera.near = 0.2;
      keyLight.shadow.camera.far = 7.5;
      const d = 1.65;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    fillLight.position.set(-1.6, 1.3, -1.0);
    scene.add(fillLight);

    // =========================================================================
    // 1. BÀN THÍ NGHIỆM NẰM NGANG: DÀI 2.0m × RỘNG 1.0m, MÀU NÂU GỖ VỪA PHẢI (KHÔNG KẺ Ô)
    // =========================================================================
    const TABLE_LENGTH_X = 2.0; // Chiều dài 2.0m
    const TABLE_WIDTH_Z = 1.0; // Chiều rộng 1.0m
    const TABLE_THICKNESS = 0.05;
    const LEG_HEIGHT = 0.76;

    const labTableGroup = new THREE.Group();
    labTableGroup.name = 'lab_table_2m_x_1m';

    // Mặt bàn màu nâu tự nhiên (không quá nhạt, không quá đậm, không kẻ ô)
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 1024;
    woodCanvas.height = 512;
    const wctx = woodCanvas.getContext('2d')!;
    wctx.fillStyle = '#865432';
    wctx.fillRect(0, 0, 1024, 512);

    // Vân gỗ mịn tự nhiên
    for (let i = 0; i < 160; i++) {
      const y = (i / 160) * 512;
      wctx.fillStyle = i % 2 === 0 ? 'rgba(110, 66, 36, 0.16)' : 'rgba(156, 102, 62, 0.12)';
      wctx.fillRect(0, y, 1024, 2 + (i % 3));
    }

    const woodTex = new THREE.CanvasTexture(woodCanvas);
    woodTex.colorSpace = THREE.SRGBColorSpace;
    woodTex.anisotropy = 8;

    const tableTopMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.56,
      metalness: 0.05,
    });
    const tableEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x6e4224,
      roughness: 0.58,
      metalness: 0.06,
    });

    const tableTopMesh = new THREE.Mesh(
      new THREE.BoxGeometry(TABLE_LENGTH_X, TABLE_THICKNESS, TABLE_WIDTH_Z),
      [tableEdgeMat, tableEdgeMat, tableTopMat, tableEdgeMat, tableEdgeMat, tableEdgeMat]
    );
    tableTopMesh.position.set(0, -TABLE_THICKNESS / 2, 0);
    tableTopMesh.receiveShadow = true;
    tableTopMesh.name = 'table_top_surface';
    labTableGroup.add(tableTopMesh);

    const legMat = new THREE.MeshStandardMaterial({
      color: 0x5c371e,
      roughness: 0.55,
      metalness: 0.12,
    });
    const legOffsets: [number, number][] = [
      [-TABLE_LENGTH_X / 2 + 0.08, -TABLE_WIDTH_Z / 2 + 0.08],
      [TABLE_LENGTH_X / 2 - 0.08, -TABLE_WIDTH_Z / 2 + 0.08],
      [-TABLE_LENGTH_X / 2 + 0.08, TABLE_WIDTH_Z / 2 - 0.08],
      [TABLE_LENGTH_X / 2 - 0.08, TABLE_WIDTH_Z / 2 - 0.08],
    ];
    legOffsets.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.065, LEG_HEIGHT, 0.065), legMat);
      leg.position.set(lx, -TABLE_THICKNESS - LEG_HEIGHT / 2, lz);
      labTableGroup.add(leg);
    });

    scene.add(labTableGroup);
    labTableGroupRef.current = labTableGroup;

    // =========================================================================
    // 2. TỦ KÍNH 2 TẦNG ĐỐI DIỆN (KHÔNG CHIA VÁCH NGĂN, ĐỂ ĐỒ VÔ TRONG LÀ ĐƯỢC)
    // =========================================================================
    const cabinetGroup = new THREE.Group();
    cabinetGroup.name = 'glass_cabinet_2_tiers';
    const CABINET_Z = -0.68;
    const CABINET_W = 1.65;
    const CABINET_H = 0.44;
    const CABINET_D = 0.30;

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.28,
      roughness: 0.07,
      metalness: 0.05,
      ior: 1.5,
      clearcoat: 1.0,
      depthWrite: false,
    });
    const glassShelfMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.42,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
      clearcoat: 0.9,
    });
    const frameMetalMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.8,
    });

    // Chân đỡ tủ kính đối diện
    const cabStand = new THREE.Mesh(
      new THREE.BoxGeometry(CABINET_W, LEG_HEIGHT + TABLE_THICKNESS, CABINET_D),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55, metalness: 0.2 })
    );
    cabStand.position.set(0, -(LEG_HEIGHT + TABLE_THICKNESS) / 2, CABINET_Z);
    cabinetGroup.add(cabStand);

    // Tầng 1 (Đáy tủ kính: mặt đặt đồ y = 0.024m)
    const shelfTier1 = new THREE.Mesh(
      new THREE.BoxGeometry(CABINET_W, 0.016, CABINET_D),
      glassShelfMat
    );
    shelfTier1.position.set(0, 0.016, CABINET_Z);
    shelfTier1.receiveShadow = true;
    cabinetGroup.add(shelfTier1);

    // Tầng 2 (Kệ kính giữa suốt chiều dài không chia ngăn: mặt đặt đồ y = 0.222m)
    const shelfTier2 = new THREE.Mesh(
      new THREE.BoxGeometry(CABINET_W - 0.02, 0.014, CABINET_D - 0.01),
      glassShelfMat
    );
    shelfTier2.position.set(0, 0.215, CABINET_Z);
    shelfTier2.receiveShadow = true;
    cabinetGroup.add(shelfTier2);

    // Nóc kính của tủ
    const glassRoof = new THREE.Mesh(
      new THREE.BoxGeometry(CABINET_W, 0.014, CABINET_D),
      glassMat
    );
    glassRoof.position.set(0, CABINET_H, CABINET_Z);
    cabinetGroup.add(glassRoof);

    // Mặt kính lưng tủ và 2 bên hông
    const glassBack = new THREE.Mesh(
      new THREE.BoxGeometry(CABINET_W, CABINET_H, 0.01),
      glassMat
    );
    glassBack.position.set(0, CABINET_H / 2, CABINET_Z - CABINET_D / 2 + 0.005);
    cabinetGroup.add(glassBack);

    const glassLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, CABINET_H, CABINET_D),
      glassMat
    );
    glassLeft.position.set(-CABINET_W / 2 + 0.005, CABINET_H / 2, CABINET_Z);
    cabinetGroup.add(glassLeft);

    const glassRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, CABINET_H, CABINET_D),
      glassMat
    );
    glassRight.position.set(CABINET_W / 2 - 0.005, CABINET_H / 2, CABINET_Z);
    cabinetGroup.add(glassRight);

    // 4 trụ khung kim loại ở 4 góc tủ kính
    [
      [-CABINET_W / 2 + 0.012, -CABINET_D / 2 + 0.012],
      [CABINET_W / 2 - 0.012, -CABINET_D / 2 + 0.012],
      [-CABINET_W / 2 + 0.012, CABINET_D / 2 - 0.012],
      [CABINET_W / 2 - 0.012, CABINET_D / 2 - 0.012],
    ].forEach(([px, pz]) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, CABINET_H, 12),
        frameMetalMat
      );
      post.position.set(px, CABINET_H / 2, CABINET_Z + pz);
      cabinetGroup.add(post);
    });

    scene.add(cabinetGroup);

    // =========================================================================
    // 3. KHÔNG GIAN PHÒNG THÍ NGHIỆM XUNG QUANH (TƯỢNG TRƯNG, KHÔNG TƯƠNG TÁC)
    // =========================================================================
    const labDecorGroup = new THREE.Group();
    labDecorGroup.name = 'decorative_lab_environment';
    const FLOOR_Y = -TABLE_THICKNESS - LEG_HEIGHT;

    // Sàn phòng thí nghiệm lát gạch nhám
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.78, metalness: 0.06 })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = FLOOR_Y;
    floorMesh.receiveShadow = true;
    labDecorGroup.add(floorMesh);

    // Tường phòng thí nghiệm (Tường sau và 2 tường bên)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.02,
    });
    const backRoomWall = new THREE.Mesh(new THREE.BoxGeometry(9.0, 3.4, 0.08), wallMat);
    backRoomWall.position.set(0, FLOOR_Y + 1.7, -2.35);
    labDecorGroup.add(backRoomWall);

    const leftRoomWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.4, 7.0), wallMat);
    leftRoomWall.position.set(-4.2, FLOOR_Y + 1.7, 0);
    labDecorGroup.add(leftRoomWall);

    const rightRoomWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.4, 7.0), wallMat);
    rightRoomWall.position.set(4.2, FLOOR_Y + 1.7, 0);
    labDecorGroup.add(rightRoomWall);

    // Bảng viết phấn xanh trên tường sau phòng thí nghiệm (Người dùng có thể click vào để tự nhập nội dung)
    const blackboardGroup = new THREE.Group();
    blackboardGroup.name = 'interactive_blackboard_group';

    const boardFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.05, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x784928, roughness: 0.6 })
    );
    boardFrame.position.set(0, 0.98, -2.29);
    boardFrame.userData = { isBlackboard: true };
    blackboardGroup.add(boardFrame);

    const chalkCanvas = document.createElement('canvas');
    chalkCanvas.width = 1024;
    chalkCanvas.height = 384;
    chalkCanvasRef.current = chalkCanvas;

    const chalkTex = new THREE.CanvasTexture(chalkCanvas);
    chalkTex.colorSpace = THREE.SRGBColorSpace;
    chalkTextureRef.current = chalkTex;

    const chalkPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.48, 0.93),
      new THREE.MeshBasicMaterial({ map: chalkTex })
    );
    chalkPlane.position.set(0, 0.98, -2.265);
    chalkPlane.userData = { isBlackboard: true };
    blackboardGroup.add(chalkPlane);

    scene.add(blackboardGroup);
    blackboardGroupRef.current = blackboardGroup;

    // =========================================================================
    // 3B. HAI CHIẾC KỆ 2 BÊN (ĐÃ XÓA BỎ HẾT CHAI LỌ, ĐẶT VẬT PHẨM LÊN ĐƯỢC)
    //     KÈM TỦ ĐỰNG VẬT PHẨM DƯỚI KỆ 2 BÊN (NHẤP VÀO MỞ TRANG VẬT PHẨM / KÉO THẢ ĐỂ CẤT)
    // =========================================================================
    const sideShelvesGroup = new THREE.Group();
    sideShelvesGroup.name = 'interactive_side_shelves_group';
    const underCabinetsGroup = new THREE.Group();
    underCabinetsGroup.name = 'interactive_under_shelf_cabinets_group';

    const buildInteractiveSideUnit = (sideX: number, sideKey: 'left' | 'right') => {
      const unitZ = -0.1;
      const SHELF_W = 0.92;
      const SHELF_D = 0.68;

      // Nhóm kệ gỗ ở trên (Mặt kệ to tầng 1 y = 0.0m để đặt tự do bất kỳ đâu, và Kệ tầng 2 y = 0.26m ở phía trong)
      const shelfUnit = new THREE.Group();
      shelfUnit.position.set(sideX, 0, unitZ);
      shelfUnit.name = `side_shelf_${sideKey}`;

      // Mặt kệ to ở dưới (Tầng 1: y = 0.0m, rộng rãi để người dùng đặt vị trí nào cũng được)
      const lowerTop = new THREE.Mesh(
        new THREE.BoxGeometry(SHELF_W, 0.042, SHELF_D),
        new THREE.MeshStandardMaterial({
          map: woodTex,
          roughness: 0.54,
          metalness: 0.06,
        })
      );
      lowerTop.position.y = -0.021;
      lowerTop.receiveShadow = true;
      lowerTop.userData = { isSideShelfSurface: true, side: sideKey, tier: 'lower', surfaceY: 0.0 };
      shelfUnit.add(lowerTop);

      // Gờ viền mảnh chống rơi ở mép sau
      const backGuard = new THREE.Mesh(
        new THREE.BoxGeometry(SHELF_W, 0.026, 0.014),
        tableEdgeMat
      );
      backGuard.position.set(0, 0.013, -SHELF_D / 2 + 0.007);
      shelfUnit.add(backGuard);

      // Kệ gỗ tầng 2 (y = 0.26m, nằm gọn phía sau z cục bộ = -0.23 => z thế giới = -0.33, để mặt kệ dưới hoàn toàn thoáng rộng)
      const rackPostMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.35,
        metalness: 0.72,
      });
      const upperShelf = new THREE.Mesh(
        new THREE.BoxGeometry(SHELF_W - 0.04, 0.022, 0.2),
        new THREE.MeshStandardMaterial({
          map: woodTex,
          roughness: 0.52,
          metalness: 0.06,
        })
      );
      upperShelf.position.set(0, 0.249, -0.23);
      upperShelf.receiveShadow = true;
      upperShelf.castShadow = true;
      upperShelf.userData = {
        isSideShelfSurface: true,
        side: sideKey,
        tier: 'upper',
        surfaceY: 0.26,
      };
      shelfUnit.add(upperShelf);

      [-SHELF_W / 2 + 0.045, SHELF_W / 2 - 0.045].forEach((rx) => {
        [-0.31, -0.15].forEach((rz) => {
          const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.01, 0.01, 0.26, 12),
            rackPostMat
          );
          post.position.set(rx, 0.13, rz);
          shelfUnit.add(post);
        });
      });

      sideShelvesGroup.add(shelfUnit);

      // Nhóm TỦ VẬT PHẨM TRÁI / TỦ VẬT PHẨM PHẢI (2 tủ hoàn toàn riêng biệt)
      const cabGroup = new THREE.Group();
      cabGroup.position.set(sideX, 0, unitZ);
      cabGroup.name = `under_shelf_cabinet_${sideKey}`;
      cabGroup.userData = { isUnderShelfCabinet: true, side: sideKey };

      const cabBodyMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.58,
        metalness: 0.25,
      });
      const cabDoorMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.45,
        metalness: 0.32,
      });
      const cabTrimMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.35,
        metalness: 0.65,
      });

      const cabBody = new THREE.Mesh(
        new THREE.BoxGeometry(SHELF_W - 0.04, LEG_HEIGHT, SHELF_D - 0.04),
        cabBodyMat
      );
      cabBody.position.y = -0.042 - LEG_HEIGHT / 2;
      cabBody.receiveShadow = true;
      cabBody.userData = { isUnderShelfCabinet: true, side: sideKey };
      cabGroup.add(cabBody);

      // Hai cánh cửa tủ phía trước (+Z) kèm tay nắm kim loại
      const doorW = (SHELF_W - 0.1) / 2;
      const doorH = LEG_HEIGHT - 0.08;
      const doorZ = (SHELF_D - 0.04) / 2 + 0.008;

      [-doorW / 2 - 0.008, doorW / 2 + 0.008].forEach((dx, dIdx) => {
        const doorMesh = new THREE.Mesh(
          new THREE.BoxGeometry(doorW, doorH, 0.016),
          cabDoorMat.clone()
        );
        doorMesh.position.set(dx, -0.042 - LEG_HEIGHT / 2, doorZ);
        doorMesh.userData = { isUnderShelfCabinet: true, side: sideKey, isCabinetDoor: true };
        cabGroup.add(doorMesh);

        // Tay nắm cửa tủ
        const handleX = dIdx === 0 ? dx + doorW * 0.36 : dx - doorW * 0.36;
        const handleMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.014, 0.12, 0.024),
          cabTrimMat
        );
        handleMesh.position.set(handleX, -0.042 - LEG_HEIGHT / 2 + 0.04, doorZ + 0.014);
        handleMesh.userData = { isUnderShelfCabinet: true, side: sideKey };
        cabGroup.add(handleMesh);
      });

      // Bảng tên "TỦ VẬT PHẨM TRÁI" / "TỦ VẬT PHẨM PHẢI"
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 512;
      labelCanvas.height = 96;
      const lctx = labelCanvas.getContext('2d')!;
      lctx.fillStyle = '#0f172a';
      lctx.fillRect(0, 0, 512, 96);
      lctx.strokeStyle = '#f59e0b';
      lctx.lineWidth = 6;
      lctx.strokeRect(6, 6, 500, 84);
      lctx.fillStyle = '#fde68a';
      lctx.font = 'bold 28px sans-serif';
      lctx.textAlign = 'center';
      lctx.fillText(
        sideKey === 'left' ? 'TỦ VẬT PHẨM TRÁI' : 'TỦ VẬT PHẨM PHẢI',
        256,
        42
      );
      lctx.fillStyle = '#93c5fd';
      lctx.font = '20px sans-serif';
      lctx.fillText('Nhấp để mở • Kéo vật thả vào để cất', 256, 74);

      const labelTex = new THREE.CanvasTexture(labelCanvas);
      labelTex.colorSpace = THREE.SRGBColorSpace;
      const labelPlate = new THREE.Mesh(
        new THREE.PlaneGeometry(0.54, 0.1),
        new THREE.MeshBasicMaterial({ map: labelTex })
      );
      labelPlate.position.set(0, -0.16, doorZ + 0.011);
      labelPlate.userData = { isUnderShelfCabinet: true, side: sideKey };
      cabGroup.add(labelPlate);

      // Khung viền phát sáng khi người dùng rà hoặc kéo vật phẩm vào tủ
      const hlBox = new THREE.Mesh(
        new THREE.BoxGeometry(SHELF_W - 0.01, LEG_HEIGHT + 0.01, SHELF_D - 0.01),
        new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          wireframe: true,
          transparent: true,
          opacity: 0.85,
        })
      );
      hlBox.position.y = -0.042 - LEG_HEIGHT / 2;
      hlBox.name = `under_cabinet_highlight_${sideKey}`;
      hlBox.visible = false;
      cabGroup.add(hlBox);

      underCabinetsGroup.add(cabGroup);
    };

    buildInteractiveSideUnit(-1.52, 'left');
    buildInteractiveSideUnit(1.52, 'right');

    scene.add(sideShelvesGroup);
    scene.add(underCabinetsGroup);
    sideShelvesGroupRef.current = sideShelvesGroup;
    underCabinetsGroupRef.current = underCabinetsGroup;
    scene.add(labDecorGroup);

    // =========================================================================
    // 4. KHỞI TẠO CÁC THIẾT BỊ 3D TRÊN MẶT BÀN 2.0m × 1.0m
    // =========================================================================
    const ol3d = window.OL3D_EQUIPMENT_MODULE;
    let equipmentRoot: THREE.Group;
    if (ol3d && typeof ol3d.buildEquipmentMesh === 'function') {
      equipmentRoot = ol3d.buildEquipmentMesh(THREE, {});
    } else {
      equipmentRoot = new THREE.Group();
    }

    const oldBaseFoot = equipmentRoot.getObjectByName('base_foot');
    if (oldBaseFoot) oldBaseFoot.visible = false;
    const oldScaleDisp = equipmentRoot.getObjectByName('scale_display');
    if (oldScaleDisp) oldScaleDisp.visible = false;
    const oldScaleRear = equipmentRoot.getObjectByName('scale_display_rear');
    if (oldScaleRear) oldScaleRear.visible = false;
    equipmentRoot.children.forEach((ch) => {
      if (ch.type === 'Mesh' && ch.position.z < -0.15) {
        ch.visible = false;
      }
    });

    const compGroup = equipmentRoot.getObjectByName('circuit_components_group');
    if (compGroup) {
      compGroup.position.y = 0;
    }

    const builtInWiresGroup = equipmentRoot.getObjectByName('circuit_wires_group');
    if (builtInWiresGroup) {
      while (builtInWiresGroup.children.length > 0) {
        builtInWiresGroup.remove(builtInWiresGroup.children[0]);
      }
    }

    EQUIPMENT_CATALOG.forEach((spec) => {
      const obj = equipmentRoot.getObjectByName(spec.nodeName);
      if (obj) {
        obj.position.set(
          spec.tableDefaultPos[0],
          spec.tableDefaultPos[1],
          spec.tableDefaultPos[2]
        );
        obj.userData.workbenchId = spec.id;
      }
    });

    scene.add(equipmentRoot);
    equipmentRootRef.current = equipmentRoot;

    // Đồng bộ 2 viên pin nằm khớp trong Giá đỡ pin lúc khởi tạo
    const holderInit = equipmentRoot.getObjectByName('unit_battery_holder');
    const b1Init = equipmentRoot.getObjectByName('unit_battery_1');
    const b2Init = equipmentRoot.getObjectByName('unit_battery_2');
    if (holderInit && b1Init && b2Init) {
      b1Init.position.set(
        holderInit.position.x,
        holderInit.position.y,
        holderInit.position.z - 0.022
      );
      b2Init.position.set(
        holderInit.position.x,
        holderInit.position.y,
        holderInit.position.z + 0.022
      );
    }

    const dynWireGroup = new THREE.Group();
    dynWireGroup.name = 'dynamic_wires_3d';
    equipmentRoot.add(dynWireGroup);
    wireGroupRef.current = dynWireGroup;

    // Vòng sáng đánh dấu cọc cắm đang trỏ chuột / chọn dây
    const ringGeo = new THREE.TorusGeometry(0.011, 0.0022, 12, 28);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const highlightRing = new THREE.Mesh(ringGeo, ringMat);
    highlightRing.visible = false;
    scene.add(highlightRing);
    terminalHighlightRef.current = highlightRing;

    // =========================================================================
    // 5. HỆ 2 TRỤC CHUỘT PHẢI (GIZMO):
    //    - Trục 1: Trục thẳng đứng (Vertical Y Axis) để kéo vật lên cao
    //    - Trục 2: Trục xoay tròn (Circular Rotation Ring) để xoay vật
    // =========================================================================
    const gizmoGroup = new THREE.Group();
    gizmoGroup.name = 'right_click_dual_axis_gizmo';
    gizmoGroup.visible = false;

    const verticalAxisGroup = new THREE.Group();
    verticalAxisGroup.name = 'gizmo_vertical_axis';
    const vMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const vShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0038, 0.0038, 0.16, 16), vMat);
    vShaft.position.y = 0.11;
    vShaft.userData = { gizmoPart: 'vertical' };
    verticalAxisGroup.add(vShaft);

    const vCone = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.032, 20), vMat);
    vCone.position.y = 0.198;
    vCone.userData = { gizmoPart: 'vertical' };
    verticalAxisGroup.add(vCone);

    const vHitbox = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.21, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    vHitbox.position.y = 0.115;
    vHitbox.userData = { gizmoPart: 'vertical' };
    verticalAxisGroup.add(vHitbox);
    gizmoGroup.add(verticalAxisGroup);

    const rotateAxisGroup = new THREE.Group();
    rotateAxisGroup.name = 'gizmo_rotation_ring';
    const rMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const rTorusGeo = new THREE.TorusGeometry(0.095, 0.0036, 14, 48);
    rTorusGeo.rotateX(Math.PI / 2);
    const rTorus = new THREE.Mesh(rTorusGeo, rMat);
    rTorus.position.y = 0.025;
    rTorus.userData = { gizmoPart: 'rotate' };
    rotateAxisGroup.add(rTorus);

    for (let k = 0; k < 4; k++) {
      const ang = (k * Math.PI) / 2;
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 14, 14), rMat);
      knob.position.set(Math.cos(ang) * 0.095, 0.025, Math.sin(ang) * 0.095);
      knob.userData = { gizmoPart: 'rotate' };
      rotateAxisGroup.add(knob);
    }

    const rHitGeo = new THREE.TorusGeometry(0.095, 0.018, 10, 36);
    rHitGeo.rotateX(Math.PI / 2);
    const rHitbox = new THREE.Mesh(
      rHitGeo,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    rHitbox.position.y = 0.025;
    rHitbox.userData = { gizmoPart: 'rotate' };
    rotateAxisGroup.add(rHitbox);

    gizmoGroup.add(rotateAxisGroup);
    scene.add(gizmoGroup);
    gizmoGroupRef.current = gizmoGroup;

    // Điều khiển Camera OrbitControls (kết hợp Zoom-to-Cursor)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enableZoom = false;
    controls.target.set(...DEFAULT_CAMERA_TARGET);
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controlsRef.current = controls;

    // =========================================================================
    // 6. ZOOM CHÍNH XÁC TẠI VỊ TRÍ CON TRỎ CHUỘT (VÀ VUỐT/CUỘN TRÊN THANH CÔNG TẮC)
    // =========================================================================
    const wheelRaycaster = new THREE.Raycaster();
    const wheelPointer = new THREE.Vector2();
    const groundZoomPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const zoomPivot = new THREE.Vector3();
    const zoomableObjects = [
      equipmentRoot,
      labTableGroup,
      cabinetGroup,
      sideShelvesGroup,
      underCabinetsGroup,
    ];

    const isChildOfSwitchLever = (obj: THREE.Object3D | null): boolean => {
      let cur: THREE.Object3D | null = obj;
      while (cur) {
        if (cur.name === 'switch_blade_pivot') return true;
        cur = cur.parent;
      }
      return false;
    };

    const handleWheelZoomToCursor = (e: WheelEvent) => {
      e.preventDefault();
      const rect = renderer.domElement.getBoundingClientRect();
      wheelPointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      wheelPointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      wheelRaycaster.setFromCamera(wheelPointer, camera);

      // Nếu con trỏ đang rà vào thanh bật/tắt công tắc:
      // Vuốt/lăn lên (deltaY < 0) -> Mở công tắc; Vuốt/lăn xuống (deltaY > 0) -> Đóng công tắc
      if (!inCabinetRef.current.knife_switch) {
        const swObj = equipmentRoot.getObjectByName('unit_switch');
        if (swObj && swObj.visible) {
          const swHits = wheelRaycaster.intersectObjects(swObj.children, true);
          if (swHits.some((h) => isChildOfSwitchLever(h.object))) {
            if (e.deltaY < -1) {
              // Kéo / vuốt lên -> Công tắc MỞ
              setSwitchClosed((prev) => {
                if (prev !== false) {
                  window.OL3D_EQUIPMENT_MODULE?.playEquipmentSound('switch', false);
                }
                return false;
              });
            } else if (e.deltaY > 1) {
              // Kéo / vuốt xuống -> Công tắc ĐÓNG
              setSwitchClosed((prev) => {
                if (prev !== true) {
                  window.OL3D_EQUIPMENT_MODULE?.playEquipmentSound('switch', true);
                }
                return true;
              });
            }
            return;
          }
        }
      }

      const hits = wheelRaycaster.intersectObjects(zoomableObjects, true);
      const validHit = hits.find((h) => h.object.visible);
      if (validHit) {
        zoomPivot.copy(validHit.point);
      } else if (!wheelRaycaster.ray.intersectPlane(groundZoomPlane, zoomPivot)) {
        zoomPivot.copy(controls.target);
      }

      const normDelta =
        Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 120) / 120;
      const zoomStep = 0.16;
      const scaleFactor =
        normDelta < 0
          ? 1 - zoomStep * Math.abs(normDelta)
          : 1 + zoomStep * Math.abs(normDelta);

      const camOffset = camera.position.clone().sub(zoomPivot);
      const nextDistToPivot = camOffset.length() * scaleFactor;
      if (nextDistToPivot < 0.06 || nextDistToPivot > 5.5) return;

      const nextCamPos = zoomPivot.clone().addScaledVector(camOffset, scaleFactor);
      const targetOffset = controls.target.clone().sub(zoomPivot);
      const nextTarget = zoomPivot.clone().addScaledVector(targetOffset, scaleFactor);

      if (nextCamPos.y < -0.65) {
        nextCamPos.y = -0.65;
      }

      camera.position.copy(nextCamPos);
      controls.target.copy(nextTarget);
      controls.update();
    };

    renderer.domElement.addEventListener('wheel', handleWheelZoomToCursor, {
      passive: false,
    });

    // Vòng lặp Render + Vật lý rơi tự do + Chống xuyên vật + Chiếu nhãn 3D
    let animId = 0;
    let lastTime = performance.now();
    let frameCounter = 0;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      let anyFallingMoved = false;
      allCatalogRef.current.forEach((spec) => {
        const phys = physicsRef.current[spec.id];
        if (!phys || !phys.falling) return;
        const obj = equipmentRoot.getObjectByName(spec.nodeName);
        if (!obj) {
          phys.falling = false;
          return;
        }
        phys.vy -= 9.8 * dt;
        obj.position.y += phys.vy * dt;
        anyFallingMoved = true;

        if (obj.position.y <= phys.restingY) {
          obj.position.y = phys.restingY;
          resolveSolidCollisions(spec.id);
          if (Math.abs(phys.vy) > 0.45) {
            phys.vy = -phys.vy * 0.24;
            window.OL3D_EQUIPMENT_MODULE?.playEquipmentSound('plug');
          } else {
            phys.vy = 0;
            phys.falling = false;
          }
        }

        if (
          spec.id === 'battery_holder' ||
          spec.id === 'single_battery_holder_1' ||
          spec.id === 'single_battery_holder_2'
        ) {
          syncInsertedBatteriesToHolder();
        }
      });

      if (gizmoGroup.visible && gizmoTargetRef.current) {
        const targetSpec = allCatalogRef.current.find((s) => s.id === gizmoTargetRef.current);
        const targetObj = targetSpec
          ? equipmentRoot.getObjectByName(targetSpec.nodeName)
          : null;
        if (targetObj) {
          gizmoGroup.position.copy(targetObj.position);
        }
      }

      if (anyFallingMoved) {
        rebuild3DWires(activeWiresRef.current);
      }

      // Cập nhật trạng thái thiết bị mỗi frame để kim đo, con chạy và lưỡi cầu dao mượt mà,
      // tuyệt đối không làm nhúc nhích công tắc khi người dùng bấm/kéo các thiết bị khác
      window.OL3D_EQUIPMENT_MODULE?.updateEquipmentState(
        equipmentRoot,
        {
          ...equipmentStateRef.current,
          ...(switchBladeAngleOverrideRef.current !== null
            ? { switchBladeAngle: switchBladeAngleOverrideRef.current }
            : {}),
        },
        dt
      );

      // Cập nhật hiệu ứng đưa Camera về góc nhìn tổng thể khi nhấp đúp vào mặt bàn
      if (cameraResetAnimRef.current && cameraResetAnimRef.current.active) {
        const anim = cameraResetAnimRef.current;
        const t = Math.min(1, (now - anim.startTime) / anim.durationMs);
        const ease = 1 - Math.pow(1 - t, 3);
        camera.position.lerpVectors(anim.fromPos, anim.toPos, ease);
        controls.target.lerpVectors(anim.fromTarget, anim.toTarget, ease);
        if (t >= 1) {
          cameraResetAnimRef.current.active = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      frameCounter++;
      if (frameCounter % 2 === 0 && mountRef.current) {
        const cw = mountRef.current.clientWidth;
        const ch = mountRef.current.clientHeight;
        const nextLabels: ProjectedLabel[] = [];
        const tempV = new THREE.Vector3();

        allCatalogRef.current.forEach((spec) => {
          if (inUnderCabinetRef.current[spec.id]) return;
          const obj = equipmentRoot.getObjectByName(spec.nodeName);
          if (!obj || !obj.visible) return;
          obj.getWorldPosition(tempV);
          tempV.y += spec.labelOffsetY;
          tempV.project(camera);

          const isBehind = tempV.z > 1.0;
          const sx = (tempV.x * 0.5 + 0.5) * cw;
          const sy = (-tempV.y * 0.5 + 0.5) * ch;
          nextLabels.push({
            id: spec.id,
            x: sx,
            y: sy,
            visible: !isBehind && sx > 20 && sx < cw - 20 && sy > 40 && sy < ch - 20,
            inCabinet: Boolean(inCabinetRef.current[spec.id]),
            onSideShelf: Boolean(onSideShelfRef.current[spec.id]),
          });
        });
        setProjectedLabels(nextLabels);
      }
    };
    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('wheel', handleWheelZoomToCursor);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [rebuild3DWires, resolveSolidCollisions, syncInsertedBatteriesToHolder]);

  const activeWiresRef = useRef(activeWires);
  useEffect(() => {
    activeWiresRef.current = activeWires;
  }, [activeWires]);

  const switchClosedRef = useRef(switchClosed);
  useEffect(() => {
    switchClosedRef.current = switchClosed;
  }, [switchClosed]);

  const switchBladeAngleOverrideRef = useRef<number | null>(null);

  const equipmentStateRef = useRef<Record<string, unknown>>({
    disableAutoBatteryPos: true,
    switchClosed: false,
    rheostatOhm: 6.0,
    battery1Inserted: true,
    battery2Inserted: true,
    emfV: 0,
    ammeterReadingA: 0,
    ammeterMaxA: 0.6,
    voltmeterReadingV: 0,
    voltmeterMaxV: 6.0,
    bulbCurrentA: 0,
    bulbResistance: 4.8,
  });

  // Đồng bộ trạng thái vật lý (góc quay kim Ampe kế, Vôn kế, độ sáng đèn, vị trí con chạy biến trở, lưỡi cầu dao)
  useEffect(() => {
    const root = equipmentRootRef.current;
    if (!root) return;

    rebuild3DWires(activeWires);

    equipmentStateRef.current = {
      disableAutoBatteryPos: true,
      switchClosed: !inCabinetMap.knife_switch ? switchClosed : false,
      rheostatOhm,
      battery1Inserted: effectiveBat1,
      battery2Inserted: effectiveBat2,
      emfV: solution.emfV,
      ammeterReadingA: solution.ammeterReadingA,
      ammeterMaxA: solution.ammeterScaleMax,
      voltmeterReadingV: solution.voltmeterReadingV,
      voltmeterMaxV: solution.voltmeterScaleMax,
      bulbCurrentA: solution.bulbCurrentA,
      bulbResistance: 4.8,
    };
  }, [
    activeWires,
    switchClosed,
    rheostatOhm,
    effectiveBat1,
    effectiveBat2,
    inCabinetMap,
    solution,
    rebuild3DWires,
  ]);

  useEffect(() => {
    const gizmo = gizmoGroupRef.current;
    if (!gizmo) return;
    if (!gizmoTargetId) {
      gizmo.visible = false;
      return;
    }
    const obj = getEquipmentObject(gizmoTargetId);
    if (obj) {
      gizmo.position.copy(obj.position);
      gizmo.visible = true;
    } else {
      gizmo.visible = false;
    }
  }, [gizmoTargetId, getEquipmentObject]);

  // Dựng và đồng bộ các mô hình 3D từ Kho lưu trữ .HTML trực tiếp lên Bàn thí nghiệm 3D
  useEffect(() => {
    const root = equipmentRootRef.current;
    if (!root) return;

    const validIds = new Set(storedHtmlModules.map((m) => m.id));

    // Xóa các mô hình 3D đã bị gỡ khỏi Bộ lưu trữ
    Object.keys(customRuntimesRef.current).forEach((id) => {
      if (!validIds.has(id)) {
        const existingObj = root.getObjectByName(`unit_${id}`);
        if (existingObj) {
          root.remove(existingObj);
        }
        delete customRuntimesRef.current[id];
      }
    });

    const nextTermMap: Record<string, WorkbenchItemId> = { ...TERMINAL_TO_ITEM_ID };
    const nextTermMeta: Record<string, { label: string }> = { ...TERMINAL_META };

    storedHtmlModules.forEach((mod) => {
      const spec = allCatalogRef.current.find((s) => s.id === mod.id);
      if (!spec) return;

      let entry = customRuntimesRef.current[mod.id];
      if (!entry) {
        const validated = parseAndValidateHtmlModule(mod.htmlContent, mod.filename);
        if (!validated.runtime) return;

        try {
          const builtGroup = validated.runtime.buildEquipmentGroup(
            THREE,
            validated.manifestRaw
          );
          builtGroup.name = `unit_${mod.id}`;
          builtGroup.userData.workbenchId = mod.id;

          const detectedTermCodes: string[] = [];
          builtGroup.traverse((ch) => {
            if ((ch as THREE.Mesh).isMesh) {
              ch.castShadow = true;
              ch.receiveShadow = true;
            }
            if (typeof ch.name === 'string' && ch.name.startsWith('terminal_')) {
              const code = ch.name.replace(/^terminal_/, '');
              ch.userData.terminalId = code;
              detectedTermCodes.push(code);
            }
          });

          // Nếu bật tự động gắn 2 cọc cắm dây bắp chuối (+/-) và trong model chưa có đủ 2 cọc
          if (mod.addBindingPosts && detectedTermCodes.length < 2) {
            const upperSlug = mod.slug
              .replace(/[^a-zA-Z0-9]/g, '_')
              .toUpperCase()
              .slice(0, 12);
            const negCode = `IMP_${upperSlug}_NEG`;
            const posCode = `IMP_${upperSlug}_POS`;

            const postGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.016, 16);
            const metalPinGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.008, 12);
            const metalMat = new THREE.MeshStandardMaterial({
              color: 0xe2e8f0,
              metalness: 0.9,
              roughness: 0.2,
            });
            const zFront = Math.max(0.032, mod.dimensionsM[2] * 0.46);

            [
              { code: negCode, x: -0.022, color: 0x1e293b },
              { code: posCode, x: 0.022, color: 0xdc2626 },
            ].forEach((p) => {
              const postGroup = new THREE.Group();
              postGroup.name = `terminal_${p.code}`;
              postGroup.position.set(p.x, 0.008, zFront);
              postGroup.userData = { terminalId: p.code };

              const collar = new THREE.Mesh(
                postGeo,
                new THREE.MeshStandardMaterial({
                  color: p.color,
                  roughness: 0.35,
                  metalness: 0.1,
                })
              );
              collar.castShadow = true;
              collar.userData = { terminalId: p.code };
              postGroup.add(collar);

              const pin = new THREE.Mesh(metalPinGeo, metalMat);
              pin.position.y = 0.01;
              pin.userData = { terminalId: p.code };
              postGroup.add(pin);

              builtGroup.add(postGroup);
              detectedTermCodes.push(p.code);
            });
          }

          const isUnderCab = Boolean(inUnderCabinetRef.current[mod.id]);
          const isCab = Boolean(inCabinetRef.current[mod.id]);
          const savedTf = savedTransformPendingRef.current?.[mod.id];
          const initPos = savedTf
            ? savedTf.pos
            : isCab
            ? spec.cabinetSlotPos
            : spec.tableDefaultPos;
          builtGroup.position.set(initPos[0], initPos[1], initPos[2]);
          if (savedTf) {
            builtGroup.rotation.y = savedTf.rotY;
          }
          builtGroup.visible = !isUnderCab;
          physicsRef.current[mod.id] = {
            vy: 0,
            falling: false,
            restingY: initPos[1],
          };

          root.add(builtGroup);
          if (!isUnderCab) {
            resolveSolidCollisions(mod.id);
          }

          const curVal =
            customDeviceValuesRef.current[mod.id] !== undefined
              ? customDeviceValuesRef.current[mod.id]
              : mod.controls.defaultValue;
          validated.runtime.applyEquipmentState(
            THREE,
            builtGroup,
            {
              [mod.controls.stateKey]: curVal,
              multimeterValue: curVal,
              phValue: curVal,
            },
            validated.manifestRaw
          );

          entry = {
            runtime: validated.runtime,
            assetArg: validated.manifestRaw,
            group: builtGroup,
          };
          customRuntimesRef.current[mod.id] = entry;
        } catch {
          // Ignore invalid runtime
        }
      }

      if (entry && entry.group) {
        entry.group.traverse((ch) => {
          if (ch.userData && typeof ch.userData.terminalId === 'string') {
            const tid = ch.userData.terminalId;
            nextTermMap[tid] = mod.id;
            nextTermMeta[tid] = {
              label: `${tid} (${mod.nameVi})`,
            };
          }
        });
      }
    });

    setDynamicTerminalToItem(nextTermMap);
    setDynamicTerminalMeta(nextTermMeta);
  }, [storedHtmlModules, resolveSolidCollisions]);

  // Hàm xử lý khi người dùng điều chỉnh thanh trượt thông số của thiết bị .HTML đã nạp
  const handleChangeCustomDeviceValue = useCallback(
    (id: string, nextVal: number) => {
      setCustomDeviceValues((prev) => ({ ...prev, [id]: nextVal }));
      const mod = storedHtmlModules.find((m) => m.id === id);
      const entry = customRuntimesRef.current[id];
      if (mod && entry && entry.group) {
        try {
          entry.runtime.applyEquipmentState(
            THREE,
            entry.group,
            {
              [mod.controls.stateKey]: nextVal,
              multimeterValue: nextVal,
              phValue: nextVal,
            },
            entry.assetArg
          );
          if (!audioCtxRef.current) {
            const AudioCtx =
              window.AudioContext ||
              (window as unknown as { webkitAudioContext: typeof AudioContext })
                .webkitAudioContext;
            if (AudioCtx) audioCtxRef.current = new AudioCtx();
          }
          if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
          }
          entry.runtime.playEquipmentSound('slider', nextVal);
        } catch {
          // Ignore runtime errors
        }
      }
    },
    [storedHtmlModules]
  );

  // Hàm lưu thiết bị .HTML mới vào Bộ lưu trữ & đặt lên Bàn thí nghiệm 3D
  const handleSaveModuleToWorkbench = useCallback(
    (
      validated: ValidatedHtmlEquipmentModule,
      addBindingPosts: boolean,
      filename: string,
      rawHtml: string
    ) => {
      const cleanSlug = validated.slug
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase();
      const id = `imported_${cleanSlug}`;

      // Nếu đã có model cũ cùng ID trên bàn thì xóa để dựng lại bản mới nhất
      const root = equipmentRootRef.current;
      if (root) {
        const oldObj = root.getObjectByName(`unit_${id}`);
        if (oldObj) root.remove(oldObj);
      }
      delete customRuntimesRef.current[id];

      const storedItem: StoredHtmlEquipmentModule = {
        id,
        assetId: validated.assetId,
        slug: validated.slug,
        nameVi: validated.nameVi,
        nameEn: validated.nameEn,
        category: validated.category,
        summaryVi: validated.summaryVi,
        filename,
        htmlContent: rawHtml,
        iconSvg: validated.iconSvg,
        realPhotoHtml: validated.realPhotoHtml,
        dimensionsM: validated.dimensionsM,
        massG: validated.massG,
        controls: validated.controls,
        importedAt: Date.now(),
        addBindingPosts,
        currentControlValue: validated.controls.defaultValue,
      };

      const nextList = saveStoredHtmlModule(storedItem);
      setStoredHtmlModules(nextList);
      setCustomDeviceValues((prev) => ({
        ...prev,
        [id]: validated.controls.defaultValue,
      }));

      // Khi có vật phẩm mới: tìm vị trí trống ngay ngắn trên 2 chiếc kệ hai bên.
      // Nếu kệ không đủ chỗ (đầy 12 vị trí) thì tự động cất vào Tủ Vật Phẩm Trái!
      const freeShelfSlot = findFreeSideShelfSlot(id);
      if (freeShelfSlot) {
        savedTransformPendingRef.current = {
          ...(savedTransformPendingRef.current || {}),
          [id]: {
            pos: [freeShelfSlot.x, freeShelfSlot.y, freeShelfSlot.z],
            rotY: 0,
          },
        };
        setCabinetStorageSideMap((prev) => ({ ...prev, [id]: null }));
        setInCabinetMap((prev) => ({ ...prev, [id]: false }));
        setInUnderCabinetMap((prev) => ({ ...prev, [id]: false }));
        setOnSideShelfMap((prev) => ({ ...prev, [id]: true }));
        cabinetStorageSideRef.current = { ...cabinetStorageSideRef.current, [id]: null };
        inCabinetRef.current = { ...inCabinetRef.current, [id]: false };
        inUnderCabinetRef.current = { ...inUnderCabinetRef.current, [id]: false };
        onSideShelfRef.current = { ...onSideShelfRef.current, [id]: true };
        showToast(
          `Đã đặt ngay ngắn vật phẩm mới "${validated.nameVi}" lên Kệ!`
        );
      } else {
        setCabinetStorageSideMap((prev) => ({ ...prev, [id]: 'left' }));
        setInCabinetMap((prev) => ({ ...prev, [id]: false }));
        setInUnderCabinetMap((prev) => ({ ...prev, [id]: true }));
        setOnSideShelfMap((prev) => ({ ...prev, [id]: false }));
        cabinetStorageSideRef.current = { ...cabinetStorageSideRef.current, [id]: 'left' };
        inCabinetRef.current = { ...inCabinetRef.current, [id]: false };
        inUnderCabinetRef.current = { ...inUnderCabinetRef.current, [id]: true };
        onSideShelfRef.current = { ...onSideShelfRef.current, [id]: false };
        showToast(
          `Kệ đã đầy! Vật phẩm mới "${validated.nameVi}" đã được cất vào Tủ Vật Phẩm Trái.`
        );
      }
      playSound('plug');
    },
    [playSound, findFreeSideShelfSlot, showToast]
  );

  // Tự động khôi phục thí nghiệm đã lưu từ localStorage khi truy cập lại web
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_EXPERIMENT_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as SavedExperimentState;
      if (!saved || typeof saved !== 'object') return;

      if (saved.appMode) setAppMode(saved.appMode);
      if (Array.isArray(saved.wires)) setWires(saved.wires);
      if (typeof saved.switchClosed === 'boolean') {
        setSwitchClosed(saved.switchClosed);
        switchClosedRef.current = saved.switchClosed;
      }
      if (typeof saved.rheostatOhm === 'number') setRheostatOhm(saved.rheostatOhm);

      if (saved.slot1Occupant !== undefined) {
        setSlot1Occupant(saved.slot1Occupant);
        slot1OccupantRef.current = saved.slot1Occupant;
      }
      if (saved.slot2Occupant !== undefined) {
        setSlot2Occupant(saved.slot2Occupant);
        slot2OccupantRef.current = saved.slot2Occupant;
      }
      if (saved.singleSlot1Occupant !== undefined) {
        setSingleSlot1Occupant(saved.singleSlot1Occupant);
        singleSlot1OccupantRef.current = saved.singleSlot1Occupant;
      }
      if (saved.singleSlot2Occupant !== undefined) {
        setSingleSlot2Occupant(saved.singleSlot2Occupant);
        singleSlot2OccupantRef.current = saved.singleSlot2Occupant;
      }

      if (saved.inCabinetMap) {
        setInCabinetMap(saved.inCabinetMap);
        inCabinetRef.current = saved.inCabinetMap;
      }
      if (saved.inUnderCabinetMap) {
        setInUnderCabinetMap(saved.inUnderCabinetMap);
        inUnderCabinetRef.current = saved.inUnderCabinetMap;
      }
      if (saved.cabinetStorageSideMap) {
        setCabinetStorageSideMap(saved.cabinetStorageSideMap);
        cabinetStorageSideRef.current = saved.cabinetStorageSideMap;
      } else if (saved.inUnderCabinetMap) {
        const migratedSide: Record<WorkbenchItemId, 'left' | 'right' | null> = {};
        Object.entries(saved.inUnderCabinetMap).forEach(([k, v]) => {
          migratedSide[k] = v ? 'left' : null;
        });
        setCabinetStorageSideMap(migratedSide);
        cabinetStorageSideRef.current = migratedSide;
      }
      if (saved.onSideShelfMap) {
        setOnSideShelfMap(saved.onSideShelfMap);
        onSideShelfRef.current = saved.onSideShelfMap;
      }
      if (saved.customDeviceValues) {
        setCustomDeviceValues((prev) => ({ ...prev, ...saved.customDeviceValues }));
      }
      if (typeof saved.boardTitle === 'string') setBoardTitle(saved.boardTitle);
      if (typeof saved.boardContent === 'string') setBoardContent(saved.boardContent);
      if (saved.boardChalkColor) setBoardChalkColor(saved.boardChalkColor);

      if (saved.itemTransforms) {
        savedTransformPendingRef.current = saved.itemTransforms;
        const root = equipmentRootRef.current;
        if (root) {
          Object.entries(saved.itemTransforms).forEach(([id, tf]) => {
            const spec = allCatalogRef.current.find((s) => s.id === id);
            const obj = spec ? root.getObjectByName(spec.nodeName) : null;
            if (obj && tf && Array.isArray(tf.pos)) {
              obj.position.set(tf.pos[0], tf.pos[1], tf.pos[2]);
              obj.rotation.y = tf.rotY || 0;
              obj.visible = !saved.inUnderCabinetMap?.[id];
              physicsRef.current[id] = {
                vy: 0,
                falling: false,
                restingY: tf.pos[1],
              };
            }
          });
        }
      }

      if (saved.cameraPos && cameraRef.current) {
        cameraRef.current.position.set(
          saved.cameraPos[0],
          saved.cameraPos[1],
          saved.cameraPos[2]
        );
      }
      if (saved.controlsTarget && controlsRef.current) {
        controlsRef.current.target.set(
          saved.controlsTarget[0],
          saved.controlsTarget[1],
          saved.controlsTarget[2]
        );
        controlsRef.current.update();
      }
    } catch {
      // Ignore corrupted state
    }
  }, []);

  const handleDeleteStoredModule = useCallback(
    (id: string) => {
      const nextList = removeStoredHtmlModule(id);
      setStoredHtmlModules(nextList);
      setWires((prev) =>
        prev.filter(
          (w) =>
            allTerminalToItemRef.current[w.from] !== id &&
            allTerminalToItemRef.current[w.to] !== id
        )
      );
      if (gizmoTargetRef.current === id) setGizmoTargetId(null);
      if (inspectedItem?.id === id) setInspectedItem(null);
      playSound('plug');
    },
    [inspectedItem, playSound]
  );

  const handleFocusModuleOnTable = useCallback(
    (id: string) => {
      if (inCabinetRef.current[id]) {
        moveItemBetweenTableAndCabinet(id, false);
      }
      window.setTimeout(() => {
        const obj = getEquipmentObject(id);
        const cam = cameraRef.current;
        const ctrl = controlsRef.current;
        if (obj && cam && ctrl) {
          ctrl.target.set(obj.position.x, obj.position.y + 0.05, obj.position.z);
          cam.position.set(
            obj.position.x + 0.18,
            obj.position.y + 0.36,
            obj.position.z + 0.46
          );
          ctrl.update();
        }
      }, 60);
    },
    [getEquipmentObject, moveItemBetweenTableAndCabinet]
  );

  // Vẽ lại nội dung Bảng Đen 3D mỗi khi người dùng nhập tiêu đề, nội dung hoặc đổi màu phấn
  useEffect(() => {
    const canvas = chalkCanvasRef.current;
    const tex = chalkTextureRef.current;
    if (!canvas || !tex) return;
    const cctx = canvas.getContext('2d');
    if (!cctx) return;

    // Nền bảng xanh đậm + vệt phấn mờ tự nhiên
    cctx.fillStyle = '#0f392b';
    cctx.fillRect(0, 0, canvas.width, canvas.height);

    cctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    cctx.lineWidth = 2;
    cctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

    const colorMap: Record<'white' | 'yellow' | 'cyan' | 'green', string> = {
      white: 'rgba(248, 250, 252, 0.92)',
      yellow: 'rgba(253, 224, 71, 0.94)',
      cyan: 'rgba(103, 232, 249, 0.94)',
      green: 'rgba(134, 239, 172, 0.94)',
    };
    const textColor = colorMap[boardChalkColor] || colorMap.white;

    cctx.fillStyle = textColor;
    cctx.textAlign = 'center';

    let currentY = 68;
    if (boardTitle.trim()) {
      cctx.font = 'bold 32px sans-serif';
      cctx.fillText(boardTitle.trim(), canvas.width / 2, currentY, canvas.width - 64);
      // Gạch chân nhẹ dưới tiêu đề
      cctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      cctx.beginPath();
      cctx.moveTo(160, currentY + 18);
      cctx.lineTo(canvas.width - 160, currentY + 18);
      cctx.stroke();
      currentY += 64;
    } else {
      currentY = 85;
    }

    // Tự động xuống dòng cho nội dung người dùng nhập
    cctx.font = '25px monospace';
    const rawLines = boardContent.split('\n');
    const maxLineWidth = canvas.width - 80;
    const wrappedLines: string[] = [];

    rawLines.forEach((rawLine) => {
      if (!rawLine.trim()) {
        wrappedLines.push('');
        return;
      }
      const words = rawLine.split(' ');
      let currentLine = '';
      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (cctx.measureText(testLine).width > maxLineWidth && currentLine) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) wrappedLines.push(currentLine);
    });

    const lineHeight = 42;
    wrappedLines.slice(0, 6).forEach((line) => {
      cctx.fillText(line, canvas.width / 2, currentY, maxLineWidth);
      currentY += lineHeight;
    });

    // Dòng nhắc nhỏ ở góc dưới bảng
    cctx.font = '15px sans-serif';
    cctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
    cctx.textAlign = 'right';
    cctx.fillText('Click vào bảng để tự nhập nội dung', canvas.width - 28, canvas.height - 26);

    tex.needsUpdate = true;
  }, [boardTitle, boardContent, boardChalkColor]);

  // Xử lý tương tác Chuột 3D:
  // - Rà viên pin vào Giá đỡ 2 pin hoặc Giá đỡ 1 pin (#1, #2) -> hiện màu xanh lá ở đúng ngăn
  // - Thả viên pin ra -> pin vào đúng ngăn theo đúng góc xoay ngang/dọc của Giá đỡ pin
  // - Kéo Giá đỡ pin -> các viên pin đang gắn trong Giá đỡ pin tự động di chuyển & xoay theo
  // - Chống xuyên thấu giữa các vật phẩm ("ruột đặc")
  useEffect(() => {
    const container = mountRef.current;
    const root = equipmentRootRef.current;
    const gizmo = gizmoGroupRef.current;
    if (!container || !root || !gizmo) return;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const horizontalPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeHit = new THREE.Vector3();

    type HoveredSlotTarget = 'slot1' | 'slot2' | 'single1' | 'single2' | null;

    let draggingItemId: WorkbenchItemId | null = null;
    let draggingRheostat = false;
    let draggingSwitchLever = false;
    let switchDragStartPointerY = 0;
    let switchDragStartAngle = 0.72;
    let switchDragMoved = false;
    let isHoveringSwitchLever = false;
    let switchHoverEnterTime = 0;
    let switchHoverAnchorY = 0;
    let draggingGizmoMode: 'vertical' | 'rotate' | null = null;
    let gizmoStartY = 0;
    let gizmoStartPointerY = 0;
    let gizmoStartRotY = 0;
    let gizmoStartAngle = 0;
    let hoveredSlotTarget: HoveredSlotTarget = null;
    const dragOffset = new THREE.Vector3();

    const updatePointer = (e: PointerEvent | MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const setSwitchLeverHighlight = (visible: boolean) => {
      const swObj = getEquipmentObject('knife_switch');
      if (!swObj) return;
      const hlGroup = swObj.getObjectByName('switch_lever_highlight');
      if (hlGroup) hlGroup.visible = visible;
      const ud = swObj.userData as {
        bladeMetalMat?: THREE.MeshPhysicalMaterial;
        handleMat?: THREE.MeshPhysicalMaterial;
      };
      if (ud?.bladeMetalMat) {
        ud.bladeMetalMat.emissive.setHex(visible ? 0x22c55e : 0x000000);
        ud.bladeMetalMat.emissiveIntensity = visible ? 0.55 : 0.0;
      }
      if (ud?.handleMat) {
        ud.handleMat.emissive.setHex(visible ? 0x22c55e : 0x000000);
        ud.handleMat.emissiveIntensity = visible ? 0.65 : 0.0;
      }
    };

    const setHolderSlotHighlights = (target: HoveredSlotTarget) => {
      const holderObj = getEquipmentObject('battery_holder');
      if (holderObj) {
        const hl1 = holderObj.getObjectByName('slot1_highlight');
        const hl2 = holderObj.getObjectByName('slot2_highlight');
        if (hl1) hl1.visible = target === 'slot1';
        if (hl2) hl2.visible = target === 'slot2';
      }
      const single1Obj = getEquipmentObject('single_battery_holder_1');
      if (single1Obj) {
        const shl1 = single1Obj.getObjectByName('slot_highlight');
        if (shl1) shl1.visible = target === 'single1';
      }
      const single2Obj = getEquipmentObject('single_battery_holder_2');
      if (single2Obj) {
        const shl2 = single2Obj.getObjectByName('slot_highlight');
        if (shl2) shl2.visible = target === 'single2';
      }
    };

    const findTerminalId = (obj: THREE.Object3D | null): string | null => {
      let cur: THREE.Object3D | null = obj;
      while (cur) {
        if (cur.userData && typeof cur.userData.terminalId === 'string') {
          const tid = cur.userData.terminalId;
          const ownerId = allTerminalToItemRef.current[tid];
          if (ownerId && !inCabinetRef.current[ownerId]) {
            return tid;
          }
          return null;
        }
        cur = cur.parent;
      }
      return null;
    };

    const findWorkbenchItem = (
      obj: THREE.Object3D | null
    ): { id: WorkbenchItemId; group: THREE.Object3D } | null => {
      let cur: THREE.Object3D | null = obj;
      while (cur) {
        if (cur.userData && cur.userData.workbenchId) {
          return {
            id: cur.userData.workbenchId as WorkbenchItemId,
            group: cur,
          };
        }
        cur = cur.parent;
      }
      return null;
    };

    const isChildOfName = (obj: THREE.Object3D | null, targetName: string): boolean => {
      let cur: THREE.Object3D | null = obj;
      while (cur) {
        if (cur.name === targetName) return true;
        cur = cur.parent;
      }
      return false;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const cam = cameraRef.current;
      if (!cam) return;
      updatePointer(e);
      raycaster.setFromCamera(pointer, cam);

      const hits = raycaster.intersectObjects(root.children, true);
      for (const hit of hits) {
        const found = findWorkbenchItem(hit.object);
        if (found) {
          if (!physicsRef.current[found.id]) {
            physicsRef.current[found.id] = { vy: 0, falling: false, restingY: 0 };
          }
          physicsRef.current[found.id].falling = false;
          physicsRef.current[found.id].vy = 0;
          setGizmoTargetId(found.id);
          playSound('plug');
          return;
        }
      }

      if (gizmoTargetRef.current) {
        setGizmoTargetId(null);
        triggerGravityFallForAll();
      }
    };

    const setUnderCabinetHighlight = (side: 'left' | 'right' | null) => {
      const grp = underCabinetsGroupRef.current;
      if (!grp) return;
      const leftHl = grp.getObjectByName('under_cabinet_highlight_left');
      const rightHl = grp.getObjectByName('under_cabinet_highlight_right');
      if (leftHl) leftHl.visible = side === 'left';
      if (rightHl) rightHl.visible = side === 'right';
    };

    const findUnderCabinetSide = (obj: THREE.Object3D | null): 'left' | 'right' | null => {
      let cur: THREE.Object3D | null = obj;
      while (cur) {
        if (cur.userData && cur.userData.isUnderShelfCabinet) {
          return (cur.userData.side as 'left' | 'right') || 'left';
        }
        cur = cur.parent;
      }
      return null;
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const cam = cameraRef.current;
      if (!cam) return;
      updatePointer(e);
      raycaster.setFromCamera(pointer, cam);

      const hits = raycaster.intersectObjects(root.children, true);
      for (const hit of hits) {
        if (!hit.object.visible) continue;
        const found = findWorkbenchItem(hit.object);
        if (found && !inUnderCabinetRef.current[found.id]) {
          const spec = allCatalogRef.current.find((s) => s.id === found.id);
          if (spec) {
            setInspectedItem(spec);
            playSound('plug');
          }
          return;
        }
      }

      // Khi nhấp đúp vào mặt bàn chính -> tự động đưa Camera về vị trí góc nhìn ban đầu thoải mái, nhìn tổng thể thí nghiệm
      if (labTableGroupRef.current) {
        const tableHits = raycaster.intersectObjects(labTableGroupRef.current.children, true);
        if (tableHits.length > 0) {
          resetCameraToOverview();
          return;
        }
      }

      if (blackboardGroupRef.current) {
        const bbHits = raycaster.intersectObjects(blackboardGroupRef.current.children, true);
        if (bbHits.length > 0) {
          setShowBoardModalOrFocus();
          return;
        }
      }
    };

    const setShowBoardModalOrFocus = () => {
      setShowBlackboardModal(true);
      playSound('plug');
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const cam = cameraRef.current;
      if (!cam) return;
      updatePointer(e);
      raycaster.setFromCamera(pointer, cam);

      if (gizmo.visible && gizmoTargetRef.current) {
        const gizmoHits = raycaster.intersectObjects(gizmo.children, true);
        if (gizmoHits.length > 0) {
          const part = gizmoHits[0].object.userData?.gizmoPart as
            | 'vertical'
            | 'rotate'
            | undefined;
          const targetObj = getEquipmentObject(gizmoTargetRef.current);
          if (part && targetObj) {
            e.stopPropagation();
            if (controlsRef.current) controlsRef.current.enabled = false;
            draggingGizmoMode = part;
            physicsRef.current[gizmoTargetRef.current].falling = false;
            physicsRef.current[gizmoTargetRef.current].vy = 0;

            if (part === 'vertical') {
              gizmoStartY = targetObj.position.y;
              gizmoStartPointerY = pointer.y;
              container.style.cursor = 'ns-resize';
            } else {
              gizmoStartRotY = targetObj.rotation.y;
              horizontalPlane.constant = -targetObj.position.y;
              if (raycaster.ray.intersectPlane(horizontalPlane, planeHit)) {
                gizmoStartAngle = Math.atan2(
                  planeHit.x - targetObj.position.x,
                  planeHit.z - targetObj.position.z
                );
              }
              container.style.cursor = 'grabbing';
            }
            return;
          }
        }
      }

      const rawHits = raycaster.intersectObjects(root.children, true);
      const hits = rawHits.filter((h) => {
        if (!h.object.visible) return false;
        const f = findWorkbenchItem(h.object);
        if (f && inUnderCabinetRef.current[f.id]) return false;
        return true;
      });

      if (hits.length === 0) {
        // Kiểm tra xem người dùng có click vào Tủ Vật Phẩm Trái hoặc Tủ Vật Phẩm Phải để mở Trang Vật Phẩm của tủ đó không
        if (underCabinetsGroupRef.current) {
          const uHits = raycaster.intersectObjects(underCabinetsGroupRef.current.children, true);
          const hitCab = uHits.find((h) => findUnderCabinetSide(h.object) !== null);
          if (hitCab) {
            const clickedSide = findUnderCabinetSide(hitCab.object)!;
            setActiveCabinetModalSide(clickedSide);
            playSound('plug');
            return;
          }
        }

        // Kiểm tra xem người dùng có click vào Bảng Đen để nhập nội dung không
        if (blackboardGroupRef.current) {
          const bbHits = raycaster.intersectObjects(blackboardGroupRef.current.children, true);
          if (bbHits.length > 0) {
            setShowBoardModalOrFocus();
            return;
          }
        }

        if (selectedTerminal) setSelectedTerminal(null);
        if (gizmoTargetRef.current) {
          setGizmoTargetId(null);
          triggerGravityFallForAll();
        }
        return;
      }

      const firstItem = findWorkbenchItem(hits[0].object);
      if (
        gizmoTargetRef.current &&
        (!firstItem || firstItem.id !== gizmoTargetRef.current)
      ) {
        setGizmoTargetId(null);
        triggerGravityFallForAll();
      }

      for (const hit of hits) {
        const termId = findTerminalId(hit.object);
        if (termId) {
          e.stopPropagation();
          if (!selectedTerminal) {
            setSelectedTerminal(termId);
            playSound('plug');
          } else if (selectedTerminal === termId) {
            setSelectedTerminal(null);
          } else {
            const from = selectedTerminal;
            const to = termId;
            setWires((prev) => {
              const existingIdx = prev.findIndex(
                (w) => (w.from === from && w.to === to) || (w.from === to && w.to === from)
              );
              if (existingIdx >= 0) {
                return prev.filter((_, i) => i !== existingIdx);
              }
              return [
                ...prev,
                {
                  id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  from,
                  to,
                  color: wireColor,
                },
              ];
            });
            setSelectedTerminal(null);
            playSound('plug');
          }
          return;
        }
      }

      const topHit = hits[0].object;

      if (!inCabinetRef.current.knife_switch && isChildOfName(topHit, 'switch_blade_pivot')) {
        e.stopPropagation();
        if (controlsRef.current) controlsRef.current.enabled = false;
        draggingSwitchLever = true;
        switchDragStartPointerY = pointer.y;
        switchDragStartAngle = switchClosedRef.current ? -0.04 : 0.72;
        switchDragMoved = false;
        setSwitchLeverHighlight(true);
        container.style.cursor = 'ns-resize';
        return;
      }

      if (!inCabinetRef.current.rheostat_20 && isChildOfName(topHit, 'plunger')) {
        if (controlsRef.current) controlsRef.current.enabled = false;
        draggingRheostat = true;
        container.style.cursor = 'ew-resize';
        return;
      }

      for (const hit of hits) {
        const found = findWorkbenchItem(hit.object);
        if (found) {
          if (controlsRef.current) controlsRef.current.enabled = false;
          draggingItemId = found.id;
          physicsRef.current[found.id].falling = false;
          physicsRef.current[found.id].vy = 0;

          // Nếu bắt đầu kéo 1 viên pin đang gắn trong Giá đỡ 2 pin hoặc Giá đỡ 1 pin thì tách nó khỏi ngăn để kéo tự do
          if (isBatteryCellId(found.id)) {
            if (slot1OccupantRef.current === found.id) {
              slot1OccupantRef.current = null;
              setSlot1Occupant(null);
            }
            if (slot2OccupantRef.current === found.id) {
              slot2OccupantRef.current = null;
              setSlot2Occupant(null);
            }
            if (singleSlot1OccupantRef.current === found.id) {
              singleSlot1OccupantRef.current = null;
              setSingleSlot1Occupant(null);
            }
            if (singleSlot2OccupantRef.current === found.id) {
              singleSlot2OccupantRef.current = null;
              setSingleSlot2Occupant(null);
            }
          }

          horizontalPlane.constant = -found.group.position.y;
          if (!inCabinetRef.current[found.id] && raycaster.ray.intersectPlane(horizontalPlane, planeHit)) {
            dragOffset.copy(found.group.position).sub(planeHit);
            dragOffset.x = Math.max(-0.08, Math.min(0.08, dragOffset.x));
            dragOffset.z = Math.max(-0.08, Math.min(0.08, dragOffset.z));
            dragOffset.y = 0;
          } else {
            dragOffset.set(0, 0, 0);
          }
          container.style.cursor = 'grabbing';
          return;
        }
      }
    };

    // Tính vị trí con trỏ 3D khi kéo vật phẩm lên:
    // 1. Tủ Vật Phẩm Trái hoặc Tủ Vật Phẩm Phải (để tự động cất vào đúng tủ đó khi thả chuột)
    // 2. Hai chiếc kệ gỗ 2 bên (Mặt kệ to tầng 1 y = 0.0m đặt tự do bất kỳ đâu trên bề mặt, hoặc Kệ tầng 2 y = 0.26m)
    // 3. Kệ kính 2 tầng đối diện (Tầng 1: 0.024m hoặc Tầng 2: 0.222m)
    // 4. Mặt bàn gỗ chính 2.0m × 1.0m (y = 0.0m)
    const computeDragPlacement = (r: THREE.Ray) => {
      // 1. Kiểm tra nếu con trỏ đang trỏ vào mặt kệ gỗ 2 bên (ưu tiên kiểm tra mặt kệ trước để không bị nhận nhầm xuống thân tủ dưới)
      if (sideShelvesGroupRef.current) {
        const sHits = raycaster.intersectObjects(sideShelvesGroupRef.current.children, true);
        const surfaceHit = sHits.find((h) => h.object.userData?.isSideShelfSurface);
        if (surfaceHit) {
          const side = surfaceHit.object.userData.side as 'left' | 'right';
          const tier = surfaceHit.object.userData.tier as 'upper' | 'lower';
          const surfaceY = tier === 'upper' ? 0.26 : 0.0;
          const minX = side === 'left' ? -1.94 : 1.1;
          const maxX = side === 'left' ? -1.1 : 1.94;
          // Mặt kệ to ở dưới (tier === 'lower') cho phép đặt tự do khắp bề mặt từ trước ra sau (-0.41m đến +0.21m)
          const minZ = tier === 'upper' ? -0.41 : -0.41;
          const maxZ = tier === 'upper' ? -0.25 : 0.21;
          return {
            isOverCabinet: false,
            isOverSideShelf: true,
            isOverUnderCabinet: null as 'left' | 'right' | null,
            x: Math.max(minX, Math.min(maxX, surfaceHit.point.x)),
            y: surfaceY,
            z: Math.max(minZ, Math.min(maxZ, surfaceHit.point.z)),
          };
        }
      }

      // 2. Kiểm tra nếu con trỏ đang kéo vật phẩm thả vào Tủ Vật Phẩm Trái hoặc Tủ Vật Phẩm Phải
      if (underCabinetsGroupRef.current) {
        const uHits = raycaster.intersectObjects(underCabinetsGroupRef.current.children, true);
        const foundCab = uHits.find((h) => findUnderCabinetSide(h.object) !== null);
        if (foundCab) {
          const side = findUnderCabinetSide(foundCab.object)!;
          return {
            isOverCabinet: false,
            isOverSideShelf: false,
            isOverUnderCabinet: side,
            x: side === 'left' ? -1.52 : 1.52,
            y: -0.15,
            z: 0.24,
          };
        }
      }

      horizontalPlane.constant = 0;
      const hasTableHit = r.intersectPlane(horizontalPlane, planeHit);
      const tableX = hasTableHit ? planeHit.x + dragOffset.x : 0;
      const tableZ = hasTableHit ? planeHit.z + dragOffset.z : 0;

      // Nếu kéo sang vùng mặt kệ to tầng 1 của 2 kệ gỗ hai bên (|x| > 1.06): đặt tự do tại đúng vị trí con trỏ trên bề mặt y = 0.0m
      if (hasTableHit && Math.abs(tableX) > 1.06 && tableZ >= -0.44 && tableZ <= 0.24) {
        const side: 'left' | 'right' = tableX < 0 ? 'left' : 'right';
        const minX = side === 'left' ? -1.94 : 1.1;
        const maxX = side === 'left' ? -1.1 : 1.94;
        return {
          isOverCabinet: false,
          isOverSideShelf: true,
          isOverUnderCabinet: null as 'left' | 'right' | null,
          x: Math.max(minX, Math.min(maxX, tableX)),
          y: 0.0,
          z: Math.max(-0.41, Math.min(0.21, tableZ)),
        };
      }

      // 3. Xét giao điểm tia nhìn với mặt phẳng kệ tủ kính (z = -0.68)
      if (Math.abs(r.direction.z) > 1e-4) {
        const tCab = (-0.68 - r.origin.z) / r.direction.z;
        if (tCab > 0) {
          const cabX = r.origin.x + tCab * r.direction.x;
          const cabY = r.origin.y + tCab * r.direction.y;
          if (
            Math.abs(cabX) <= 0.82 &&
            cabY >= -0.06 &&
            cabY <= 0.48 &&
            (!hasTableHit || planeHit.z < -0.45)
          ) {
            const chosenTierY = cabY >= 0.16 ? 0.222 : 0.024;
            return {
              isOverCabinet: true,
              isOverSideShelf: false,
              isOverUnderCabinet: null as 'left' | 'right' | null,
              x: Math.max(-0.74, Math.min(0.74, cabX)),
              y: chosenTierY,
              z: -0.68,
            };
          }
        }
      }

      return {
        isOverCabinet: false,
        isOverSideShelf: false,
        isOverUnderCabinet: null as 'left' | 'right' | null,
        x: Math.max(-0.94, Math.min(0.94, tableX)),
        y: 0,
        z: Math.max(-0.46, Math.min(0.46, tableZ)),
      };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const cam = cameraRef.current;
      if (!cam) return;
      updatePointer(e);
      raycaster.setFromCamera(pointer, cam);

      // A. Đang kéo Trục thẳng đứng hoặc Trục xoay tròn (Chuột phải Gizmo)
      if (draggingGizmoMode && gizmoTargetRef.current) {
        const targetObj = getEquipmentObject(gizmoTargetRef.current);
        if (!targetObj) return;

        if (draggingGizmoMode === 'vertical') {
          const deltaY = (pointer.y - gizmoStartPointerY) * 0.85;
          const minY = inCabinetRef.current[gizmoTargetRef.current] ? 0.024 : 0.0;
          targetObj.position.y = Math.max(minY, Math.min(1.15, gizmoStartY + deltaY));
          gizmo.position.copy(targetObj.position);
          if (
            gizmoTargetRef.current === 'battery_holder' ||
            gizmoTargetRef.current === 'single_battery_holder_1' ||
            gizmoTargetRef.current === 'single_battery_holder_2'
          ) {
            syncInsertedBatteriesToHolder();
          }
          rebuild3DWires(activeWiresRef.current);
        } else if (draggingGizmoMode === 'rotate') {
          horizontalPlane.constant = -targetObj.position.y;
          if (raycaster.ray.intersectPlane(horizontalPlane, planeHit)) {
            const curAngle = Math.atan2(
              planeHit.x - targetObj.position.x,
              planeHit.z - targetObj.position.z
            );
            targetObj.rotation.y = gizmoStartRotY + (curAngle - gizmoStartAngle);
            resolveSolidCollisions(gizmoTargetRef.current);
            if (
              gizmoTargetRef.current === 'battery_holder' ||
              gizmoTargetRef.current === 'single_battery_holder_1' ||
              gizmoTargetRef.current === 'single_battery_holder_2'
            ) {
              syncInsertedBatteriesToHolder();
            }
            rebuild3DWires(activeWiresRef.current);
          }
        }
        return;
      }

      // A2. Đang kéo thanh bật/tắt công tắc (Kéo con trỏ lên -> Mở công tắc; Kéo con trỏ xuống -> Đóng công tắc)
      if (draggingSwitchLever) {
        setSwitchLeverHighlight(true);
        container.style.cursor = 'ns-resize';
        const dy = pointer.y - switchDragStartPointerY;
        if (Math.abs(dy) > 0.008) {
          switchDragMoved = true;
          const nextAngle = Math.max(-0.04, Math.min(0.72, switchDragStartAngle + dy * 4.5));
          switchBladeAngleOverrideRef.current = nextAngle;
          if (dy > 0.015) {
            // Kéo lên -> Công tắc MỞ
            if (switchClosedRef.current !== false) {
              switchClosedRef.current = false;
              setSwitchClosed(false);
              playSound('switch', false);
            }
          } else if (dy < -0.015) {
            // Kéo xuống -> Công tắc ĐÓNG
            if (switchClosedRef.current !== true) {
              switchClosedRef.current = true;
              setSwitchClosed(true);
              playSound('switch', true);
            }
          }
        }
        return;
      }

      // B. Đang kéo con chạy Biến trở 20Ω
      if (draggingRheostat) {
        const rheoObj = getEquipmentObject('rheostat_20');
        if (rheoObj) {
          horizontalPlane.constant = -rheoObj.position.y;
          if (raycaster.ray.intersectPlane(horizontalPlane, planeHit)) {
            const localPos = planeHit.clone().sub(rheoObj.position);
            localPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rheoObj.rotation.y);
            const ratio = Math.max(0, Math.min(1, (localPos.x + 0.056) / 0.112));
            setRheostatOhm(Math.round(ratio * 20 * 2) / 2);
          }
        }
        return;
      }

      // C. Đang kéo di chuyển Vật phẩm trên mặt bàn 2.0m × 1.0m, đặt lên 2 chiếc kệ hai bên, cất vào tủ dưới kệ hoặc tủ kính
      if (draggingItemId) {
        const itemObj = getEquipmentObject(draggingItemId);
        const spec = allCatalogRef.current.find((s) => s.id === draggingItemId);
        if (itemObj && spec) {
          const placement = computeDragPlacement(raycaster.ray);
          setUnderCabinetHighlight(placement.isOverUnderCabinet);

          itemObj.position.x = placement.x;
          itemObj.position.y = placement.y;
          itemObj.position.z = placement.z;

          if (!placement.isOverUnderCabinet) {
            resolveSolidCollisions(draggingItemId);
          }
          if (placement.isOverCabinet) {
            itemObj.position.z = -0.68;
            itemObj.position.x = Math.max(-0.74, Math.min(0.74, itemObj.position.x));
          }

          // Nếu đang kéo viên pin (battery_cell_1..4):
          // Kiểm tra rà vào từng ngăn của Giá đỡ 2 pin hoặc 2 Giá đỡ 1 pin -> hiện màu xanh lá ở ngăn đó!
          hoveredSlotTarget = null;
          if (
            isBatteryCellId(draggingItemId) &&
            !placement.isOverCabinet &&
            !placement.isOverSideShelf &&
            !placement.isOverUnderCabinet
          ) {
            // 1. Kiểm tra Giá đỡ 2 pin
            if (!inCabinetRef.current.battery_holder && !inUnderCabinetRef.current.battery_holder) {
              const holderObj = getEquipmentObject('battery_holder');
              if (holderObj) {
                const rel = new THREE.Vector3(
                  itemObj.position.x - holderObj.position.x,
                  0,
                  itemObj.position.z - holderObj.position.z
                ).applyAxisAngle(new THREE.Vector3(0, 1, 0), -holderObj.rotation.y);

                if (Math.abs(rel.x) < 0.075 && Math.abs(rel.z) < 0.055) {
                  if (
                    rel.z < 0 &&
                    (slot1OccupantRef.current === null ||
                      slot1OccupantRef.current === draggingItemId)
                  ) {
                    hoveredSlotTarget = 'slot1';
                  } else if (
                    rel.z >= 0 &&
                    (slot2OccupantRef.current === null ||
                      slot2OccupantRef.current === draggingItemId)
                  ) {
                    hoveredSlotTarget = 'slot2';
                  } else if (slot1OccupantRef.current === null) {
                    hoveredSlotTarget = 'slot1';
                  } else if (slot2OccupantRef.current === null) {
                    hoveredSlotTarget = 'slot2';
                  }
                }
              }
            }

            // 2. Kiểm tra Giá đỡ 1 pin #1
            if (
              hoveredSlotTarget === null &&
              !inCabinetRef.current.single_battery_holder_1 &&
              !inUnderCabinetRef.current.single_battery_holder_1 &&
              (singleSlot1OccupantRef.current === null ||
                singleSlot1OccupantRef.current === draggingItemId)
            ) {
              const single1Obj = getEquipmentObject('single_battery_holder_1');
              if (single1Obj) {
                const rel1 = new THREE.Vector3(
                  itemObj.position.x - single1Obj.position.x,
                  0,
                  itemObj.position.z - single1Obj.position.z
                ).applyAxisAngle(new THREE.Vector3(0, 1, 0), -single1Obj.rotation.y);
                if (Math.abs(rel1.x) < 0.075 && Math.abs(rel1.z) < 0.042) {
                  hoveredSlotTarget = 'single1';
                }
              }
            }

            // 3. Kiểm tra Giá đỡ 1 pin #2
            if (
              hoveredSlotTarget === null &&
              !inCabinetRef.current.single_battery_holder_2 &&
              !inUnderCabinetRef.current.single_battery_holder_2 &&
              (singleSlot2OccupantRef.current === null ||
                singleSlot2OccupantRef.current === draggingItemId)
            ) {
              const single2Obj = getEquipmentObject('single_battery_holder_2');
              if (single2Obj) {
                const rel2 = new THREE.Vector3(
                  itemObj.position.x - single2Obj.position.x,
                  0,
                  itemObj.position.z - single2Obj.position.z
                ).applyAxisAngle(new THREE.Vector3(0, 1, 0), -single2Obj.rotation.y);
                if (Math.abs(rel2.x) < 0.075 && Math.abs(rel2.z) < 0.042) {
                  hoveredSlotTarget = 'single2';
                }
              }
            }
          }
          setHolderSlotHighlights(hoveredSlotTarget);

          if (
            (draggingItemId === 'battery_holder' ||
              draggingItemId === 'single_battery_holder_1' ||
              draggingItemId === 'single_battery_holder_2') &&
            !placement.isOverCabinet &&
            !placement.isOverUnderCabinet
          ) {
            syncInsertedBatteriesToHolder();
          }

          if (gizmoTargetRef.current === draggingItemId) {
            gizmo.position.copy(itemObj.position);
          }
          rebuild3DWires(activeWiresRef.current);
        }
        return;
      }

      // D. Khi di chuột bình thường (Hover)
      if (gizmo.visible) {
        const gHits = raycaster.intersectObjects(gizmo.children, true);
        if (gHits.length > 0) {
          setSwitchLeverHighlight(false);
          isHoveringSwitchLever = false;
          const part = gHits[0].object.userData?.gizmoPart;
          container.style.cursor = part === 'vertical' ? 'ns-resize' : 'grab';
          return;
        }
      }

      const hits = raycaster.intersectObjects(root.children, true);
      let foundTerm: string | null = null;
      for (const hit of hits) {
        const tid = findTerminalId(hit.object);
        if (tid) {
          foundTerm = tid;
          break;
        }
      }
      setHoveredTerminal(foundTerm);

      // Kiểm tra rà chuột vào thanh bật/tắt của Công tắc (switch_blade_pivot)
      const hitSwitchLever =
        !foundTerm &&
        !inCabinetRef.current.knife_switch &&
        hits.length > 0 &&
        isChildOfName(hits[0].object, 'switch_blade_pivot');

      if (hitSwitchLever) {
        setSwitchLeverHighlight(true);
        if (!isHoveringSwitchLever) {
          isHoveringSwitchLever = true;
          switchHoverEnterTime = performance.now();
          switchHoverAnchorY = pointer.y;
        } else if (performance.now() - switchHoverEnterTime > 85) {
          // Khi đã rà vào thanh công tắc (hiện màu xanh lá) và vuốt con trỏ chuột lên/xuống:
          // Vuốt lên -> Mở công tắc; Vuốt xuống -> Đóng công tắc
          const hoverDy = pointer.y - switchHoverAnchorY;
          if (hoverDy > 0.022) {
            switchHoverAnchorY = pointer.y;
            if (switchClosedRef.current !== false) {
              switchClosedRef.current = false;
              setSwitchClosed(false);
              playSound('switch', false);
            }
          } else if (hoverDy < -0.022) {
            switchHoverAnchorY = pointer.y;
            if (switchClosedRef.current !== true) {
              switchClosedRef.current = true;
              setSwitchClosed(true);
              playSound('switch', true);
            }
          }
        }
      } else {
        if (isHoveringSwitchLever) {
          // Nếu vừa rà vào thanh công tắc rồi vuốt mạnh chuột văng ra phía trên/dưới thanh công tắc
          if (performance.now() - switchHoverEnterTime > 70) {
            const exitDy = pointer.y - switchHoverAnchorY;
            if (exitDy > 0.024 && switchClosedRef.current !== false) {
              switchClosedRef.current = false;
              setSwitchClosed(false);
              playSound('switch', false);
            } else if (exitDy < -0.024 && switchClosedRef.current !== true) {
              switchClosedRef.current = true;
              setSwitchClosed(true);
              playSound('switch', true);
            }
          }
          isHoveringSwitchLever = false;
        }
        setSwitchLeverHighlight(false);
      }

      const activeTermId = foundTerm || selectedTerminal;
      const ring = terminalHighlightRef.current;
      if (ring && activeTermId) {
        const termObj =
          root.getObjectByName('terminal_' + activeTermId) ||
          root.getObjectByName('term_' + activeTermId);
        const ownerId = allTerminalToItemRef.current[activeTermId];
        if (termObj && ownerId && !inCabinetRef.current[ownerId]) {
          const wp = new THREE.Vector3();
          termObj.getWorldPosition(wp);
          ring.position.copy(wp).add(new THREE.Vector3(0, 0.016, 0));
          ring.visible = true;
          (ring.material as THREE.MeshBasicMaterial).color.setHex(
            selectedTerminal === activeTermId ? 0x22c55e : 0xfacc15
          );
        } else {
          ring.visible = false;
        }
      } else if (ring) {
        ring.visible = false;
      }

      // Kiểm tra rà chuột vào Tủ dưới kệ 2 bên
      let hoveredUnderCab: 'left' | 'right' | null = null;
      if (underCabinetsGroupRef.current && hits.length === 0) {
        const uHits = raycaster.intersectObjects(underCabinetsGroupRef.current.children, true);
        const foundU = uHits.find((h) => findUnderCabinetSide(h.object) !== null);
        if (foundU) {
          hoveredUnderCab = findUnderCabinetSide(foundU.object);
        }
      }
      setUnderCabinetHighlight(hoveredUnderCab);

      if (foundTerm) {
        container.style.cursor = 'pointer';
      } else if (hitSwitchLever) {
        container.style.cursor = 'ns-resize';
      } else if (hits.length > 0 && findWorkbenchItem(hits[0].object)) {
        container.style.cursor = 'grab';
      } else if (hoveredUnderCab) {
        container.style.cursor = 'pointer';
      } else if (
        blackboardGroupRef.current &&
        raycaster.intersectObjects(blackboardGroupRef.current.children, true).length > 0
      ) {
        container.style.cursor = 'pointer';
      } else {
        container.style.cursor = 'default';
      }
    };

    const handlePointerUp = () => {
      if (controlsRef.current) controlsRef.current.enabled = true;
      setHolderSlotHighlights(null);
      setUnderCabinetHighlight(null);

      if (draggingSwitchLever) {
        const finalAngle = switchBladeAngleOverrideRef.current;
        switchBladeAngleOverrideRef.current = null;
        if (!switchDragMoved) {
          setSwitchClosed((prev) => {
            const next = !prev;
            switchClosedRef.current = next;
            playSound('switch', next);
            return next;
          });
        } else if (finalAngle !== null) {
          const shouldClose = finalAngle < 0.34;
          if (switchClosedRef.current !== shouldClose) {
            switchClosedRef.current = shouldClose;
            setSwitchClosed(shouldClose);
            playSound('switch', shouldClose);
          }
        }
        draggingSwitchLever = false;
        container.style.cursor = isHoveringSwitchLever ? 'ns-resize' : 'default';
        return;
      }

      if (draggingItemId) {
        const itemObj = getEquipmentObject(draggingItemId);
        const spec = allCatalogRef.current.find((s) => s.id === draggingItemId);
        if (itemObj && spec) {
          const placement = computeDragPlacement(raycaster.ray);

          if (!physicsRef.current[draggingItemId]) {
            physicsRef.current[draggingItemId] = { vy: 0, falling: false, restingY: 0 };
          }

          // 1. Nếu người dùng kéo vật phẩm thả vào Tủ Vật Phẩm Trái hoặc Tủ Vật Phẩm Phải -> tự động cất vào đúng chiếc tủ đó!
          if (placement.isOverUnderCabinet || itemObj.position.y < -0.05) {
            const targetSide: 'left' | 'right' =
              placement.isOverUnderCabinet || (itemObj.position.x < 0 ? 'left' : 'right');
            storeItemInUnderCabinet(draggingItemId, targetSide);
          } else if (
            placement.isOverCabinet ||
            (itemObj.position.z < -0.52 && Math.abs(itemObj.position.x) < 0.82)
          ) {
            // 2. Đặt vật lên kệ Tủ kính 2 tầng đối diện
            const chosenTierY = itemObj.position.y >= 0.12 ? 0.222 : 0.024;
            setCabinetStorageSideMap((prev) => ({ ...prev, [draggingItemId!]: null }));
            setInCabinetMap((prev) => ({ ...prev, [draggingItemId!]: true }));
            setInUnderCabinetMap((prev) => ({ ...prev, [draggingItemId!]: false }));
            setOnSideShelfMap((prev) => ({ ...prev, [draggingItemId!]: false }));
            cabinetStorageSideRef.current = {
              ...cabinetStorageSideRef.current,
              [draggingItemId]: null,
            };
            inCabinetRef.current = { ...inCabinetRef.current, [draggingItemId]: true };
            inUnderCabinetRef.current = { ...inUnderCabinetRef.current, [draggingItemId]: false };
            onSideShelfRef.current = { ...onSideShelfRef.current, [draggingItemId]: false };

            itemObj.position.set(
              Math.max(-0.74, Math.min(0.74, itemObj.position.x)),
              chosenTierY,
              -0.68
            );
            resolveSolidCollisions(draggingItemId);
            itemObj.position.z = -0.68;
            itemObj.position.y = chosenTierY;

            physicsRef.current[draggingItemId].restingY = chosenTierY;
            physicsRef.current[draggingItemId].falling = false;
            physicsRef.current[draggingItemId].vy = 0;

            setWires((prev) =>
              prev.filter(
                (w) =>
                  allTerminalToItemRef.current[w.from] !== draggingItemId &&
                  allTerminalToItemRef.current[w.to] !== draggingItemId
              )
            );
            if (slot1OccupantRef.current === draggingItemId) {
              slot1OccupantRef.current = null;
              setSlot1Occupant(null);
            }
            if (slot2OccupantRef.current === draggingItemId) {
              slot2OccupantRef.current = null;
              setSlot2Occupant(null);
            }
            if (singleSlot1OccupantRef.current === draggingItemId) {
              singleSlot1OccupantRef.current = null;
              setSingleSlot1Occupant(null);
            }
            if (singleSlot2OccupantRef.current === draggingItemId) {
              singleSlot2OccupantRef.current = null;
              setSingleSlot2Occupant(null);
            }
            if (draggingItemId === 'battery_holder') {
              slot1OccupantRef.current = null;
              slot2OccupantRef.current = null;
              setSlot1Occupant(null);
              setSlot2Occupant(null);
            }
            if (draggingItemId === 'single_battery_holder_1') {
              singleSlot1OccupantRef.current = null;
              setSingleSlot1Occupant(null);
            }
            if (draggingItemId === 'single_battery_holder_2') {
              singleSlot2OccupantRef.current = null;
              setSingleSlot2Occupant(null);
            }
            playSound('plug');
          } else if (placement.isOverSideShelf || Math.abs(itemObj.position.x) > 1.04) {
            // 3. Đặt vật phẩm lên 2 chiếc kệ gỗ hai bên (Mặt kệ to tầng 1 y = 0.0m đặt tự do vị trí nào cũng được, hoặc Kệ tầng 2 y = 0.26m)
            const shelfY = itemObj.position.y >= 0.14 ? 0.26 : 0.0;
            setCabinetStorageSideMap((prev) => ({ ...prev, [draggingItemId!]: null }));
            setInCabinetMap((prev) => ({ ...prev, [draggingItemId!]: false }));
            setInUnderCabinetMap((prev) => ({ ...prev, [draggingItemId!]: false }));
            setOnSideShelfMap((prev) => ({ ...prev, [draggingItemId!]: true }));
            cabinetStorageSideRef.current = {
              ...cabinetStorageSideRef.current,
              [draggingItemId]: null,
            };
            inCabinetRef.current = { ...inCabinetRef.current, [draggingItemId]: false };
            inUnderCabinetRef.current = { ...inUnderCabinetRef.current, [draggingItemId]: false };
            onSideShelfRef.current = { ...onSideShelfRef.current, [draggingItemId]: true };

            physicsRef.current[draggingItemId].restingY = shelfY;
            physicsRef.current[draggingItemId].falling = false;
            physicsRef.current[draggingItemId].vy = 0;
            itemObj.position.y = shelfY;
            resolveSolidCollisions(draggingItemId);
            rebuild3DWires(activeWiresRef.current);
            playSound('plug');
          } else {
            // 4. Đặt vật trên Mặt bàn gỗ chính 2.0m × 1.0m
            setCabinetStorageSideMap((prev) => ({ ...prev, [draggingItemId!]: null }));
            setInCabinetMap((prev) => ({ ...prev, [draggingItemId!]: false }));
            setInUnderCabinetMap((prev) => ({ ...prev, [draggingItemId!]: false }));
            setOnSideShelfMap((prev) => ({ ...prev, [draggingItemId!]: false }));
            cabinetStorageSideRef.current = {
              ...cabinetStorageSideRef.current,
              [draggingItemId]: null,
            };
            inCabinetRef.current = { ...inCabinetRef.current, [draggingItemId]: false };
            inUnderCabinetRef.current = { ...inUnderCabinetRef.current, [draggingItemId]: false };
            onSideShelfRef.current = { ...onSideShelfRef.current, [draggingItemId]: false };

            physicsRef.current[draggingItemId].restingY = 0;
            itemObj.position.y = 0;
            itemObj.position.z = Math.max(-0.44, Math.min(0.44, itemObj.position.z));

            if (isBatteryCellId(draggingItemId) && hoveredSlotTarget !== null) {
              if (hoveredSlotTarget === 'slot1') {
                slot1OccupantRef.current = draggingItemId;
                setSlot1Occupant(draggingItemId);
              } else if (hoveredSlotTarget === 'slot2') {
                slot2OccupantRef.current = draggingItemId;
                setSlot2Occupant(draggingItemId);
              } else if (hoveredSlotTarget === 'single1') {
                singleSlot1OccupantRef.current = draggingItemId;
                setSingleSlot1Occupant(draggingItemId);
              } else if (hoveredSlotTarget === 'single2') {
                singleSlot2OccupantRef.current = draggingItemId;
                setSingleSlot2Occupant(draggingItemId);
              }
              syncInsertedBatteriesToHolder();
              playSound('plug');
            } else {
              resolveSolidCollisions(draggingItemId);
              if (
                draggingItemId === 'battery_holder' ||
                draggingItemId === 'single_battery_holder_1' ||
                draggingItemId === 'single_battery_holder_2'
              ) {
                syncInsertedBatteriesToHolder();
              }
            }
            rebuild3DWires(activeWiresRef.current);
          }
        }
      }

      hoveredSlotTarget = null;
      draggingItemId = null;
      draggingRheostat = false;
      draggingGizmoMode = null;
      container.style.cursor = 'default';
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('dblclick', handleDoubleClick);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('dblclick', handleDoubleClick);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    selectedTerminal,
    wireColor,
    getEquipmentObject,
    resolveSolidCollisions,
    syncInsertedBatteriesToHolder,
    rebuild3DWires,
    triggerGravityFallForAll,
    resetCameraToOverview,
    storeItemInUnderCabinet,
    playSound,
  ]);

  const renderOnDeviceBadge = (label: ProjectedLabel) => {
    const spec = allEquipmentCatalog.find((s) => s.id === label.id);
    if (!spec) return null;

    if (
      (label.id === slot1Occupant ||
        label.id === slot2Occupant ||
        label.id === singleSlot1Occupant ||
        label.id === singleSlot2Occupant) &&
      !label.inCabinet
    ) {
      return null;
    }

    if (label.inCabinet) {
      return (
        <div
          key={label.id}
          style={{ left: `${label.x}px`, top: `${label.y}px` }}
          className="fixed -translate-x-1/2 -translate-y-full pointer-events-auto z-10"
        >
          <button
            onClick={() => moveItemBetweenTableAndCabinet(label.id, false)}
            className="px-2 py-0.5 rounded bg-slate-900/90 hover:bg-emerald-900/90 border border-slate-700 hover:border-emerald-500 text-[10px] font-medium text-slate-300 hover:text-white shadow cursor-pointer whitespace-nowrap transition-colors"
            title="Kéo ra bàn hoặc click để lấy ra bàn"
          >
            {spec.name} (Trong tủ kính)
          </button>
        </div>
      );
    }

    let badgeTitle = spec.name;
    let badgeMetric = '';
    let badgeTone = 'border-slate-700 bg-[#0F172A]/95 text-slate-200';

    if (spec.isImportedHtml && spec.importedModule) {
      const mod = spec.importedModule;
      const curVal =
        customDeviceValues[mod.id] !== undefined
          ? customDeviceValues[mod.id]
          : mod.controls.defaultValue;
      badgeTitle = mod.nameVi;
      badgeMetric = `${curVal} ${mod.controls.unit}`;
      badgeTone = 'border-sky-500/70 bg-[#0C192E]/95 text-sky-200';
    } else if (label.id === 'battery_holder') {
      badgeTitle = 'Giá Đỡ 2 Pin';
      badgeMetric = `U = ${solution.emfV.toFixed(1)}V (${
        effectiveBat1 ? 'Ngăn 1: Có' : 'Ngăn 1: Trống'
      } | ${effectiveBat2 ? 'Ngăn 2: Có' : 'Ngăn 2: Trống'})`;
      badgeTone =
        effectiveBat1 || effectiveBat2
          ? 'border-amber-500/60 bg-[#0F172A]/95 text-amber-200'
          : 'border-slate-700 bg-[#0F172A]/95 text-slate-300';
    } else if (label.id === 'single_battery_holder_1') {
      badgeTitle = 'Giá Đỡ 1 Pin #1';
      badgeMetric = effectiveSingleBat1 ? '1.5V (Đã lắp pin)' : '0V (Chưa lắp pin)';
      badgeTone = effectiveSingleBat1
        ? 'border-amber-500/60 bg-[#0F172A]/95 text-amber-200'
        : 'border-slate-700 bg-[#0F172A]/95 text-slate-300';
    } else if (label.id === 'single_battery_holder_2') {
      badgeTitle = 'Giá Đỡ 1 Pin #2';
      badgeMetric = effectiveSingleBat2 ? '1.5V (Đã lắp pin)' : '0V (Chưa lắp pin)';
      badgeTone = effectiveSingleBat2
        ? 'border-amber-500/60 bg-[#0F172A]/95 text-amber-200'
        : 'border-slate-700 bg-[#0F172A]/95 text-slate-300';
    } else if (label.id === 'knife_switch') {
      badgeTitle = 'Cầu Dao K';
      badgeMetric = switchClosed ? 'ĐANG ĐÓNG KHÍT' : 'ĐANG MỞ (NGẮT)';
      badgeTone = switchClosed
        ? 'border-emerald-500/70 bg-[#06281E]/95 text-emerald-200'
        : 'border-amber-500/60 bg-[#0F172A]/95 text-amber-200';
    } else if (label.id === 'bulb_126') {
      badgeTitle = 'Bóng Đèn';
      badgeMetric = `I = ${solution.bulbCurrentA.toFixed(2)}A • P = ${solution.bulbPowerW.toFixed(
        2
      )}W`;
      badgeTone =
        solution.bulbPowerW > 0.02
          ? 'border-yellow-400/80 bg-[#2A2006]/95 text-yellow-200'
          : 'border-slate-700 bg-[#0F172A]/95 text-slate-300';
    } else if (label.id === 'rheostat_20') {
      badgeTitle = 'Biến Trở 20Ω';
      badgeMetric = `R = ${solution.rRheostatActiveOhm.toFixed(1)} Ω`;
      badgeTone = 'border-rose-500/50 bg-[#0F172A]/95 text-rose-200';
    } else if (label.id === 'ammeter_dc') {
      badgeTitle = `Ampe Kế (${solution.ammeterScaleMax}A)`;
      badgeMetric = `I = ${solution.ammeterReadingA.toFixed(3)} A`;
      badgeTone =
        solution.ammeterReverse || solution.ammeterOverRange
          ? 'border-rose-500 bg-[#350D15]/95 text-rose-200'
          : 'border-emerald-500/60 bg-[#0F172A]/95 text-emerald-200';
    } else if (label.id === 'voltmeter_dc') {
      badgeTitle = `Vôn Kế (${solution.voltmeterScaleMax}V)`;
      badgeMetric = `U = ${solution.voltmeterReadingV.toFixed(2)} V`;
      badgeTone =
        solution.voltmeterReverse || solution.voltmeterOverRange
          ? 'border-rose-500 bg-[#350D15]/95 text-rose-200'
          : 'border-sky-500/60 bg-[#0F172A]/95 text-sky-200';
    } else {
      badgeMetric = '1.5V DC (Kéo vào giá đỡ)';
    }

    return (
      <div
        key={label.id}
        style={{ left: `${label.x}px`, top: `${label.y}px` }}
        className="fixed -translate-x-1/2 -translate-y-full pointer-events-auto z-10 select-none"
      >
        <div
          className={`px-2.5 py-1 rounded-md border shadow-md flex flex-col items-center gap-0.5 ${badgeTone}`}
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[10px] font-bold tracking-tight opacity-85">
              {badgeTitle}:
            </span>
            <span className="text-[11px] font-mono font-bold">{badgeMetric}</span>
            <button
              onClick={() => setInspectedItem(spec)}
              className="ml-0.5 text-slate-400 hover:text-white cursor-pointer"
              title="Xem thông tin giới thiệu thiết bị (hoặc nhấp đúp vào vật)"
            >
              <Info className="w-3 h-3" />
            </button>
          </div>

          {label.id === 'knife_switch' && (
            <button
              onClick={() => {
                setSwitchClosed((v) => {
                  const next = !v;
                  playSound('switch', next);
                  return next;
                });
              }}
              className="mt-0.5 px-2 py-0.5 rounded bg-black/40 hover:bg-black/60 text-[10px] font-semibold cursor-pointer"
            >
              {switchClosed ? 'Gạt Mở Cầu Dao' : 'Gạt Đóng Khít Cầu Dao'}
            </button>
          )}

          {label.id === 'rheostat_20' && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="range"
                min={0}
                max={20}
                step={0.5}
                value={rheostatOhm}
                onChange={(e) => setRheostatOhm(parseFloat(e.target.value))}
                className="w-20 h-1.5 accent-amber-400 cursor-pointer"
              />
            </div>
          )}

          {spec.isImportedHtml && spec.importedModule && (
            <div className="flex flex-col items-center gap-1 mt-0.5 w-full">
              <input
                type="range"
                min={spec.importedModule.controls.min}
                max={spec.importedModule.controls.max}
                step={spec.importedModule.controls.step}
                value={
                  customDeviceValues[spec.importedModule.id] !== undefined
                    ? customDeviceValues[spec.importedModule.id]
                    : spec.importedModule.controls.defaultValue
                }
                onChange={(e) =>
                  handleChangeCustomDeviceValue(
                    spec.importedModule!.id,
                    parseFloat(e.target.value)
                  )
                }
                className="w-24 h-1.5 accent-sky-400 cursor-pointer"
              />
              {spec.importedModule.controls.presets.length > 0 && (
                <div className="flex items-center gap-1">
                  {spec.importedModule.controls.presets.slice(0, 3).map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleChangeCustomDeviceValue(spec.importedModule!.id, p.value)
                      }
                      className="px-1.5 py-0.5 rounded bg-black/40 hover:bg-black/60 text-[9px] font-mono text-sky-200 cursor-pointer"
                    >
                      {p.value}
                      {spec.importedModule!.controls.unit}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const [selectedCodeSpec, setSelectedCodeSpec] = useState<ExportableEquipmentSpec>(
    EXPORTABLE_MODULES[0]
  );
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [codeViewSection, setCodeViewSection] = useState<'full' | 'manifest' | 'script3d'>('full');

  const handleDownloadEquipmentHtml = (spec: ExportableEquipmentSpec) => {
    const htmlContent = generateStandaloneEquipmentHtml(spec);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = spec.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllEquipmentHtml = () => {
    EXPORTABLE_MODULES.forEach((spec, idx) => {
      window.setTimeout(() => {
        handleDownloadEquipmentHtml(spec);
      }, idx * 180);
    });
  };

  const handleCopyEquipmentHtml = async (codeText: string) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = codeText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const openEquipmentCodeModal = (workbenchItemId?: string) => {
    if (workbenchItemId) {
      const normalizedId =
        workbenchItemId === 'single_battery_holder_2'
          ? 'single_battery_holder_1'
          : workbenchItemId === 'battery_cell_2' ||
            workbenchItemId === 'battery_cell_3' ||
            workbenchItemId === 'battery_cell_4'
          ? 'battery_cell_1'
          : workbenchItemId;
      const found = EXPORTABLE_MODULES.find(
        (m) => m.workbenchItemId === normalizedId || m.targetFilter === normalizedId
      );
      if (found) {
        setSelectedCodeSpec(found);
      }
    }
    setShowExportModal(true);
  };

  const fullSelectedHtmlCode = useMemo(() => {
    if (!showExportModal) return '';
    return generateStandaloneEquipmentHtml(selectedCodeSpec);
  }, [showExportModal, selectedCodeSpec]);

  const displayedCodeContent = useMemo(() => {
    if (!fullSelectedHtmlCode) return '';
    if (codeViewSection === 'manifest') {
      const match = fullSelectedHtmlCode.match(
        /<script id="ol3d-module-manifest"[^>]*>([\s\S]*?)<\/script>/i
      );
      return match ? match[0] : fullSelectedHtmlCode;
    }
    if (codeViewSection === 'script3d') {
      const match = fullSelectedHtmlCode.match(
        /<script id="ol3d-module-3d-script">([\s\S]*?)<\/script>/i
      );
      return match ? match[0] : fullSelectedHtmlCode;
    }
    return fullSelectedHtmlCode;
  }, [fullSelectedHtmlCode, codeViewSection]);

  const itemsInCabinetCount = Object.values(inCabinetMap).filter(Boolean).length;

  return (
    <div className="relative h-screen w-screen bg-[#131C2E] text-[#F8FAFC] overflow-hidden select-none flex flex-col">
      {/* THANH CÔNG CỤ TRÊN CÙNG — MẶC ĐỊNH ẨN BỚT, KHI BẤM "HIỆN THANH CÔNG CỤ" MỚI HIỆN ĐẦY ĐỦ */}
      {showTopToolbar && (
        <header className="min-h-12 shrink-0 bg-[#0F172A] border-b border-slate-800 px-3.5 py-1.5 flex items-center justify-between gap-2 z-30 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight text-slate-100 flex items-center gap-2">
                <span>PHÒNG THÍ NGHIỆM MẠCH ĐIỆN 3D (BÀN GỖ 2.0m × 1.0m & KỆ TỦ 2 BÊN)</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Nhấp đúp vào mặt bàn để về góc nhìn tổng thể • Kéo vật thả lên kệ gỗ 2 bên hoặc cất vào Tủ Vật Phẩm Trái / Phải
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-800">
              <button
                onClick={() => setWireColor('red')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer ${
                  wireColor === 'red'
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-300" />
                Dây Đỏ (+)
              </button>
              <button
                onClick={() => setWireColor('blue')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer ${
                  wireColor === 'blue'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-300" />
                Dây Xanh (-)
              </button>
            </div>

            <button
              onClick={handleSaveExperiment}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-[11px] font-bold text-white flex items-center gap-1 shadow cursor-pointer"
              title="Lưu toàn bộ vị trí vật phẩm, dây cắm, công tắc và trạng thái hiện tại để khi truy cập lại vẫn giữ nguyên"
            >
              <Save className="w-3.5 h-3.5" />
              Lưu Thí Nghiệm
            </button>

            <button
              onClick={putAllIntoCabinet}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 flex items-center gap-1 cursor-pointer"
              title="Sắp xếp tất cả vật phẩm lên kệ bằng kính"
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              Đưa Tất Cả Vật Phẩm Lên Kệ
            </button>

            <button
              onClick={placeAllOnTableUnwired}
              className={`px-2.5 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                appMode === 'custom_build' && itemsInCabinetCount === 0 && wires.length === 0
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <PackageOpen className="w-3.5 h-3.5 text-emerald-400" />
              Đưa Ra Bàn (Tự Lắp)
            </button>

            <button
              onClick={activateReferenceTemplateMode}
              className={`px-2.5 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                appMode === 'template_demo'
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              Bản Mẫu Nối Tiếp
            </button>

            <button
              onClick={() => setShowWirePopover((v) => !v)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <Cable className="w-3.5 h-3.5 text-sky-400" />
              Dây ({activeWires.length})
            </button>

            <button
              onClick={() => setShowDeviceOverlays((v) => !v)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              {showDeviceOverlays ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-400" /> Nhãn Thiết Bị
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" /> Nhãn Thiết Bị
                </>
              )}
            </button>

            <button
              onClick={() => setShowBlackboardModal(true)}
              className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-[11px] font-semibold text-emerald-200 flex items-center gap-1 cursor-pointer"
              title="Tự nhập nội dung hiển thị lên Bảng Đen trong phòng thí nghiệm"
            >
              <PenTool className="w-3.5 h-3.5 text-emerald-400" />
              Viết Bảng Đen
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 border border-sky-400 text-[11px] font-bold text-white flex items-center gap-1.5 shadow cursor-pointer"
              title="Nạp file .HTML thiết bị từ máy tính, kiểm tra 4 khối, xem yêu cầu kỹ thuật, tải file mẫu và lưu vào Bộ lưu trữ để đưa lên kệ/bàn 3D"
            >
              <Upload className="w-3.5 h-3.5" />
              Nạp & Lưu Trữ (.HTML)
              {storedHtmlModules.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-extrabold">
                  {storedHtmlModules.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 border border-amber-300 text-[11px] font-bold text-slate-950 flex items-center gap-1.5 shadow cursor-pointer"
              title="Xem mã nguồn .HTML và tải từng thiết bị (hoặc trọn bộ) về máy để upload lên nền tảng khác"
            >
              <Code2 className="w-3.5 h-3.5" />
              Code Thiết Bị (.HTML)
            </button>

            <button
              onClick={() => setShowTopToolbar(false)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] font-semibold text-slate-300 flex items-center gap-1 cursor-pointer"
              title="Ẩn bớt thanh công cụ ở trên để không gian thí nghiệm rộng rãi hơn"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              Ẩn Công Cụ
            </button>
          </div>
        </header>
      )}

      {/* KHÔNG GIAN 3D TOÀN MÀN HÌNH */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {/* CỤM NÚT GỌN GÀNG Ở GÓC TRÊN PHẢI KHI ẨN THANH CÔNG CỤ (BẤM HIỆN MỚI HIỆN) */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <button
            onClick={handleSaveExperiment}
            className="px-3 py-1.5 rounded-md bg-emerald-600/95 hover:bg-emerald-500 border border-emerald-400 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg cursor-pointer"
            title={
              lastSavedAt
                ? `Đã lưu lúc ${new Date(lastSavedAt).toLocaleTimeString('vi-VN')} — Bấm để lưu trạng thái mới nhất`
                : 'Lưu trạng thái thí nghiệm để khi truy cập lại không bị reset'
            }
          >
            <Save className="w-3.5 h-3.5" />
            Lưu Thí Nghiệm
          </button>

          <button
            onClick={resetCameraToOverview}
            className="px-2.5 py-1.5 rounded-md bg-[#0F172A]/95 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 shadow-lg cursor-pointer"
            title="Đưa góc nhìn về vị trí tổng thể ban đầu (Hoặc nhấp đúp chuột vào mặt bàn gỗ)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
            Góc Nhìn Chuẩn
          </button>

          {!showTopToolbar && (
            <button
              onClick={() => setShowTopToolbar(true)}
              className="px-3 py-1.5 rounded-md bg-sky-600/95 hover:bg-sky-500 border border-sky-400 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg cursor-pointer"
              title="Hiện đầy đủ các thanh công cụ ở trên"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Hiện Thanh Công Cụ
            </button>
          )}
        </div>

        {/* THÔNG BÁO TOAST KHI LƯU THÍ NGHIỆM / CẤT VẬT PHẨM / ĐẶT LÊN KỆ */}
        {toastBanner && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-md bg-emerald-950/95 border border-emerald-400 text-emerald-100 text-xs font-semibold shadow-xl flex items-center gap-2 pointer-events-none">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastBanner}</span>
          </div>
        )}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none max-w-3xl w-full px-4">
          <div
            className={`px-4 py-2 rounded-md border flex items-center justify-between gap-4 shadow-lg w-full ${
              solution.statusLevel === 'ok'
                ? 'bg-[#06281E] border-emerald-500/70 text-emerald-100'
                : solution.statusLevel === 'error'
                ? 'bg-[#350D15] border-rose-500 text-rose-100'
                : solution.statusLevel === 'warn'
                ? 'bg-[#332208] border-amber-500/80 text-amber-100'
                : 'bg-[#0F172A] border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              {solution.statusLevel === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : solution.statusLevel === 'error' || solution.statusLevel === 'warn' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Zap className="w-4 h-4 text-sky-400 shrink-0" />
              )}
              <span>{solution.statusMessage}</span>
            </div>

            {wires.length > 0 && (
              <button
                onClick={() => {
                  setWires([]);
                  setSelectedTerminal(null);
                  playSound('plug');
                }}
                className="pointer-events-auto shrink-0 px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-[10px] font-semibold text-rose-200 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Tháo hết dây
              </button>
            )}
          </div>

          {(hoveredTerminal || selectedTerminal || gizmoTargetId) && (
            <div className="px-3 py-1 rounded bg-[#0F172A] border border-amber-500/50 text-xs text-amber-300 font-mono shadow">
              {selectedTerminal ? (
                <span>
                  Đầu dây 1:{' '}
                  <strong>
                    {dynamicTerminalMeta[selectedTerminal]?.label || selectedTerminal}
                  </strong>
                  {hoveredTerminal && hoveredTerminal !== selectedTerminal
                    ? ` → Click để nối tới ${
                        dynamicTerminalMeta[hoveredTerminal]?.label || hoveredTerminal
                      }`
                    : ' (Click cọc cắm thứ 2 để nối)'}
                </span>
              ) : hoveredTerminal ? (
                <span>
                  Cọc cắm:{' '}
                  <strong>
                    {dynamicTerminalMeta[hoveredTerminal]?.label || hoveredTerminal}
                  </strong>{' '}
                  (Click chuột trái để cắm {wireColor === 'red' ? 'Dây Đỏ' : 'Dây Xanh'})
                </span>
              ) : (
                <span>
                  Đang mở 2 trục trên:{' '}
                  <strong>
                    {allEquipmentCatalog.find((s) => s.id === gizmoTargetId)?.name}
                  </strong>{' '}
                  — Kéo trục đứng (Xanh) để nâng lên cao, kéo vành tròn (Vàng) để xoay. Click ra ngoài để vật tự rơi xuống!
                </span>
              )}
            </div>
          )}
        </div>

        {showWirePopover && (
          <div className="absolute top-16 right-4 z-30 w-72 bg-[#0F172A] border border-slate-700 rounded-md shadow-2xl p-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200">
                Danh Sách Dây Đang Nối ({activeWires.length})
              </span>
              <button
                onClick={() => setShowWirePopover(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1">
              {activeWires.length === 0 ? (
                <div className="text-[11px] text-slate-400 py-3 text-center">
                  Chưa có dây nào. Click vào 2 cọc cắm bất kỳ trên thiết bị 3D để nối dây.
                </div>
              ) : (
                activeWires.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px]"
                  >
                    <span className="font-mono text-slate-200 truncate">
                      {w.from} ↔ {w.to}
                    </span>
                    <button
                      onClick={() =>
                        setWires((prev) => prev.filter((item) => item.id !== w.id))
                      }
                      className="text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {showDeviceOverlays &&
          projectedLabels.map((lbl) => (lbl.visible ? renderOnDeviceBadge(lbl) : null))}

        <div ref={mountRef} className="w-full h-full" />

        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-[#0F172A]/95 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-3.5 shadow-lg whitespace-nowrap pointer-events-none">
          <span>
            <strong className="text-amber-400">Lăn chuột:</strong> Zoom đúng vị trí trỏ chuột
          </span>
          <span>•</span>
          <span>
            <strong className="text-emerald-400">Kéo Pin vào Giá đỡ:</strong> Hiện ngăn màu xanh & tự xoay khớp hướng
          </span>
          <span>•</span>
          <span>
            <strong className="text-sky-400">Chuột phải:</strong> 2 trục (Nâng cao & Xoay) / Click ngoài: Tự rơi
          </span>
          <span>•</span>
          <span>
            <strong className="text-rose-400">Nhấp đúp:</strong> Giới thiệu & lấy Code .HTML
          </span>
        </div>
      </main>

      {/* MODAL GIỚI THIỆU CHI TIẾT VẬT DỤNG KHI NHẤP ĐÚP CHUỘT */}
      {inspectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setInspectedItem(null)}
        >
          <div
            className="bg-[#0F172A] border border-amber-500/50 rounded-lg max-w-lg w-full p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="text-[11px] font-mono text-amber-400 uppercase">
                  {inspectedItem.category} • Mã: {inspectedItem.modelCode}
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">
                  {inspectedItem.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectedItem(null)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 my-3.5 text-xs text-slate-300 leading-relaxed">
              <div>
                <div className="font-bold text-slate-100 mb-0.5">1. Giới thiệu cấu tạo:</div>
                <p className="text-slate-300">{inspectedItem.introduction}</p>
              </div>

              <div>
                <div className="font-bold text-emerald-400 mb-0.5">
                  2. Nguyên lý hoạt động & Quy tắc đấu dây:
                </div>
                <p className="text-slate-300">{inspectedItem.workingPrinciple}</p>
              </div>

              <div>
                <div className="font-bold text-amber-400 mb-1">
                  3. Các cọc cắm (Terminals) trên mô hình 3D:
                </div>
                <div className="space-y-1">
                  {inspectedItem.terminals.map((t) => (
                    <div
                      key={t.code}
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <span className="font-mono font-bold text-amber-300">{t.code}</span>
                      <span className="text-slate-300 text-right">{t.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-bold text-sky-400 mb-1">4. Thông số kỹ thuật:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {inspectedItem.specs.map((sp) => (
                    <div
                      key={sp.label}
                      className="p-2 rounded bg-slate-900 border border-slate-800"
                    >
                      <div className="text-[10px] text-slate-400">{sp.label}</div>
                      <div className="font-mono font-semibold text-slate-100 mt-0.5">
                        {sp.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    const isCurrentlyInCab = inCabinetMap[inspectedItem.id];
                    moveItemBetweenTableAndCabinet(inspectedItem.id, !isCurrentlyInCab);
                    setInspectedItem(null);
                  }}
                  className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  {inCabinetMap[inspectedItem.id]
                    ? 'Lấy Ra Bàn'
                    : 'Cất Vào Tủ'}
                </button>
                <button
                  onClick={() => {
                    const obj = getEquipmentObject(inspectedItem.id);
                    if (obj) {
                      obj.rotation.set(0, 0, 0);
                      if (
                        inspectedItem.id === 'battery_holder' ||
                        inspectedItem.id === 'single_battery_holder_1' ||
                        inspectedItem.id === 'single_battery_holder_2'
                      ) {
                        syncInsertedBatteriesToHolder();
                      }
                    }
                    playSound('plug');
                  }}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Đặt Lại Góc
                </button>
                <button
                  onClick={() => {
                    const id = inspectedItem.id;
                    setInspectedItem(null);
                    openEquipmentCodeModal(id);
                  }}
                  className="px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Xem & Tải Code .HTML
                </button>
              </div>

              <button
                onClick={() => setInspectedItem(null)}
                className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM MÃ NGUỒN & TẢI FILE .HTML ĐỘC LẬP CỦA CÁC THIẾT BỊ (CHUẨN OL3D v2.4) */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-[#0F172A] border border-amber-500/50 rounded-lg max-w-6xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    Mục Code Của Các Thiết Bị (.HTML Độc Lập — Chuẩn OpenLab 3D v2.4)
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                    Đạt 7/7 Cổng Kiểm Định G1–G7
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mỗi file <code className="text-amber-300 font-mono">.html</code> giữ nguyên 100% tính năng cải tiến (4 chốt biến trở, rà pin hiện màu xanh khớp giá đỡ, vuốt cầu dao lên/xuống, giải mạch Phần A & B, chuột phải 2 trục & trọng lực, chống xuyên thấu) để tải về và upload trực tiếp lên nền tảng khác.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadAllEquipmentHtml}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                  title="Tải xuống toàn bộ 9 file .HTML của các thiết bị cùng lúc"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải Tất Cả ({EXPORTABLE_MODULES.length} File .HTML)
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body: 2 cột (Danh sách thiết bị bên trái + Chi tiết & Code .HTML bên phải) */}
            <div className="flex-1 min-h-0 grid grid-cols-12 divide-x divide-slate-800">
              {/* Cột trái: Danh sách 9 thiết bị */}
              <div className="col-span-4 flex flex-col min-h-0 bg-slate-950/30">
                <div className="px-3.5 py-2.5 border-b border-slate-800 text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Danh Sách File Thiết Bị ({EXPORTABLE_MODULES.length})</span>
                  <span className="text-[10px] font-mono text-amber-400">OL3D-v2.4</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
                  {EXPORTABLE_MODULES.map((spec, idx) => {
                    const isSelected = selectedCodeSpec.slug === spec.slug;
                    return (
                      <div
                        key={spec.slug}
                        onClick={() => setSelectedCodeSpec(spec)}
                        className={`p-2.5 rounded-md border transition cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/80 text-slate-100 shadow'
                            : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-bold truncate">
                              {spec.name}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-sky-400 truncate mt-1">
                            {spec.filename}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            Mã: {spec.modelCode} • {spec.massG}g
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadEquipmentHtml(spec);
                          }}
                          className="shrink-0 px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title={`Tải file ${spec.filename} về máy`}
                        >
                          <Download className="w-3 h-3" />
                          .HTML
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cột phải: Thông tin chức năng bảo toàn + Khung xem & copy mã nguồn .HTML */}
              <div className="col-span-8 flex flex-col min-h-0 bg-[#0B1120]">
                {/* Thông tin thiết bị đang chọn */}
                <div className="p-4 border-b border-slate-800 space-y-3 shrink-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {selectedCodeSpec.filename}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          ({(fullSelectedHtmlCode.length / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                        {selectedCodeSpec.name}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {selectedCodeSpec.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyEquipmentHtml(displayedCodeContent)}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Đã Copy Code!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-sky-400" />
                            <span>Copy Mã Nguồn .HTML</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDownloadEquipmentHtml(selectedCodeSpec)}
                        className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Tải File {selectedCodeSpec.filename}
                      </button>
                    </div>
                  </div>

                  {/* Các chức năng giữ nguyên và cọc đấu dây */}
                  <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                    <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                      <div className="font-bold text-emerald-400 mb-1">
                        Chức năng giữ nguyên trong file .HTML:
                      </div>
                      <ul className="space-y-0.5 text-slate-300 list-disc list-inside">
                        {selectedCodeSpec.preservedFeatures.map((feat, i) => (
                          <li key={i} className="truncate" title={feat}>
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                      <div className="font-bold text-amber-400 mb-1">
                        Cọc đấu nối 3D & Cấu trúc chuẩn v2.4:
                      </div>
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {selectedCodeSpec.terminals.map((term) => (
                          <span
                            key={term.code}
                            title={term.desc}
                            className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-amber-300"
                          >
                            {term.code}: {term.desc}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Đầy đủ 4 khối: <code className="text-sky-300">#ol3d-module-manifest</code>,{' '}
                        <code className="text-sky-300">#ol3d-module-icon</code>,{' '}
                        <code className="text-sky-300">#ol3d-module-real-photo</code>,{' '}
                        <code className="text-sky-300">#ol3d-module-3d-script</code>
                      </div>
                    </div>
                  </div>

                  {/* Thanh chuyển chế độ xem code */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCodeViewSection('full')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                          codeViewSection === 'full'
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Toàn Bộ File (.HTML Độc Lập)
                      </button>
                      <button
                        onClick={() => setCodeViewSection('manifest')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                          codeViewSection === 'manifest'
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Khối 1: Manifest JSON (OL3D v2.4)
                      </button>
                      <button
                        onClick={() => setCodeViewSection('script3d')}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                          codeViewSection === 'script3d'
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Khối 4: 3D Procedural Script (Three.js)
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {displayedCodeContent.split('\n').length} dòng code
                    </span>
                  </div>
                </div>

                {/* Khung hiển thị mã nguồn .HTML */}
                <div className="flex-1 min-h-0 relative bg-[#070B14] p-3 overflow-auto select-text">
                  <pre className="text-[11px] font-mono text-emerald-300/95 leading-relaxed whitespace-pre overflow-x-auto">
                    {displayedCodeContent}
                  </pre>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span>
                Mẹo: Bạn có thể bấm <strong className="text-amber-300">Tải File .HTML</strong> để nhận file trực tiếp và upload ngay lên nền tảng khác (OpenLab 3D / LMS / Web).
              </span>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TỰ NHẬP NỘI DUNG BẢNG ĐEN PHÒNG THÍ NGHIỆM */}
      {showBlackboardModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowBlackboardModal(false)}
        >
          <div
            className="bg-[#0F172A] border border-emerald-500/50 rounded-lg max-w-lg w-full p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Viết Nội Dung Lên Bảng Đen Phòng Thí Nghiệm
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Nội dung bạn nhập sẽ hiển thị trực tiếp lên bảng phấn 3D phía sau phòng thí nghiệm.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBlackboardModal(false)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 my-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Tiêu đề trên bảng:
                </label>
                <input
                  type="text"
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bài thí nghiệm..."
                  className="w-full px-3 py-2 rounded bg-[#0f392b] border border-emerald-700/70 text-xs font-bold text-slate-100 placeholder-emerald-300/40 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Nội dung ghi chép / công thức (Enter để xuống dòng):
                </label>
                <textarea
                  rows={5}
                  value={boardContent}
                  onChange={(e) => setBoardContent(e.target.value)}
                  placeholder="Nhập nội dung bài học, công thức hoặc ghi chú thí nghiệm..."
                  className="w-full px-3 py-2 rounded bg-[#0f392b] border border-emerald-700/70 text-xs font-mono text-slate-100 placeholder-emerald-300/40 focus:outline-none focus:border-emerald-400 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-300">Màu phấn viết:</span>
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { id: 'white', label: 'Phấn Trắng', dot: 'bg-white' },
                      { id: 'yellow', label: 'Phấn Vàng', dot: 'bg-yellow-300' },
                      { id: 'cyan', label: 'Phấn Xanh Lam', dot: 'bg-cyan-300' },
                      { id: 'green', label: 'Phấn Xanh Lá', dot: 'bg-emerald-300' },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setBoardChalkColor(c.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 border cursor-pointer ${
                        boardChalkColor === c.id
                          ? 'bg-slate-800 border-emerald-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setBoardTitle('');
                    setBoardContent('');
                  }}
                  className="px-2.5 py-1.5 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-xs font-semibold cursor-pointer"
                >
                  Xóa Trắng Bảng
                </button>
                <button
                  onClick={() => {
                    setBoardTitle('PHÒNG THÍ NGHIỆM VẬT LÝ — MẠCH ĐIỆN MỘT CHIỀU');
                    setBoardContent(
                      'Định luật Ôm: I = U / R     •     Công suất: P = U · I = I² · R\nGhép nối tiếp 2 nguồn: E_bộ = E1 + E2  (Nối cực + pin này với cực - pin kia)'
                    );
                    setBoardChalkColor('white');
                  }}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Khôi Phục Mặc Định
                </button>
              </div>

              <button
                onClick={() => setShowBlackboardModal(false)}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRẠM NẠP, CHẨN ĐOÁN 4 KHỐI & KHO LƯU TRỮ THIẾT BỊ .HTML */}
      <HtmlImportStudioModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        storedModules={storedHtmlModules}
        onSaveModuleToWorkbench={handleSaveModuleToWorkbench}
        onDeleteStoredModule={handleDeleteStoredModule}
        onFocusModuleOnTable={handleFocusModuleOnTable}
        onToggleCabinetModule={(id) =>
          moveItemBetweenTableAndCabinet(id, !inCabinetMap[id])
        }
        inCabinetMap={inCabinetMap}
        customDeviceValues={customDeviceValues}
        onChangeCustomDeviceValue={handleChangeCustomDeviceValue}
      />

      {/* TRANG VẬT PHẨM TRONG TỦ VẬT PHẨM TRÁI HOẶC TỦ VẬT PHẨM PHẢI (2 TỦ HOÀN TOÀN RIÊNG BIỆT) */}
      <UnderShelfDrawerModal
        isOpen={activeCabinetModalSide !== null}
        cabinetSide={activeCabinetModalSide}
        onClose={() => setActiveCabinetModalSide(null)}
        allCatalog={allEquipmentCatalog}
        cabinetStorageSideMap={cabinetStorageSideMap}
        onPlaceItemOnMainTable={(id) => {
          moveItemBetweenTableAndCabinet(id, false);
          setActiveCabinetModalSide(null);
        }}
        onPlaceItemOnCabinetShelf={(id, side) => {
          placeItemOnSideShelf(id, side);
          setActiveCabinetModalSide(null);
        }}
      />
    </div>
  );
}
