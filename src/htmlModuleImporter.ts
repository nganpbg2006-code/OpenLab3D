import * as THREE from 'three';

export interface DiagnosticCheckItem {
  id: 'manifest' | 'icon_photo' | 'script_compile' | 'mesh_3d';
  title: string;
  badgeCode: string;
  status: 'ok' | 'warn' | 'error';
  message: string;
  fixHint?: string;
}

export interface ParsedModuleControls {
  stateKey: string;
  labelVi: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  presets: { label: string; value: number }[];
}

export interface CompiledEquipmentModuleRuntime {
  buildEquipmentGroup: (THREE_NS: typeof THREE, asset?: Record<string, unknown>) => THREE.Group;
  buildEquipmentMesh: (THREE_NS: typeof THREE, asset?: Record<string, unknown>) => THREE.Group;
  applyEquipmentState: (
    THREE_NS: typeof THREE,
    rootObject: THREE.Object3D,
    instance: Record<string, unknown>,
    asset?: Record<string, unknown>
  ) => void;
  updateEquipmentState: (
    rootObject: THREE.Object3D,
    state: Record<string, unknown>,
    dt?: number
  ) => void;
  playEquipmentSound: (eventType: string, value?: unknown) => void;
}

export interface ValidatedHtmlEquipmentModule {
  isValid: boolean;
  errorCount: number;
  warnCount: number;
  checks: DiagnosticCheckItem[];
  assetId: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  category: string;
  summaryVi: string;
  dimensionsM: [number, number, number];
  massG: number;
  controls: ParsedModuleControls;
  iconSvg: string;
  realPhotoHtml: string;
  manifestRaw: Record<string, unknown>;
  scriptCode: string;
  meshCount: number;
  detectedTerminals: string[];
  runtime: CompiledEquipmentModuleRuntime | null;
}

export interface StoredHtmlEquipmentModule {
  id: string;
  assetId: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  category: string;
  summaryVi: string;
  filename: string;
  htmlContent: string;
  dimensionsM: [number, number, number];
  massG: number;
  controls: ParsedModuleControls;
  iconSvg: string;
  realPhotoHtml: string;
  importedAt: number;
  addBindingPosts: boolean;
  currentControlValue: number;
}

const STORAGE_KEY = 'ol3d_imported_html_modules_v1';

/**
 * Biên dịch an toàn khối #ol3d-module-3d-script mà không ghi đè mất
 * window.OL3D_EQUIPMENT_MODULE của bộ thí nghiệm gốc trên trang.
 */
export function compileIsolatedModuleRuntime(
  scriptCode: string
): { runtime: CompiledEquipmentModuleRuntime | null; error?: string } {
  if (!scriptCode || !scriptCode.trim()) {
    return { runtime: null, error: 'Khối #ol3d-module-3d-script trống.' };
  }

  const prevGlobal = window.OL3D_EQUIPMENT_MODULE;
  let capturedRaw: Record<string, unknown> | undefined;

  try {
    window.OL3D_EQUIPMENT_MODULE = undefined;
    const runner = new Function(
      scriptCode + '\n;return window.OL3D_EQUIPMENT_MODULE;'
    );
    capturedRaw = runner() as Record<string, unknown> | undefined;
  } catch (err) {
    window.OL3D_EQUIPMENT_MODULE = prevGlobal;
    return {
      runtime: null,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    window.OL3D_EQUIPMENT_MODULE = prevGlobal;
  }

  if (!capturedRaw || typeof capturedRaw !== 'object') {
    return {
      runtime: null,
      error: 'Script không gán đối tượng vào window.OL3D_EQUIPMENT_MODULE.',
    };
  }

  const rawBuildGroup =
    typeof capturedRaw.buildEquipmentGroup === 'function'
      ? (capturedRaw.buildEquipmentGroup as (
          t: typeof THREE,
          a?: Record<string, unknown>
        ) => THREE.Group)
      : null;
  const rawBuildMesh =
    typeof capturedRaw.buildEquipmentMesh === 'function'
      ? (capturedRaw.buildEquipmentMesh as (
          t: typeof THREE,
          a?: Record<string, unknown>
        ) => THREE.Group)
      : null;

  if (!rawBuildGroup && !rawBuildMesh) {
    return {
      runtime: null,
      error:
        'Thiếu hàm tạo mô hình 3D: Cần có buildEquipmentGroup(THREE, asset) hoặc buildEquipmentMesh(THREE, asset).',
    };
  }

  const withIsolatedGlobal = <T>(fn: () => T): T => {
    const saved = window.OL3D_EQUIPMENT_MODULE;
    try {
      window.OL3D_EQUIPMENT_MODULE =
        capturedRaw as unknown as Window['OL3D_EQUIPMENT_MODULE'];
      return fn();
    } finally {
      window.OL3D_EQUIPMENT_MODULE = saved;
    }
  };

  const buildFn = (
    THREE_NS: typeof THREE,
    asset?: Record<string, unknown>
  ): THREE.Group => {
    return withIsolatedGlobal(() => {
      if (rawBuildGroup) return rawBuildGroup.call(capturedRaw, THREE_NS, asset || {});
      return rawBuildMesh!.call(capturedRaw, THREE_NS, asset || {});
    });
  };

  const applyFn = (
    THREE_NS: typeof THREE,
    rootObject: THREE.Object3D,
    instance: Record<string, unknown>,
    asset?: Record<string, unknown>
  ) => {
    withIsolatedGlobal(() => {
      if (typeof capturedRaw!.applyEquipmentState === 'function') {
        (
          capturedRaw!.applyEquipmentState as (
            t: typeof THREE,
            r: THREE.Object3D,
            i: Record<string, unknown>,
            a?: Record<string, unknown>
          ) => void
        ).call(capturedRaw, THREE_NS, rootObject, instance, asset || {});
      } else if (typeof capturedRaw!.updateEquipmentState === 'function') {
        const st =
          instance && typeof instance.instanceState === 'object' && instance.instanceState
            ? (instance.instanceState as Record<string, unknown>)
            : instance;
        (
          capturedRaw!.updateEquipmentState as (
            r: THREE.Object3D,
            s: Record<string, unknown>,
            dt?: number
          ) => void
        ).call(capturedRaw, rootObject, st, 0.05);
      }
    });
  };

  const updateFn = (
    rootObject: THREE.Object3D,
    state: Record<string, unknown>,
    dt?: number
  ) => {
    withIsolatedGlobal(() => {
      if (typeof capturedRaw!.updateEquipmentState === 'function') {
        (
          capturedRaw!.updateEquipmentState as (
            r: THREE.Object3D,
            s: Record<string, unknown>,
            d?: number
          ) => void
        ).call(capturedRaw, rootObject, state, dt ?? 0.016);
      } else if (typeof capturedRaw!.applyEquipmentState === 'function') {
        (
          capturedRaw!.applyEquipmentState as (
            t: typeof THREE,
            r: THREE.Object3D,
            i: Record<string, unknown>,
            a?: Record<string, unknown>
          ) => void
        ).call(capturedRaw, THREE, rootObject, { instanceState: state }, {});
      }
    });
  };

  const soundFn = (eventType: string, value?: unknown) => {
    withIsolatedGlobal(() => {
      if (typeof capturedRaw!.playEquipmentSound === 'function') {
        try {
          (
            capturedRaw!.playEquipmentSound as (e: string, v?: unknown) => void
          ).call(capturedRaw, eventType, value);
        } catch {
          // Bỏ qua lỗi audio
        }
      }
    });
  };

  return {
    runtime: {
      buildEquipmentGroup: buildFn,
      buildEquipmentMesh: buildFn,
      applyEquipmentState: applyFn,
      updateEquipmentState: updateFn,
      playEquipmentSound: soundFn,
    },
  };
}

/**
 * Phân tích & Chẩn đoán 4 khối chuẩn của file .HTML theo đúng chuẩn OpenLab 3D
 */
export function parseAndValidateHtmlModule(
  htmlContent: string,
  fallbackFilename = 'thiet-bi-3d.html'
): ValidatedHtmlEquipmentModule {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const checks: DiagnosticCheckItem[] = [];
  let manifestRaw: Record<string, unknown> = {};
  let assetId = 'OL3D-EQP-CUSTOM-01';
  let slug = fallbackFilename.replace(/\.html?$/i, '').toLowerCase();
  let nameVi = 'Thiết bị 3D tùy chỉnh';
  let nameEn = 'Custom 3D Equipment';
  let category = 'Thiết bị bổ sung (.HTML)';
  let summaryVi = 'Mô-đun thiết bị 3D được nạp từ file .HTML độc lập.';
  let dimensionsM: [number, number, number] = [0.12, 0.12, 0.12];
  let massG = 200;
  let controls: ParsedModuleControls = {
    stateKey: 'multimeterValue',
    labelVi: 'Giá trị điều khiển thiết bị',
    unit: '',
    min: 0,
    max: 10,
    step: 0.5,
    defaultValue: 5,
    presets: [
      { label: 'Mức Tối Thiểu (0)', value: 0 },
      { label: 'Mức Trung Bình (5)', value: 5 },
      { label: 'Mức Tối Đa (10)', value: 10 },
    ],
  };

  // 1. KIỂM TRA KHỐI 1: #ol3d-module-manifest
  const manifestEl = doc.getElementById('ol3d-module-manifest');
  if (!manifestEl || !manifestEl.textContent?.trim()) {
    checks.push({
      id: 'manifest',
      title: '1. Khối thông số JSON Manifest',
      badgeCode: '#ol3d-module-manifest',
      status: 'error',
      message: 'Không tìm thấy thẻ <script id="ol3d-module-manifest" type="application/json">.',
      fixHint:
        'Thêm khối <script id="ol3d-module-manifest" type="application/json"> chứa đối tượng asset, geometry.boundingBoxM và moduleControls.',
    });
  } else {
    try {
      manifestRaw = JSON.parse(manifestEl.textContent.trim()) as Record<string, unknown>;
      const assetObj = (manifestRaw.asset || {}) as Record<string, unknown>;
      const nameObj = (assetObj.name || {}) as Record<string, unknown>;
      const geomObj = (assetObj.geometry || {}) as Record<string, unknown>;
      const bboxObj = (geomObj.boundingBoxM || {}) as Record<string, unknown>;
      const sciObj = (assetObj.scientificProperties || {}) as Record<string, unknown>;
      const refMass = (sciObj.referenceMass || {}) as Record<string, unknown>;

      const hasAssetId = Boolean(assetObj.assetId || assetObj.id);
      const hasNameVi = Boolean(
        (typeof nameObj.vi === 'string' && nameObj.vi.trim()) ||
          (typeof assetObj.nameVi === 'string' && assetObj.nameVi.trim())
      );
      const hasBbox =
        typeof bboxObj.width === 'number' &&
        typeof bboxObj.height === 'number' &&
        typeof bboxObj.depth === 'number';

      assetId = String(assetObj.assetId || assetObj.id || assetId);
      slug = String(assetObj.slug || slug);
      nameVi = String(nameObj.vi || assetObj.nameVi || nameObj.en || assetId);
      nameEn = String(nameObj.en || assetObj.nameEn || nameVi);
      category = String(assetObj.category || category);

      if (typeof assetObj.summary === 'string') {
        summaryVi = assetObj.summary;
      } else if (assetObj.summary && typeof (assetObj.summary as Record<string, unknown>).vi === 'string') {
        summaryVi = String((assetObj.summary as Record<string, unknown>).vi);
      }

      if (hasBbox) {
        dimensionsM = [
          Math.max(0.03, Number(bboxObj.width) || 0.12),
          Math.max(0.02, Number(bboxObj.height) || 0.12),
          Math.max(0.03, Number(bboxObj.depth) || 0.12),
        ];
      }
      if (typeof refMass.value === 'number') {
        massG = refMass.value;
      }

      const ctrlRaw = (manifestRaw.moduleControls || {}) as Record<string, unknown>;
      if (Object.keys(ctrlRaw).length > 0) {
        const lblObj = ctrlRaw.label;
        const parsedLabel =
          typeof lblObj === 'string'
            ? lblObj
            : lblObj && typeof (lblObj as Record<string, unknown>).vi === 'string'
            ? String((lblObj as Record<string, unknown>).vi)
            : String(ctrlRaw.labelVi || 'Giá trị điều khiển');
        const minVal = typeof ctrlRaw.min === 'number' ? ctrlRaw.min : 0;
        const maxVal = typeof ctrlRaw.max === 'number' ? ctrlRaw.max : 10;
        const stepVal = typeof ctrlRaw.step === 'number' ? ctrlRaw.step : 0.5;
        const defVal =
          typeof ctrlRaw.defaultValue === 'number' ? ctrlRaw.defaultValue : (minVal + maxVal) / 2;
        const rawPresets = Array.isArray(ctrlRaw.presets) ? ctrlRaw.presets : [];
        const parsedPresets = rawPresets
          .map((p: Record<string, unknown>) => {
            const patch = (p.statePatch || {}) as Record<string, unknown>;
            const val =
              typeof p.value === 'number'
                ? p.value
                : typeof patch.multimeterValue === 'number'
                ? patch.multimeterValue
                : defVal;
            return {
              label: String(p.label || `${val}`),
              value: Number(val),
            };
          })
          .filter((p) => !Number.isNaN(p.value));

        controls = {
          stateKey: String(ctrlRaw.stateKey || 'multimeterValue'),
          labelVi: parsedLabel,
          unit: String(ctrlRaw.unit || ''),
          min: minVal,
          max: maxVal,
          step: stepVal,
          defaultValue: defVal,
          presets:
            parsedPresets.length > 0
              ? parsedPresets
              : [
                  { label: `Mức ${minVal} ${ctrlRaw.unit || ''}`.trim(), value: minVal },
                  { label: `Mức chuẩn ${defVal} ${ctrlRaw.unit || ''}`.trim(), value: defVal },
                  { label: `Mức ${maxVal} ${ctrlRaw.unit || ''}`.trim(), value: maxVal },
                ],
        };
      }

      const missingRecommended: string[] = [];
      if (!hasAssetId) missingRecommended.push('asset.assetId');
      if (!hasNameVi) missingRecommended.push('asset.name.vi');
      if (!hasBbox) missingRecommended.push('geometry.boundingBoxM');

      if (missingRecommended.length > 0) {
        checks.push({
          id: 'manifest',
          title: '1. Khối thông số JSON Manifest',
          badgeCode: '#ol3d-module-manifest',
          status: 'warn',
          message: `Cú pháp JSON hợp lệ nhưng thiếu trường khuyến nghị: ${missingRecommended.join(', ')}.`,
          fixHint:
            'Bổ sung đầy đủ assetId (VD: "OL3D-EQP-..."), name.vi và geometry.boundingBoxM để hiển thị đúng tên và kích thước.',
        });
      } else {
        checks.push({
          id: 'manifest',
          title: '1. Khối thông số JSON Manifest',
          badgeCode: '#ol3d-module-manifest',
          status: 'ok',
          message: `Hợp lệ: ${nameVi} (${assetId}) — Kích thước ${(dimensionsM[0] * 1000).toFixed(0)}×${(dimensionsM[2] * 1000).toFixed(0)}×${(dimensionsM[1] * 1000).toFixed(0)} mm.`,
        });
      }
    } catch (err) {
      checks.push({
        id: 'manifest',
        title: '1. Khối thông số JSON Manifest',
        badgeCode: '#ol3d-module-manifest',
        status: 'error',
        message: `Lỗi cú pháp JSON: ${err instanceof Error ? err.message : String(err)}`,
        fixHint: 'Kiểm tra dấu phẩy cuối mảng/object và đảm bảo chuỗi JSON hợp lệ.',
      });
    }
  }

  // 2. KIỂM TRA KHỐI 2 & 3: #ol3d-module-icon & #ol3d-module-real-photo
  const iconEl = doc.getElementById('ol3d-module-icon');
  const photoEl = doc.getElementById('ol3d-module-real-photo');
  const iconSvg = iconEl ? iconEl.innerHTML.trim() : '';
  const realPhotoHtml = photoEl ? photoEl.innerHTML.trim() : '';

  if (iconSvg && realPhotoHtml) {
    checks.push({
      id: 'icon_photo',
      title: '2. Khối Icon 2D & Hình đối chiếu',
      badgeCode: '#ol3d-module-icon & #ol3d-module-real-photo',
      status: 'ok',
      message: 'Đầy đủ biểu tượng SVG 2D và hình đối chiếu thực tế.',
    });
  } else {
    checks.push({
      id: 'icon_photo',
      title: '2. Khối Icon 2D & Hình đối chiếu',
      badgeCode: '#ol3d-module-icon & #ol3d-module-real-photo',
      status: 'warn',
      message: `Thiếu ${!iconSvg ? '#ol3d-module-icon' : ''} ${!realPhotoHtml ? '#ol3d-module-real-photo' : ''}. Hệ thống sẽ tự tạo biểu tượng mặc định.`,
      fixHint:
        'Thêm <template id="ol3d-module-icon"><svg>...</svg></template> và <template id="ol3d-module-real-photo"><svg>...</svg></template>.',
    });
  }

  // 3. KIỂM TRA KHỐI 4: #ol3d-module-3d-script
  const scriptEl = doc.getElementById('ol3d-module-3d-script');
  const scriptCode = scriptEl ? scriptEl.textContent || '' : '';
  const { runtime, error: compileErr } = compileIsolatedModuleRuntime(scriptCode);

  if (!runtime) {
    checks.push({
      id: 'script_compile',
      title: '3. Khối Script 3D Three.js',
      badgeCode: 'window.OL3D_EQUIPMENT_MODULE',
      status: 'error',
      message: `Lỗi biên dịch Script 3D: ${compileErr || 'Không tìm thấy #ol3d-module-3d-script'}`,
      fixHint:
        'Đảm bảo <script id="ol3d-module-3d-script"> khai báo window.OL3D_EQUIPMENT_MODULE có hàm buildEquipmentGroup(THREE, asset) hoặc buildEquipmentMesh(THREE, asset).',
    });
    checks.push({
      id: 'mesh_3d',
      title: '4. Kiểm tra Dựng hình 3D & Tỷ lệ mặt bàn',
      badgeCode: 'buildEquipmentMesh(THREE, asset)',
      status: 'error',
      message: 'Chưa thể kiểm tra dựng hình 3D do Khối 3 bị lỗi.',
      fixHint: 'Sửa lỗi ở Khối 3 trước để thực thi hàm tạo mô hình 3D.',
    });

    return {
      isValid: false,
      errorCount: checks.filter((c) => c.status === 'error').length,
      warnCount: checks.filter((c) => c.status === 'warn').length,
      checks,
      assetId,
      slug,
      nameVi,
      nameEn,
      category,
      summaryVi,
      dimensionsM,
      massG,
      controls,
      iconSvg,
      realPhotoHtml,
      manifestRaw,
      scriptCode,
      meshCount: 0,
      detectedTerminals: [],
      runtime: null,
    };
  }

  checks.push({
    id: 'script_compile',
    title: '3. Khối Script 3D Three.js',
    badgeCode: 'window.OL3D_EQUIPMENT_MODULE',
    status: 'ok',
    message: 'Biên dịch JavaScript 3D thành công, đầy đủ hàm tạo mô hình và cập nhật trạng thái.',
  });

  // 4. KIỂM TRA DỰNG HÌNH 3D THỰC TẾ VỚI THREE.JS
  let meshCount = 0;
  const detectedTerminals: string[] = [];

  try {
    const assetArg = (manifestRaw.asset || { slug }) as Record<string, unknown>;
    const testGroup = runtime.buildEquipmentMesh(THREE, assetArg);

    if (!testGroup || !(testGroup instanceof THREE.Object3D)) {
      checks.push({
        id: 'mesh_3d',
        title: '4. Kiểm tra Dựng hình 3D & Tỷ lệ mặt bàn',
        badgeCode: 'buildEquipmentMesh(THREE, asset)',
        status: 'error',
        message: 'Hàm buildEquipmentMesh không trả về đối tượng THREE.Group / THREE.Object3D hợp lệ.',
        fixHint: 'Hàm buildEquipmentMesh phải trả về đối tượng new THREE.Group() có ít nhất 1 THREE.Mesh hợp lệ.',
      });
    } else {
      testGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          meshCount++;
        }
        if (
          typeof child.name === 'string' &&
          (child.name.startsWith('terminal_') || child.name.startsWith('term_'))
        ) {
          const code = child.name.replace(/^(terminal_|term_)/, '');
          if (code && !detectedTerminals.includes(code)) {
            detectedTerminals.push(code);
          }
        }
      });

      // Thử gọi applyEquipmentState để đảm bảo không văng lỗi runtime
      runtime.applyEquipmentState(
        THREE,
        testGroup,
        { instanceState: { [controls.stateKey]: controls.defaultValue, multimeterValue: controls.defaultValue } },
        assetArg
      );

      if (meshCount === 0) {
        checks.push({
          id: 'mesh_3d',
          title: '4. Kiểm tra Dựng hình 3D & Tỷ lệ mặt bàn',
          badgeCode: 'buildEquipmentMesh(THREE, asset)',
          status: 'error',
          message: 'Đối tượng THREE.Group trả về không chứa bất kỳ THREE.Mesh nào (0 mesh).',
          fixHint: 'Thêm ít nhất 1 THREE.Mesh (ví dụ thân thiết bị body, scale_display, plunger) vào group trước khi return.',
        });
      } else {
        const box = new THREE.Box3().setFromObject(testGroup);
        const size = new THREE.Vector3();
        box.getSize(size);
        if (
          size.x > 0.01 &&
          size.y > 0.01 &&
          size.z > 0.01 &&
          size.x < 1.5 &&
          size.y < 1.5 &&
          size.z < 1.5
        ) {
          dimensionsM = [
            Number(size.x.toFixed(3)),
            Number(size.y.toFixed(3)),
            Number(size.z.toFixed(3)),
          ];
        }
        checks.push({
          id: 'mesh_3d',
          title: '4. Kiểm tra Dựng hình 3D & Tỷ lệ mặt bàn',
          badgeCode: 'buildEquipmentMesh(THREE, asset)',
          status: 'ok',
          message: `Dựng hình 3D thành công: ${meshCount} Mesh 3D, kích thước bao ${(dimensionsM[0] * 1000).toFixed(0)}×${(dimensionsM[2] * 1000).toFixed(0)}×${(dimensionsM[1] * 1000).toFixed(0)} mm${
            detectedTerminals.length > 0
              ? ` • Phát hiện ${detectedTerminals.length} cọc đấu dây (${detectedTerminals.join(', ')})`
              : ' • Có thể tự gắn thêm 2 cọc đấu dây (+/-) trên bàn'
          }.`,
        });
      }
    }
  } catch (err) {
    checks.push({
      id: 'mesh_3d',
      title: '4. Kiểm tra Dựng hình 3D & Tỷ lệ mặt bàn',
      badgeCode: 'buildEquipmentMesh(THREE, asset)',
      status: 'error',
      message: `Lỗi tích hợp: ${err instanceof Error ? err.message : String(err)}`,
      fixHint:
        'Hàm buildEquipmentMesh phải trả về đối tượng new THREE.Group() có ít nhất 1 THREE.Mesh hợp lệ và không gọi biến this chưa gán ngữ cảnh.',
    });
  }

  const errorCount = checks.filter((c) => c.status === 'error').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;

  return {
    isValid: errorCount === 0 && meshCount > 0,
    errorCount,
    warnCount,
    checks,
    assetId,
    slug,
    nameVi,
    nameEn,
    category,
    summaryVi,
    dimensionsM,
    massG,
    controls,
    iconSvg,
    realPhotoHtml,
    manifestRaw,
    scriptCode,
    meshCount,
    detectedTerminals,
    runtime,
  };
}

/**
 * Đọc danh sách các thiết bị .HTML đã lưu trong bộ lưu trữ trình duyệt (localStorage)
 */
export function loadStoredHtmlModules(): StoredHtmlEquipmentModule[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Lưu hoặc cập nhật một thiết bị .HTML vào bộ lưu trữ và trả về danh sách mới
 */
export function saveStoredHtmlModule(
  item: StoredHtmlEquipmentModule
): StoredHtmlEquipmentModule[] {
  const current = loadStoredHtmlModules();
  const existingIdx = current.findIndex(
    (m) => m.id === item.id || m.assetId === item.assetId || m.slug === item.slug
  );
  let next: StoredHtmlEquipmentModule[];
  if (existingIdx >= 0) {
    next = [...current];
    next[existingIdx] = {
      ...item,
      id: current[existingIdx].id,
      importedAt: Date.now(),
    };
  } else {
    next = [...current, item];
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota errors
  }
  return next;
}

/**
 * Xóa một thiết bị .HTML khỏi bộ lưu trữ
 */
export function removeStoredHtmlModule(id: string): StoredHtmlEquipmentModule[] {
  const current = loadStoredHtmlModules();
  const next = current.filter((m) => m.id !== id);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore
  }
  return next;
}

/**
 * Tạo File Mẫu Chuẩn (.HTML) có đầy đủ 4 khối, màn hình LCD 360°, con chạy/núm xoay plunger,
 * 2 cọc cắm dây bắp chuối (terminal_*) và âm thanh phản hồi để người dùng tải về hoặc nạp thử ngay.
 */
export function generateSampleTemplateHtml(): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OL3D HTML Module Mẫu — Máy Đo Điện Đa Năng Hiện Số 3D (OL3D-EQP-DMM-SAMPLE-01)</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; }
    .header { padding: 14px 24px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .badge { background: #0284c7; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
    .grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; padding: 20px; max-width: 1280px; margin: 0 auto; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; }
    #preview3d { width: 100%; height: 420px; border-radius: 10px; overflow: hidden; background: radial-gradient(circle at center, #1e293b, #090d16); }
    .btn { padding: 6px 12px; border-radius: 6px; border: 1px solid #475569; background: #334155; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }
    .btn:hover { background: #475569; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <span class="badge">OL3D-HTML-MODULE v2.1</span>
      <strong style="margin-left: 10px; font-size: 18px;">File Mẫu Chuẩn: Đồng Hồ Vạn Năng Hiện Số 3D (OL3D-EQP-DMM-SAMPLE-01)</strong>
    </div>
    <div style="font-size: 13px; color: #94a3b8;">Đầy đủ 4 khối: Manifest JSON + Icon 2D + Ảnh đối chiếu + Script 3D Three.js có 2 cọc cắm dây</div>
  </div>

  <!-- =========================================================================
       KHỐI 1 (BẮT BUỘC): HỒ SƠ THÔNG SỐ VẬT LÝ & ĐIỀU KHIỂN (#ol3d-module-manifest)
       ========================================================================= -->
  <script id="ol3d-module-manifest" type="application/json">
  {
    "moduleSpecVersion": "OL3D-HTML-MODULE-v2.1",
    "schemaVersion": "OL3D-HTML-MODULE-v2.4",
    "asset": {
      "assetId": "OL3D-EQP-DMM-SAMPLE-01",
      "slug": "dong-ho-van-nang-hien-so-3d",
      "name": {
        "vi": "Đồng Hồ Vạn Năng Hiện Số 3D (Mẫu Chuẩn OpenLab)",
        "en": "3D Digital Multimeter & Voltage Sensor"
      },
      "kind": "equipment",
      "subject": "physics",
      "category": "measurement-instrument",
      "categoryIds": ["physics", "electrical-equipment"],
      "tags": ["dong-ho-van-nang", "von-ke-so", "ampe-ke-so", "file-mau-html"],
      "summary": "Đồng hồ đo điện đa năng hiện số LCD 360° kèm núm xoay chọn thang đo (plunger) và 2 cọc cắm dây bắp chuối Đỏ (+) / Đen (-), dùng làm file mẫu chuẩn để nạp vào bàn thí nghiệm 3D.",
      "textbookRef": {
        "bookTitle": "SGK Khoa học Tự nhiên 8, 9 & Vật lý 11",
        "chapter": "Chương Điện học — Đo cường độ dòng điện, hiệu điện thế và điện trở",
        "lesson": "Thực hành đo các đại lượng điện bằng đồng hồ hiện số",
        "figureRef": "Thiết bị đo điện hiện số chuẩn Thông tư 38/2021/TT-BGDĐT",
        "standardFunction": "Hiển thị trực tiếp giá trị điện áp DC (0.00V – 20.00V), dòng điện (A) hoặc điện trở (Ω) trên màn hình LCD kỹ thuật số.",
        "usageGuidelines": "Cắm dây bắp chuối Đỏ vào cọc V/Ω/A (+), dây Xanh/Đen vào cọc COM (-), xoay núm chọn thang đo hoặc kéo thanh trượt để kiểm tra.",
        "safetyNote": "Chọn đúng thang đo trước khi đóng khóa K của mạch điện."
      },
      "geometry": {
        "modelFormat": "PROCEDURAL_PBR",
        "modelUri": "procedural://digital-multimeter-sample",
        "proceduralArchetype": "digital-multimeter",
        "upAxis": "Y",
        "anchor": "base-center",
        "boundingBoxM": { "width": 0.11, "height": 0.145, "depth": 0.085 },
        "dimensions": {
          "widthOrDiameter": { "value": 110, "unit": "mm", "status": "verified" },
          "height": { "value": 145, "unit": "mm", "status": "verified" },
          "depth": { "value": 85, "unit": "mm", "status": "verified" }
        },
        "triangleCount": 1680,
        "materialCount": 8,
        "namedNodes": [
          { "nodeName": "body", "role": "body", "description": "Thân đồng hồ vạn năng bọc vỏ cao su bảo vệ màu vàng cam" },
          { "nodeName": "scale_display", "role": "scale_display", "description": "Màn hình LCD kỹ thuật số hiển thị số đo 360°" },
          { "nodeName": "plunger", "role": "plunger", "description": "Núm xoay chọn thang đo ở giữa thân máy" }
        ],
        "scaleValidation": "verified"
      },
      "scientificProperties": {
        "referenceMass": { "value": 240.0, "unit": "g", "status": "verified" },
        "referenceVolume": { "value": 110.0, "unit": "cm³", "status": "verified" }
      }
    },
    "moduleControls": {
      "stateKey": "multimeterValue",
      "label": "Giá trị điện áp đo trên LCD",
      "unit": "V",
      "min": 0.0,
      "max": 12.0,
      "step": 0.1,
      "defaultValue": 3.0,
      "canBeWeighedOnBalance": true,
      "presets": [
        { "label": "Chưa có điện (0.00 V)", "value": 0.0, "statePatch": { "multimeterValue": 0.0 } },
        { "label": "Nguồn 1 Pin (1.50 V)", "value": 1.5, "statePatch": { "multimeterValue": 1.5 } },
        { "label": "Nguồn 2 Pin nối tiếp (3.00 V)", "value": 3.0, "statePatch": { "multimeterValue": 3.0 } },
        { "label": "Nguồn Ắc quy (12.00 V)", "value": 12.0, "statePatch": { "multimeterValue": 12.0 } }
      ]
    },
    "realPhotoMeta": {
      "caption": "Hình đối chiếu thực tế: Đồng hồ vạn năng hiện số phòng thí nghiệm kèm màn hình LCD, núm xoay thang đo và 2 cọc cắm bắp chuối.",
      "manufacturerRef": "Thiết bị Giáo dục Việt Nam — Chuẩn Thông tư 38/2021/TT-BGDĐT",
      "realWorldScaleNote": "Rộng 110 mm × Sâu 85 mm × Cao 145 mm",
      "annotations": [
        { "xPercent": 50, "yPercent": 28, "label": "1. Màn hình LCD hiển thị số đo 360°" },
        { "xPercent": 50, "yPercent": 56, "label": "2. Núm xoay chọn thang đo (plunger)" },
        { "xPercent": 50, "yPercent": 80, "label": "3. Cọc âm COM (Đen) và Cọc dương V/Ω/A (Đỏ)" }
      ]
    },
    "dossier": {
      "assetId": "OL3D-EQP-DMM-SAMPLE-01",
      "technicalStandard": "IEC 61010-1 · Thông tư 38/2021/TT-BGDĐT",
      "exactDimensionsSpec": "110 × 85 × 145 mm",
      "weightOrCapacitySpec": "Khối lượng: 240 g · Dải đo: 0 – 20 V DC",
      "synthesizedFeatures": [
        "Màn hình LCD kỹ thuật số hiển thị rõ nét ở cả mặt trước và mặt sau 360°.",
        "Núm xoay chọn thang đo (plunger) quay tự động theo giá trị thanh trượt.",
        "Tích hợp sẵn 2 cọc cắm dây bắp chuối chuẩn 4mm để nối dây trực tiếp trên bàn thí nghiệm 3D."
      ],
      "fiveWebSources": [
        { "siteName": "Bộ Giáo dục và Đào tạo — Thông tư 38/2021/TT-BGDĐT", "domain": "moet.gov.vn", "verifiedSpecSummary": "Đồng hồ đo điện đa năng hiện số dùng trong môn Khoa học tự nhiên và Vật lý." },
        { "siteName": "Chuẩn kỹ thuật OpenLab 3D HTML Module", "domain": "openlab3d.edu.vn", "verifiedSpecSummary": "Cấu trúc 4 khối dữ liệu bắt buộc cho mô-đun thiết bị 3D độc lập." }
      ]
    }
  }
  </script>

  <!-- =========================================================================
       KHỐI 2 (BẮT BUỘC): BIỂU TƯỢNG VECTOR 2D 80x80 (#ol3d-module-icon)
       ========================================================================= -->
  <template id="ol3d-module-icon">
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="8" width="48" height="64" rx="8" fill="#F59E0B" stroke="#B45309" stroke-width="2" />
      <rect x="20" y="12" width="40" height="56" rx="5" fill="#1E293B" />
      <rect x="24" y="16" width="32" height="16" rx="3" fill="#CCFBF1" stroke="#14B8A6" stroke-width="1.5" />
      <text x="40" y="27" text-anchor="middle" fill="#042F2E" font-family="monospace" font-weight="bold" font-size="9">3.00 V</text>
      <circle cx="40" cy="44" r="9" fill="#334155" stroke="#94A3B8" stroke-width="1.5" />
      <line x1="40" y1="44" x2="46" y2="38" stroke="#38BDF8" stroke-width="2.2" stroke-linecap="round" />
      <circle cx="31" cy="60" r="4" fill="#0F172A" stroke="#94A3B8" stroke-width="1.2" />
      <circle cx="49" cy="60" r="4" fill="#EF4444" stroke="#FCA5A5" stroke-width="1.2" />
    </svg>
  </template>

  <!-- =========================================================================
       KHỐI 3 (BẮT BUỘC): HÌNH ĐỐI CHIẾU THỰC TẾ 680x420 (#ol3d-module-real-photo)
       ========================================================================= -->
  <template id="ol3d-module-real-photo">
    <svg viewBox="0 0 680 420" width="680" height="420" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="680" height="420" rx="14" fill="#0F172A" />
      <rect x="220" y="36" width="240" height="330" rx="22" fill="#F59E0B" stroke="#D97706" stroke-width="4" />
      <rect x="234" y="50" width="212" height="302" rx="14" fill="#1E293B" />
      <rect x="254" y="70" width="172" height="76" rx="8" fill="#CCFBF1" stroke="#0D9488" stroke-width="3" />
      <text x="268" y="94" fill="#0F766E" font-family="monospace" font-size="13" font-weight="bold">DC VOLTMETER · AUTO</text>
      <text x="412" y="132" text-anchor="end" fill="#042F2E" font-family="monospace" font-size="34" font-weight="bold">3.00 V</text>
      <circle cx="340" cy="218" r="46" fill="#334155" stroke="#64748B" stroke-width="3" />
      <line x1="340" y1="218" x2="372" y2="190" stroke="#38BDF8" stroke-width="6" stroke-linecap="round" />
      <circle cx="295" cy="312" r="16" fill="#090D16" stroke="#94A3B8" stroke-width="3" />
      <text x="295" y="342" text-anchor="middle" fill="#CBD5E1" font-family="sans-serif" font-size="11" font-weight="bold">COM (-)</text>
      <circle cx="385" cy="312" r="16" fill="#EF4444" stroke="#FCA5A5" stroke-width="3" />
      <text x="385" y="342" text-anchor="middle" fill="#FCA5A5" font-family="sans-serif" font-size="11" font-weight="bold">V/Ω (+)</text>
    </svg>
  </template>

  <!-- =========================================================================
       KHỐI 4 (BẮT BUỘC): SCRIPT DỰNG HÌNH 3D THREE.JS (#ol3d-module-3d-script)
       ========================================================================= -->
  <script id="ol3d-module-3d-script">
    window.OL3D_EQUIPMENT_MODULE = {
      buildEquipmentGroup: function(THREE, asset) {
        var group = new THREE.Group();
        group.name = (asset && asset.slug ? asset.slug : 'dong-ho-van-nang-hien-so-3d') + '_root';

        var bootMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.42, metalness: 0.08 });
        var caseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.15 });
        var dialMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.25 });
        var brassMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.22, metalness: 0.88 });

        // 1. Đế & Vỏ bảo vệ màu vàng cam (tâm tại 0,0,0, mặt đáy tại y = 0)
        var bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.106, 0.138, 0.068), bootMat);
        bodyMesh.name = 'body';
        bodyMesh.position.set(0, 0.069, 0);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        group.add(bodyMesh);

        // Mặt máy màu xanh đen phía trước
        var frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.094, 0.126, 0.008), caseMat);
        frontPanel.position.set(0, 0.069, 0.032);
        group.add(frontPanel);

        // 2. Màn hình LCD kỹ thuật số (scale_display & scale_display_rear)
        function createLcdTexture(valText) {
          var canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 192;
          var ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#0f2922';
            ctx.fillRect(0, 0, 512, 192);
            ctx.fillStyle = '#ccfbf1';
            ctx.fillRect(10, 10, 492, 172);
            ctx.fillStyle = '#0f766e';
            ctx.font = 'bold 26px monospace';
            ctx.fillText('DIGITAL MULTIMETER · DC', 22, 46);
            ctx.fillStyle = '#042f2e';
            ctx.font = 'bold 84px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(valText || '3.00 V', 482, 144);
          }
          var tex = new THREE.CanvasTexture(canvas);
          tex.needsUpdate = true;
          return tex;
        }

        var lcdMat = new THREE.MeshStandardMaterial({
          map: createLcdTexture('3.00 V'),
          roughness: 0.18,
          emissive: new THREE.Color('#14b8a6'),
          emissiveIntensity: 0.22,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2
        });

        var scaleDisplay = new THREE.Mesh(new THREE.PlaneGeometry(0.078, 0.034), lcdMat);
        scaleDisplay.name = 'scale_display';
        scaleDisplay.position.set(0, 0.106, 0.0368);
        group.add(scaleDisplay);

        var scaleDisplayRear = new THREE.Mesh(new THREE.PlaneGeometry(0.078, 0.034), lcdMat);
        scaleDisplayRear.name = 'scale_display_rear';
        scaleDisplayRear.position.set(0, 0.106, -0.035);
        scaleDisplayRear.rotation.y = Math.PI;
        group.add(scaleDisplayRear);

        // 3. Núm xoay chọn thang đo ('plunger') ở giữa thân máy
        var knobGroup = new THREE.Group();
        knobGroup.name = 'plunger';
        knobGroup.position.set(0, 0.062, 0.036);
        group.add(knobGroup);

        var knobCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.023, 0.012, 28), dialMat);
        knobCyl.rotation.x = Math.PI / 2;
        knobGroup.add(knobCyl);

        var pointerBar = new THREE.Mesh(
          new THREE.BoxGeometry(0.005, 0.034, 0.006),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25 })
        );
        pointerBar.position.set(0, 0.005, 0.006);
        knobGroup.add(pointerBar);

        // 4. Hai cọc cắm dây bắp chuối 4mm (terminal_DMM_NEG & terminal_DMM_POS)
        function createTerminalPost(termCode, xPos, colorHex) {
          var tGroup = new THREE.Group();
          tGroup.name = 'terminal_' + termCode;
          tGroup.position.set(xPos, 0.022, 0.038);
          tGroup.userData = { terminalId: termCode };

          var collar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0075, 0.0085, 0.014, 18),
            new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3 })
          );
          collar.rotation.x = Math.PI / 2;
          tGroup.add(collar);

          var socket = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0035, 0.0035, 0.016, 14),
            brassMat
          );
          socket.rotation.x = Math.PI / 2;
          tGroup.add(socket);

          return tGroup;
        }

        group.add(createTerminalPost('DMM_NEG', -0.024, 0x0f172a));
        group.add(createTerminalPost('DMM_POS', 0.024, 0xef4444));

        return group;
      },

      buildEquipmentMesh: function(THREE, asset) {
        return window.OL3D_EQUIPMENT_MODULE.buildEquipmentGroup(THREE, asset);
      },

      applyEquipmentState: function(THREE, rootObject, instance, asset) {
        var st = instance && instance.instanceState ? instance.instanceState : (instance || {});
        var val = typeof st.multimeterValue === 'number' ? st.multimeterValue : 3.0;
        var label = val.toFixed(2) + ' V';

        // Xoay núm plunger theo giá trị đo
        var plunger = rootObject.getObjectByName('plunger');
        if (plunger) {
          plunger.rotation.z = -0.6 + (val / 12.0) * 1.2;
        }

        // Cập nhật màn hình LCD trước & sau
        rootObject.traverse(function(child) {
          if (child.isMesh && typeof child.name === 'string' && child.name.indexOf('scale_display') === 0) {
            var mat = child.material;
            if (mat && mat.map && mat.map.image && mat.map.image.getContext) {
              var ctx = mat.map.image.getContext('2d');
              ctx.fillStyle = '#0f2922';
              ctx.fillRect(0, 0, 512, 192);
              ctx.fillStyle = '#ccfbf1';
              ctx.fillRect(10, 10, 492, 172);
              ctx.fillStyle = '#0f766e';
              ctx.font = 'bold 26px monospace';
              ctx.fillText('DIGITAL MULTIMETER · DC', 22, 46);
              ctx.fillStyle = '#042f2e';
              ctx.font = 'bold 84px monospace';
              ctx.textAlign = 'right';
              ctx.fillText(label, 482, 144);
              mat.map.needsUpdate = true;
            }
          }
        });
      },

      updateEquipmentState: function(rootObject, state, dt) {
        window.OL3D_EQUIPMENT_MODULE.applyEquipmentState(window.THREE, rootObject, { instanceState: state }, {});
      },

      playEquipmentSound: function(eventType, value) {
        try {
          var AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;
          if (!window.__ol3dAudioCtx) window.__ol3dAudioCtx = new AudioCtx();
          var ctx = window.__ol3dAudioCtx;
          if (ctx.state === 'suspended') ctx.resume();
          var now = ctx.currentTime;
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520 + (Number(value) || 0) * 35, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.065);
        } catch (e) {}
      }
    };
  </script>

  <!-- Giao diện tự kiểm tra khi mở file trực tiếp trên trình duyệt -->
  <div class="grid">
    <div class="card">
      <div id="preview3d"></div>
      <div style="margin-top: 12px; display: flex; align-items: center; gap: 10px;">
        <span>Thử giá trị đo (V):</span>
        <input id="slider" type="range" min="0" max="12" step="0.1" value="3.0" style="flex:1;" />
        <strong id="val-txt" style="color:#38bdf8;">3.00 V</strong>
      </div>
    </div>
    <div class="card">
      <h3 style="margin-top:0;">Hướng dẫn nạp file mẫu này vào Phòng Thí Nghiệm 3D</h3>
      <p style="font-size:13px;color:#cbd5e1;">Bấm nút <strong>"Nạp &amp; Lưu Trữ Thiết Bị (.HTML)"</strong> trên thanh công cụ của web, chọn file <code>.html</code> này để kiểm định 4 khối và đưa thẳng mô hình 3D lên bàn thí nghiệm gỗ 2.0m × 1.0m.</p>
    </div>
  </div>
  <script>
    (function() {
      var box = document.getElementById('preview3d');
      var scene = new THREE.Scene();
      var cam = new THREE.PerspectiveCamera(42, box.clientWidth / box.clientHeight, 0.01, 10);
      cam.position.set(0.18, 0.16, 0.24);
      cam.lookAt(0, 0.07, 0);
      var ren = new THREE.WebGLRenderer({ antialias: true });
      ren.setSize(box.clientWidth, box.clientHeight);
      box.appendChild(ren.domElement);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.0));
      var dl = new THREE.DirectionalLight(0xffffff, 1.2);
      dl.position.set(1, 2, 1.5);
      scene.add(dl);
      var grp = window.OL3D_EQUIPMENT_MODULE.buildEquipmentGroup(THREE, {});
      scene.add(grp);
      document.getElementById('slider').addEventListener('input', function(e) {
        var v = parseFloat(e.target.value);
        document.getElementById('val-txt').textContent = v.toFixed(2) + ' V';
        window.OL3D_EQUIPMENT_MODULE.applyEquipmentState(THREE, grp, { instanceState: { multimeterValue: v } }, {});
      });
      function loop() { requestAnimationFrame(loop); ren.render(scene, cam); }
      loop();
    })();
  </script>
</body>
</html>`;
}
