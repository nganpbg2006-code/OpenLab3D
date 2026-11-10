export interface EquipmentControlPreset {
  label: string;
  value: number;
}

export interface EquipmentControlConfig {
  labelVi: string;
  labelEn: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  presets: EquipmentControlPreset[];
}

export interface ExportableEquipmentSpec {
  id: string;
  assetId: string;
  slug: string;
  name: string;
  nameEn: string;
  modelCode: string;
  filename: string;
  description: string;
  dimensionsM: [number, number, number];
  massG: number;
  category: string;
  targetFilter: string;
  workbenchItemId?: string;
  preservedFeatures: string[];
  terminals: { code: string; desc: string }[];
  controlConfig: EquipmentControlConfig;
  annotations: { xPercent: number; yPercent: number; label: string }[];
}

export const EXPORTABLE_MODULES: ExportableEquipmentSpec[] = [
  {
    id: 'full_kit',
    assetId: 'OL3D-EQP-DC-SERIES-CIRCUIT-KIT-01',
    slug: 'bo-mach-dien-noi-tiep-day-du',
    name: '1. Trọn Bộ Phòng Thí Nghiệm Mạch Điện Nối Tiếp 3D (Đầy Đủ)',
    nameEn: '3D Modular DC Series Circuit Experiment Kit (Full Workbench)',
    modelCode: 'OL3D-FULL-KIT-V2.4',
    filename: 'ol3d-bo-mach-dien-noi-tiep-day-du-v2.4.html',
    description:
      'Toàn bộ phòng thí nghiệm 3D: Bàn gỗ 2.0m × 1.0m, Tủ kính 2 tầng đối diện, Bảng đen tương tác, Giá đỡ 2 pin, 2 Giá đỡ 1 pin, 4 Pin Con Ó 1.5V, Cầu dao K, Biến trở 20Ω (4 chốt), Bóng đèn 126, Ampe kế, Vôn kế & Dây bắp chuối.',
    dimensionsM: [0.54, 0.125, 0.36],
    massG: 1250,
    category: 'Trọn bộ thí nghiệm Điện học DC',
    targetFilter: 'ALL',
    preservedFeatures: [
      'Đầy đủ Phần A (Nguồn 1 Pin) & Phần B (Nguồn 2 Pin Nối tiếp / Song song) với 3 trường hợp chuẩn',
      'Rà viên pin vào Giá đỡ 2 pin hoặc Giá đỡ 1 pin hiện màu xanh lá & tự động khớp chiều ngang/dọc',
      'Rà chuột vào thanh Cầu dao K hiện màu xanh lá, vuốt/kéo lên để Mở, vuốt/kéo xuống để Đóng khít',
      'Biến trở 20Ω đủ 4 chốt (2 chốt dưới cuộn dây, 2 chốt trên thanh kim loại) hỗ trợ Kiểu 1, Kiểu 2, Kiểu 3',
      'Chuột phải mở 2 trục (Nâng cao & Xoay tròn), click ra ngoài tự rơi theo trọng lực, nhấp đúp xem chi tiết',
      'Chống xuyên thấu ("ruột đặc") giữa các thiết bị & dây cắm bắp chuối tự vòng qua vật cản, zoom tại trỏ chuột',
    ],
    terminals: [
      { code: 'BAT1_POS / BAT1_NEG / BAT2_POS / BAT2_NEG', desc: '4 cọc Giá đỡ 2 pin' },
      { code: 'SBAT1_POS / SBAT1_NEG / SBAT2_POS / SBAT2_NEG', desc: '4 cọc của 2 Giá đỡ 1 pin' },
      { code: 'SW_RED / SW_GREEN', desc: '2 cọc Cầu dao K' },
      { code: 'RHEO_IN / RHEO_COIL_END / RHEO_RAIL_L / RHEO_WIPER', desc: '4 chốt Biến trở 20Ω' },
      { code: 'BULB_NEG / BULB_POS', desc: '2 chốt Bóng đèn sợi đốt' },
      { code: 'AM_NEG / AM_06A / AM_3A & VM_NEG / VM_6V / VM_12V', desc: '6 cọc Ampe kế & Vôn kế' },
    ],
    controlConfig: {
      labelVi: 'Giá trị biến trở con chạy R_bt (Ω)',
      labelEn: 'Rheostat Resistance R_bt (Ω)',
      unit: 'Ω',
      min: 0,
      max: 20,
      step: 0.5,
      defaultValue: 4.0,
      presets: [
        { label: 'R = 0 Ω (Đèn sáng mạnh nhất)', value: 0.0 },
        { label: 'R = 4 Ω (Đèn sáng chuẩn)', value: 4.0 },
        { label: 'R = 10 Ω (Đèn sáng mờ)', value: 10.0 },
        { label: 'R = 20 Ω (Dòng nhỏ nhất)', value: 20.0 },
      ],
    },
    annotations: [
      { xPercent: 18, yPercent: 28, label: '1. Giá đỡ + 2 Pin đại Con Ó 1.5V (SLOT_1 & SLOT_2)' },
      { xPercent: 50, yPercent: 28, label: '2. Ampe kế (0.6A/3A) & Vôn kế (6V/12V)' },
      { xPercent: 82, yPercent: 28, label: '3. Biến trở con chạy 20Ω (4 chốt cắm)' },
      { xPercent: 28, yPercent: 72, label: '4. Cầu dao K & Bóng đèn dây tóc 126 (4.8Ω)' },
    ],
  },
  {
    id: 'battery_holder',
    assetId: 'OL3D-EQP-DUAL-BATTERY-HOLDER-02',
    slug: 'gia-do-2-pin-trong-suot',
    name: '2. Giá Đỡ 2 Pin Nhựa Trong Suốt (4 Cọc Đỏ/Đen)',
    nameEn: 'Transparent Acrylic 2-Cell D Battery Holder (4 Binding Posts)',
    modelCode: 'OL3D-BH2-V2.4',
    filename: 'ol3d-gia-do-2-pin-trong-suot-v2.4.html',
    description:
      'Giá đỡ 2 viên pin đại bằng nhựa Acrylic trong suốt có 2 ngăn độc lập (SLOT_1 & SLOT_2) và 4 cọc đấu điện ở 4 góc. Kèm sẵn pin đại Con Ó để kéo rà vào khay hiện màu xanh lá và tự khớp.',
    dimensionsM: [0.14, 0.042, 0.088],
    massG: 145,
    category: 'Nguồn điện một chiều (DC)',
    targetFilter: 'unit_battery_holder',
    workbenchItemId: 'battery_holder',
    preservedFeatures: [
      'Kéo viên pin rà vào Ngăn 1 hoặc Ngăn 2 sẽ sáng màu xanh lá, thả chuột tự động khớp pin đúng chiều',
      'Khi di chuyển, nâng cao hoặc xoay Giá đỡ 2 pin, các viên pin bên trong tự động di chuyển và xoay theo',
      'Chuột phải mở 2 trục (Nâng cao & Xoay tròn), click ra ngoài tự rơi xuống bàn, nhấp đúp xem thông số',
      '4 cọc cắm độc lập (BAT1_POS, BAT1_NEG, BAT2_NEG, BAT2_POS) hỗ trợ dùng 1 pin hoặc ghép 2 pin nối tiếp/song song',
    ],
    terminals: [
      { code: 'BAT1_POS', desc: 'Cọc Đỏ trái (+ Ngăn 1)' },
      { code: 'BAT1_NEG', desc: 'Cọc Đen phải (- Ngăn 1)' },
      { code: 'BAT2_NEG', desc: 'Cọc Đen trái (- Ngăn 2)' },
      { code: 'BAT2_POS', desc: 'Cọc Đỏ phải (+ Ngăn 2)' },
    ],
    controlConfig: {
      labelVi: 'Trạng thái lắp pin & Điện áp bộ nguồn (V)',
      labelEn: 'Battery Insertion & Source Voltage (V)',
      unit: 'V',
      min: 0,
      max: 3.0,
      step: 1.5,
      defaultValue: 3.0,
      presets: [
        { label: 'Tháo rời 2 pin (0.0 V - Hiện khay xanh)', value: 0.0 },
        { label: 'Lắp 1 viên pin Ngăn 1 (1.5 V DC)', value: 1.5 },
        { label: 'Lắp đủ 2 viên pin Con Ó (3.0 V DC)', value: 3.0 },
      ],
    },
    annotations: [
      { xPercent: 18, yPercent: 25, label: '1. Cọc dương BAT1_POS (+) và âm BAT1_NEG (-) Ngăn 1' },
      { xPercent: 22, yPercent: 38, label: '2. Cọc âm BAT2_NEG (-) và dương BAT2_POS (+) Ngăn 2' },
      { xPercent: 16, yPercent: 45, label: '3. Thân nhựa Acrylic trong suốt + bản đồng tiếp điện' },
    ],
  },
  {
    id: 'single_battery_holder_1',
    assetId: 'OL3D-EQP-SINGLE-BATTERY-HOLDER-03',
    slug: 'gia-do-1-pin-don-trong-suot',
    name: '3. Giá Đỡ 1 Pin Đơn Trong Suốt (2 Cọc Đỏ/Đen)',
    nameEn: 'Transparent Acrylic Single D-Cell Battery Holder (2 Binding Posts)',
    modelCode: 'OL3D-BH1-V2.4',
    filename: 'ol3d-gia-do-1-pin-don-v2.4.html',
    description:
      'Giá đỡ đơn 1 viên pin đại 1.5V bằng nhựa Acrylic trong suốt có 2 cọc SBAT1_POS (+) và SBAT1_NEG (-). Kéo viên pin rà vào khay sẽ hiện màu xanh lá và tự động khớp đúng chiều.',
    dimensionsM: [0.14, 0.042, 0.048],
    massG: 85,
    category: 'Nguồn điện một chiều (DC)',
    targetFilter: 'unit_single_battery_holder_1',
    workbenchItemId: 'single_battery_holder_1',
    preservedFeatures: [
      'Kéo viên pin đại 1.5V rà vào khay đơn hiện màu xanh lá, thả chuột tự động khớp pin đúng hướng ngang/dọc',
      'Viên pin đã lắp luôn di chuyển, xoay và nâng hạ đồng bộ cùng Giá đỡ 1 pin',
      'Kết hợp 2 Giá đỡ 1 pin để thực hành ghép nguồn nối tiếp (3.0V) hoặc song song (1.5V) ở Phần B',
      'Chuột phải mở 2 trục (Nâng cao & Xoay tròn), click ra ngoài tự rơi, nhấp đúp xem giới thiệu chi tiết',
    ],
    terminals: [
      { code: 'SBAT1_POS', desc: 'Cọc Đỏ trái (+ Cực Dương Giá đỡ 1 pin #1)' },
      { code: 'SBAT1_NEG', desc: 'Cọc Đen phải (- Cực Âm Giá đỡ 1 pin #1)' },
      { code: 'SBAT2_POS / SBAT2_NEG', desc: 'Cọc Đỏ (+) & Đen (-) của Giá đỡ 1 pin #2 đi kèm' },
    ],
    controlConfig: {
      labelVi: 'Trạng thái lắp viên pin đại (V)',
      labelEn: 'Single Battery Holder State (V)',
      unit: 'V',
      min: 0,
      max: 1.5,
      step: 1.5,
      defaultValue: 1.5,
      presets: [
        { label: 'Tháo viên pin ra ngoài (0.0 V - Hiện khay xanh)', value: 0.0 },
        { label: 'Lắp viên pin đại Con Ó vào khay (1.5 V DC)', value: 1.5 },
      ],
    },
    annotations: [
      { xPercent: 18, yPercent: 25, label: '1. Cọc Đỏ cực Dương SBAT1_POS (+)' },
      { xPercent: 25, yPercent: 38, label: '2. Cọc Đen cực Âm SBAT1_NEG (-)' },
      { xPercent: 16, yPercent: 45, label: '3. Khay nhựa trong suốt nhận diện lắp pin tự động' },
    ],
  },
  {
    id: 'battery_cell_1',
    assetId: 'OL3D-EQP-PINACO-CON-O-R20S-04',
    slug: 'vien-pin-dai-con-o-1-5v',
    name: '4. Viên Pin Đại Con Ó 1.5V (PINACO R20S)',
    nameEn: 'PINACO Con O R20S 1.5V D-Size Dry Cell Battery',
    modelCode: 'PINACO-R20S-V2.4',
    filename: 'ol3d-vien-pin-dai-con-o-1.5v-v2.4.html',
    description:
      'Viên pin đại Con Ó R20S 1.5V vỏ vàng-đen đặc trưng, đầu có núm nhô kim loại là cực Dương (+), đáy phẳng là cực Âm (-). Hỗ trợ kéo thả lắp vào mọi Giá đỡ pin.',
    dimensionsM: [0.09, 0.033, 0.033],
    massG: 95,
    category: 'Nguồn điện hóa học DC',
    targetFilter: 'unit_battery_1',
    workbenchItemId: 'battery_cell_1',
    preservedFeatures: [
      'Mô hình 3D chuẩn kích thước pin đại R20S (Ø31 × 90mm) với núm cực Dương (+) và đáy cực Âm (-)',
      'Kéo rà vào Giá đỡ 2 pin hoặc Giá đỡ 1 pin sẽ kích hoạt vùng sáng xanh lá và tự xoay khớp chiều cực',
      'Chuột phải mở 2 trục (Nâng lên cao & Xoay tròn 360°), click ra ngoài rơi tự do xuống mặt bàn',
      'Nhấp đúp chuột hiển thị đầy đủ thông số suất điện động E = 1.50V, điện trở trong r = 0.12Ω',
    ],
    terminals: [
      { code: 'Cực Dương (+)', desc: 'Đầu có núm kim loại nhô ra' },
      { code: 'Cực Âm (-)', desc: 'Đáy kim loại phẳng' },
    ],
    controlConfig: {
      labelVi: 'Suất điện động danh định của Pin E (V)',
      labelEn: 'Nominal Battery EMF E (V)',
      unit: 'V',
      min: 0,
      max: 1.5,
      step: 0.25,
      defaultValue: 1.5,
      presets: [
        { label: 'Pin mới đầy điện (E = 1.50 V)', value: 1.5 },
        { label: 'Pin yếu (E = 1.00 V)', value: 1.0 },
        { label: 'Pin cạn (E = 0.00 V)', value: 0.0 },
      ],
    },
    annotations: [
      { xPercent: 14, yPercent: 28, label: '1. Núm kim loại nhô cao — Cực Dương (+)' },
      { xPercent: 20, yPercent: 32, label: '2. Vỏ kẽm bọc nhãn Vàng-Đen Con Ó PINACO 1.5V' },
      { xPercent: 26, yPercent: 36, label: '3. Đáy kẽm phẳng — Cực Âm (-)' },
    ],
  },
  {
    id: 'knife_switch',
    assetId: 'OL3D-EQP-KNIFE-SWITCH-K-05',
    slug: 'cau-dao-dong-ngat-k',
    name: '5. Cầu Dao Đóng Ngắt K (Công Tắc Khóa K Đế Cam)',
    nameEn: 'Single-Pole Knife Switch K (Orange Insulated Base)',
    modelCode: 'OL3D-SWK-V2.4',
    filename: 'ol3d-cau-dao-dong-ngat-k-v2.4.html',
    description:
      'Cầu dao đơn K đế nhựa cam cách điện với 2 cọc SW_RED (Đỏ) & SW_GREEN (Xanh lá), ngàm kẹp chữ U và lưỡi dao đồng có tay nắm đen.',
    dimensionsM: [0.112, 0.045, 0.068],
    massG: 110,
    category: 'Khí cụ đóng cắt mạch',
    targetFilter: 'unit_switch',
    workbenchItemId: 'knife_switch',
    preservedFeatures: [
      'Rà con trỏ chuột vào thanh bật/tắt công tắc sẽ hiện màu xanh lá nổi bật',
      'Kéo hoặc vuốt con trỏ chuột LÊN để MỞ công tắc, kéo hoặc vuốt XUỐNG để ĐÓNG khít lưỡi dao vào ngàm chữ U',
      'Hỗ trợ cả lăn chuột (scroll) hoặc click nhẹ trên thanh công tắc; thao tác thiết bị khác không làm công tắc tự nhúc nhích',
      'Chuột phải mở 2 trục (Nâng cao & Xoay tròn), click ra ngoài tự rơi, nhấp đúp xem nguyên lý hoạt động',
    ],
    terminals: [
      { code: 'SW_RED', desc: 'Cọc Đỏ (bên trái - nối bản lề lưỡi dao)' },
      { code: 'SW_GREEN', desc: 'Cọc Xanh lá (bên phải - nối ngàm kẹp chữ U)' },
    ],
    controlConfig: {
      labelVi: 'Trạng thái đóng/mở khóa K (0 = Mở, 1 = Đóng)',
      labelEn: 'Knife Switch State (0 = Open, 1 = Closed)',
      unit: 'trạng thái',
      min: 0,
      max: 1,
      step: 1,
      defaultValue: 1,
      presets: [
        { label: 'Mở khóa K (Ngắt mạch — Lưỡi dao nâng lên)', value: 0 },
        { label: 'Đóng khóa K (Kín mạch — Lưỡi dao hạ khít)', value: 1 },
      ],
    },
    annotations: [
      { xPercent: 10, yPercent: 72, label: '1. Cọc Đỏ SW_RED nối trụ bản lề' },
      { xPercent: 18, yPercent: 68, label: '2. Lưỡi dao đồng + Tay nắm cách điện (hiện màu xanh khi rà chuột)' },
      { xPercent: 24, yPercent: 74, label: '3. Ngàm kẹp chữ U & Cọc Xanh SW_GREEN' },
    ],
  },
  {
    id: 'bulb_126',
    assetId: 'OL3D-EQP-FILAMENT-BULB-126-06',
    slug: 'bong-den-day-toc-126',
    name: '6. Bóng Đèn Dây Tóc Đế Trắng 126 (R = 4.8Ω)',
    nameEn: 'Incandescent Filament Bulb 126 on Base (R = 4.8Ω)',
    modelCode: 'OL3D-BULB-V2.4',
    filename: 'ol3d-bong-den-day-toc-126-v2.4.html',
    description:
      'Bóng đèn dây tóc vonfram gắn trên đế nhựa trắng kèm đui xoáy đồng và 2 chốt BULB_NEG (Đen) - BULB_POS (Đỏ), phát sáng động theo cường độ dòng điện I và công suất P = I²R.',
    dimensionsM: [0.092, 0.065, 0.056],
    massG: 90,
    category: 'Phụ tải tiêu thụ điện',
    targetFilter: 'unit_bulb',
    workbenchItemId: 'bulb_126',
    preservedFeatures: [
      'Dây tóc vonfram, bầu thủy tinh, hào quang và PointLight phát sáng tỉ lệ trực tiếp với dòng điện I & P = I²R',
      '2 chốt cắm không phân biệt cực (BULB_NEG & BULB_POS), chỉ sáng khi mắc đúng các trường hợp chuẩn của Phần A & Phần B',
      'Tích hợp thanh trượt thử nghiệm dòng điện trực tiếp trong chế độ xem thiết bị độc lập',
      'Chuột phải mở 2 trục (Nâng cao & Xoay tròn), click ra ngoài tự rơi, nhấp đúp xem thông số kỹ thuật',
    ],
    terminals: [
      { code: 'BULB_NEG', desc: 'Chốt B - Cọc Đen bên trái đế đèn' },
      { code: 'BULB_POS', desc: 'Chốt A - Cọc Đỏ bên phải đế đèn' },
    ],
    controlConfig: {
      labelVi: 'Hiệu điện thế đặt vào hai đầu đèn U_đèn (V)',
      labelEn: 'Bulb Applied Voltage U_bulb (V)',
      unit: 'V',
      min: 0,
      max: 3.0,
      step: 0.1,
      defaultValue: 2.0,
      presets: [
        { label: 'Ngắt điện U = 0.0 V (Đèn tắt)', value: 0.0 },
        { label: 'Nguồn 1 Pin U = 1.5 V (Đèn sáng vừa)', value: 1.5 },
        { label: 'Định mức U = 2.4 V (Đèn sáng rõ)', value: 2.4 },
        { label: 'Nguồn 2 Pin nối tiếp U = 3.0 V (Đèn sáng rực)', value: 3.0 },
      ],
    },
    annotations: [
      { xPercent: 32, yPercent: 72, label: '1. Cọc Đen BULB_NEG (Chốt B)' },
      { xPercent: 36, yPercent: 66, label: '2. Bầu thủy tinh & Dây tóc vonfram phát sáng P = I²R' },
      { xPercent: 42, yPercent: 72, label: '3. Cọc Đỏ BULB_POS (Chốt A)' },
    ],
  },
  {
    id: 'rheostat_20',
    assetId: 'OL3D-EQP-SLIDING-RHEOSTAT-20OHM-07',
    slug: 'bien-tro-con-chay-20-ohm',
    name: '7. Biến Trở Con Chạy 20Ω (Đủ 4 Chốt: 2 Dưới & 2 Trên)',
    nameEn: '20Ω Sliding Rheostat (4 Terminals: 2 Lower Coil & 2 Upper Rail)',
    modelCode: 'OL3D-RHEO20-V2.4',
    filename: 'ol3d-bien-tro-con-chay-20ohm-v2.4.html',
    description:
      'Biến trở con chạy 20Ω - 2A có 2 chốt dưới nối 2 đầu cuộn dây (RHEO_IN, RHEO_COIL_END) và 2 chốt trên ở 2 đầu thanh kim loại (RHEO_RAIL_L, RHEO_WIPER) cùng con chạy trượt dọc.',
    dimensionsM: [0.176, 0.075, 0.068],
    massG: 260,
    category: 'Linh kiện điều chỉnh dòng điện',
    targetFilter: 'unit_rheostat',
    workbenchItemId: 'rheostat_20',
    preservedFeatures: [
      'Đầy đủ 4 chốt cắm thực tế: 2 chốt dưới cuộn dây (RHEO_IN, RHEO_COIL_END) và 2 chốt trên thanh kim loại (RHEO_RAIL_L, RHEO_WIPER)',
      'Kéo trực tiếp con chạy (plunger) trên mô hình 3D hoặc thanh trượt để thay đổi điện trở từ 0.0Ω đến 20.0Ω',
      'Mô phỏng chính xác 3 kiểu mắc: Kiểu 1 (1 trên + 1 dưới: R biến thiên), Kiểu 2 (2 chốt dưới: R cố định 20Ω), Kiểu 3 (2 chốt trên: R = 0Ω)',
      'Chuột phải mở 2 trục (Nâng cao & Xoay tròn), click ra ngoài tự rơi, nhấp đúp xem nguyên lý 3 kiểu mắc',
    ],
    terminals: [
      { code: 'RHEO_IN', desc: 'Chốt dưới trái (Đỏ - Đầu cuộn dây)' },
      { code: 'RHEO_COIL_END', desc: 'Chốt dưới phải (Xanh - Cuối cuộn dây)' },
      { code: 'RHEO_RAIL_L', desc: 'Chốt trên trái (Xanh lá - Thanh ray kim loại)' },
      { code: 'RHEO_WIPER', desc: 'Chốt trên phải (Xanh lá - Thanh ray kim loại)' },
    ],
    controlConfig: {
      labelVi: 'Giá trị biến trở con chạy R_bt (Ω)',
      labelEn: 'Sliding Rheostat Resistance R_bt (Ω)',
      unit: 'Ω',
      min: 0,
      max: 20,
      step: 0.5,
      defaultValue: 6.0,
      presets: [
        { label: 'Con chạy sát trái R = 0 Ω', value: 0.0 },
        { label: 'Vị trí 30% R = 6.0 Ω', value: 6.0 },
        { label: 'Chính giữa cuộn dây R = 10.0 Ω', value: 10.0 },
        { label: 'Tối đa cuộn dây R = 20.0 Ω', value: 20.0 },
      ],
    },
    annotations: [
      { xPercent: 74, yPercent: 24, label: '1. Hai chốt trên thanh kim loại: RHEO_RAIL_L & RHEO_WIPER' },
      { xPercent: 82, yPercent: 28, label: '2. Con chạy (plunger) trượt dọc trên cuộn dây hợp kim 20Ω' },
      { xPercent: 88, yPercent: 36, label: '3. Hai chốt dưới cuộn dây: RHEO_IN & RHEO_COIL_END' },
    ],
  },
  {
    id: 'ammeter_dc',
    assetId: 'OL3D-EQP-ANALOG-AMMETER-DC-08',
    slug: 'ampe-ke-kim-dc',
    name: '8. Ampe Kế Kim DC Phòng Thí Nghiệm (0.6A / 3A)',
    nameEn: 'Laboratory Analog DC Ammeter (0.6A / 3A Dual Range)',
    modelCode: 'OL3D-AMDC-V2.4',
    filename: 'ol3d-ampe-ke-kim-dc-v2.4.html',
    description:
      'Ampe kế từ điện một chiều 2 thang đo (0.6A và 3A), dải cọc Xanh lá gồm 1 cọc âm chung AM_NEG (Đen) và 2 cọc dương AM_06A, AM_3A (Đỏ), điện trở trong R_A = 0.05Ω.',
    dimensionsM: [0.098, 0.092, 0.096],
    massG: 230,
    category: 'Dụng cụ đo cường độ dòng điện',
    targetFilter: 'unit_ammeter',
    workbenchItemId: 'ammeter_dc',
    preservedFeatures: [
      'Kim chỉ thị quay vật lý mượt mà theo đúng thang đo (0–0.6A hoặc 0–3.0A) và lệch ngược về âm nếu cắm ngược cực',
      'Mặt chia độ sắc nét có rãnh gương chống thị sai, cấp chính xác 2.5, dải cọc màu xanh lá chuẩn thực tế',
      'Tích hợp thanh trượt thử nghiệm dòng điện & chọn thang đo 0.6A / 3A trực tiếp khi xem độc lập',
      'Chuột phải mở 2 trục (Nâng cao & Xoay tròn), click ra ngoài tự rơi, nhấp đúp xem quy tắc mắc nối tiếp',
    ],
    terminals: [
      { code: 'AM_NEG', desc: 'Cọc Đen (-) chung bên trái trên dải Xanh lá' },
      { code: 'AM_06A', desc: 'Cọc Đỏ (+) giữa — Thang đo 0.6A (ĐCNN 0.02A)' },
      { code: 'AM_3A', desc: 'Cọc Đỏ (+) phải — Thang đo 3.0A (ĐCNN 0.1A)' },
    ],
    controlConfig: {
      labelVi: 'Cường độ dòng điện qua Ampe kế I (A)',
      labelEn: 'Measured DC Current I (A)',
      unit: 'A',
      min: -0.12,
      max: 0.6,
      step: 0.02,
      defaultValue: 0.24,
      presets: [
        { label: 'Ngược cực (I = -0.10 A — Kim lệch trái)', value: -0.1 },
        { label: 'Chưa có dòng (I = 0.00 A)', value: 0.0 },
        { label: 'Dòng chuẩn 1 đèn (I = 0.24 A)', value: 0.24 },
        { label: 'Toàn thang 0.6A (I = 0.60 A)', value: 0.6 },
      ],
    },
    annotations: [
      { xPercent: 44, yPercent: 24, label: '1. Mặt chia độ 0–0.6A / 0–3A & Kim chỉ thị (plunger)' },
      { xPercent: 44, yPercent: 32, label: '2. Vít hiệu chỉnh điểm 0 chính giữa' },
      { xPercent: 44, yPercent: 38, label: '3. Dải cọc Xanh lá: AM_NEG (-), AM_06A (+), AM_3A (+)' },
    ],
  },
  {
    id: 'voltmeter_dc',
    assetId: 'OL3D-EQP-ANALOG-VOLTMETER-DC-09',
    slug: 'von-ke-kim-dc',
    name: '9. Vôn Kế Kim DC Phòng Thí Nghiệm (6V / 12V)',
    nameEn: 'Laboratory Analog DC Voltmeter (6V / 12V Dual Range)',
    modelCode: 'OL3D-VMDC-V2.4',
    filename: 'ol3d-von-ke-kim-dc-v2.4.html',
    description:
      'Vôn kế từ điện một chiều 2 thang đo (6V và 12V), dải cọc Xanh dương gồm 1 cọc âm chung VM_NEG (Đen) và 2 cọc dương VM_6V, VM_12V (Đỏ), điện trở trong R_V = 10,000Ω.',
    dimensionsM: [0.098, 0.092, 0.096],
    massG: 230,
    category: 'Dụng cụ đo hiệu điện thế',
    targetFilter: 'unit_voltmeter',
    workbenchItemId: 'voltmeter_dc',
    preservedFeatures: [
      'Kim chỉ thị quay vật lý mượt mà theo đúng thang đo (0–6V hoặc 0–12V) và lệch ngược nếu cắm ngược cực',
      'Phát hiện lỗi mắc nối tiếp Vôn kế vào mạch chính (R_V = 10,000Ω làm đèn không sáng)',
      'Tích hợp thanh trượt thử nghiệm hiệu điện thế & chọn thang đo 6V / 12V trực tiếp khi xem độc lập',
      'Chuột phải mở 2 trục (Nâng cao & Xoay tròn), click ra ngoài tự rơi, nhấp đúp xem quy tắc mắc song song',
    ],
    terminals: [
      { code: 'VM_NEG', desc: 'Cọc Đen (-) chung bên trái trên dải Xanh dương' },
      { code: 'VM_6V', desc: 'Cọc Đỏ (+) giữa — Thang đo 6V (ĐCNN 0.2V)' },
      { code: 'VM_12V', desc: 'Cọc Đỏ (+) phải — Thang đo 12V (ĐCNN 0.4V)' },
    ],
    controlConfig: {
      labelVi: 'Hiệu điện thế đo trên Vôn kế U (V)',
      labelEn: 'Measured DC Voltage U (V)',
      unit: 'V',
      min: -1.0,
      max: 6.0,
      step: 0.2,
      defaultValue: 3.0,
      presets: [
        { label: 'Cắm ngược cực (U = -0.8 V — Kim lệch trái)', value: -0.8 },
        { label: 'Ngắt mạch (U = 0.0 V)', value: 0.0 },
        { label: 'Nguồn 1 Pin (U = 1.5 V)', value: 1.5 },
        { label: 'Nguồn 2 Pin nối tiếp (U = 3.0 V)', value: 3.0 },
        { label: 'Toàn thang 6V (U = 6.0 V)', value: 6.0 },
      ],
    },
    annotations: [
      { xPercent: 56, yPercent: 24, label: '1. Mặt chia độ 0–6V / 0–12V & Kim chỉ thị (plunger)' },
      { xPercent: 56, yPercent: 32, label: '2. Vít chỉnh 0 & Vỏ nghiêng chống lóa' },
      { xPercent: 56, yPercent: 38, label: '3. Dải cọc Xanh dương: VM_NEG (-), VM_6V (+), VM_12V (+)' },
    ],
  },
];

export function generateStandaloneEquipmentHtml(spec: ExportableEquipmentSpec): string {
  const scriptEl = document.getElementById('ol3d-module-3d-script');
  const rawBuilderScript = scriptEl ? scriptEl.textContent || '' : '';

  const iconEl = document.getElementById('ol3d-module-icon');
  const rawIconSvg = iconEl ? iconEl.innerHTML.trim() : '';

  const photoEl = document.getElementById('ol3d-module-real-photo');
  const rawPhotoSvg = photoEl ? photoEl.innerHTML.trim() : '';

  const [wM, hM, dM] = spec.dimensionsM;
  const ctrl = spec.controlConfig;

  // Thay thế DEFAULT_TARGET_FILTER và DEFAULT_TARGET_BBOX ngay bên trong #ol3d-module-3d-script
  // để khi nền tảng khác gọi buildEquipmentGroup(THREE, asset) hoặc buildEquipmentMesh(THREE, asset)
  // thì tạo ra đúng mô hình 3D của thiết bị đó (hoặc trọn bộ) ở gốc (0,0,0), mặt đáy y = 0, khớp hoàn toàn file mẫu.
  const customizedBuilderScript = rawBuilderScript
    .replace("var DEFAULT_TARGET_FILTER = 'ALL';", `var DEFAULT_TARGET_FILTER = '${spec.targetFilter}';`)
    .replace('var DEFAULT_TARGET_BBOX = [0.54, 0.125, 0.36];', `var DEFAULT_TARGET_BBOX = [${wM}, ${hM}, ${dM}];`);

  // Khối 1: Manifest chuẩn theo đúng file mẫu OL3D-HTML-MODULE v2.1 & v2.4
  const manifestObj = {
    moduleSpecVersion: 'OL3D-HTML-MODULE-v2.1',
    schemaVersion: 'OL3D-HTML-MODULE-v2.4',
    asset: {
      assetId: spec.assetId,
      id: spec.assetId,
      slug: spec.slug,
      name: {
        vi: spec.name,
        en: spec.nameEn,
      },
      nameVi: spec.name,
      nameEn: spec.nameEn,
      kind: 'equipment',
      subject: 'physics',
      category: 'electricity-apparatus',
      categoryIds: ['physics', 'electric_circuit', 'measurement'],
      tags: [spec.slug, 'mach-dien-noi-tiep', 'vat-ly-thcs-thpt', 'openlab-3d'],
      proceduralArchetype: 'dc-series-circuit-kit',
      manufacturer: 'Thiết bị Giáo dục Việt Nam - PINACO Con Ó / OpenLab 3D',
      modelCode: spec.modelCode,
      summary: {
        vi: spec.description,
        en: `${spec.nameEn} — Interactive 3D Physics Equipment Module.`,
      },
      textbookRef: {
        bookTitle: 'Khoa học Tự nhiên 8 & Vật lý 9, 11 (Chương Điện học - Định luật Ôm)',
        chapter: 'Chương Điện học — Dòng điện một chiều & Định luật Ôm',
        lesson: 'Thực hành: Lắp mạch điện nối tiếp, đo cường độ dòng điện và hiệu điện thế',
        figureRef: `Thiết bị chuẩn Thông tư 38/2021/TT-BGDĐT (${spec.modelCode})`,
        standardFunction: spec.description,
        usageGuidelines: spec.preservedFeatures,
        safetyNote:
          'Lắp đúng cực (+) và (-) của nguồn điện và đồng hồ đo; không nối tắt hai cực của nguồn pin qua Ampe kế mà không có bóng đèn hoặc điện trở tải.',
      },
      assetVersion: '2.4.0',
      manifestSchemaVersion: '2.4.0',
      moduleApiVersion: '2.4.0',
      geometry: {
        modelFormat: 'procedural-threejs-html-module',
        modelUri: `procedural://${spec.slug}`,
        proceduralArchetype: 'dc-series-circuit-kit',
        upAxis: 'Y',
        frontAxis: '+Z',
        anchor: 'bottom_center',
        boundingBoxM: {
          width: wM,
          height: hM,
          depth: dM,
        },
        dimensions: {
          widthOrDiameter: { value: Math.round(wM * 1000), unit: 'mm', status: 'verified' },
          height: { value: Math.round(hM * 1000), unit: 'mm', status: 'verified' },
          depth: { value: Math.round(dM * 1000), unit: 'mm', status: 'verified' },
        },
        triangleCount: spec.targetFilter === 'ALL' ? 8640 : 1850,
        materialCount: spec.targetFilter === 'ALL' ? 18 : 8,
        namedNodes: ['body', 'scale_display', 'plunger'],
        scaleValidation: `Tỷ lệ 1:1 chuẩn SI (1 đơn vị 3D = 1m): Rộng ${Math.round(wM * 1000)}mm × Sâu ${Math.round(dM * 1000)}mm × Cao ${Math.round(hM * 1000)}mm.`,
      },
      scientificProperties: {
        referenceMass: { value: spec.massG, unit: 'g', status: 'verified' },
        referenceVolume: { value: Math.round(wM * hM * dM * 1e6 * 0.55), unit: 'cm³', status: 'verified' },
        ratedVoltageDc: { value: 3.0, unit: 'V', status: 'verified' },
        bulbResistance: { value: 4.8, unit: 'Ω', status: 'verified' },
        rheostatMaxResistance: { value: 20.0, unit: 'Ω', status: 'verified' },
      },
      measurementMetadata: {
        measuredQuantity: 'current_and_voltage',
        ammeterRanges: ['0 - 0.6 A (ĐCNN 0.02 A)', '0 - 3.0 A (ĐCNN 0.1 A)'],
        voltmeterRanges: ['0 - 6.0 V (ĐCNN 0.2 V)', '0 - 12.0 V (ĐCNN 0.4 V)'],
        leastCount: { value: ctrl.step, unit: ctrl.unit, status: 'verified' },
        accuracyClass: '2.5',
      },
    },
    moduleControls: {
      stateKey: 'multimeterValue',
      label: {
        vi: ctrl.labelVi,
        en: ctrl.labelEn,
      },
      labelVi: ctrl.labelVi,
      unit: ctrl.unit,
      min: ctrl.min,
      max: ctrl.max,
      step: ctrl.step,
      defaultValue: ctrl.defaultValue,
      canBeWeighedOnBalance: true,
      canSubmergeInVessel: false,
      canHoldLiquid: false,
      presets: ctrl.presets.map((p) => ({
        label: p.label,
        value: p.value,
        statePatch: { multimeterValue: p.value },
      })),
    },
    realPhotoMeta: {
      caption: {
        vi: spec.description,
        en: `${spec.nameEn} — Technical Reference Diagram`,
      },
      captionVi: spec.description,
      sourceType: 'svg-technical-diagram',
      manufacturerRef: `Thiết bị Giáo dục Việt Nam — Mã hiệu ${spec.modelCode}`,
      realWorldScaleNote: `Kích thước thực tế ${Math.round(wM * 1000)} × ${Math.round(dM * 1000)} × ${Math.round(hM * 1000)} mm`,
      annotations: spec.annotations,
    },
    dossier: {
      technicalStandard:
        'Thông tư 38/2021/TT-BGDĐT & 39/2021/TT-BGDĐT - Danh mục thiết bị dạy học tối thiểu môn Khoa học tự nhiên & Vật lý',
      exactDimensionsSpec: `${Math.round(wM * 1000)} × ${Math.round(dM * 1000)} × ${Math.round(hM * 1000)} mm (${wM}m × ${dM}m × ${hM}m trong không gian 3D)`,
      weightOrCapacitySpec: `Khối lượng tham chiếu ~${spec.massG} g; Nguồn Pin đại Con Ó R20 1.5V; Bóng đèn dây tóc R = 4.8Ω; Biến trở con chạy 20Ω (4 chốt).`,
      synthesizedFeatures: spec.preservedFeatures,
      fiveWebSources: [
        {
          siteName: 'Bộ Giáo dục và Đào tạo — Thông tư 38/2021/TT-BGDĐT',
          domain: 'moet.gov.vn',
          verifiedSpecSummary:
            'Quy định danh mục thiết bị dạy học tối thiểu môn Khoa học tự nhiên cấp THCS gồm bộ thí nghiệm điện học, biến trở con chạy 20Ω, ampe kế 0.6A/3A và vôn kế 6V/12V.',
        },
        {
          siteName: 'Công ty CP Pin Ắc quy Miền Nam (PINACO Con Ó)',
          domain: 'pinaco.com.vn',
          verifiedSpecSummary:
            'Thông số kỹ thuật Pin đại Con Ó R20S UM-1: Điện áp danh định 1.5V DC, đường kính 33mm, chiều cao 61.5mm - 90mm cả khay tiếp điểm.',
        },
        {
          siteName: 'Công ty CP Thiết bị Giáo dục 1 (BGD)',
          domain: 'thietbigiaoduc1.com.vn',
          verifiedSpecSummary:
            'Quy cách kỹ thuật đế lắp pin đại trong suốt, công tắc đơn K đế nhựa cam, đế đèn dây tóc và biến trở con chạy 20Ω - 2A dùng trong phòng thí nghiệm trường học.',
        },
        {
          siteName: 'Tiêu chuẩn Đồng hồ đo điện TCVN / IEC 60051',
          domain: 'tieuchuan.vn',
          verifiedSpecSummary:
            'Tiêu chuẩn đồng hồ đo điện cơ cấu từ điện chỉ thị kim cấp chính xác 2.5 dùng cho dòng điện một chiều DC trong phòng thí nghiệm vật lý.',
        },
        {
          siteName: 'Chuẩn kỹ thuật OpenLab 3D Master Specification v2.4',
          domain: 'openlab3d.edu.vn',
          verifiedSpecSummary:
            'Quy chuẩn đóng gói mô-đun thiết bị 3D độc lập .HTML 4 khối (#ol3d-module-manifest, #ol3d-module-icon, #ol3d-module-real-photo, #ol3d-module-3d-script).',
        },
      ],
    },
    audit360: {
      omnidirectionalReadout360:
        'Quan sát 360 độ sắc nét từ mọi góc nhìn (0°, 90°, 180°, 270°), zoom trực tiếp tại vị trí con trỏ chuột.',
      coreInteractiveFunctions: spec.preservedFeatures,
      environmentalAndCrossToolInteractions: [
        'Tương thích 100% với Trình Kiểm Định & Nền Tảng Phòng Thí Nghiệm Ảo OpenLab 3D (hỗ trợ cả buildEquipmentGroup và buildEquipmentMesh)',
        'Tích hợp song song Trạm Kiểm Định Mẫu 360° và Bàn Thí Nghiệm Mạch Điện 3D Tương Tác Đầy Đủ Chức Năng',
      ],
    },
  };

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mô-đun 3D Độc lập: ${spec.name} — OL3D-HTML-MODULE</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      line-height: 1.5;
    }
    .mode-switcher-bar {
      position: sticky; top: 0; z-index: 100;
      background: #090d16; border-bottom: 1px solid #334155;
      padding: 8px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
    }
    .mode-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .mode-tab {
      padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700;
      border: 1px solid #334155; background: #1e293b; color: #cbd5e1; cursor: pointer; transition: all 0.15s;
    }
    .mode-tab.active { background: #0284c7; border-color: #38bdf8; color: #ffffff; }
    .mode-tab.lab-tab.active { background: #d97706; border-color: #fbbf24; color: #ffffff; }

    /* Giao diện Trạm Kiểm Định Chuẩn File Mẫu (#ol3d-standalone-inspector) */
    #ol3d-standalone-inspector { padding: 20px; }
    .container { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px; }
    @media (max-width: 960px) { .container { grid-template-columns: 1fr; } }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 14px;
      padding: 18px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      background: #0284c7;
      color: white;
      margin-right: 6px;
    }
    .badge-ok { background: #059669; }
    h1 { font-size: 20px; margin: 8px 0 4px; color: #fff; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 12px; }
    #preview3d {
      width: 100%;
      height: 440px;
      background: radial-gradient(circle at center, #dbeafe 0%, #93c5fd 100%);
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    }
    .ctrl-bar {
      display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; align-items: center;
      background: #0f172a; padding: 10px 12px; border-radius: 10px; border: 1px solid #334155;
    }
    .ctrl-bar label { font-size: 12px; color: #cbd5e1; font-weight: 600; }
    .ctrl-bar input[type="range"] { flex: 1; accent-color: #38bdf8; }
    .btn {
      padding: 6px 12px; border-radius: 7px; border: 1px solid #475569;
      background: #334155; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 5px;
    }
    .btn:hover { background: #475569; }
    .btn-red.active { background: #dc2626; border-color: #ef4444; color: #ffffff; }
    .btn-blue.active { background: #2563eb; border-color: #3b82f6; color: #ffffff; }
    .btn-emerald { background: rgba(5, 150, 105, 0.35); border-color: rgba(16, 185, 129, 0.6); color: #a7f3d0; }
    .btn-amber { background: rgba(217, 119, 6, 0.35); border-color: rgba(245, 158, 11, 0.6); color: #fde68a; }
    .photo-box {
      background: #fff; border-radius: 10px; padding: 10px; color: #0f172a; position: relative;
      overflow: hidden;
    }
    .photo-box svg { width: 100%; height: auto; display: block; }
    .spec-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 10px; }
    .spec-item { background: #0f172a; padding: 8px 10px; border-radius: 8px; border: 1px solid #334155; font-size: 12px; }
    .spec-item strong { display: block; color: #38bdf8; font-size: 11px; }
    .source-list { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
    .source-list li { background: #0f172a; padding: 9px 12px; border-radius: 8px; border-left: 3px solid #10b981; font-size: 12px; }

    /* Giao diện Phòng Thí Nghiệm 3D Tương Tác Đầy Đủ Chức Năng (#ol3d-interactive-workbench) */
    #ol3d-interactive-workbench {
      display: none; width: 100vw; height: calc(100vh - 49px); position: relative; flex-direction: column; overflow: hidden;
      user-select: none;
    }
    .wb-toolbar {
      background: #0f172a; border-bottom: 1px solid #1e293b; padding: 8px 14px;
      display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; z-index: 30;
    }
    #viewport-wrap { flex: 1; position: relative; width: 100%; height: 100%; overflow: hidden; }
    #viewport { width: 100%; height: 100%; display: block; }
    .status-banner {
      position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
      z-index: 20; display: flex; flex-direction: column; align-items: center; gap: 6px;
      max-width: 780px; width: calc(100% - 32px); pointer-events: none;
    }
    .status-box {
      width: 100%; padding: 8px 14px; border-radius: 7px; border: 1px solid #334155;
      background: rgba(15, 23, 42, 0.94); color: #e2e8f0; font-size: 12px; font-weight: 600;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.45); pointer-events: auto;
    }
    .status-box.ok { background: rgba(6, 40, 30, 0.95); border-color: rgba(16, 185, 129, 0.7); color: #d1fae5; }
    .status-box.warn { background: rgba(51, 34, 8, 0.95); border-color: rgba(245, 158, 11, 0.8); color: #fef3c7; }
    .hint-pill {
      padding: 4px 12px; border-radius: 6px; background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(245, 158, 11, 0.5); color: #fcd34d; font-size: 11px; font-family: monospace;
    }
    .device-control-card {
      position: absolute; top: 70px; left: 14px; z-index: 20; width: 295px;
      background: rgba(15, 23, 42, 0.94); border: 1px solid #334155; border-radius: 8px;
      padding: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }
    .device-control-card h3 { margin: 0 0 6px 0; font-size: 12px; color: #fbbf24; }
    .device-control-card p { margin: 0 0 8px 0; font-size: 11px; color: #94a3b8; line-height: 1.4; }
    .ctrl-row { display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-top: 8px; gap: 8px; }
    .ctrl-row input[type="range"] { flex: 1; accent-color: #38bdf8; cursor: pointer; }
    .bottom-guide {
      position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
      z-index: 20; padding: 6px 16px; border-radius: 999px; background: rgba(15, 23, 42, 0.94);
      border: 1px solid #1e293b; font-size: 11px; color: #cbd5e1; white-space: nowrap; pointer-events: none;
    }
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.72); z-index: 150;
      display: none; align-items: center; justify-content: center; padding: 16px;
    }
    .modal-backdrop.open { display: flex; }
    .modal-card {
      background: #0f172a; border: 1px solid rgba(245, 158, 11, 0.5); border-radius: 10px;
      max-width: 520px; width: 100%; padding: 18px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      max-height: 88vh; overflow-y: auto;
    }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #1e293b; padding-bottom: 10px; }
    .modal-body { font-size: 12px; color: #cbd5e1; line-height: 1.55; margin: 12px 0; }
    .label-3d {
      position: fixed; transform: translate(-50%, -100%); z-index: 15;
      background: rgba(15, 23, 42, 0.93); border: 1px solid #334155; border-radius: 5px;
      padding: 3px 8px; font-size: 10px; font-weight: 700; color: #f8fafc; white-space: nowrap;
      pointer-events: auto; cursor: pointer;
    }
  </style>
</head>
<body>

  <!-- =====================================================================
       KHỐI 1: METADATA & HỒ SƠ KỸ THUẬT CHUẨN (#ol3d-module-manifest)
       ===================================================================== -->
  <script id="ol3d-module-manifest" type="application/json">
${JSON.stringify(manifestObj, null, 2)}
  </script>

  <!-- =====================================================================
       KHỐI 2: BIỂU TƯỢNG VECTOR 2D (#ol3d-module-icon)
       ===================================================================== -->
  <template id="ol3d-module-icon">
    ${rawIconSvg}
  </template>

  <!-- =====================================================================
       KHỐI 3: HÌNH ĐỐI CHIẾU THỰC TẾ STUDIO (#ol3d-module-real-photo)
       ===================================================================== -->
  <template id="ol3d-module-real-photo">
    ${rawPhotoSvg}
  </template>

  <!-- =====================================================================
       KHỐI 4: MÃ NGUỒN DỰNG HÌNH 3D THREE.JS (#ol3d-module-3d-script)
       ===================================================================== -->
  <script id="ol3d-module-3d-script">
${customizedBuilderScript}
  </script>

  <!-- THANH CHUYỂN ĐỔI GIỮA TRẠM KIỂM ĐỊNH FILE MẪU & BÀN THÍ NGHIỆM 3D ĐẦY ĐỦ -->
  <div class="mode-switcher-bar">
    <div style="display:flex;align-items:center;gap:10px;">
      <span class="badge">OL3D-HTML-MODULE v2.1 / v2.4</span>
      <span class="badge badge-ok">4 Khối Chuẩn Hợp Lệ</span>
      <strong style="font-size:13px;color:#f8fafc;">${spec.name}</strong>
    </div>
    <div class="mode-tabs">
      <button id="tab-btn-inspector" class="mode-tab active">🔍 1. Trạm Kiểm Định & Mô Hình 3D Chuẩn File Mẫu</button>
      <button id="tab-btn-workbench" class="mode-tab lab-tab">⚡ 2. Mở Bàn Thí Nghiệm 3D Tương Tác Đầy Đủ Chức Năng</button>
    </div>
  </div>

  <!-- =====================================================================
       KHỐI 5A: TRẠM KIỂM ĐỊNH ĐỘC LẬP CHUẨN FILE MẪU (#ol3d-standalone-inspector)
       ===================================================================== -->
  <div id="ol3d-standalone-inspector">
    <div style="max-width: 1280px; margin: 0 auto 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div>
        <span class="badge">OL3D-HTML-MODULE v2.1</span>
        <span class="badge badge-ok">Tự Chạy Độc Lập &amp; Nhập Thẳng Vào Phòng Thí Nghiệm</span>
        <h1 id="title-vi">${spec.name}</h1>
      </div>
      <div style="font-size: 12px; color: #94a3b8;">
        Chuẩn 4 khối dữ liệu: <code>#ol3d-module-manifest</code> · <code>#ol3d-module-icon</code> · <code>#ol3d-module-real-photo</code> · <code>#ol3d-module-3d-script</code>
      </div>
    </div>

    <div class="container">
      <!-- Cột Trái: Khung 3D tương tác 360 độ -->
      <div class="card">
        <h2>1. Kiểm Định Mô Hình 3D Tương Tác (360° Orbit + Tỷ Lệ Thực 1:1)</h2>
        <div id="preview3d"></div>

        <div class="ctrl-bar">
          <label id="ctrl-label">${ctrl.labelVi}:</label>
          <input id="ctrl-slider" type="range" min="${ctrl.min}" max="${ctrl.max}" step="${ctrl.step}" value="${ctrl.defaultValue}" />
          <span id="ctrl-val" style="font-weight: 800; color: #38bdf8; min-width: 64px;">${ctrl.defaultValue} ${ctrl.unit}</span>
        </div>

        <div class="ctrl-bar" id="preset-buttons" style="margin-top: 8px;">
          <span style="font-size: 12px; color: #94a3b8;">Mức thử nhanh:</span>
        </div>

        <div class="ctrl-bar" style="margin-top: 8px;">
          <span style="font-size: 12px; color: #94a3b8;">Góc nhìn kiểm định 360°:</span>
          <button class="btn" onclick="setCameraAngle(0)">0° (Mặt trước)</button>
          <button class="btn" onclick="setCameraAngle(90)">90° (Cạnh phải)</button>
          <button class="btn" onclick="setCameraAngle(180)">180° (Mặt sau)</button>
          <button class="btn" onclick="setCameraAngle(270)">270° (Cạnh trái)</button>
        </div>

        <div class="spec-grid" id="spec-summary-cards"></div>
      </div>

      <!-- Cột Phải: Hình thực tế + Icon 2D + Hồ sơ 5 nguồn -->
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <div class="card">
          <h2>2. Hình Ảnh Thực Tế Studio &amp; Biểu Tượng 2D</h2>
          <div style="display: grid; grid-template-columns: 1fr 110px; gap: 14px; align-items: start;">
            <div class="photo-box" id="real-photo-mount"></div>
            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 10px; text-align: center;">
              <div id="icon-2d-mount" style="display: flex; justify-content: center;"></div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Icon 2D</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>3. Hồ Sơ Sách Giáo Khoa &amp; 5 Nguồn Đối Chiếu Thực Tế</h2>
          <div id="textbook-summary" style="font-size: 13px; color: #e2e8f0; margin-bottom: 10px;"></div>
          <ul class="source-list" id="five-sources-list"></ul>
        </div>
      </div>
    </div>
  </div>

  <!-- =====================================================================
       KHỐI 5B: BÀN THÍ NGHIỆM MẠCH ĐIỆN 3D ĐẦY ĐỦ CHỨC NĂNG NHƯ CŨ
       ===================================================================== -->
  <div id="ol3d-interactive-workbench">
    <div class="wb-toolbar">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <button id="btn-wire-red" class="btn btn-red active">🔴 Dây Đỏ (+)</button>
        <button id="btn-wire-blue" class="btn btn-blue">🔵 Dây Xanh (-)</button>
        <button id="btn-focus-device" class="btn btn-amber" style="display: ${spec.targetFilter === 'ALL' ? 'none' : 'inline-flex'}">🎯 Chỉ Xem Thiết Bị Này</button>
        <button id="btn-show-all-kit" class="btn btn-emerald">📦 Đưa Đầy Đủ Bộ Mạch Ra Bàn</button>
        <button id="btn-template-series" class="btn">⚡ Bản Mẫu Mạch Nối Tiếp</button>
        <button id="btn-cabinet-all" class="btn">🗄️ Cất Vào Tủ Kính</button>
        <button id="btn-clear-wires" class="btn">🗑️ Tháo Hết Dây</button>
        <button id="btn-toggle-labels" class="btn">👁️ Nhãn 3D</button>
        <button id="btn-edit-board" class="btn btn-emerald">✏️ Viết Bảng Đen</button>
      </div>
      <div style="font-size:11px;color:#94a3b8;">
        Rà pin vào giá đỡ hiện màu xanh • Vuốt lên/xuống thanh công tắc • Chuột phải 2 trục &amp; Tự rơi • Zoom tại trỏ chuột
      </div>
    </div>

    <div id="viewport-wrap">
      <div class="status-banner">
        <div id="status-box" class="status-box">
          <span id="status-text">Sẵn sàng tương tác 3D — Click 2 cọc để nối dây, kéo thả vật, chuột phải mở 2 trục hoặc nhấp đúp vào thiết bị.</span>
        </div>
        <div id="hint-pill" class="hint-pill" style="display:none;"></div>
      </div>

      <div class="device-control-card" id="quick-panel">
        <h3>Điều Khiển Nhanh Trên Bàn</h3>
        <p>${spec.description}</p>
        <div class="ctrl-row">
          <span>Cầu dao K:</span>
          <button id="btn-quick-switch" class="btn btn-amber">ĐANG MỞ (Click/Vuốt để Đóng)</button>
        </div>
        <div class="ctrl-row">
          <span>Biến trở R (<strong id="lbl-rheo">6.0</strong> Ω):</span>
          <input id="rng-rheo" type="range" min="0" max="20" step="0.5" value="6.0" />
        </div>
        <div class="ctrl-row" id="standalone-test-row" style="display: ${spec.targetFilter === 'ALL' ? 'none' : 'flex'}">
          <span>Thử dòng/áp trực tiếp:</span>
          <input id="rng-test-drive" type="range" min="-0.3" max="1.0" step="0.02" value="0.0" />
        </div>
      </div>

      <div id="labels-layer"></div>
      <div id="viewport"></div>

      <div class="bottom-guide">
        <strong style="color:#fbbf24">Lăn chuột:</strong> Zoom tại trỏ chuột &nbsp;•&nbsp;
        <strong style="color:#34d399">Kéo Pin vào Giá đỡ:</strong> Hiện màu xanh &amp; tự khớp &nbsp;•&nbsp;
        <strong style="color:#38bdf8">Chuột phải:</strong> 2 trục (Nâng &amp; Xoay) / Click ngoài: Tự rơi &nbsp;•&nbsp;
        <strong style="color:#fb7185">Nhấp đúp:</strong> Thông tin thiết bị
      </div>
    </div>
  </div>

  <!-- MODAL GIỚI THIỆU THIẾT BỊ KHI NHẤP ĐÚP -->
  <div id="info-modal" class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <div id="info-cat" style="font-size:10px;color:#fbbf24;font-family:monospace;text-transform:uppercase;"></div>
          <div id="info-title" style="font-size:15px;font-weight:700;color:#f8fafc;margin-top:2px;"></div>
        </div>
        <button id="btn-close-info" class="btn">✕ Đóng</button>
      </div>
      <div class="modal-body">
        <div style="font-weight:700;color:#34d399;margin-bottom:3px;">1. Giới thiệu &amp; Nguyên lý hoạt động:</div>
        <div id="info-desc" style="margin-bottom:10px;"></div>
        <div style="font-weight:700;color:#fbbf24;margin-bottom:4px;">2. Các cọc cắm &amp; Thông số kỹ thuật:</div>
        <div id="info-specs" class="spec-grid"></div>
      </div>
    </div>
  </div>

  <!-- MODAL VIẾT BẢNG ĐEN PHÒNG THÍ NGHIỆM -->
  <div id="board-modal" class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-header">
        <div style="font-size:14px;font-weight:700;color:#34d399;">✏️ Viết Nội Dung Lên Bảng Đen Phòng Thí Nghiệm</div>
        <button id="btn-close-board" class="btn">✕ Đóng</button>
      </div>
      <div class="modal-body">
        <div style="margin-bottom:8px;">
          <div style="font-weight:600;margin-bottom:4px;">Tiêu đề trên bảng:</div>
          <input id="inp-board-title" type="text" value="PHÒNG THÍ NGHIỆM VẬT LÝ — MẠCH ĐIỆN MỘT CHIỀU" style="width:100%;padding:7px;background:#0f392b;border:1px solid #10b981;color:#fff;border-radius:5px;font-weight:700;" />
        </div>
        <div>
          <div style="font-weight:600;margin-bottom:4px;">Nội dung ghi chép / công thức:</div>
          <textarea id="inp-board-content" rows="4" style="width:100%;padding:7px;background:#0f392b;border:1px solid #10b981;color:#fff;border-radius:5px;font-family:monospace;">Định luật Ôm: I = U / R     •     Công suất: P = U · I = I² · R
Ghép nối tiếp 2 nguồn: E_bộ = E1 + E2  (Nối cực + pin này với cực - pin kia)</textarea>
        </div>
      </div>
    </div>
  </div>

  <script>
    // =========================================================================
    // PHẦN 1: TRẠM KIỂM ĐỊNH 3D CHUẨN FILE MẪU (#ol3d-standalone-inspector)
    // =========================================================================
    (function() {
      var manifest = JSON.parse(document.getElementById('ol3d-module-manifest').textContent);
      var asset = manifest.asset;
      var ctrl = manifest.moduleControls;

      document.getElementById('title-vi').textContent = asset.name.vi + ' (' + asset.assetId + ')';
      document.getElementById('icon-2d-mount').innerHTML = document.getElementById('ol3d-module-icon').innerHTML;
      document.getElementById('real-photo-mount').innerHTML = document.getElementById('ol3d-module-real-photo').innerHTML;

      var photoMount = document.getElementById('real-photo-mount');
      if (manifest.realPhotoMeta && Array.isArray(manifest.realPhotoMeta.annotations)) {
        manifest.realPhotoMeta.annotations.forEach(function(ann, idx) {
          var pin = document.createElement('div');
          pin.title = ann.label;
          pin.style.cssText =
            'position:absolute;left:' + ann.xPercent + '%;top:' + ann.yPercent + '%;' +
            'transform:translate(-50%,-50%);width:22px;height:22px;border-radius:50%;' +
            'background:#0284c7;color:#fff;font-size:11px;font-weight:700;display:flex;' +
            'align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);cursor:help;';
          pin.textContent = String(idx + 1);
          photoMount.appendChild(pin);
        });
      }

      var bbox = asset.geometry.boundingBoxM;
      document.getElementById('spec-summary-cards').innerHTML =
        '<div class="spec-item"><strong>KÍCH THƯỚC THỰC (R×C×S)</strong>' +
          (bbox.width * 1000).toFixed(0) + ' × ' + (bbox.height * 1000).toFixed(0) + ' × ' + (bbox.depth * 1000).toFixed(0) + ' mm</div>' +
        '<div class="spec-item"><strong>KHỐI LƯỢNG THAM CHIẾU</strong>' +
          asset.scientificProperties.referenceMass.value + ' ' + asset.scientificProperties.referenceMass.unit + '</div>' +
        '<div class="spec-item"><strong>ĐIỆN ÁP &amp; ĐIỆN TRỞ CHUẨN</strong>U = ' +
          asset.scientificProperties.ratedVoltageDc.value + ' V · R_đèn = ' + asset.scientificProperties.bulbResistance.value + ' Ω</div>' +
        '<div class="spec-item"><strong>ĐIỂM NEO MẶT BÀN</strong>' +
          asset.geometry.anchor + ' (y = 0)</div>';

      document.getElementById('textbook-summary').innerHTML =
        '<strong>' + asset.textbookRef.bookTitle + '</strong> — ' + asset.textbookRef.lesson + '<br/>' +
        '<span style="color:#94a3b8">' + asset.textbookRef.standardFunction + '</span>';

      var srcList = document.getElementById('five-sources-list');
      manifest.dossier.fiveWebSources.forEach(function(s, idx) {
        var li = document.createElement('li');
        li.innerHTML = '<strong>Nguồn ' + (idx + 1) + ' — ' + s.siteName + ' (' + s.domain + '):</strong><br/>' + s.verifiedSpecSummary;
        srcList.appendChild(li);
      });

      var container = document.getElementById('preview3d');
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.01, 20);
      var renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
        renderer.outputEncoding = THREE.sRGBEncoding;
      }
      container.appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 0.95));
      var dirLight = new THREE.DirectionalLight(0xffffff, 1.15);
      dirLight.position.set(1.2, 2.0, 1.5);
      scene.add(dirLight);

      var desk = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.015, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 })
      );
      desk.position.y = -0.0075;
      scene.add(desk);
      scene.add(new THREE.GridHelper(0.6, 12, 0x475569, 0x64748b));

      var eqGroup = window.OL3D_EQUIPMENT_MODULE.buildEquipmentGroup(THREE, asset);
      scene.add(eqGroup);

      var maxDim = Math.max(bbox.width, bbox.height, bbox.depth, 0.14);
      var radius = Math.max(0.28, maxDim * 1.45);
      var theta = 0.55, phi = 1.08;
      var targetY = Math.max(0.03, bbox.height * 0.42);
      var isDown = false, prevX = 0, prevY = 0;

      function updateCamera() {
        camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
        camera.position.y = Math.max(0.03, radius * Math.cos(phi));
        camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(0, targetY, 0);
      }
      updateCamera();

      window.setCameraAngle = function(deg) {
        theta = (deg * Math.PI) / 180;
        phi = 1.12;
        updateCamera();
      };

      renderer.domElement.addEventListener('pointerdown', function(e) {
        isDown = true; prevX = e.clientX; prevY = e.clientY;
      });
      window.addEventListener('pointerup', function() { isDown = false; });
      window.addEventListener('pointermove', function(e) {
        if (!isDown) return;
        theta -= (e.clientX - prevX) * 0.01;
        phi = Math.max(0.25, Math.min(1.48, phi - (e.clientY - prevY) * 0.01));
        prevX = e.clientX; prevY = e.clientY;
        updateCamera();
      });
      renderer.domElement.addEventListener('wheel', function(e) {
        e.preventDefault();
        radius = Math.max(0.12, Math.min(1.6, radius + e.deltaY * 0.0005));
        updateCamera();
      }, { passive: false });

      var slider = document.getElementById('ctrl-slider');
      var valSpan = document.getElementById('ctrl-val');
      document.getElementById('ctrl-label').textContent = (ctrl.label.vi || ctrl.labelVi) + ':';

      function applyVal(v) {
        var num = parseFloat(v);
        slider.value = num;
        valSpan.textContent = num.toFixed(ctrl.step < 1 ? 2 : 0) + ' ' + ctrl.unit;
        window.OL3D_EQUIPMENT_MODULE.applyEquipmentState(THREE, eqGroup, {
          instanceState: { multimeterValue: num }
        }, asset);
      }

      slider.addEventListener('input', function(e) { applyVal(e.target.value); });

      var presetWrap = document.getElementById('preset-buttons');
      ctrl.presets.forEach(function(p) {
        var b = document.createElement('button');
        b.className = 'btn';
        b.textContent = p.label;
        b.onclick = function() { applyVal(p.value); };
        presetWrap.appendChild(b);
      });

      applyVal(ctrl.defaultValue);

      function animateInspector() {
        requestAnimationFrame(animateInspector);
        renderer.render(scene, camera);
      }
      animateInspector();

      window.addEventListener('resize', function() {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        }
      });
    })();

    // =========================================================================
    // PHẦN 2: BÀN THÍ NGHIỆM 3D TƯƠNG TÁC ĐẦY ĐỦ CHỨC NĂNG NHƯ CŨ
    // (Tương thích trực tiếp với Three.js r128 không cần esm.sh)
    // =========================================================================
    (function() {
      var workbenchInitialized = false;
      var resizeWorkbenchFn = null;

      var tabInspector = document.getElementById('tab-btn-inspector');
      var tabWorkbench = document.getElementById('tab-btn-workbench');
      var viewInspector = document.getElementById('ol3d-standalone-inspector');
      var viewWorkbench = document.getElementById('ol3d-interactive-workbench');

      tabInspector.addEventListener('click', function() {
        tabInspector.classList.add('active');
        tabWorkbench.classList.remove('active');
        viewInspector.style.display = 'block';
        viewWorkbench.style.display = 'none';
      });

      tabWorkbench.addEventListener('click', function() {
        tabWorkbench.classList.add('active');
        tabInspector.classList.remove('active');
        viewInspector.style.display = 'none';
        viewWorkbench.style.display = 'flex';
        if (!workbenchInitialized) {
          workbenchInitialized = true;
          initFullInteractiveWorkbench();
        } else if (resizeWorkbenchFn) {
          resizeWorkbenchFn();
        }
      });

      function initFullInteractiveWorkbench() {
        var INITIAL_FILTER = '${spec.targetFilter}';

        var CATALOG = [
          {
            id: 'battery_holder', nodeName: 'unit_battery_holder', name: 'Giá Đỡ 2 Pin Trong Suốt',
            category: 'Nguồn điện DC', modelCode: 'OL3D-BH2-V2.4',
            desc: 'Giá đỡ 2 ngăn độc lập (SLOT_1 & SLOT_2). Rà pin vào ngăn hiện màu xanh lá để tự khớp. Muốn có 3.0V nối tiếp cần nối cực (-) pin này với cực (+) pin kia.',
            specs: [['Số ngăn', '2 ngăn (SLOT_1, SLOT_2)'], ['Cọc cắm', 'BAT1_POS, BAT1_NEG, BAT2_NEG, BAT2_POS'], ['Điện áp', '1.5V (1 pin) / 3.0V (2 pin)'], ['Kích thước', '140 × 88 × 42 mm']],
            tablePos: [-0.36, 0, -0.12], cabPos: [-0.62, 0.222, -0.68], labelY: 0.085, halfW: 0.074, halfD: 0.048, height: 0.046
          },
          {
            id: 'single_battery_holder_1', nodeName: 'unit_single_battery_holder_1', name: 'Giá Đỡ 1 Pin #1',
            category: 'Nguồn điện DC', modelCode: 'OL3D-BH1-V2.4-1',
            desc: 'Giá đỡ đơn 1 viên pin đại 1.5V có 2 cọc SBAT1_POS (+) và SBAT1_NEG (-). Kéo viên pin rà vào khay sẽ sáng màu xanh lá và tự khớp đúng chiều.',
            specs: [['Số ngăn', '1 ngăn đơn'], ['Cọc cắm', 'SBAT1_POS (+), SBAT1_NEG (-)'], ['Điện áp', '1.5V DC'], ['Kích thước', '140 × 48 × 42 mm']],
            tablePos: [-0.66, 0, -0.18], cabPos: [-0.36, 0.222, -0.68], labelY: 0.08, halfW: 0.074, halfD: 0.028, height: 0.045
          },
          {
            id: 'single_battery_holder_2', nodeName: 'unit_single_battery_holder_2', name: 'Giá Đỡ 1 Pin #2',
            category: 'Nguồn điện DC', modelCode: 'OL3D-BH1-V2.4-2',
            desc: 'Giá đỡ đơn 1 viên pin đại thứ hai có 2 cọc SBAT2_POS (+) và SBAT2_NEG (-). Dùng độc lập hoặc ghép nối tiếp/song song với Giá đỡ 1 pin #1.',
            specs: [['Số ngăn', '1 ngăn đơn'], ['Cọc cắm', 'SBAT2_POS (+), SBAT2_NEG (-)'], ['Điện áp', '1.5V DC'], ['Kích thước', '140 × 48 × 42 mm']],
            tablePos: [-0.66, 0, 0.06], cabPos: [-0.10, 0.222, -0.68], labelY: 0.08, halfW: 0.074, halfD: 0.028, height: 0.045
          },
          {
            id: 'battery_cell_1', nodeName: 'unit_battery_1', name: 'Viên Pin Đại Con Ó 1.5V #1',
            category: 'Nguồn điện hóa học', modelCode: 'PINACO-R20S-1',
            desc: 'Pin đại Con Ó 1.5V. Kéo rà vào Giá đỡ 2 pin hoặc Giá đỡ 1 pin sẽ hiện màu xanh lá và tự động khớp vào ngăn theo đúng chiều.',
            specs: [['Suất điện động E', '1.50 V DC'], ['Điện trở trong r', '0.12 Ω'], ['Loại pin', 'R20S / Cỡ D'], ['Kích thước', 'Ø31 × 90 mm']],
            tablePos: [-0.36, 0, -0.142], cabPos: [-0.22, 0.222, -0.68], labelY: 0.065, halfW: 0.048, halfD: 0.018, height: 0.034
          },
          {
            id: 'battery_cell_2', nodeName: 'unit_battery_2', name: 'Viên Pin Đại Con Ó 1.5V #2',
            category: 'Nguồn điện hóa học', modelCode: 'PINACO-R20S-2',
            desc: 'Pin đại Con Ó 1.5V thứ hai dùng để ghép bộ nguồn 2 pin nối tiếp (3.0V) hoặc song song (1.5V).',
            specs: [['Suất điện động E', '1.50 V DC'], ['Điện trở trong r', '0.12 Ω'], ['Loại pin', 'R20S / Cỡ D'], ['Kích thước', 'Ø31 × 90 mm']],
            tablePos: [-0.36, 0, -0.098], cabPos: [0.12, 0.222, -0.68], labelY: 0.065, halfW: 0.048, halfD: 0.018, height: 0.034
          },
          {
            id: 'battery_cell_3', nodeName: 'unit_battery_3', name: 'Viên Pin Đại Con Ó 1.5V #3',
            category: 'Nguồn điện hóa học', modelCode: 'PINACO-R20S-3',
            desc: 'Pin đại Con Ó 1.5V thứ ba dùng để lắp vào Giá đỡ 1 pin hoặc Giá đỡ 2 pin.',
            specs: [['Suất điện động E', '1.50 V DC'], ['Điện trở trong r', '0.12 Ω'], ['Loại pin', 'R20S / Cỡ D'], ['Kích thước', 'Ø31 × 90 mm']],
            tablePos: [-0.66, 0, -0.27], cabPos: [0.28, 0.222, -0.68], labelY: 0.065, halfW: 0.048, halfD: 0.018, height: 0.034
          },
          {
            id: 'battery_cell_4', nodeName: 'unit_battery_4', name: 'Viên Pin Đại Con Ó 1.5V #4',
            category: 'Nguồn điện hóa học', modelCode: 'PINACO-R20S-4',
            desc: 'Pin đại Con Ó 1.5V thứ tư dùng để lắp vào Giá đỡ 1 pin hoặc Giá đỡ 2 pin.',
            specs: [['Suất điện động E', '1.50 V DC'], ['Điện trở trong r', '0.12 Ω'], ['Loại pin', 'R20S / Cỡ D'], ['Kích thước', 'Ø31 × 90 mm']],
            tablePos: [-0.66, 0, 0.15], cabPos: [0.40, 0.222, -0.68], labelY: 0.065, halfW: 0.048, halfD: 0.018, height: 0.034
          },
          {
            id: 'knife_switch', nodeName: 'unit_switch', name: 'Cầu Dao Đóng Ngắt K',
            category: 'Khí cụ đóng cắt', modelCode: 'OL3D-SWK-V2.4',
            desc: 'Cầu dao đơn K có 2 cọc SW_RED & SW_GREEN. Rà chuột vào thanh công tắc sẽ sáng màu xanh lá: kéo/vuốt lên để Mở, kéo/vuốt xuống để Đóng khít vào ngàm chữ U.',
            specs: [['Cọc đấu dây', 'SW_RED (Đỏ), SW_GREEN (Xanh)'], ['Điện trở đóng', '0.005 Ω'], ['Trạng thái mở', 'Cách điện hoàn toàn'], ['Kích thước', '112 × 68 × 45 mm']],
            tablePos: [-0.06, 0, -0.14], cabPos: [0.52, 0.222, -0.68], labelY: 0.075, halfW: 0.06, halfD: 0.038, height: 0.045
          },
          {
            id: 'bulb_126', nodeName: 'unit_bulb', name: 'Bóng Đèn Dây Tóc 126',
            category: 'Phụ tải tiêu thụ', modelCode: 'OL3D-BULB-V2.4',
            desc: 'Bóng đèn sợi đốt vonfram có 2 chốt BULB_NEG & BULB_POS (không phân biệt cực). Độ sáng tăng giảm mạnh theo cường độ dòng điện I và P = I²R.',
            specs: [['Điện trở R_đèn', '4.80 Ω'], ['Điện áp định mức', '1.5 V – 3.0 V DC'], ['Cọc đấu dây', 'BULB_NEG, BULB_POS'], ['Kích thước', '92 × 56 × 65 mm']],
            tablePos: [-0.05, 0, 0.14], cabPos: [-0.58, 0.025, -0.68], labelY: 0.095, halfW: 0.05, halfD: 0.032, height: 0.068
          },
          {
            id: 'rheostat_20', nodeName: 'unit_rheostat', name: 'Biến Trở Con Chạy 20Ω',
            category: 'Linh kiện điều chỉnh', modelCode: 'OL3D-RHEO20-V2.4',
            desc: 'Biến trở con chạy 20Ω có 2 chốt dưới nối 2 đầu cuộn dây (RHEO_IN, RHEO_COIL_END) và 2 chốt trên ở 2 đầu thanh kim loại (RHEO_RAIL_L, RHEO_WIPER). Hỗ trợ đủ 3 kiểu mắc.',
            specs: [['Dải điện trở', '0.0 Ω – 20.0 Ω'], ['2 chốt dưới', 'RHEO_IN, RHEO_COIL_END'], ['2 chốt trên', 'RHEO_RAIL_L, RHEO_WIPER'], ['Kích thước', '176 × 68 × 75 mm']],
            tablePos: [0.24, 0, -0.14], cabPos: [-0.16, 0.025, -0.68], labelY: 0.095, halfW: 0.092, halfD: 0.038, height: 0.076
          },
          {
            id: 'ammeter_dc', nodeName: 'unit_ammeter', name: 'Ampe Kế Kim DC (0.6A / 3A)',
            category: 'Dụng cụ đo dòng điện', modelCode: 'OL3D-AMDC-V2.4',
            desc: 'Ampe kế DC dải cọc Xanh lá (AM_NEG, AM_06A, AM_3A), điện trở trong rất nhỏ R_A = 0.05Ω, mắc nối tiếp trong mạch.',
            specs: [['Điện trở trong', '0.05 Ω'], ['Thang đo', '0.6 A & 3.0 A'], ['Cọc cắm', 'AM_NEG (-), AM_06A, AM_3A'], ['Cách mắc', 'Mắc NỐI TIẾP']],
            tablePos: [0.26, 0, 0.14], cabPos: [0.24, 0.025, -0.68], labelY: 0.115, halfW: 0.054, halfD: 0.052, height: 0.105
          },
          {
            id: 'voltmeter_dc', nodeName: 'unit_voltmeter', name: 'Vôn Kế Kim DC (6V / 12V)',
            category: 'Dụng cụ đo điện áp', modelCode: 'OL3D-VMDC-V2.4',
            desc: 'Vôn kế DC dải cọc Xanh dương (VM_NEG, VM_6V, VM_12V), điện trở trong rất lớn R_V = 10,000Ω, mắc song song với hai đầu đèn hoặc nguồn.',
            specs: [['Điện trở trong', '10,000 Ω'], ['Thang đo', '6.0 V & 12.0 V'], ['Cọc cắm', 'VM_NEG (-), VM_6V, VM_12V'], ['Cách mắc', 'Mắc SONG SONG']],
            tablePos: [-0.36, 0, 0.14], cabPos: [0.58, 0.025, -0.68], labelY: 0.115, halfW: 0.054, halfD: 0.052, height: 0.105
          }
        ];

        var TERMINAL_TO_ITEM = {
          BAT1_POS: 'battery_holder', BAT1_NEG: 'battery_holder', BAT2_NEG: 'battery_holder', BAT2_POS: 'battery_holder',
          SBAT1_POS: 'single_battery_holder_1', SBAT1_NEG: 'single_battery_holder_1',
          SBAT2_POS: 'single_battery_holder_2', SBAT2_NEG: 'single_battery_holder_2',
          SW_RED: 'knife_switch', SW_GREEN: 'knife_switch',
          BULB_NEG: 'bulb_126', BULB_POS: 'bulb_126',
          RHEO_IN: 'rheostat_20', RHEO_COIL_END: 'rheostat_20', RHEO_RAIL_L: 'rheostat_20', RHEO_WIPER: 'rheostat_20',
          AM_NEG: 'ammeter_dc', AM_06A: 'ammeter_dc', AM_3A: 'ammeter_dc',
          VM_NEG: 'voltmeter_dc', VM_6V: 'voltmeter_dc', VM_12V: 'voltmeter_dc'
        };

        var isBatteryCell = function(id) {
          return id === 'battery_cell_1' || id === 'battery_cell_2' || id === 'battery_cell_3' || id === 'battery_cell_4';
        };
        var isAnyHolder = function(id) {
          return id === 'battery_holder' || id === 'single_battery_holder_1' || id === 'single_battery_holder_2';
        };

        var wireColor = 'red';
        var selectedTerminal = null;
        var switchClosed = false;
        var rheostatOhm = 6.0;
        var testDriveVal = 0.0;
        var showLabels = true;
        var slot1Occupant = 'battery_cell_1';
        var slot2Occupant = 'battery_cell_2';
        var singleSlot1Occupant = null;
        var singleSlot2Occupant = null;
        var gizmoTargetId = null;
        var switchBladeAngleOverride = null;
        var wires = [];

        var inCabinet = {};
        var physics = {};
        CATALOG.forEach(function(s) {
          inCabinet[s.id] = false;
          physics[s.id] = { vy: 0, falling: false, restingY: 0 };
        });

        var container = document.getElementById('viewport');
        var scene = new THREE.Scene();
        scene.background = new THREE.Color(0x131c2e);
        scene.fog = new THREE.FogExp2(0x131c2e, 0.075);

        var camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.01, 30);
        var camTarget = new THREE.Vector3(0, 0.06, -0.06);
        camera.position.set(0, 0.62, 0.85);
        camera.lookAt(camTarget);

        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
          renderer.outputColorSpace = THREE.SRGBColorSpace;
        } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
          renderer.outputEncoding = THREE.sRGBEncoding;
        }
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xfff8f0, 0x334155, 0.85));
        var keyLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
        keyLight.position.set(1.2, 2.3, 1.4);
        keyLight.castShadow = true;
        scene.add(keyLight);
        var fillLight = new THREE.DirectionalLight(0x93c5fd, 0.55);
        fillLight.position.set(-1.6, 1.3, -1.0);
        scene.add(fillLight);

        // 1. Bàn gỗ 2.0m x 1.0m màu nâu tự nhiên
        var labTableGroup = new THREE.Group();
        var woodCanvas = document.createElement('canvas');
        woodCanvas.width = 1024; woodCanvas.height = 512;
        var wctx = woodCanvas.getContext('2d');
        wctx.fillStyle = '#865432'; wctx.fillRect(0, 0, 1024, 512);
        for (var i = 0; i < 150; i++) {
          wctx.fillStyle = i % 2 === 0 ? 'rgba(110, 66, 36, 0.16)' : 'rgba(156, 102, 62, 0.12)';
          wctx.fillRect(0, (i / 150) * 512, 1024, 2 + (i % 3));
        }
        var woodTex = new THREE.CanvasTexture(woodCanvas);
        if (THREE.SRGBColorSpace) woodTex.colorSpace = THREE.SRGBColorSpace;
        var tableTopMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.56, metalness: 0.05 });
        var tableEdgeMat = new THREE.MeshStandardMaterial({ color: 0x6e4224, roughness: 0.58 });
        var tableTopMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 1.0), [
          tableEdgeMat, tableEdgeMat, tableTopMat, tableEdgeMat, tableEdgeMat, tableEdgeMat
        ]);
        tableTopMesh.position.set(0, -0.025, 0);
        tableTopMesh.receiveShadow = true;
        labTableGroup.add(tableTopMesh);

        var legMat = new THREE.MeshStandardMaterial({ color: 0x5c371e, roughness: 0.55 });
        [[-0.92, -0.42], [0.92, -0.42], [-0.92, 0.42], [0.92, 0.42]].forEach(function(pair) {
          var leg = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.76, 0.065), legMat);
          leg.position.set(pair[0], -0.43, pair[1]);
          labTableGroup.add(leg);
        });
        scene.add(labTableGroup);

        // 2. Tủ kính 2 tầng đối diện
        var cabinetGroup = new THREE.Group();
        var CAB_Z = -0.68, CAB_W = 1.65, CAB_H = 0.44, CAB_D = 0.30;
        var glassMat = new THREE.MeshPhysicalMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.28, roughness: 0.07, depthWrite: false });
        var glassShelfMat = new THREE.MeshPhysicalMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.42, roughness: 0.1 });
        var cabStand = new THREE.Mesh(new THREE.BoxGeometry(CAB_W, 0.81, CAB_D), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55 }));
        cabStand.position.set(0, -0.405, CAB_Z);
        cabinetGroup.add(cabStand);
        var shelf1 = new THREE.Mesh(new THREE.BoxGeometry(CAB_W, 0.016, CAB_D), glassShelfMat);
        shelf1.position.set(0, 0.016, CAB_Z);
        cabinetGroup.add(shelf1);
        var shelf2 = new THREE.Mesh(new THREE.BoxGeometry(CAB_W - 0.02, 0.014, CAB_D - 0.01), glassShelfMat);
        shelf2.position.set(0, 0.215, CAB_Z);
        cabinetGroup.add(shelf2);
        var roof = new THREE.Mesh(new THREE.BoxGeometry(CAB_W, 0.014, CAB_D), glassMat);
        roof.position.set(0, CAB_H, CAB_Z);
        cabinetGroup.add(roof);
        scene.add(cabinetGroup);

        // 3. Bảng Đen phòng thí nghiệm phía sau
        var blackboardGroup = new THREE.Group();
        var boardFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.05, 0.04), new THREE.MeshStandardMaterial({ color: 0x784928, roughness: 0.6 }));
        boardFrame.position.set(0, 0.98, -2.29);
        blackboardGroup.add(boardFrame);
        var chalkCanvas = document.createElement('canvas');
        chalkCanvas.width = 1024; chalkCanvas.height = 384;
        var chalkTex = new THREE.CanvasTexture(chalkCanvas);
        if (THREE.SRGBColorSpace) chalkTex.colorSpace = THREE.SRGBColorSpace;
        var chalkPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.48, 0.93), new THREE.MeshBasicMaterial({ map: chalkTex }));
        chalkPlane.position.set(0, 0.98, -2.265);
        blackboardGroup.add(chalkPlane);
        scene.add(blackboardGroup);

        function redrawBlackboard() {
          var cctx = chalkCanvas.getContext('2d');
          cctx.fillStyle = '#0f392b'; cctx.fillRect(0, 0, 1024, 384);
          cctx.strokeStyle = 'rgba(255,255,255,0.1)'; cctx.lineWidth = 2; cctx.strokeRect(18, 18, 988, 348);
          cctx.fillStyle = '#f8fafc'; cctx.textAlign = 'center';
          var title = document.getElementById('inp-board-title').value || '';
          var content = document.getElementById('inp-board-content').value || '';
          cctx.font = 'bold 30px sans-serif';
          cctx.fillText(title, 512, 68, 940);
          cctx.font = '23px monospace';
          content.split('\\n').slice(0, 6).forEach(function(line, idx) {
            cctx.fillText(line, 512, 132 + idx * 42, 940);
          });
          chalkTex.needsUpdate = true;
        }
        redrawBlackboard();
        document.getElementById('inp-board-title').addEventListener('input', redrawBlackboard);
        document.getElementById('inp-board-content').addEventListener('input', redrawBlackboard);

        // 4. Khởi tạo toàn bộ thiết bị 3D từ OL3D_EQUIPMENT_MODULE (với fullWorkbench: true)
        var equipmentRoot = window.OL3D_EQUIPMENT_MODULE.buildEquipmentMesh(THREE, { fullWorkbench: true });
        ['body', 'base_foot', 'scale_display', 'scale_display_rear', 'stand_post'].forEach(function(n) {
          var el = equipmentRoot.getObjectByName(n);
          if (el) el.visible = false;
        });
        var compGroup = equipmentRoot.getObjectByName('circuit_components_group');
        if (compGroup) compGroup.position.y = 0;
        var builtInWires = equipmentRoot.getObjectByName('circuit_wires_group');
        if (builtInWires) {
          while (builtInWires.children.length > 0) builtInWires.remove(builtInWires.children[0]);
        }

        CATALOG.forEach(function(spec) {
          var obj = equipmentRoot.getObjectByName(spec.nodeName);
          if (obj) {
            obj.position.set(spec.tablePos[0], spec.tablePos[1], spec.tablePos[2]);
            obj.userData.workbenchId = spec.id;
          }
        });
        scene.add(equipmentRoot);

        var dynWireGroup = new THREE.Group();
        equipmentRoot.add(dynWireGroup);

        // 5. Hệ 2 trục Chuột phải (Gizmo: Trục đứng xanh lá & Vành xoay tròn vàng cam)
        var gizmoGroup = new THREE.Group();
        gizmoGroup.visible = false;
        var vMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        var vShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0038, 0.0038, 0.16, 16), vMat);
        vShaft.position.y = 0.11; vShaft.userData = { gizmoPart: 'vertical' };
        var vCone = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.032, 20), vMat);
        vCone.position.y = 0.198; vCone.userData = { gizmoPart: 'vertical' };
        var vHit = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.21, 12), new THREE.MeshBasicMaterial({ visible: false }));
        vHit.position.y = 0.115; vHit.userData = { gizmoPart: 'vertical' };
        gizmoGroup.add(vShaft, vCone, vHit);

        var rMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        var rTorusGeo = new THREE.TorusGeometry(0.095, 0.0036, 14, 48);
        rTorusGeo.rotateX(Math.PI / 2);
        var rTorus = new THREE.Mesh(rTorusGeo, rMat);
        rTorus.position.y = 0.025; rTorus.userData = { gizmoPart: 'rotate' };
        var rHitGeo = new THREE.TorusGeometry(0.095, 0.018, 10, 36);
        rHitGeo.rotateX(Math.PI / 2);
        var rHit = new THREE.Mesh(rHitGeo, new THREE.MeshBasicMaterial({ visible: false }));
        rHit.position.y = 0.025; rHit.userData = { gizmoPart: 'rotate' };
        gizmoGroup.add(rTorus, rHit);
        scene.add(gizmoGroup);

        var getObj = function(id) {
          var s = CATALOG.find(function(x) { return x.id === id; });
          return s ? equipmentRoot.getObjectByName(s.nodeName) : null;
        };

        function syncInsertedBatteriesToHolder() {
          var holderObj = getObj('battery_holder');
          if (holderObj) {
            if (slot1Occupant && !inCabinet[slot1Occupant]) {
              var b1 = getObj(slot1Occupant);
              if (b1) {
                var off1 = new THREE.Vector3(0, 0, -0.022).applyAxisAngle(new THREE.Vector3(0, 1, 0), holderObj.rotation.y);
                b1.position.copy(holderObj.position).add(off1);
                b1.rotation.y = slot1Occupant !== 'battery_cell_2' ? holderObj.rotation.y : holderObj.rotation.y + Math.PI;
              }
            }
            if (slot2Occupant && !inCabinet[slot2Occupant]) {
              var b2 = getObj(slot2Occupant);
              if (b2) {
                var off2 = new THREE.Vector3(0, 0, 0.022).applyAxisAngle(new THREE.Vector3(0, 1, 0), holderObj.rotation.y);
                b2.position.copy(holderObj.position).add(off2);
                b2.rotation.y = slot2Occupant === 'battery_cell_2' ? holderObj.rotation.y : holderObj.rotation.y + Math.PI;
              }
            }
          }
          var s1Obj = getObj('single_battery_holder_1');
          if (s1Obj && singleSlot1Occupant && !inCabinet[singleSlot1Occupant]) {
            var b = getObj(singleSlot1Occupant);
            if (b) {
              b.position.copy(s1Obj.position);
              b.rotation.y = singleSlot1Occupant !== 'battery_cell_2' ? s1Obj.rotation.y : s1Obj.rotation.y + Math.PI;
            }
          }
          var s2Obj = getObj('single_battery_holder_2');
          if (s2Obj && singleSlot2Occupant && !inCabinet[singleSlot2Occupant]) {
            var b4 = getObj(singleSlot2Occupant);
            if (b4) {
              b4.position.copy(s2Obj.position);
              b4.rotation.y = singleSlot2Occupant !== 'battery_cell_2' ? s2Obj.rotation.y : s2Obj.rotation.y + Math.PI;
            }
          }
        }

        function focusSingleTargetDevice() {
          if (INITIAL_FILTER === 'ALL') return;
          wires = [];
          selectedTerminal = null;
          gizmoTargetId = null;
          gizmoGroup.visible = false;

          CATALOG.forEach(function(s) {
            var obj = getObj(s.id);
            if (!obj) return;
            var isMain = s.nodeName === INITIAL_FILTER;
            var isCompanionBat =
              (INITIAL_FILTER === 'unit_battery_holder' && (s.id === 'battery_cell_1' || s.id === 'battery_cell_2')) ||
              (INITIAL_FILTER === 'unit_single_battery_holder_1' && (s.id === 'battery_cell_3' || s.id === 'single_battery_holder_2'));
            if (isMain) {
              inCabinet[s.id] = false;
              obj.position.set(0, 0, 0);
              obj.rotation.set(0, 0, 0);
              physics[s.id] = { vy: 0, falling: false, restingY: 0 };
            } else if (isCompanionBat) {
              inCabinet[s.id] = false;
              obj.position.set(s.id === 'single_battery_holder_2' ? 0.22 : -0.18, 0, s.id === 'battery_cell_2' ? 0.08 : -0.06);
              obj.rotation.set(0, 0, 0);
              physics[s.id] = { vy: 0, falling: false, restingY: 0 };
            } else {
              inCabinet[s.id] = true;
              obj.position.set(s.cabPos[0], s.cabPos[1], s.cabPos[2]);
              obj.rotation.set(0, 0, 0);
              physics[s.id] = { vy: 0, falling: false, restingY: s.cabPos[1] };
            }
          });

          if (INITIAL_FILTER === 'unit_battery_holder') {
            slot1Occupant = 'battery_cell_1';
            slot2Occupant = 'battery_cell_2';
          } else {
            slot1Occupant = null;
            slot2Occupant = null;
          }
          singleSlot1Occupant = INITIAL_FILTER === 'unit_single_battery_holder_1' ? 'battery_cell_3' : null;
          singleSlot2Occupant = null;
          syncInsertedBatteriesToHolder();
          rebuild3DWires();
          camera.position.set(0, 0.28, 0.38);
          camTarget.set(0, 0.03, 0);
          camera.lookAt(camTarget);
        }

        function placeAllOnTable() {
          wires = [];
          selectedTerminal = null;
          gizmoTargetId = null;
          gizmoGroup.visible = false;
          slot1Occupant = 'battery_cell_1';
          slot2Occupant = 'battery_cell_2';
          singleSlot1Occupant = null;
          singleSlot2Occupant = null;
          CATALOG.forEach(function(s) {
            inCabinet[s.id] = false;
            var obj = getObj(s.id);
            if (obj) {
              obj.position.set(s.tablePos[0], s.tablePos[1], s.tablePos[2]);
              obj.rotation.set(0, 0, 0);
              physics[s.id] = { vy: 0, falling: false, restingY: 0 };
            }
          });
          syncInsertedBatteriesToHolder();
          rebuild3DWires();
          camera.position.set(0, 0.68, 0.92);
          camTarget.set(0, 0.06, -0.06);
          camera.lookAt(camTarget);
        }

        function resolveSolidCollisions(movingId) {
          var movingObj = getObj(movingId);
          var movingSpec = CATALOG.find(function(s) { return s.id === movingId; });
          if (!movingObj || !movingSpec) return;
          var isMovBat = isBatteryCell(movingId);
          var isSeated = function(id) {
            return id === slot1Occupant || id === slot2Occupant || id === singleSlot1Occupant || id === singleSlot2Occupant;
          };
          var getExtents = function(spec, rotY) {
            var c = Math.abs(Math.cos(rotY)), s = Math.abs(Math.sin(rotY));
            return [spec.halfW * c + spec.halfD * s, spec.halfW * s + spec.halfD * c];
          };
          for (var iter = 0; iter < 3; iter++) {
            var mExt = getExtents(movingSpec, movingObj.rotation.y);
            var mHX = mExt[0], mHZ = mExt[1];
            CATALOG.forEach(function(other) {
              if (other.id === movingId) return;
              if (isMovBat && isAnyHolder(other.id)) return;
              if (isAnyHolder(movingId) && isSeated(other.id)) return;
              if (!isMovBat && isSeated(other.id)) return;
              var otherObj = getObj(other.id);
              if (!otherObj || !otherObj.visible) return;
              if (movingObj.position.y + movingSpec.height <= otherObj.position.y + 0.004 ||
                  movingObj.position.y >= otherObj.position.y + other.height - 0.004) return;
              var oExt = getExtents(other, otherObj.rotation.y);
              var minX = mHX + oExt[0] + 0.006, minZ = mHZ + oExt[1] + 0.006;
              var dx = movingObj.position.x - otherObj.position.x;
              var dz = movingObj.position.z - otherObj.position.z;
              var ovX = minX - Math.abs(dx), ovZ = minZ - Math.abs(dz);
              if (ovX > 0 && ovZ > 0) {
                if (ovX < ovZ) movingObj.position.x += (dx >= 0 ? 1 : -1) * ovX;
                else movingObj.position.z += (dz >= 0 ? 1 : -1) * ovZ;
              }
            });
          }
          if (isAnyHolder(movingId)) syncInsertedBatteriesToHolder();
        }

        function rebuild3DWires() {
          while (dynWireGroup.children.length > 0) {
            var ch = dynWireGroup.children[0];
            dynWireGroup.remove(ch);
            if (ch.geometry) ch.geometry.dispose();
          }
          equipmentRoot.updateMatrixWorld(true);
          var rootInv = new THREE.Matrix4().copy(equipmentRoot.matrixWorld).invert();
          var redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 });
          var blueMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.35 });

          var activeWires = wires.filter(function(w) {
            var dA = TERMINAL_TO_ITEM[w.from], dB = TERMINAL_TO_ITEM[w.to];
            return dA && dB && !inCabinet[dA] && !inCabinet[dB];
          });

          activeWires.forEach(function(w, idx) {
            var tA = equipmentRoot.getObjectByName('terminal_' + w.from);
            var tB = equipmentRoot.getObjectByName('terminal_' + w.to);
            if (!tA || !tB) return;
            var wA = new THREE.Vector3(), wB = new THREE.Vector3();
            tA.getWorldPosition(wA); tB.getWorldPosition(wB);
            var pA = wA.applyMatrix4(rootInv), pB = wB.applyMatrix4(rootInv);
            var dist = pA.distanceTo(pB);
            var arcH = Math.min(0.11, Math.max(0.036, dist * 0.28)) + (idx % 3) * 0.006;
            var p1 = pA.clone().add(new THREE.Vector3(0, 0.028, 0));
            var pMid = pA.clone().lerp(pB, 0.5).add(new THREE.Vector3(0, arcH * 1.1, (idx % 2 === 0 ? 1 : -1) * 0.025));
            var p4 = pB.clone().add(new THREE.Vector3(0, 0.028, 0));
            var curve = new THREE.CatmullRomCurve3([pA, p1, pMid, p4, pB]);
            var mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.0024, 10, false), w.color === 'red' ? redMat : blueMat);
            dynWireGroup.add(mesh);
          });
        }

        function solveCircuit() {
          var terms = Object.keys(TERMINAL_TO_ITEM);
          var deg = {}; terms.forEach(function(t) { deg[t] = 0; });
          var parent = {}; terms.forEach(function(t) { parent[t] = t; });
          var find = function(x) { return parent[x] === x ? x : (parent[x] = find(parent[x])); };
          var union = function(a, b) { var ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra; };

          var activeWires = wires.filter(function(w) {
            return !inCabinet[TERMINAL_TO_ITEM[w.from]] && !inCabinet[TERMINAL_TO_ITEM[w.to]];
          });
          activeWires.forEach(function(w) {
            deg[w.from]++; deg[w.to]++; union(w.from, w.to);
          });

          var slots = [
            { pos: 'BAT1_POS', neg: 'BAT1_NEG', ins: !inCabinet.battery_holder && slot1Occupant && !inCabinet[slot1Occupant] },
            { pos: 'BAT2_POS', neg: 'BAT2_NEG', ins: !inCabinet.battery_holder && slot2Occupant && !inCabinet[slot2Occupant] },
            { pos: 'SBAT1_POS', neg: 'SBAT1_NEG', ins: !inCabinet.single_battery_holder_1 && singleSlot1Occupant && !inCabinet[singleSlot1Occupant] },
            { pos: 'SBAT2_POS', neg: 'SBAT2_NEG', ins: !inCabinet.single_battery_holder_2 && singleSlot2Occupant && !inCabinet[singleSlot2Occupant] }
          ];
          var activeSlots = slots.filter(function(s) { return s.ins && deg[s.pos] > 0 && deg[s.neg] > 0; });

          var emfV = 0, rInt = 0.12, srcPos = '', srcNeg = '';
          if (activeSlots.length === 1) {
            srcPos = find(activeSlots[0].pos); srcNeg = find(activeSlots[0].neg);
            if (srcPos !== srcNeg) { emfV = 1.5; rInt = 0.12; }
          } else if (activeSlots.length === 2) {
            var b1 = activeSlots[0], b2 = activeSlots[1];
            var p1 = find(b1.pos), n1 = find(b1.neg), p2 = find(b2.pos), n2 = find(b2.neg);
            if (p1 === p2 && n1 === n2 && p1 !== n1) {
              emfV = 1.5; rInt = 0.06; srcPos = p1; srcNeg = n1;
            } else if (p1 === n2 && p2 !== n1) {
              emfV = 3.0; rInt = 0.24; srcPos = p2; srcNeg = n1;
            } else if (n1 === p2 && p1 !== n2) {
              emfV = 3.0; rInt = 0.24; srcPos = p1; srcNeg = n2;
            }
          }

          var lowerL = deg.RHEO_IN > 0, lowerR = deg.RHEO_COIL_END > 0;
          var upperL = deg.RHEO_RAIL_L > 0, upperR = deg.RHEO_WIPER > 0;
          var rheoTouched = lowerL || lowerR || upperL || upperR;
          var rRheo = rheostatOhm, rheoA = '', rheoB = '', rheoValid = true;
          if (rheoTouched) {
            var lCnt = (lowerL ? 1 : 0) + (lowerR ? 1 : 0);
            var uCnt = (upperL ? 1 : 0) + (upperR ? 1 : 0);
            if (lCnt === 1 && uCnt === 1) {
              rheoA = lowerL ? 'RHEO_IN' : 'RHEO_COIL_END';
              rheoB = upperL ? 'RHEO_RAIL_L' : 'RHEO_WIPER';
              rRheo = lowerL ? rheostatOhm : 20 - rheostatOhm;
            } else if (lCnt === 2 && uCnt === 0) {
              rheoA = 'RHEO_IN'; rheoB = 'RHEO_COIL_END'; rRheo = 20.0;
            } else if (lCnt === 0 && uCnt >= 1) {
              rheoA = upperL ? 'RHEO_RAIL_L' : 'RHEO_WIPER';
              rheoB = upperR ? 'RHEO_WIPER' : 'RHEO_RAIL_L';
              rRheo = 0.0;
            } else {
              rheoValid = false;
            }
          }

          var swTouched = deg.SW_RED > 0 || deg.SW_GREEN > 0;
          var bulbWired = deg.BULB_POS > 0 && deg.BULB_NEG > 0 && find('BULB_POS') !== find('BULB_NEG');

          if (activeWires.length === 0 && Math.abs(testDriveVal) > 0.005) {
            var testI = Math.max(0, testDriveVal);
            return {
              closed: testI > 0.02, emfV: 3.0, currentA: testDriveVal, voltV: testDriveVal * 4.8,
              bulbCurrentA: testI, amScale: 0.6, vmScale: 6.0,
              msg: 'Đang thử nghiệm trực tiếp thiết bị: I = ' + testDriveVal.toFixed(2) + 'A, U = ' + (testDriveVal * 4.8).toFixed(2) + 'V',
              level: 'ok'
            };
          }

          if (emfV === 0 || !bulbWired || (swTouched && !switchClosed) || (rheoTouched && (!swTouched || !switchClosed || !rheoValid))) {
            return {
              closed: false, emfV: emfV, currentA: 0, voltV: 0, bulbCurrentA: 0, amScale: 0.6, vmScale: 6.0,
              msg: activeWires.length === 0
                ? 'Sẵn sàng: Chọn Dây Đỏ / Dây Xanh rồi click 2 cọc cắm để lắp mạch, hoặc kéo thả thiết bị trên bàn.'
                : (swTouched && !switchClosed)
                ? 'Công tắc K đang MỞ: Hãy vuốt/kéo thanh công tắc xuống để ĐÓNG mạch!'
                : 'Mạch chưa khép kín đúng chuẩn Phần A (1 Pin) hoặc Phần B (2 Pin) — Đèn chưa sáng.',
              level: activeWires.length === 0 ? 'idle' : 'warn'
            };
          }

          var elems = [{ u: find('BULB_POS'), v: find('BULB_NEG'), r: 4.8 }];
          if (swTouched && switchClosed) elems.push({ u: find('SW_RED'), v: find('SW_GREEN'), r: 0.005 });
          if (rheoTouched && find(rheoA) !== find(rheoB)) elems.push({ u: find(rheoA), v: find(rheoB), r: rRheo });
          var amPos = deg.AM_06A > 0 ? 'AM_06A' : deg.AM_3A > 0 ? 'AM_3A' : '';
          if (deg.AM_NEG > 0 && amPos) elems.push({ u: find(amPos), v: find('AM_NEG'), r: 0.05 });

          var adj = {};
          elems.forEach(function(e, idx) {
            if (!adj[e.u]) adj[e.u] = [];
            if (!adj[e.v]) adj[e.v] = [];
            adj[e.u].push({ idx: idx, to: e.v });
            adj[e.v].push({ idx: idx, to: e.u });
          });

          var validChain = Boolean(adj[srcPos] && adj[srcPos].length === 1 && adj[srcNeg] && adj[srcNeg].length === 1);
          var vis = {};
          var visCount = 0;
          var cur = srcPos;
          while (validChain && cur !== srcNeg) {
            var list = adj[cur] || [];
            var next = null;
            for (var k = 0; k < list.length; k++) {
              if (!vis[list[k].idx]) { next = list[k]; break; }
            }
            if (!next) { validChain = false; break; }
            vis[next.idx] = true; visCount++; cur = next.to;
          }
          if (!validChain || cur !== srcNeg || visCount !== elems.length) {
            return {
              closed: false, emfV: emfV, currentA: 0, voltV: 0, bulbCurrentA: 0, amScale: 0.6, vmScale: 6.0,
              msg: 'Mạch ngoài chưa tạo thành vòng nối tiếp khép kín từ cực (+) qua đèn về cực (-) nguồn.',
              level: 'warn'
            };
          }

          var rTot = rInt + 4.8 + (rheoTouched ? rRheo : 0) + (amPos ? 0.05 : 0);
          var I = emfV / Math.max(0.05, rTot);
          var Ubulb = I * 4.8;
          return {
            closed: true, emfV: emfV, currentA: I, voltV: Ubulb, bulbCurrentA: I,
            amScale: deg.AM_3A > 0 ? 3.0 : 0.6,
            vmScale: deg.VM_12V > 0 ? 12.0 : 6.0,
            msg: 'ĐÈN SÁNG • U_nguồn = ' + emfV.toFixed(1) + 'V | I = ' + I.toFixed(3) + 'A | U_đèn = ' + Ubulb.toFixed(2) + 'V | R_bt = ' + rRheo.toFixed(1) + 'Ω',
            level: 'ok'
          };
        }

        if (INITIAL_FILTER !== 'ALL') {
          focusSingleTargetDevice();
        } else {
          syncInsertedBatteriesToHolder();
        }

        var raycaster = new THREE.Raycaster();
        var pointer = new THREE.Vector2();
        var groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        var planeHit = new THREE.Vector3();

        var isChildOfName = function(obj, name) {
          var c = obj;
          while (c) { if (c.name === name) return true; c = c.parent; }
          return false;
        };

        var setSwitchLeverHighlight = function(vis) {
          var sw = getObj('knife_switch');
          if (!sw) return;
          var hl = sw.getObjectByName('switch_lever_highlight');
          if (hl) hl.visible = vis;
          if (sw.userData && sw.userData.bladeMetalMat) {
            sw.userData.bladeMetalMat.emissive.setHex(vis ? 0x22c55e : 0x000000);
            sw.userData.bladeMetalMat.emissiveIntensity = vis ? 0.55 : 0.0;
          }
        };

        var setHolderSlotHighlights = function(target) {
          var h2 = getObj('battery_holder');
          if (h2) {
            var s1 = h2.getObjectByName('slot1_highlight'), s2 = h2.getObjectByName('slot2_highlight');
            if (s1) s1.visible = target === 'slot1';
            if (s2) s2.visible = target === 'slot2';
          }
          var sh1 = getObj('single_battery_holder_1');
          if (sh1 && sh1.getObjectByName('slot_highlight')) sh1.getObjectByName('slot_highlight').visible = target === 'single1';
          var sh2 = getObj('single_battery_holder_2');
          if (sh2 && sh2.getObjectByName('slot_highlight')) sh2.getObjectByName('slot_highlight').visible = target === 'single2';
        };

        function syncSwitchUI() {
          var btn = document.getElementById('btn-quick-switch');
          btn.textContent = switchClosed ? 'ĐANG ĐÓNG KHÍT (ON)' : 'ĐANG MỞ (OFF)';
          btn.className = switchClosed ? 'btn btn-emerald' : 'btn btn-amber';
        }

        renderer.domElement.addEventListener('wheel', function(e) {
          e.preventDefault();
          var rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);

          var swObj = getObj('knife_switch');
          if (swObj && !inCabinet.knife_switch) {
            var swHits = raycaster.intersectObjects(swObj.children, true);
            if (swHits.some(function(h) { return isChildOfName(h.object, 'switch_blade_pivot'); })) {
              if (e.deltaY < -1 && switchClosed) {
                switchClosed = false; syncSwitchUI(); window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('switch', false);
              } else if (e.deltaY > 1 && !switchClosed) {
                switchClosed = true; syncSwitchUI(); window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('switch', true);
              }
              return;
            }
          }

          var hits = raycaster.intersectObjects([equipmentRoot, labTableGroup, cabinetGroup], true);
          var valid = hits.find(function(h) { return h.object.visible; });
          var pivot = new THREE.Vector3();
          if (valid) pivot.copy(valid.point);
          else if (!raycaster.ray.intersectPlane(groundPlane, pivot)) pivot.copy(camTarget);

          var norm = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 120) / 120;
          var factor = norm < 0 ? 1 - 0.16 * Math.abs(norm) : 1 + 0.16 * Math.abs(norm);
          var camOff = camera.position.clone().sub(pivot);
          if (camOff.length() * factor < 0.06 || camOff.length() * factor > 5.5) return;
          camera.position.copy(pivot.clone().addScaledVector(camOff, factor));
          camTarget.copy(pivot.clone().addScaledVector(camTarget.clone().sub(pivot), factor));
          camera.lookAt(camTarget);
        }, { passive: false });

        var draggingItemId = null;
        var draggingRheostat = false;
        var draggingSwitchLever = false;
        var switchDragStartY = 0;
        var switchDragMoved = false;
        var isHoveringSwitch = false;
        var switchHoverAnchorY = 0;
        var draggingGizmoMode = null;
        var gizmoStartY = 0, gizmoStartPtrY = 0, gizmoStartRotY = 0, gizmoStartAng = 0;
        var hoveredSlot = null;
        var dragOffset = new THREE.Vector3();
        var orbitingCamera = false;
        var orbitPrevX = 0, orbitPrevY = 0;

        var updatePtr = function(e) {
          var r = renderer.domElement.getBoundingClientRect();
          pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
          pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        };

        var findTerm = function(obj) {
          var c = obj;
          while (c) {
            if (c.userData && c.userData.terminalId && !inCabinet[TERMINAL_TO_ITEM[c.userData.terminalId]]) return c.userData.terminalId;
            c = c.parent;
          }
          return null;
        };

        var findItem = function(obj) {
          var c = obj;
          while (c) { if (c.userData && c.userData.workbenchId) return { id: c.userData.workbenchId, group: c }; c = c.parent; }
          return null;
        };

        var triggerGravityFall = function() {
          CATALOG.forEach(function(s) {
            if (s.id === slot1Occupant || s.id === slot2Occupant || s.id === singleSlot1Occupant || s.id === singleSlot2Occupant) return;
            var obj = getObj(s.id);
            if (!obj) return;
            var restY = inCabinet[s.id] ? (obj.position.y >= 0.19 ? 0.222 : 0.024) : 0;
            physics[s.id].restingY = restY;
            if (obj.position.y > restY + 0.002) physics[s.id].falling = true;
          });
        };

        renderer.domElement.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          updatePtr(e); raycaster.setFromCamera(pointer, camera);
          var hits = raycaster.intersectObjects(equipmentRoot.children, true);
          for (var i = 0; i < hits.length; i++) {
            var found = findItem(hits[i].object);
            if (found) {
              physics[found.id].falling = false; physics[found.id].vy = 0;
              gizmoTargetId = found.id;
              gizmoGroup.position.copy(found.group.position);
              gizmoGroup.visible = true;
              window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('plug');
              return;
            }
          }
          if (gizmoTargetId) { gizmoTargetId = null; gizmoGroup.visible = false; triggerGravityFall(); }
        });

        renderer.domElement.addEventListener('dblclick', function(e) {
          updatePtr(e); raycaster.setFromCamera(pointer, camera);
          var hits = raycaster.intersectObjects(equipmentRoot.children, true);
          for (var i = 0; i < hits.length; i++) {
            var found = findItem(hits[i].object);
            if (found) {
              var specItem = CATALOG.find(function(x) { return x.id === found.id; });
              if (specItem) {
                document.getElementById('info-cat').textContent = specItem.category + ' • ' + specItem.modelCode;
                document.getElementById('info-title').textContent = specItem.name;
                document.getElementById('info-desc').textContent = specItem.desc;
                var grid = document.getElementById('info-specs');
                grid.innerHTML = specItem.specs.map(function(pair) {
                  return '<div class="spec-item"><div style="font-size:10px;color:#94a3b8">' + pair[0] + '</div><div style="font-weight:700;color:#f8fafc;font-family:monospace">' + pair[1] + '</div></div>';
                }).join('');
                document.getElementById('info-modal').classList.add('open');
              }
              return;
            }
          }
        });

        renderer.domElement.addEventListener('pointerdown', function(e) {
          if (e.button !== 0) return;
          updatePtr(e); raycaster.setFromCamera(pointer, camera);

          if (gizmoGroup.visible && gizmoTargetId) {
            var gHits = raycaster.intersectObjects(gizmoGroup.children, true);
            if (gHits.length > 0) {
              var part = gHits[0].object.userData ? gHits[0].object.userData.gizmoPart : null;
              var tObj = getObj(gizmoTargetId);
              if (part && tObj) {
                draggingGizmoMode = part;
                gizmoStartY = tObj.position.y; gizmoStartPtrY = pointer.y;
                gizmoStartRotY = tObj.rotation.y;
                groundPlane.constant = -tObj.position.y;
                if (raycaster.ray.intersectPlane(groundPlane, planeHit)) {
                  gizmoStartAng = Math.atan2(planeHit.x - tObj.position.x, planeHit.z - tObj.position.z);
                }
                return;
              }
            }
          }

          var hits = raycaster.intersectObjects(equipmentRoot.children, true);
          if (hits.length === 0) {
            var bbHits = raycaster.intersectObjects(blackboardGroup.children, true);
            if (bbHits.length > 0) { document.getElementById('board-modal').classList.add('open'); return; }
            selectedTerminal = null;
            if (gizmoTargetId) { gizmoTargetId = null; gizmoGroup.visible = false; triggerGravityFall(); }
            orbitingCamera = true;
            orbitPrevX = e.clientX;
            orbitPrevY = e.clientY;
            return;
          }

          for (var i = 0; i < hits.length; i++) {
            var tid = findTerm(hits[i].object);
            if (tid) {
              if (!selectedTerminal) {
                selectedTerminal = tid;
                window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('plug');
              } else if (selectedTerminal === tid) {
                selectedTerminal = null;
              } else {
                var from = selectedTerminal, to = tid;
                var idx = wires.findIndex(function(w) { return (w.from === from && w.to === to) || (w.from === to && w.to === from); });
                if (idx >= 0) wires.splice(idx, 1);
                else wires.push({ id: 'w_' + Date.now(), from: from, to: to, color: wireColor });
                selectedTerminal = null;
                rebuild3DWires();
                window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('plug');
              }
              return;
            }
          }

          var topObj = hits[0].object;
          if (!inCabinet.knife_switch && isChildOfName(topObj, 'switch_blade_pivot')) {
            draggingSwitchLever = true;
            switchDragStartY = pointer.y;
            switchDragMoved = false;
            setSwitchLeverHighlight(true);
            return;
          }
          if (!inCabinet.rheostat_20 && isChildOfName(topObj, 'plunger')) {
            draggingRheostat = true;
            return;
          }

          for (var j = 0; j < hits.length; j++) {
            var found = findItem(hits[j].object);
            if (found) {
              draggingItemId = found.id;
              physics[found.id].falling = false; physics[found.id].vy = 0;
              if (isBatteryCell(found.id)) {
                if (slot1Occupant === found.id) slot1Occupant = null;
                if (slot2Occupant === found.id) slot2Occupant = null;
                if (singleSlot1Occupant === found.id) singleSlot1Occupant = null;
                if (singleSlot2Occupant === found.id) singleSlot2Occupant = null;
              }
              groundPlane.constant = 0;
              if (!inCabinet[found.id] && raycaster.ray.intersectPlane(groundPlane, planeHit)) {
                dragOffset.copy(found.group.position).sub(planeHit);
                dragOffset.y = 0;
              } else dragOffset.set(0, 0, 0);
              return;
            }
          }
        });

        window.addEventListener('pointermove', function(e) {
          updatePtr(e); raycaster.setFromCamera(pointer, camera);

          if (orbitingCamera) {
            var dx = (e.clientX - orbitPrevX) * 0.007;
            var dy = (e.clientY - orbitPrevY) * 0.007;
            orbitPrevX = e.clientX;
            orbitPrevY = e.clientY;
            var offset = camera.position.clone().sub(camTarget);
            var r = offset.length();
            var theta = Math.atan2(offset.x, offset.z) - dx;
            var phi = Math.max(0.18, Math.min(Math.PI / 2 - 0.03, Math.acos(Math.max(-1, Math.min(1, offset.y / r))) - dy));
            camera.position.set(
              camTarget.x + r * Math.sin(phi) * Math.sin(theta),
              camTarget.y + r * Math.cos(phi),
              camTarget.z + r * Math.sin(phi) * Math.cos(theta)
            );
            camera.lookAt(camTarget);
            return;
          }

          if (draggingGizmoMode && gizmoTargetId) {
            var tObj = getObj(gizmoTargetId);
            if (!tObj) return;
            if (draggingGizmoMode === 'vertical') {
              tObj.position.y = Math.max(0, Math.min(1.1, gizmoStartY + (pointer.y - gizmoStartPtrY) * 0.85));
              gizmoGroup.position.copy(tObj.position);
              if (isAnyHolder(gizmoTargetId)) syncInsertedBatteriesToHolder();
              rebuild3DWires();
            } else {
              groundPlane.constant = -tObj.position.y;
              if (raycaster.ray.intersectPlane(groundPlane, planeHit)) {
                var ang = Math.atan2(planeHit.x - tObj.position.x, planeHit.z - tObj.position.z);
                tObj.rotation.y = gizmoStartRotY + (ang - gizmoStartAng);
                resolveSolidCollisions(gizmoTargetId);
                if (isAnyHolder(gizmoTargetId)) syncInsertedBatteriesToHolder();
                rebuild3DWires();
              }
            }
            return;
          }

          if (draggingSwitchLever) {
            var dySw = pointer.y - switchDragStartY;
            if (Math.abs(dySw) > 0.008) {
              switchDragMoved = true;
              var startAng = switchClosed ? -0.04 : 0.72;
              switchBladeAngleOverride = Math.max(-0.04, Math.min(0.72, startAng + dySw * 4.5));
              if (dySw > 0.015 && switchClosed) {
                switchClosed = false; syncSwitchUI(); window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('switch', false);
              } else if (dySw < -0.015 && !switchClosed) {
                switchClosed = true; syncSwitchUI(); window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('switch', true);
              }
            }
            return;
          }

          if (draggingRheostat) {
            var rObj = getObj('rheostat_20');
            if (rObj) {
              groundPlane.constant = -rObj.position.y;
              if (raycaster.ray.intersectPlane(groundPlane, planeHit)) {
                var loc = planeHit.clone().sub(rObj.position).applyAxisAngle(new THREE.Vector3(0, 1, 0), -rObj.rotation.y);
                rheostatOhm = Math.round(Math.max(0, Math.min(1, (loc.x + 0.056) / 0.112)) * 20 * 2) / 2;
                document.getElementById('rng-rheo').value = rheostatOhm;
                document.getElementById('lbl-rheo').textContent = rheostatOhm.toFixed(1);
              }
            }
            return;
          }

          if (draggingItemId) {
            var itemObj = getObj(draggingItemId);
            if (itemObj) {
              groundPlane.constant = 0;
              if (raycaster.ray.intersectPlane(groundPlane, planeHit)) {
                itemObj.position.set(
                  Math.max(-0.92, Math.min(0.92, planeHit.x + dragOffset.x)),
                  0,
                  Math.max(-0.45, Math.min(0.45, planeHit.z + dragOffset.z))
                );
                inCabinet[draggingItemId] = false;
                resolveSolidCollisions(draggingItemId);
              }

              hoveredSlot = null;
              if (isBatteryCell(draggingItemId)) {
                var h2 = getObj('battery_holder');
                if (h2 && !inCabinet.battery_holder) {
                  var rel = new THREE.Vector3(itemObj.position.x - h2.position.x, 0, itemObj.position.z - h2.position.z)
                    .applyAxisAngle(new THREE.Vector3(0, 1, 0), -h2.rotation.y);
                  if (Math.abs(rel.x) < 0.075 && Math.abs(rel.z) < 0.055) {
                    if (rel.z < 0 && !slot1Occupant) hoveredSlot = 'slot1';
                    else if (rel.z >= 0 && !slot2Occupant) hoveredSlot = 'slot2';
                    else if (!slot1Occupant) hoveredSlot = 'slot1';
                    else if (!slot2Occupant) hoveredSlot = 'slot2';
                  }
                }
                var s1 = getObj('single_battery_holder_1');
                if (!hoveredSlot && s1 && !inCabinet.single_battery_holder_1 && !singleSlot1Occupant) {
                  var rel1 = new THREE.Vector3(itemObj.position.x - s1.position.x, 0, itemObj.position.z - s1.position.z)
                    .applyAxisAngle(new THREE.Vector3(0, 1, 0), -s1.rotation.y);
                  if (Math.abs(rel1.x) < 0.075 && Math.abs(rel1.z) < 0.042) hoveredSlot = 'single1';
                }
                var s2 = getObj('single_battery_holder_2');
                if (!hoveredSlot && s2 && !inCabinet.single_battery_holder_2 && !singleSlot2Occupant) {
                  var rel2 = new THREE.Vector3(itemObj.position.x - s2.position.x, 0, itemObj.position.z - s2.position.z)
                    .applyAxisAngle(new THREE.Vector3(0, 1, 0), -s2.rotation.y);
                  if (Math.abs(rel2.x) < 0.075 && Math.abs(rel2.z) < 0.042) hoveredSlot = 'single2';
                }
              }
              setHolderSlotHighlights(hoveredSlot);
              if (isAnyHolder(draggingItemId)) syncInsertedBatteriesToHolder();
              rebuild3DWires();
            }
            return;
          }

          var hits = raycaster.intersectObjects(equipmentRoot.children, true);
          var hitSw = !inCabinet.knife_switch && hits.length > 0 && isChildOfName(hits[0].object, 'switch_blade_pivot');
          if (hitSw) {
            setSwitchLeverHighlight(true);
            renderer.domElement.style.cursor = 'ns-resize';
            if (!isHoveringSwitch) {
              isHoveringSwitch = true; switchHoverAnchorY = pointer.y;
            } else {
              var dyHov = pointer.y - switchHoverAnchorY;
              if (dyHov > 0.024 && switchClosed) {
                switchHoverAnchorY = pointer.y; switchClosed = false; syncSwitchUI(); window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('switch', false);
              } else if (dyHov < -0.024 && !switchClosed) {
                switchHoverAnchorY = pointer.y; switchClosed = true; syncSwitchUI(); window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('switch', true);
              }
            }
          } else {
            isHoveringSwitch = false;
            setSwitchLeverHighlight(false);
            renderer.domElement.style.cursor = hits.length > 0 ? 'grab' : 'default';
          }
        });

        window.addEventListener('pointerup', function() {
          orbitingCamera = false;
          setHolderSlotHighlights(null);
          if (draggingSwitchLever) {
            switchBladeAngleOverride = null;
            if (!switchDragMoved) {
              switchClosed = !switchClosed; syncSwitchUI(); window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('switch', switchClosed);
            }
            draggingSwitchLever = false;
            return;
          }
          if (draggingItemId && isBatteryCell(draggingItemId) && hoveredSlot) {
            if (hoveredSlot === 'slot1') slot1Occupant = draggingItemId;
            else if (hoveredSlot === 'slot2') slot2Occupant = draggingItemId;
            else if (hoveredSlot === 'single1') singleSlot1Occupant = draggingItemId;
            else if (hoveredSlot === 'single2') singleSlot2Occupant = draggingItemId;
            syncInsertedBatteriesToHolder();
            window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('plug');
          }
          hoveredSlot = null;
          draggingItemId = null;
          draggingRheostat = false;
          draggingGizmoMode = null;
        });

        document.getElementById('btn-wire-red').addEventListener('click', function() {
          wireColor = 'red';
          document.getElementById('btn-wire-red').classList.add('active');
          document.getElementById('btn-wire-blue').classList.remove('active');
        });
        document.getElementById('btn-wire-blue').addEventListener('click', function() {
          wireColor = 'blue';
          document.getElementById('btn-wire-blue').classList.add('active');
          document.getElementById('btn-wire-red').classList.remove('active');
        });
        document.getElementById('btn-focus-device').addEventListener('click', focusSingleTargetDevice);
        document.getElementById('btn-show-all-kit').addEventListener('click', placeAllOnTable);
        document.getElementById('btn-template-series').addEventListener('click', function() {
          placeAllOnTable();
          rheostatOhm = 4.0;
          document.getElementById('rng-rheo').value = '4.0';
          document.getElementById('lbl-rheo').textContent = '4.0';
          switchClosed = true; syncSwitchUI();
          wires = [
            { id: 'w1', from: 'BAT1_NEG', to: 'BAT2_POS', color: 'blue' },
            { id: 'w2', from: 'BAT1_POS', to: 'SW_RED', color: 'red' },
            { id: 'w3', from: 'SW_GREEN', to: 'RHEO_IN', color: 'red' },
            { id: 'w4', from: 'RHEO_WIPER', to: 'AM_06A', color: 'red' },
            { id: 'w5', from: 'AM_NEG', to: 'BULB_POS', color: 'blue' },
            { id: 'w6', from: 'BULB_NEG', to: 'BAT2_NEG', color: 'blue' },
            { id: 'w7', from: 'BULB_POS', to: 'VM_6V', color: 'red' },
            { id: 'w8', from: 'BULB_NEG', to: 'VM_NEG', color: 'blue' }
          ];
          rebuild3DWires();
          window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('switch', true);
        });
        document.getElementById('btn-cabinet-all').addEventListener('click', function() {
          wires = []; rebuild3DWires();
          slot1Occupant = null; slot2Occupant = null; singleSlot1Occupant = null; singleSlot2Occupant = null;
          CATALOG.forEach(function(s) {
            inCabinet[s.id] = true;
            var obj = getObj(s.id);
            if (obj) { obj.position.set(s.cabPos[0], s.cabPos[1], s.cabPos[2]); obj.rotation.set(0, 0, 0); }
          });
        });
        document.getElementById('btn-clear-wires').addEventListener('click', function() { wires = []; rebuild3DWires(); });
        document.getElementById('btn-toggle-labels').addEventListener('click', function() {
          showLabels = !showLabels;
          document.getElementById('labels-layer').style.display = showLabels ? 'block' : 'none';
        });
        document.getElementById('btn-edit-board').addEventListener('click', function() {
          document.getElementById('board-modal').classList.add('open');
        });
        document.getElementById('btn-close-board').addEventListener('click', function() {
          document.getElementById('board-modal').classList.remove('open');
        });
        document.getElementById('btn-close-info').addEventListener('click', function() {
          document.getElementById('info-modal').classList.remove('open');
        });
        document.getElementById('btn-quick-switch').addEventListener('click', function() {
          switchClosed = !switchClosed; syncSwitchUI(); window.OL3D_EQUIPMENT_MODULE.playEquipmentSound('switch', switchClosed);
        });
        document.getElementById('rng-rheo').addEventListener('input', function(e) {
          rheostatOhm = parseFloat(e.target.value);
          document.getElementById('lbl-rheo').textContent = rheostatOhm.toFixed(1);
        });
        document.getElementById('rng-test-drive').addEventListener('input', function(e) {
          testDriveVal = parseFloat(e.target.value);
        });

        var lastTime = performance.now();
        var labelsLayer = document.getElementById('labels-layer');

        function animateWorkbench(now) {
          requestAnimationFrame(animateWorkbench);
          if (viewWorkbench.style.display === 'none') return;
          var dt = Math.min(0.05, (now - lastTime) / 1000);
          lastTime = now;

          var fell = false;
          CATALOG.forEach(function(s) {
            var p = physics[s.id];
            if (!p.falling) return;
            var obj = getObj(s.id);
            if (!obj) { p.falling = false; return; }
            p.vy -= 9.8 * dt;
            obj.position.y += p.vy * dt;
            fell = true;
            if (obj.position.y <= p.restingY) {
              obj.position.y = p.restingY;
              resolveSolidCollisions(s.id);
              if (Math.abs(p.vy) > 0.45) p.vy = -p.vy * 0.24;
              else { p.vy = 0; p.falling = false; }
            }
            if (isAnyHolder(s.id)) syncInsertedBatteriesToHolder();
          });
          if (fell) rebuild3DWires();

          var sol = solveCircuit();
          var sBox = document.getElementById('status-box');
          sBox.className = 'status-box ' + (sol.level === 'ok' ? 'ok' : sol.level === 'warn' ? 'warn' : '');
          document.getElementById('status-text').textContent = sol.msg;

          var hintEl = document.getElementById('hint-pill');
          if (selectedTerminal) {
            hintEl.style.display = 'block';
            hintEl.textContent = 'Đang chọn cọc [' + selectedTerminal + '] → Click cọc thứ 2 để nối dây!';
          } else if (gizmoTargetId) {
            hintEl.style.display = 'block';
            hintEl.textContent = 'Đang mở 2 trục Chuột phải: Kéo trục Xanh lá để nâng cao, kéo vành Vàng để xoay. Click ra ngoài để vật tự rơi!';
          } else {
            hintEl.style.display = 'none';
          }

          var statePayload = {
            disableAutoBatteryPos: true,
            switchClosed: !inCabinet.knife_switch ? switchClosed : false,
            rheostatOhm: rheostatOhm,
            emfV: sol.emfV,
            ammeterReadingA: sol.currentA,
            ammeterMaxA: sol.amScale,
            voltmeterReadingV: sol.voltV,
            voltmeterMaxV: sol.vmScale,
            bulbCurrentA: sol.bulbCurrentA,
            bulbResistance: 4.8
          };
          if (switchBladeAngleOverride !== null) {
            statePayload.switchBladeAngle = switchBladeAngleOverride;
          }

          window.OL3D_EQUIPMENT_MODULE.updateEquipmentState(equipmentRoot, statePayload, dt);
          renderer.render(scene, camera);

          if (showLabels) {
            var cw = container.clientWidth, ch = container.clientHeight;
            var tv = new THREE.Vector3();
            var html = '';
            CATALOG.forEach(function(s) {
              if (inCabinet[s.id] || s.id === slot1Occupant || s.id === slot2Occupant || s.id === singleSlot1Occupant || s.id === singleSlot2Occupant) return;
              var obj = getObj(s.id);
              if (!obj || !obj.visible) return;
              obj.getWorldPosition(tv);
              tv.y += s.labelY;
              tv.project(camera);
              if (tv.z < 1.0) {
                var x = (tv.x * 0.5 + 0.5) * cw;
                var y = (-tv.y * 0.5 + 0.5) * ch;
                if (x > 30 && x < cw - 30 && y > 50 && y < ch - 20) {
                  html += '<div class="label-3d" style="left:' + x.toFixed(0) + 'px;top:' + y.toFixed(0) + 'px">' + s.name + '</div>';
                }
              }
            });
            labelsLayer.innerHTML = html;
          }
        }
        requestAnimationFrame(animateWorkbench);

        resizeWorkbenchFn = function() {
          if (container.clientWidth > 0 && container.clientHeight > 0) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
          }
        };
        window.addEventListener('resize', resizeWorkbenchFn);
      }
    })();
  </script>
</body>
</html>`;
}
