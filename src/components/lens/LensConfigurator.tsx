"use client";

import { useMemo, useState } from "react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { formatDual } from "@/lib/price";

export type LensChoice = {
  id: string;
  label: string;
  addPrice: number;
};

type RxState = {
  sphR: string;
  sphL: string;
  cylR: string;
  cylL: string;
  axisR: string;
  axisL: string;
  pd: string;
};

type Props = {
  productId: number;
  name: string;
  basePrice: number;
  image?: string;

  requireLens?: boolean;
  options: LensChoice[];
};

function range(start: number, end: number, step = 1) {
  const out: number[] = [];
  for (let v = start; v <= end + 1e-9; v += step) out.push(Number(v.toFixed(6)));
  return out;
}

// форматиране 2 знака + запетая
function makeDiopterOptions(min: number, max: number, step: number, includeZeroLabel = true) {
  const out: string[] = [];
  if (includeZeroLabel) out.push("БЕЗ ДИОПТЪР");
  const steps = Math.round((max - min) / step);
  for (let i = 0; i <= steps; i++) {
    const v = min + i * step;
    out.push(v.toFixed(2).replace(".", ","));
  }
  return out;
}

// ✅ Тук е корекцията по твоята спецификация:
const SPH_VALUES = makeDiopterOptions(-6, 6, 0.25, true);
const CYL_VALUES = ["НЯМА", ...makeDiopterOptions(-2, 2, 0.25, false).filter((v) => v !== "0,00")];

const AXIS_MIN = 1;
const AXIS_MAX = 180;
const PD_VALUES = range(50, 75, 1).map((v) => `${v}MM`);

export default function LensConfigurator({
  productId,
  name,
  basePrice,
  image,
  requireLens = false,
  options,
}: Props) {
  const safeOptions = Array.isArray(options) ? options : [];

  const [lensId, setLensId] = useState<string>("");
  const [showRx, setShowRx] = useState<boolean>(false);

  const [rx, setRx] = useState<RxState>({
    sphR: "",
    sphL: "",
    cylR: "",
    cylL: "",
    axisR: "",
    axisL: "",
    pd: "",
  });

  const selectedLens = useMemo(
    () => safeOptions.find((o) => o.id === lensId) || null,
    [lensId, safeOptions]
  );

  const addPrice = selectedLens?.addPrice ?? 0;

  const totalPrice = useMemo(() => {
    const n = Number.isFinite(basePrice) ? basePrice : 0;
    return n + addPrice;
  }, [basePrice, addPrice]);

  const needsAxisR = rx.cylR && rx.cylR !== "НЯМА";
  const needsAxisL = rx.cylL && rx.cylL !== "НЯМА";

  const axisRok = !needsAxisR || (Number(rx.axisR) >= AXIS_MIN && Number(rx.axisR) <= AXIS_MAX);
  const axisLok = !needsAxisL || (Number(rx.axisL) >= AXIS_MIN && Number(rx.axisL) <= AXIS_MAX);

  const rxComplete =
    Boolean(rx.sphR) &&
    Boolean(rx.sphL) &&
    Boolean(rx.cylR) &&
    Boolean(rx.cylL) &&
    Boolean(rx.pd) &&
    axisRok &&
    axisLok &&
    (!needsAxisR || Boolean(rx.axisR)) &&
    (!needsAxisL || Boolean(rx.axisL));

  const canAdd = (!requireLens || Boolean(selectedLens)) && (!requireLens || rxComplete);

  const errorMsg = useMemo(() => {
    if (!requireLens) return "";
    if (!selectedLens) return "Избери стъкла.";
    if (!rx.sphR || !rx.sphL) return "Избери SPH за дясно и ляво око.";
    if (!rx.cylR || !rx.cylL) return "Избери CYL за дясно и ляво око.";
    if (needsAxisR && !rx.axisR) return "Въведи Axis R (1–180).";
    if (needsAxisL && !rx.axisL) return "Въведи Axis L (1–180).";
    if (!axisRok) return "Axis R трябва да е между 1 и 180.";
    if (!axisLok) return "Axis L трябва да е между 1 и 180.";
    if (!rx.pd) return "Избери PD.";
    return "";
  }, [requireLens, selectedLens, rx, needsAxisR, needsAxisL, axisRok, axisLok]);

  return (
    <section
      style={{
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 14,
        padding: 14,
        marginTop: 14,
        background: "#fff",
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 10 }}>
        Избор на стъкла{requireLens ? " *" : ""}
      </div>

      {/* 1) LENS TYPE */}
      <select
        value={lensId}
        onChange={(e) => {
          const v = e.target.value;
          setLensId(v);
          if (v) setShowRx(true); // ✅ автоматично отваряме RX след избора
        }}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid #d9d9d9",
          outline: "none",
        }}
      >
        <option value="" disabled>
          {requireLens ? "Избери стъкла…" : "Без стъкла"}
        </option>

        {safeOptions.map((o) => (
          <option key={o.id} value={o.id}>
	    {o.label} (+{formatDual(o.addPrice)})           
          </option>
        ))}
      </select>

      {/* Summary always visible */}
<div style={{ marginTop: 10, display: "grid", gap: 6 }}>
  <div style={{ opacity: 0.85 }}>
    Рамка: <b>{formatDual(basePrice)}</b>
    {selectedLens ? (
      <>
        {" "}
        + Стъкла: <b>{formatDual(addPrice)}</b>
      </>
    ) : null}
  </div>

  <div style={{ fontWeight: 900, fontSize: 18 }}>
    Общо: {formatDual(totalPrice)}
  </div>
</div>

      {/* 2) RX toggle */}
      {requireLens && (
        <div style={{ marginTop: 12 }}>
          {!selectedLens ? (
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              * Първо избери вид стъкла, после ще се покажат параметрите (SPH/CYL/PD).
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowRx((s) => !s)}
              style={{
                width: "100%",
                marginTop: 6,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #d9d9d9",
                background: "white",
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {showRx ? "▼ Параметри на стъкла" : "► Параметри на стъкла (SPH/CYL/PD)"}
            </button>
          )}
        </div>
      )}

      {/* 3) RX OPTIONS (step) */}
      {requireLens && selectedLens && showRx && (
        <div style={{ marginTop: 14 }}>
          {/* SPH */}
          <div style={{ fontWeight: 900, marginBottom: 6 }}>SPH</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>SPH O.D. (дясно)</div>
              <select
                value={rx.sphR}
                onChange={(e) => setRx((s) => ({ ...s, sphR: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #d9d9d9" }}
              >
                <option value="" disabled>Избери</option>
                {SPH_VALUES.map((v) => (
                  <option key={`sphR-${v}`} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>SPH O.S. (ляво)</div>
              <select
                value={rx.sphL}
                onChange={(e) => setRx((s) => ({ ...s, sphL: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #d9d9d9" }}
              >
                <option value="" disabled>Избери</option>
                {SPH_VALUES.map((v) => (
                  <option key={`sphL-${v}`} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CYL */}
          <div style={{ fontWeight: 900, marginTop: 14, marginBottom: 6 }}>CYL</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>CYL R (дясно)</div>
              <select
                value={rx.cylR}
                onChange={(e) => setRx((s) => ({ ...s, cylR: e.target.value, axisR: "" }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #d9d9d9" }}
              >
                <option value="" disabled>Избери</option>
                {CYL_VALUES.map((v) => (
                  <option key={`cylR-${v}`} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>CYL L (ляво)</div>
              <select
                value={rx.cylL}
                onChange={(e) => setRx((s) => ({ ...s, cylL: e.target.value, axisL: "" }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #d9d9d9" }}
              >
                <option value="" disabled>Избери</option>
                {CYL_VALUES.map((v) => (
                  <option key={`cylL-${v}`} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* AXIS */}
          <div style={{ fontWeight: 900, marginTop: 14, marginBottom: 6 }}>AXIS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
                Axis R (градуси дясно) {needsAxisR ? "*" : ""}
              </div>
              <input
                value={rx.axisR}
                onChange={(e) => setRx((s) => ({ ...s, axisR: e.target.value.replace(/[^\d]/g, "") }))}
                disabled={!needsAxisR}
                placeholder={needsAxisR ? "1–180" : "не е нужно"}
                inputMode="numeric"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #d9d9d9",
                  background: !needsAxisR ? "#f5f5f5" : "white",
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
                Axis L (градуси ляво) {needsAxisL ? "*" : ""}
              </div>
              <input
                value={rx.axisL}
                onChange={(e) => setRx((s) => ({ ...s, axisL: e.target.value.replace(/[^\d]/g, "") }))}
                disabled={!needsAxisL}
                placeholder={needsAxisL ? "1–180" : "не е нужно"}
                inputMode="numeric"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #d9d9d9",
                  background: !needsAxisL ? "#f5f5f5" : "white",
                }}
              />
            </div>
          </div>

          {/* PD */}
          <div style={{ fontWeight: 900, marginTop: 14, marginBottom: 6 }}>PD (дистанция)</div>
          <select
            value={rx.pd}
            onChange={(e) => setRx((s) => ({ ...s, pd: e.target.value }))}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #d9d9d9",
              outline: "none",
            }}
          >
            <option value="" disabled>Избери PD</option>
            {PD_VALUES.map((v) => (
              <option key={`pd-${v}`} value={v}>{v}</option>
            ))}
          </select>
        </div>
      )}

      {/* ERROR */}
      {requireLens && errorMsg && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#b91c1c" }}>{errorMsg}</div>
      )}

      {/* ADD BUTTON */}
      <div style={{ marginTop: 12 }}>
        <AddToCartButton
          productId={productId}
          name={name}
          price={totalPrice}
          image={image}
          disabled={!canAdd}
          extras={
            selectedLens
              ? {
                  lensLabel: selectedLens.label,
                  lensPriceAdd: selectedLens.addPrice,
                  rx: requireLens ? rx : undefined,
                }
              : undefined
          }
        />
      </div>

      {requireLens && (
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          * За диоптрични рамки изборът на стъкла и параметри (SPH/CYL/PD) е задължителен. Axis се изисква само при CYL.
        </div>
      )}
    </section>
  );
}
