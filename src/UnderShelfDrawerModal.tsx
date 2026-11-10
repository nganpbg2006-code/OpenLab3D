import React from 'react';
import { Package, X, ArrowUpRight, Layers, Box } from 'lucide-react';
import { EquipmentDetailedSpec, WorkbenchItemId } from './App';

interface UnderShelfDrawerModalProps {
  isOpen: boolean;
  cabinetSide: 'left' | 'right' | null;
  onClose: () => void;
  allCatalog: EquipmentDetailedSpec[];
  cabinetStorageSideMap: Record<WorkbenchItemId, 'left' | 'right' | null>;
  onPlaceItemOnMainTable: (id: WorkbenchItemId) => void;
  onPlaceItemOnCabinetShelf: (id: WorkbenchItemId, side: 'left' | 'right') => void;
}

export const UnderShelfDrawerModal: React.FC<UnderShelfDrawerModalProps> = ({
  isOpen,
  cabinetSide,
  onClose,
  allCatalog,
  cabinetStorageSideMap,
  onPlaceItemOnMainTable,
  onPlaceItemOnCabinetShelf,
}) => {
  if (!isOpen || !cabinetSide) return null;

  const cabinetTitle =
    cabinetSide === 'left' ? 'TỦ VẬT PHẨM TRÁI' : 'TỦ VẬT PHẨM PHẢI';

  const itemsInThisCabinet = allCatalog.filter(
    (spec) => cabinetStorageSideMap[spec.id] === cabinetSide
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0F172A] border border-amber-500/50 rounded-xl max-w-4xl w-full max-h-[82vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                TRANG VẬT PHẨM — {cabinetTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chọn vật phẩm trong {cabinetTitle.toLowerCase()} để đưa ra bàn chính hoặc đặt lên kệ ở trên của tủ này.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chỉ có duy nhất 1 mục: Tất Cả */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-md text-xs font-bold bg-amber-500 text-slate-950 cursor-default"
          >
            Tất Cả ({itemsInThisCabinet.length})
          </button>
        </div>

        {/* Danh sách vật phẩm trong tủ */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 bg-[#0B1120]">
          {itemsInThisCabinet.length === 0 ? (
            <div className="p-10 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <Box className="w-9 h-9 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-slate-200">
                Chưa có vật phẩm nào trong {cabinetTitle}
              </div>
              <p className="text-xs text-slate-400">
                Khi bạn kéo vật phẩm 3D thả vào {cabinetTitle}, vật phẩm sẽ nằm ở trong tủ này.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {itemsInThisCabinet.map((spec) => (
                <div
                  key={spec.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-3 transition"
                >
                  <div className="flex items-start gap-3">
                    {spec.isImportedHtml && spec.importedModule?.iconSvg ? (
                      <div
                        className="w-14 h-14 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: spec.importedModule.iconSvg }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shrink-0 text-amber-400">
                        <Box className="w-6 h-6" />
                        <span className="text-[9px] font-mono text-slate-400 mt-0.5">3D</span>
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {spec.modelCode} • {spec.category}
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 truncate mt-0.5">
                        {spec.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {spec.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* Chỉ có 2 mục tương tác: Đưa ra bàn chính & Đặt lên kệ (ở trên của tủ đó) */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        onPlaceItemOnMainTable(spec.id);
                        onClose();
                      }}
                      className="flex-1 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Đưa Ra Bàn Chính
                    </button>

                    <button
                      onClick={() => {
                        onPlaceItemOnCabinetShelf(spec.id, cabinetSide);
                        onClose();
                      }}
                      className="flex-1 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Đặt Lên Kệ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
