"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-duo btn-duo-primary px-6 py-3 text-sm no-print"
    >
      🖨️ Печать / Сохранить как PDF
    </button>
  );
}
