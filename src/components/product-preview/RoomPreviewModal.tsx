import { useEffect, useState } from "react";
import { Modal, Button, Upload } from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined, ReloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useDragResize, type OverlayState } from "./useDragResize";

interface RoomPreviewModalProps {
  open: boolean;
  onClose: () => void;
  productImageUrl: string;
  productName: string;
}

const INITIAL_OVERLAY: OverlayState = { x: 0, y: 0, size: 220 };

/**
 * Client-only visual preview: lets the shopper drop a photo of their own space as a
 * background and drag/resize the product image over it. The background photo is a local
 * object URL — it is never uploaded to the server, only rendered in the browser.
 */
export function RoomPreviewModal({ open, onClose, productImageUrl, productName }: RoomPreviewModalProps) {
  const { t } = useTranslation();
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const { state, reset, handlers } = useDragResize({ initial: INITIAL_OVERLAY });

  // Revoke the previous object URL whenever it's replaced or the modal is closed, so we
  // don't leak memory across repeated preview sessions.
  useEffect(() => {
    if (!open && backgroundUrl) {
      URL.revokeObjectURL(backgroundUrl);
      setBackgroundUrl(null);
      reset();
    }
  }, [open, backgroundUrl, reset]);

  const handleSelectFile = (file: File) => {
    setBackgroundUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    reset();
    return false;
  };

  const uploadProps: UploadProps = {
    accept: "image/*",
    showUploadList: false,
    beforeUpload: handleSelectFile,
  };

  return (
    <Modal title={t("product.preview.title")} open={open} onCancel={onClose} footer={null} width={640} destroyOnClose>
      {!backgroundUrl ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-muted-foreground">{t("product.preview.hint")}</p>
          <Upload {...uploadProps}>
            <Button type="primary" icon={<UploadOutlined />}>
              {t("product.preview.choosePhoto")}
            </Button>
          </Upload>
        </div>
      ) : (
        <div>
          <div
            className="relative w-full overflow-hidden rounded-lg border border-border bg-muted select-none"
            style={{ aspectRatio: "4 / 3", touchAction: "none" }}
          >
            <img src={backgroundUrl} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            <div
              onPointerDown={handlers.startDrag}
              onPointerMove={(e) => {
                handlers.onDragMove(e);
                handlers.onResizeMove(e);
              }}
              onPointerUp={() => {
                handlers.endDrag();
                handlers.endResize();
              }}
              onPointerCancel={() => {
                handlers.endDrag();
                handlers.endResize();
              }}
              className="absolute top-1/2 left-1/2 cursor-move"
              style={{
                width: state.size,
                height: state.size,
                transform: `translate(-50%, -50%) translate(${state.x}px, ${state.y}px)`,
              }}
            >
              <img
                src={productImageUrl}
                alt={productName}
                draggable={false}
                className="w-full h-full object-contain pointer-events-none"
              />
              <div
                onPointerDown={handlers.startResize}
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary border-2 border-white shadow cursor-nwse-resize"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>{t("product.preview.changePhoto")}</Button>
            </Upload>
            <Button icon={<ReloadOutlined />} onClick={reset}>
              {t("product.preview.resetPosition")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">{t("product.preview.disclaimer")}</p>
        </div>
      )}
    </Modal>
  );
}
