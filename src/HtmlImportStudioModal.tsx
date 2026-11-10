import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Trash2,
  Sparkles,
  FileCode2,
  BookOpen,
  Database,
  Play,
  X,
  Eye,
  Archive,
  Check,
  Copy,
} from 'lucide-react';
import {
  StoredHtmlEquipmentModule,
  ValidatedHtmlEquipmentModule,
  parseAndValidateHtmlModule,
  generateSampleTemplateHtml,
} from './htmlModuleImporter';
import {
  EXPORTABLE_MODULES,
  generateStandaloneEquipmentHtml,
} from './standaloneExporter';

interface HtmlImportStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  storedModules: StoredHtmlEquipmentModule[];
  onSaveModuleToWorkbench: (
    validated: ValidatedHtmlEquipmentModule,
    addBindingPosts: boolean,
    filename: string,
    rawHtml: string
  ) => void;
  onDeleteStoredModule: (id: string) => void;
  onFocusModuleOnTable: (id: string) => void;
  onToggleCabinetModule: (id: string) => void;
  inCabinetMap: Record<string, boolean>;
  customDeviceValues: Record<string, number>;
  onChangeCustomDeviceValue: (id: string, val: number) => void;
}

export const HtmlImportStudioModal: React.FC<HtmlImportStudioModalProps> = ({
  isOpen,
  onClose,
  storedModules,
  onSaveModuleToWorkbench,
  onDeleteStoredModule,
  onFocusModuleOnTable,
  onToggleCabinetModule,
  inCabinetMap,
  customDeviceValues,
  onChangeCustomDeviceValue,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'requirements' | 'storage'>('import');
  const [rawHtmlInput, setRawHtmlInput] = useState<string>(() => generateSampleTemplateHtml());
  const [currentFilename, setCurrentFilename] = useState<string>(
    'file-mau-dong-ho-van-nang-3d.html'
  );
  const [addBindingPosts, setAddBindingPosts] = useState<boolean>(true);
  const [validationResult, setValidationResult] = useState<ValidatedHtmlEquipmentModule | null>(
    null
  );
  const [previewValue, setPreviewValue] = useState<number>(3.0);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState<string | null>(null);
  const [copiedSample, setCopiedSample] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewMountRef = useRef<HTMLDivElement | null>(null);
  const previewGroupRef = useRef<THREE.Group | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Chạy chẩn đoán 4 khối mỗi khi nội dung HTML thay đổi
  useEffect(() => {
    if (!isOpen) return;
    if (!rawHtmlInput.trim()) {
      setValidationResult(null);
      return;
    }
    const res = parseAndValidateHtmlModule(rawHtmlInput, currentFilename);
    setValidationResult(res);
    setPreviewValue(res.controls.defaultValue);
  }, [rawHtmlInput, currentFilename, isOpen]);

  // Khởi tạo khung Xem Trước 3D tương tác (WebGL) bên trong Studio
  useEffect(() => {
    if (!isOpen || activeTab !== 'import') return;
    const container = previewMountRef.current;
    if (!container) return;

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1220);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 20);
    camera.position.set(0.24, 0.22, 0.34);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.5);
    dirLight.position.set(0.6, 1.2, 0.8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Mặt bàn gỗ mini đối chiếu tỷ lệ
    const tableDisk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.19, 0.012, 48),
      new THREE.MeshStandardMaterial({ color: 0x7c4d2b, roughness: 0.6, metalness: 0.05 })
    );
    tableDisk.position.y = -0.006;
    tableDisk.receiveShadow = true;
    scene.add(tableDisk);

    const grid = new THREE.GridHelper(0.32, 16, 0x38bdf8, 0x1e293b);
    grid.position.y = 0.0005;
    scene.add(grid);

    const holderGroup = new THREE.Group();
    scene.add(holderGroup);
    previewGroupRef.current = holderGroup;

    if (validationResult && validationResult.runtime) {
      try {
          const built = validationResult.runtime.buildEquipmentGroup(
          THREE,
          validationResult.manifestRaw
        );
        if (built && built.isObject3D) {
          built.traverse((ch) => {
            if ((ch as THREE.Mesh).isMesh) {
              ch.castShadow = true;
              ch.receiveShadow = true;
            }
          });
          holderGroup.add(built);

          const box = new THREE.Box3().setFromObject(built);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          const maxDim = Math.max(size.x, size.y, size.z, 0.08);
          camera.position.set(maxDim * 1.45, maxDim * 1.15, maxDim * 1.75);
          validationResult.runtime.applyEquipmentState(
            THREE,
            built,
            {
              [validationResult.controls.stateKey]: validationResult.controls.defaultValue,
              multimeterValue: validationResult.controls.defaultValue,
              phValue: validationResult.controls.defaultValue,
            },
            validationResult.manifestRaw
          );
        }
      } catch {
        // Đã báo lỗi ở khối chẩn đoán #4
      }
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.06, 0);
    controls.update();

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 420;
      const h = container.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      pmrem.dispose();
      renderer.dispose();
    };
  }, [isOpen, activeTab, validationResult]);

  // Cập nhật trạng thái mô hình 3D trong khung preview khi kéo thanh trượt
  const handlePreviewSliderChange = (nextVal: number) => {
    setPreviewValue(nextVal);
    if (!validationResult || !validationResult.runtime || !previewGroupRef.current) return;
    const modelGroup = previewGroupRef.current.children[0] as THREE.Group | undefined;
    if (!modelGroup) return;

    try {
      validationResult.runtime.applyEquipmentState(
        THREE,
        modelGroup,
        {
          [validationResult.controls.stateKey]: nextVal,
          multimeterValue: nextVal,
          phValue: nextVal,
        },
        validationResult.manifestRaw
      );

      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      validationResult.runtime.playEquipmentSound('slider', nextVal);
    } catch {
      // Ignore runtime audio/state error in preview
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCurrentFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      setRawHtmlInput(content);
      setSaveSuccessBanner(null);
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleDownloadSampleHtml = () => {
    const html = generateSampleTemplateHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'file-mau-thiet-bi-chuan-openlab3d.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadSampleTemplate = () => {
    setCurrentFilename('file-mau-dong-ho-van-nang-3d.html');
    setRawHtmlInput(generateSampleTemplateHtml());
    setSaveSuccessBanner(null);
  };

  const handleLoadBuiltInExportable = (slug: string) => {
    const spec = EXPORTABLE_MODULES.find((m) => m.slug === slug);
    if (!spec) return;
    setCurrentFilename(spec.filename);
    setRawHtmlInput(generateStandaloneEquipmentHtml(spec));
    setSaveSuccessBanner(null);
  };

  const handleSaveAndDeploy = () => {
    if (!validationResult || !validationResult.isValid) return;
    onSaveModuleToWorkbench(
      validationResult,
      addBindingPosts,
      currentFilename,
      rawHtmlInput
    );
    setSaveSuccessBanner(
      `Đã lưu "${validationResult.nameVi}" vào Bộ lưu trữ trình duyệt và đặt trực tiếp lên Bàn thí nghiệm 3D!`
    );
  };

  const handleCopySampleCode = async () => {
    const sample = generateSampleTemplateHtml();
    try {
      await navigator.clipboard.writeText(sample);
      setCopiedSample(true);
      window.setTimeout(() => setCopiedSample(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-[#0F172A] border border-sky-500/50 rounded-xl max-w-6xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">
                  TRẠM NẠP, CHẨN ĐOÁN 4 KHỐI & LƯU TRỮ THIẾT BỊ 3D (.HTML) — CHUẨN OPENLAB 3D
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                  Đồng bộ Bàn Gỗ 2.0m × 1.0m
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tải file <code className="text-amber-300 font-mono">.html</code> lên hoặc dán code để kiểm tra tự động 4 khối, xem trước 3D, lưu vào bộ nhớ và đưa thẳng thiết bị lên bàn thí nghiệm với đầy đủ chức năng như thật.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadSampleHtml}
              className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
              title="Tải file .HTML mẫu chuẩn về máy để làm khung tạo thiết bị mới"
            >
              <Download className="w-3.5 h-3.5" />
              Tải File Mẫu Chuẩn (.HTML)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('import')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                activeTab === 'import'
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              1. Nạp File .HTML & Chẩn Đoán 4 Khối
            </button>

            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                activeTab === 'requirements'
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              2. Yêu Cầu Kỹ Thuật Của File .HTML Để Hiển Thị & Chạy Thật
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                activeTab === 'storage'
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              3. Kho Lưu Trữ Thiết Bị Đã Nạp ({storedModules.length})
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden md:block">
            Thiết bị sau khi nạp có thể kéo thả, xoay 2 trục, rơi trọng lực, điều chỉnh thông số & cắm dây trên bàn 3D!
          </div>
        </div>

        {/* TAB 1: NẠP FILE .HTML, CHẨN ĐOÁN 4 KHỐI & XEM TRƯỚC SẢN PHẨM */}
        {activeTab === 'import' && (
          <div className="flex-1 min-h-0 grid grid-cols-12 divide-x divide-slate-800 overflow-hidden">
            {/* CỘT TRÁI (5 CỘT): NẠP FILE / DÁN CODE / CHỌN MẪU + XEM TRƯỚC 3D */}
            <div className="col-span-5 flex flex-col min-h-0 bg-slate-950/40 p-4 space-y-3 overflow-y-auto">
              {/* Khu vực chọn file .HTML hoặc nạp mẫu */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    Bước 1: Chọn File .HTML Hoặc Nạp File Mẫu
                  </span>
                  <span className="text-[11px] font-mono text-amber-300 truncate max-w-[180px]">
                    {currentFilename}
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Tải File .HTML Từ Máy
                  </button>

                  <button
                    onClick={handleLoadSampleTemplate}
                    className="px-3 py-2 rounded-md bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow cursor-pointer"
                    title="Nạp ngay file mẫu Đồng Hồ Vạn Năng Hiện Số 3D đạt chuẩn 4/4 khối"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Nạp Thử File Mẫu Chuẩn
                  </button>
                </div>

                {/* Chọn nhanh từ 9 thiết bị có sẵn để kiểm thử */}
                <div className="pt-1">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    Hoặc nạp thử bất kỳ file .HTML nào từ bộ 9 thiết bị mạch điện:
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleLoadBuiltInExportable(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="" disabled>
                      -- Chọn thiết bị mẫu để kiểm tra 4 khối --
                    </option>
                    {EXPORTABLE_MODULES.map((m) => (
                      <option key={m.slug} value={m.slug}>
                        {m.name} ({m.filename})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Khung Xem Trước 3D Tương Tác */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    Mô Hình 3D Xem Trước & Thử Chức Năng
                  </span>
                  {validationResult && (
                    <span className="text-[10px] font-mono text-sky-300">
                      {validationResult.meshCount} Mesh •{' '}
                      {(validationResult.dimensionsM[0] * 1000).toFixed(0)}×
                      {(validationResult.dimensionsM[2] * 1000).toFixed(0)}×
                      {(validationResult.dimensionsM[1] * 1000).toFixed(0)} mm
                    </span>
                  )}
                </div>

                <div
                  ref={previewMountRef}
                  className="w-full h-56 rounded-md overflow-hidden border border-slate-800 bg-[#0b1220] relative"
                />

                {/* Thanh trượt điều khiển thử nghiệm ngay trong khung Preview */}
                {validationResult && validationResult.isValid && (
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">
                        {validationResult.controls.labelVi}:
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        {previewValue} {validationResult.controls.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={validationResult.controls.min}
                      max={validationResult.controls.max}
                      step={validationResult.controls.step}
                      value={previewValue}
                      onChange={(e) => handlePreviewSliderChange(parseFloat(e.target.value))}
                      className="w-full h-1.5 accent-sky-400 cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-1">
                      {validationResult.controls.presets.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => handlePreviewSliderChange(p.value)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200 cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ô nhập / chỉnh sửa trực tiếp mã HTML */}
              <div className="flex-1 flex flex-col min-h-[150px] p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">
                    Mã nguồn file .HTML (Có thể dán hoặc sửa trực tiếp tại đây):
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {(rawHtmlInput.length / 1024).toFixed(1)} KB
                  </span>
                </div>
                <textarea
                  value={rawHtmlInput}
                  onChange={(e) => {
                    setRawHtmlInput(e.target.value);
                    setSaveSuccessBanner(null);
                  }}
                  placeholder="Dán toàn bộ nội dung file .HTML chuẩn OpenLab 3D vào đây..."
                  className="flex-1 w-full p-2.5 rounded bg-[#070B14] border border-slate-800 text-[11px] font-mono text-emerald-300 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>
            </div>

            {/* CỘT PHẢI (7 CỘT): BẢNG CHẨN ĐOÁN LỖI 4 KHỐI (GIỐNG OPENLAB3D-NGAN.VERCEL.APP) & NÚT LƯU LÊN BÀN */}
            <div className="col-span-7 flex flex-col min-h-0 bg-[#0B1120] p-5 overflow-y-auto space-y-4">
              {/* Khung Chẩn Đoán Lỗi & Xem Trước Sản Phẩm (Giao diện chuẩn theo mẫu người dùng gửi) */}
              <div className="bg-white text-slate-900 rounded-xl p-5 shadow-lg border border-slate-200 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>🔧 3. Chẩn Đoán Lỗi & Xem Trước Sản Phẩm</span>
                    </h3>

                    {validationResult && (
                      <div className="flex items-center gap-2">
                        {validationResult.errorCount === 0 &&
                        validationResult.warnCount === 0 ? (
                          <span className="px-3 py-1 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                            ✓ Đạt chuẩn 4/4 khối — Sẵn sàng nạp
                          </span>
                        ) : (
                          <>
                            {validationResult.errorCount > 0 && (
                              <span className="px-3 py-1 rounded-md bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold">
                                {validationResult.errorCount} Lỗi cần sửa
                              </span>
                            )}
                            {validationResult.warnCount > 0 && (
                              <span className="px-3 py-1 rounded-md bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold">
                                {validationResult.warnCount} Cảnh báo
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Kiểm tra từng phần trong file .HTML để biết chính xác vị trí lỗi cần sửa trước khi đưa vào phòng thí nghiệm.
                  </p>
                </div>

                {/* Danh sách 4 khối kiểm định */}
                <div className="space-y-3">
                  {validationResult?.checks.map((diag) => {
                    const isOk = diag.status === 'ok';
                    const isWarn = diag.status === 'warn';
                    const cardStyle = isOk
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                      : isWarn
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                      : 'bg-rose-50/90 border-rose-300 text-rose-950';

                    return (
                      <div
                        key={diag.id}
                        className={`p-3.5 rounded-xl border ${cardStyle} space-y-2 transition`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-bold text-xs">
                            {isOk ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : isWarn ? (
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <span>{diag.title}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-600">
                            {diag.badgeCode}
                          </span>
                        </div>

                        <div
                          className={`text-xs pl-6 ${
                            isOk
                              ? 'text-emerald-800'
                              : isWarn
                              ? 'text-amber-800'
                              : 'text-rose-700 font-medium'
                          }`}
                        >
                          {diag.message}
                        </div>

                        {diag.fixHint && (
                          <div className="ml-6 p-2.5 rounded-lg bg-white border border-slate-200/90 text-xs text-slate-800">
                            <strong className="font-bold text-slate-900">Cách sửa: </strong>
                            {diag.fixHint}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Đối chiếu Icon 2D & Hình ảnh thực tế trích xuất từ file .HTML */}
              {validationResult && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden"
                      dangerouslySetInnerHTML={{
                        __html:
                          validationResult.iconSvg ||
                          '<span class="text-[10px] text-slate-500">Trống</span>',
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-sky-400 uppercase">
                        Khối 2A • #ol3d-module-icon
                      </div>
                      <div className="text-xs font-bold text-slate-100 truncate mt-0.5">
                        {validationResult.nameVi}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Mã: {validationResult.assetId}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
                    <div
                      className="w-20 h-16 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_img]:w-full [&_img]:h-full [&_img]:object-contain"
                      dangerouslySetInnerHTML={{
                        __html:
                          validationResult.realPhotoHtml ||
                          '<span class="text-[10px] text-slate-500">Trống</span>',
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-amber-400 uppercase">
                        Khối 2B • #ol3d-module-real-photo
                      </div>
                      <div className="text-xs font-bold text-slate-100 mt-0.5">
                        Cọc đấu dây phát hiện: {validationResult.detectedTerminals.length} cọc
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {validationResult.detectedTerminals.length > 0
                          ? validationResult.detectedTerminals.join(', ')
                          : 'Sẽ tự gắn thêm 2 cọc (+/-) nếu bật tùy chọn bên dưới'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tùy chọn tích hợp & Nút Lưu vào Bộ Lưu Trữ + Đưa lên Bàn Thí Nghiệm 3D */}
              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Bước 2: Lưu Vào Bộ Lưu Trữ & Đưa Lên Bàn Thí Nghiệm 3D
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Khi bấm lưu, file <code className="text-amber-300">.HTML</code> này sẽ được lưu bền vững vào bộ nhớ trình duyệt (<code className="text-sky-300">localStorage</code>) và xuất hiện ngay trên mặt bàn gỗ 2.0m × 1.0m.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer select-none p-2 rounded bg-slate-950/70 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={addBindingPosts}
                    onChange={(e) => setAddBindingPosts(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span>
                    Tự động bổ sung 2 cọc cắm dây bắp chuối <strong>Đỏ (+) / Đen (-)</strong> nếu mô hình 3D trong file .HTML chưa có node <code className="text-amber-300 font-mono">terminal_*</code>
                  </span>
                </label>

                {saveSuccessBanner && (
                  <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 text-xs font-semibold flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{saveSuccessBanner}</span>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      Ra Bàn Xem Ngay
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    onClick={handleSaveAndDeploy}
                    disabled={!validationResult || !validationResult.isValid}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition cursor-pointer ${
                      validationResult && validationResult.isValid
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    Lưu Vào Bộ Lưu Trữ & Đưa Lên Bàn Thí Nghiệm 3D
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: YÊU CẦU KỸ THUẬT CỦA FILE .HTML ĐỂ HIỂN THỊ & HOẠT ĐỘNG NHƯ THẬT */}
        {activeTab === 'requirements' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0B1120] space-y-5 select-text">
            <div className="p-4 rounded-xl bg-slate-900 border border-sky-500/40 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Quy Chuẩn Kỹ Thuật Cho File .HTML Thiết Bị 3D (Tương Thích 100% OpenLab 3D & Web Của Bạn)
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Để một file <code className="text-amber-300 font-mono">.html</code> khi nạp vào web hiển thị đúng kích thước vật lý trên bàn gỗ 2.0m × 1.0m, kéo thả không xuyên thấu, xoay/nâng chuột phải, rơi tự do và điều khiển được thông số như thật, file cần có đủ <strong>4 Khối Chuẩn</strong> dưới đây.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopySampleCode}
                  className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-100 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSample ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Đã Copy File Mẫu!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-sky-400" />
                      <span>Copy Code File Mẫu</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadSampleHtml}
                  className="px-3.5 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải File Mẫu (.HTML)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Yêu cầu Khối 1 */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">
                    1. Khối JSON Manifest (#ol3d-module-manifest)
                  </span>
                  <code className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono">
                    &lt;script id="ol3d-module-manifest" type="application/json"&gt;
                  </code>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Định danh:</strong> Phải có <code className="text-sky-300">asset.assetId</code> (VD: <code className="text-amber-300">"OL3D-EQP-..."</code>) và tên tiếng Việt <code className="text-sky-300">asset.name.vi</code> (hoặc <code className="text-sky-300">asset.nameVi</code>).
                  </li>
                  <li>
                    <strong>Kích thước thực (SI mét):</strong> Khai báo <code className="text-sky-300">asset.geometry.boundingBoxM: &#123; width, height, depth &#125;</code> tính bằng <strong>mét</strong> (VD: <code className="text-amber-300">0.092, 0.044, 0.148</code>) để hệ thống tính "ruột đặc" chống xuyên thấu trên mặt bàn.
                  </li>
                  <li>
                    <strong>Điều khiển tương tác:</strong> Khai báo <code className="text-sky-300">moduleControls</code> gồm <code className="text-amber-300">stateKey, labelVi, unit, min, max, step, defaultValue, presets</code> để tạo thanh trượt điều khiển trực tiếp trên nhãn 3D của thiết bị.
                  </li>
                </ul>
              </div>

              {/* Yêu cầu Khối 2 */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    2. Khối Icon 2D & Hình Đối Chiếu (#ol3d-module-icon & #ol3d-module-real-photo)
                  </span>
                  <code className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono">
                    &lt;template&gt;
                  </code>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>#ol3d-module-icon:</strong> Thẻ <code className="text-sky-300">&lt;template id="ol3d-module-icon"&gt;</code> chứa mã <code className="text-amber-300">&lt;svg viewBox="0 0 120 120"&gt;</code> hiển thị trong Kho lưu trữ và hồ sơ thiết bị.
                  </li>
                  <li>
                    <strong>#ol3d-module-real-photo:</strong> Thẻ <code className="text-sky-300">&lt;template id="ol3d-module-real-photo"&gt;</code> chứa bản vẽ kỹ thuật SVG hoặc ảnh đối chiếu thực tế của thiết bị.
                  </li>
                </ul>
              </div>

              {/* Yêu cầu Khối 3 */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400">
                    3. Khối Script 3D Three.js (#ol3d-module-3d-script)
                  </span>
                  <code className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono">
                    window.OL3D_EQUIPMENT_MODULE
                  </code>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Hàm tạo mô hình 3D:</strong> Cung cấp <code className="text-amber-300">buildEquipmentGroup(THREE, asset)</code> hoặc <code className="text-amber-300">buildEquipmentMesh(THREE, asset)</code> trả về <code className="text-sky-300">new THREE.Group()</code>.
                  </li>
                  <li>
                    <strong>Hàm cập nhật trạng thái động:</strong> Cung cấp <code className="text-amber-300">applyEquipmentState(THREE, group, state, asset)</code> hoặc <code className="text-amber-300">updateEquipmentState(group, state, dt)</code> để xoay kim, đổi số LCD, di chuyển con chạy hoặc phát sáng khi người dùng kéo thanh trượt.
                  </li>
                  <li>
                    <strong>Hàm âm thanh WebAudio:</strong> <code className="text-amber-300">playEquipmentSound(action, value)</code> tạo tiếng click/bíp thực tế khi thao tác.
                  </li>
                </ul>
              </div>

              {/* Yêu cầu Khối 4 */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400">
                    4. Quy Ước Đặt Tên Bộ Phận 3D & Cọc Cắm Dây (Terminals)
                  </span>
                  <code className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono">
                    Y = 0 tại đáy vật
                  </code>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Điểm tựa mặt bàn (Anchor Base-Center):</strong> Đáy thấp nhất của thiết bị phải nằm tại <code className="text-amber-300">y = 0</code> để vật đứng khít trên mặt bàn gỗ 2.0m × 1.0m và kệ tủ kính 2 tầng.
                  </li>
                  <li>
                    <strong>Các node chuẩn trong Group:</strong> Đặt tên <code className="text-sky-300">body</code> (thân chính), <code className="text-sky-300">scale_display</code> (màn hình / mặt chia độ), <code className="text-sky-300">plunger</code> (kim chỉ thị / con chạy / núm vặn).
                  </li>
                  <li>
                    <strong>Cọc cắm dây bắp chuối (Tùy chọn):</strong> Bất kỳ bộ phận nào đặt tên <code className="text-amber-300">terminal_MÃ_CỌC</code> (kèm <code className="text-sky-300">userData.terminalId = 'MÃ_CỌC'</code>) sẽ tự động cho phép cắm dây Đỏ/Xanh trực tiếp trên bàn thí nghiệm!
                  </li>
                </ul>
              </div>
            </div>

            {/* Khung code mẫu minh họa */}
            <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-300">
                Cấu trúc khung chuẩn của 1 file .HTML thiết bị (Bấm "Tải File Mẫu (.HTML)" ở góc trên để lấy bản đầy đủ):
              </div>
              <pre className="text-[11px] font-mono text-emerald-300 leading-relaxed overflow-x-auto">{`<!-- KHỐI 1: THÔNG SỐ JSON MANIFEST -->
<script id="ol3d-module-manifest" type="application/json">
{
  "schemaVersion": "OL3D-HTML-MODULE-v2.1",
  "asset": {
    "assetId": "OL3D-EQP-DMM-SAMPLE-01",
    "name": { "vi": "Đồng Hồ Vạn Năng Hiện Số 3D (Mẫu Chuẩn)", "en": "3D Digital Multimeter" },
    "geometry": { "anchor": "base-center", "boundingBoxM": { "width": 0.092, "height": 0.044, "depth": 0.148 } }
  },
  "moduleControls": {
    "stateKey": "multimeterValue", "labelVi": "Điện áp hiển thị (DCV)", "unit": "V",
    "min": 0, "max": 12, "step": 0.1, "defaultValue": 3.0
  }
}
</script>

<!-- KHỐI 2: ICON 2D & HÌNH ĐỐI CHIẾU THỰC TẾ -->
<template id="ol3d-module-icon"><svg viewBox="0 0 120 120">...</svg></template>
<template id="ol3d-module-real-photo"><svg viewBox="0 0 420 260">...</svg></template>

<!-- KHỐI 3: SCRIPT 3D THREE.JS -->
<script id="ol3d-module-3d-script">
window.OL3D_EQUIPMENT_MODULE = {
  buildEquipmentGroup: function(THREE, asset) {
    const group = new THREE.Group();
    // Tạo body, scale_display, plunger và terminal_DMM_POS / terminal_DMM_NEG...
    return group;
  },
  applyEquipmentState: function(THREE, group, state, asset) {
    // Cập nhật màn hình, góc xoay núm vặn / kim đo theo state.multimeterValue...
  },
  playEquipmentSound: function(action, value) { /* WebAudio synth */ }
};
</script>`}</pre>
            </div>
          </div>
        )}

        {/* TAB 3: KHO LƯU TRỮ THIẾT BỊ ĐÃ NẠP (LOCALSTORAGE) */}
        {activeTab === 'storage' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-5 bg-[#0B1120] space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Kho Lưu Trữ Thiết Bị .HTML Đã Nạp ({storedModules.length} thiết bị)
                </h3>
                <p className="text-xs text-slate-400">
                  Tất cả thiết bị tại đây được lưu tự động trong trình duyệt và luôn xuất hiện trên Bàn thí nghiệm 3D mỗi khi bạn mở web.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('import')}
                className="px-3.5 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                + Nạp Thêm File .HTML Mới
              </button>
            </div>

            {storedModules.length === 0 ? (
              <div className="p-10 rounded-xl bg-slate-900/70 border border-slate-800 text-center space-y-3">
                <Database className="w-10 h-10 text-slate-500 mx-auto" />
                <div className="text-sm font-bold text-slate-200">
                  Chưa có thiết bị .HTML nào trong Bộ lưu trữ
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Hãy chuyển sang mục <strong>"1. Nạp File .HTML & Chẩn Đoán 4 Khối"</strong>, bấm <strong>"Nạp Thử File Mẫu Chuẩn"</strong> hoặc tải file .HTML của bạn lên rồi bấm Lưu để đưa thiết bị lên bàn thí nghiệm!
                </p>
                <button
                  onClick={() => {
                    handleLoadSampleTemplate();
                    setActiveTab('import');
                  }}
                  className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Nạp Ngay Thiết Bị Mẫu Đầu Tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {storedModules.map((mod) => {
                  const isInCab = Boolean(inCabinetMap[mod.id]);
                  const curVal =
                    customDeviceValues[mod.id] !== undefined
                      ? customDeviceValues[mod.id]
                      : mod.controls.defaultValue;

                  return (
                    <div
                      key={mod.id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-16 h-16 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden"
                          dangerouslySetInnerHTML={{
                            __html:
                              mod.iconSvg ||
                              '<span class="text-[10px] text-slate-500">3D</span>',
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-amber-400 uppercase truncate">
                              {mod.assetId} • {mod.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isInCab
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {isInCab ? 'Trong Tủ Kính' : 'Đang Ở Trên Bàn 3D'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-100 truncate mt-0.5">
                            {mod.nameVi}
                          </h4>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Kích thước: {(mod.dimensionsM[0] * 1000).toFixed(0)} ×{' '}
                            {(mod.dimensionsM[2] * 1000).toFixed(0)} ×{' '}
                            {(mod.dimensionsM[1] * 1000).toFixed(0)} mm • Khối lượng:{' '}
                            {mod.massG}g
                          </div>
                        </div>
                      </div>

                      {/* Thanh điều khiển thông số trực tiếp của thiết bị trên bàn */}
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-semibold">
                            {mod.controls.labelVi}:
                          </span>
                          <span className="font-mono font-bold text-sky-300">
                            {curVal} {mod.controls.unit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={mod.controls.min}
                          max={mod.controls.max}
                          step={mod.controls.step}
                          value={curVal}
                          onChange={(e) =>
                            onChangeCustomDeviceValue(mod.id, parseFloat(e.target.value))
                          }
                          className="w-full h-1.5 accent-sky-400 cursor-pointer"
                        />
                      </div>

                      {/* Các nút thao tác */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              onFocusModuleOnTable(mod.id);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Xem Trên Bàn 3D
                          </button>

                          <button
                            onClick={() => onToggleCabinetModule(mod.id)}
                            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5 text-amber-400" />
                            {isInCab ? 'Lấy Ra Bàn' : 'Cất Vào Tủ'}
                          </button>

                          <button
                            onClick={() => {
                              const blob = new Blob([mod.htmlContent], {
                                type: 'text/html;charset=utf-8',
                              });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = mod.filename || `${mod.slug}.html`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            title="Tải lại file .HTML này về máy"
                          >
                            <Download className="w-3.5 h-3.5" />
                            .HTML
                          </button>
                        </div>

                        <button
                          onClick={() => onDeleteStoredModule(mod.id)}
                          className="px-2.5 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
