import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const colors = {
  canvas: "#090d16",
  sidebar: "#0d1320",
  panel: "#101827",
  panelSoft: "#151f31",
  border: "#243248",
  text: "#f6f8fc",
  muted: "#8b9bb4",
  blue: "#357af6",
  blueSoft: "rgba(53,122,246,0.18)",
  wine: "#762446",
  green: "#1cb879",
  yellow: "#e7b93f",
};

const font: CSSProperties = {
  fontFamily: "Inter, Arial, sans-serif",
  letterSpacing: 0,
};

const appear = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing: ease });

const sceneOpacity = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, start + 14, end - 14, end], [0, 1, 1, 0], {
    ...clamp,
    easing: ease,
  });

function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "yellow" }) {
  const background = tone === "green" ? "rgba(28,184,121,0.16)" : tone === "yellow" ? "rgba(231,185,63,0.16)" : colors.blueSoft;
  const color = tone === "green" ? "#47dd9d" : tone === "yellow" ? "#f2cb63" : "#76abff";
  return (
    <span style={{ ...font, borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 650, background, color }}>
      {children}
    </span>
  );
}

function Toast({ title, detail, opacity }: { title: string; detail: string; opacity: number }) {
  return (
    <div
      style={{
        ...font,
        position: "absolute",
        zIndex: 25,
        right: 44,
        bottom: 44,
        width: 272,
        borderRadius: 14,
        border: `1px solid ${colors.border}`,
        background: colors.panel,
        padding: "14px 16px",
        boxShadow: "0 24px 55px rgba(0,0,0,.38)",
        opacity,
        transform: `translateY(${(1 - opacity) * 18}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, color: colors.text, fontSize: 13, fontWeight: 670 }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 19, height: 19, borderRadius: 999, background: "rgba(28,184,121,.2)", color: "#47dd9d" }}>✓</span>
        {title}
      </div>
      <div style={{ color: colors.muted, fontSize: 11, lineHeight: 1.5, marginTop: 6, paddingLeft: 28 }}>{detail}</div>
    </div>
  );
}

function Sidebar({ active }: { active: "inventory" | "audits" | "reports" }) {
  const nav = [
    ["Dashboard", "▦", false],
    ["Inventory", "◈", active === "inventory"],
    ["Audits", "✓", active === "audits"],
    ["Reports", "▥", active === "reports"],
    ["Settings", "⚙", false],
  ] as const;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 214, borderRight: `1px solid ${colors.border}`, background: colors.sidebar }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: 70, padding: "0 20px", borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ position: "relative", width: 38, height: 38, overflow: "hidden", borderRadius: 11 }}>
          <Img
            src={staticFile("audit-flowicon-dark.png")}
            style={{ position: "absolute", width: 45, height: 45, left: -3.5, top: -3.5, objectFit: "cover" }}
          />
        </div>
        <div style={{ ...font, fontSize: 20, fontWeight: 740, color: colors.text }}>AuditNett</div>
      </div>
      <div style={{ padding: "22px 12px" }}>
        {nav.map(([label, icon, selected]) => (
          <div
            key={label}
            style={{
              ...font,
              height: 49,
              padding: "0 14px",
              marginBottom: 7,
              borderRadius: 11,
              display: "flex",
              alignItems: "center",
              gap: 15,
              background: selected ? colors.blue : "transparent",
              color: selected ? "#fff" : colors.muted,
              fontSize: 15,
              fontWeight: selected ? 650 : 540,
            }}
          >
            <span style={{ fontSize: 18, width: 20, textAlign: "center" }}>{icon}</span>
            {label}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 15, right: 15, bottom: 18, border: `1px solid ${colors.border}`, borderRadius: 13, padding: 14 }}>
        <div style={{ ...font, color: colors.text, fontSize: 13, fontWeight: 650 }}>Audit Admin</div>
        <div style={{ ...font, color: colors.muted, fontSize: 11, marginTop: 4 }}>Owner · GoFlow Restaurant</div>
      </div>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div style={{ position: "absolute", left: 214, right: 0, top: 0, height: 70, borderBottom: `1px solid ${colors.border}`, background: colors.panel, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px" }}>
      <div>
        <div style={{ ...font, fontSize: 12, color: colors.muted }}>GoFlow Restaurant / Bar</div>
        <div style={{ ...font, color: colors.text, fontWeight: 670, fontSize: 17, marginTop: 3 }}>{title}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Badge>CRC</Badge>
        <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", justifyContent: "center", alignItems: "center", border: `1px solid ${colors.border}`, color: colors.text }}>◦</div>
        <div style={{ width: 38, height: 38, borderRadius: 19, display: "flex", justifyContent: "center", alignItems: "center", background: colors.wine, color: "#fff", fontSize: 14, fontWeight: 700 }}>AA</div>
      </div>
    </div>
  );
}

function Shell({ active, title, children }: { active: "inventory" | "audits" | "reports"; title: string; children: ReactNode }) {
  return (
    <div style={{ position: "absolute", inset: 26, overflow: "hidden", borderRadius: 22, border: `1px solid ${colors.border}`, boxShadow: "0 32px 100px rgba(0,0,0,.4)", background: colors.panel }}>
      <Sidebar active={active} />
      <Header title={title} />
      <div style={{ position: "absolute", left: 214, right: 0, top: 70, bottom: 0, padding: "25px 28px", background: colors.canvas }}>{children}</div>
    </div>
  );
}

function Cursor({ x, y, click }: { x: number; y: number; click?: number }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 30, transform: "translate(-7px,-5px)" }}>
      {click ? <div style={{ position: "absolute", left: -14, top: -14, width: 38, height: 38, borderRadius: "50%", border: `2px solid ${colors.blue}`, opacity: click, transform: `scale(${1.35 - click * 0.45})` }} /> : null}
      <svg width="28" height="36" viewBox="0 0 28 36">
        <path d="M3 2L23 23H14L20 34L14 36L8 24L2 30Z" fill="#ffffff" stroke="#111827" strokeWidth="2.2" />
      </svg>
    </div>
  );
}

function InventoryScene({ frame }: { frame: number }) {
  const newAuditFocus = interpolate(frame, [62, 73, 86], [0, 1, 0], clamp);
  const rows = [
    ["Gin Premium", "Spirits", "12 bottles", "CRC 144,000"],
    ["Tonic Water", "Mixers", "8 units", "CRC 9,600"],
    ["Lime Juice", "Fresh", "5 L", "CRC 16,500"],
  ];
  return (
    <Shell active="inventory" title="Inventory">
      <div style={{ opacity: appear(frame, 14), transform: `translateY(${(1 - appear(frame, 14)) * 12}px)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 24 }}>
          <div>
            <div style={{ ...font, color: colors.text, fontWeight: 700, fontSize: 28 }}>Bar Inventory</div>
            <div style={{ ...font, color: colors.muted, fontSize: 14, marginTop: 8 }}>15 products · Last edited today, 09:42</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Badge tone="green">Stock synced</Badge>
            <div style={{ ...font, borderRadius: 10, background: colors.blue, padding: "11px 17px", color: "#fff", fontWeight: 650, fontSize: 14, boxShadow: `0 0 0 ${newAuditFocus * 7}px rgba(53,122,246,${0.23 * newAuditFocus})` }}>New Audit</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 13, marginBottom: 20 }}>
          {[["Total items", "15"], ["Inventory value", "CRC 422,800"], ["Audits available", "3"]].map(([label, value]) => (
            <div key={label} style={{ border: `1px solid ${colors.border}`, background: colors.panel, borderRadius: 13, padding: "17px 19px" }}>
              <div style={{ ...font, fontSize: 12, color: colors.muted }}>{label}</div>
              <div style={{ ...font, fontSize: 25, color: colors.text, fontWeight: 720, marginTop: 8 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 13, overflow: "hidden", background: colors.panel }}>
          <div style={{ ...font, display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr", padding: "13px 20px", fontSize: 12, color: colors.muted, background: colors.panelSoft }}>
            <span>Product</span><span>Category</span><span>Current stock</span><span>Value</span>
          </div>
          {rows.map((row, index) => (
            <div key={row[0]} style={{ ...font, display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr", padding: "16px 20px", fontSize: 14, color: colors.text, borderTop: `1px solid ${colors.border}`, opacity: appear(frame, 36 + index * 8) }}>
              <span style={{ fontWeight: 620 }}>{row[0]}</span><span style={{ color: colors.muted }}>{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function AssignScene({ frame }: { frame: number }) {
  const local = frame - 100;
  const selectionOpen = interpolate(local, [39, 48, 64, 71], [0, 1, 1, 0], clamp);
  const createPulse = interpolate(local, [103, 111, 121], [0, 1, 0], clamp);
  const assignmentToast = interpolate(local, [113, 123, 140, 146], [0, 1, 1, 0], clamp);
  return (
    <Shell active="audits" title="Audits">
      <div style={{ ...font, color: colors.text, fontSize: 27, fontWeight: 700 }}>Audits</div>
      <div style={{ ...font, color: colors.muted, fontSize: 14, marginTop: 6 }}>Create and assign operational inventory checks.</div>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.34)" }} />
      <div style={{ position: "absolute", left: 138, top: 40, width: 610, borderRadius: 17, border: `1px solid ${colors.border}`, background: colors.panel, boxShadow: "0 26px 65px rgba(0,0,0,.38)", opacity: appear(local, 4), transform: `scale(${0.98 + appear(local, 4) * 0.02})` }}>
        <div style={{ borderBottom: `1px solid ${colors.border}`, padding: "19px 24px" }}>
          <div style={{ ...font, color: colors.text, fontSize: 20, fontWeight: 690 }}>Create New Audit</div>
          <div style={{ ...font, color: colors.muted, fontSize: 12, marginTop: 6 }}>Assign the count to the right collaborator.</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: 22 }}>
          {[
            ["Restaurant", "GoFlow Restaurant"],
            ["Inventory", "Bar"],
            ["Responsible auditor", local > 63 ? "Sofia Ramirez" : "Select auditor"],
            ["Due date", "2026-05-25"],
          ].map(([label, value], index) => (
            <div key={label} style={{ opacity: appear(local, 13 + index * 6) }}>
              <div style={{ ...font, color: colors.muted, fontSize: 12, marginBottom: 7 }}>{label}</div>
              <div style={{ ...font, height: 43, border: `1px solid ${(selectionOpen > 0 || local > 63) && label === "Responsible auditor" ? colors.blue : colors.border}`, borderRadius: 9, padding: "13px 12px", color: value === "Select auditor" ? colors.muted : colors.text, fontSize: 13, background: colors.canvas }}>{value} <span style={{ float: "right", color: colors.muted }}>⌄</span></div>
              {label === "Responsible auditor" && selectionOpen > 0 ? (
                <div style={{ ...font, position: "absolute", zIndex: 10, marginTop: 5, width: 271, borderRadius: 9, border: `1px solid ${colors.border}`, background: colors.panel, boxShadow: "0 16px 34px rgba(0,0,0,.36)", opacity: selectionOpen, overflow: "hidden" }}>
                  {["Sofia Ramirez · Auditor", "Daniel Mora · Read only"].map((option, optionIndex) => (
                    <div key={option} style={{ padding: "11px 12px", fontSize: 12, color: optionIndex === 0 ? "#fff" : colors.muted, background: optionIndex === 0 ? colors.blue : "transparent" }}>{option}</div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <div style={{ gridColumn: "span 2", opacity: appear(local, 36) }}>
            <div style={{ ...font, color: colors.muted, fontSize: 12, marginBottom: 7 }}>Extra hand</div>
            <div style={{ ...font, height: 43, border: `1px solid ${colors.border}`, borderRadius: 9, padding: "13px 12px", color: colors.text, fontSize: 13, background: colors.canvas }}>Marco · Helper</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: `1px solid ${colors.border}`, padding: "15px 22px 20px" }}>
          <div style={{ ...font, border: `1px solid ${colors.border}`, color: colors.muted, borderRadius: 9, padding: "11px 18px", fontSize: 13 }}>Cancel</div>
          <div style={{ ...font, background: colors.blue, color: "#fff", borderRadius: 9, padding: "11px 18px", fontSize: 13, fontWeight: 650, boxShadow: `0 0 0 ${createPulse * 8}px rgba(53,122,246,${0.22 * createPulse})` }}>Create Audit</div>
        </div>
      </div>
      <Toast title="Audit task assigned" detail="Sofia receives a notification and email." opacity={assignmentToast} />
    </Shell>
  );
}

function CountScene({ frame }: { frame: number }) {
  const local = frame - 232;
  const secondSaved = local > 50;
  const allSaved = local > 88;
  const saveToast = interpolate(local, [86, 96, 116, 126], [0, 1, 1, 0], clamp);
  const rows = [
    ["Gin Premium", "12", local > 26 ? "9" : "—", local > 26 ? "-3" : "Pending"],
    ["Tonic Water", "8", secondSaved ? "7" : "—", secondSaved ? "-1" : "Pending"],
    ["Lime Juice", "5 L", allSaved ? "4 L" : "—", allSaved ? "-1 L" : "Pending"],
  ];
  return (
    <Shell active="audits" title="Audit AUD-1-20260525-004">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22, opacity: appear(local, 5) }}>
        <div>
          <div style={{ ...font, fontSize: 25, fontWeight: 700, color: colors.text }}>Bar Stock Count</div>
          <div style={{ ...font, fontSize: 13, color: colors.muted, marginTop: 7 }}>Assigned to Sofia Ramirez · GoFlow Restaurant</div>
        </div>
        <Badge tone={allSaved ? "green" : "yellow"}>{allSaved ? "Ready to complete" : "In progress"}</Badge>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: colors.panelSoft, overflow: "hidden", marginBottom: 22 }}>
        <div style={{ height: "100%", width: `${interpolate(local, [15, 105], [12, 100], clamp)}%`, background: colors.blue, borderRadius: 999 }} />
      </div>
      <div style={{ border: `1px solid ${colors.border}`, borderRadius: 13, overflow: "hidden", background: colors.panel, opacity: appear(local, 15) }}>
        <div style={{ ...font, display: "grid", gridTemplateColumns: "1.3fr .75fr .75fr .8fr .9fr", padding: "14px 20px", background: colors.panelSoft, color: colors.muted, fontSize: 12 }}>
          <span>Product</span><span>Previous</span><span>Current</span><span>Difference</span><span>Action</span>
        </div>
        {rows.map((row, i) => {
          const rowSaved = i === 0 ? local > 26 : i === 1 ? secondSaved : allSaved;
          return (
            <div key={row[0]} style={{ ...font, display: "grid", gridTemplateColumns: "1.3fr .75fr .75fr .8fr .9fr", alignItems: "center", padding: "19px 20px", borderTop: `1px solid ${colors.border}`, color: colors.text, fontSize: 14 }}>
              <span style={{ fontWeight: 630 }}>{row[0]}</span>
              <span style={{ color: colors.muted }}>{row[1]}</span>
              <span style={{ border: `1px solid ${rowSaved ? colors.blue : colors.border}`, borderRadius: 7, padding: "7px 11px", width: 58, color: rowSaved ? colors.text : colors.muted }}>{row[2]}</span>
              <span style={{ color: rowSaved ? "#f2cb63" : colors.muted }}>{row[3]}</span>
              <Badge tone={rowSaved ? "green" : "blue"}>{rowSaved ? "Saved" : "Save"}</Badge>
            </div>
          );
        })}
      </div>
      {allSaved ? <div style={{ ...font, position: "absolute", right: 28, bottom: 25, background: colors.blue, borderRadius: 9, color: "#fff", padding: "12px 20px", fontSize: 14, fontWeight: 650 }}>Complete Audit</div> : null}
      <Toast title="All rows saved" detail="Stock comparison is ready to complete." opacity={saveToast} />
    </Shell>
  );
}

function ReportsScene({ frame }: { frame: number }) {
  const local = frame - 362;
  const barWidth = interpolate(local, [18, 65], [0, 1], clamp);
  const exportToast = interpolate(local, [80, 91, 108, 119], [0, 1, 1, 0], clamp);
  return (
    <Shell active="reports" title="Reports">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: appear(local, 4) }}>
        <div>
          <div style={{ ...font, color: colors.text, fontWeight: 700, fontSize: 27 }}>Audit completed</div>
          <div style={{ ...font, color: colors.muted, fontSize: 14, marginTop: 6 }}>Bar · Updated stock snapshot · AUD-1-20260525-004</div>
        </div>
        <Badge tone="green">Export ready</Badge>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 13, margin: "25px 0 20px", opacity: appear(local, 14) }}>
        {[["Items counted", "15 / 15"], ["Total variance", "-4 units"], ["Compliance", "93%"]].map(([label, value]) => (
          <div key={label} style={{ border: `1px solid ${colors.border}`, borderRadius: 13, background: colors.panel, padding: 18 }}>
            <div style={{ ...font, fontSize: 12, color: colors.muted }}>{label}</div>
            <div style={{ ...font, fontSize: 27, fontWeight: 720, color: colors.text, marginTop: 8 }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 14, opacity: appear(local, 23) }}>
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 13, background: colors.panel, padding: 19 }}>
          <div style={{ ...font, color: colors.text, fontWeight: 650, fontSize: 15, marginBottom: 18 }}>Inventory discrepancy</div>
          {[
            ["Gin Premium", 78, "-3"],
            ["Tonic Water", 34, "-1"],
            ["Lime Juice", 16, "Reviewed"],
          ].map(([name, value, result]) => (
            <div key={String(name)} style={{ marginBottom: 17 }}>
              <div style={{ ...font, display: "flex", justifyContent: "space-between", fontSize: 12, color: colors.muted, marginBottom: 8 }}><span>{name}</span><span>{result}</span></div>
              <div style={{ height: 7, borderRadius: 999, background: colors.panelSoft }}><div style={{ height: "100%", width: `${Number(value) * barWidth}%`, background: colors.blue, borderRadius: 999 }} /></div>
            </div>
          ))}
        </div>
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: 13, background: colors.panel, padding: 19 }}>
          <div style={{ ...font, color: colors.text, fontWeight: 650, fontSize: 15 }}>Inventory updated</div>
          <div style={{ ...font, fontSize: 42, fontWeight: 760, color: "#47dd9d", marginTop: 22 }}>09:47</div>
          <div style={{ ...font, color: colors.muted, fontSize: 13, marginTop: 4 }}>New stock applied</div>
          <div style={{ ...font, marginTop: 29, background: colors.blue, color: "#fff", borderRadius: 9, padding: "12px 18px", textAlign: "center", fontWeight: 650, fontSize: 13 }}>Export CSV / PDF</div>
        </div>
      </div>
      <Toast title="Report exported" detail="Inventory snapshot updated successfully." opacity={exportToast} />
    </Shell>
  );
}

export function AuditNettWorkflowDemo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inventoryOpacity = sceneOpacity(frame, 0, 116);
  const assignOpacity = sceneOpacity(frame, 100, 248);
  const countOpacity = sceneOpacity(frame, 232, 378);
  const reportOpacity = interpolate(frame, [362, 379], [0, 1], { ...clamp, easing: ease });
  const endFade = interpolate(frame, [476, 492], [0, 1], { ...clamp, easing: ease });
  const story = frame < 100
    ? { step: "01", title: "Choose inventory", detail: "Bar inventory selected" }
    : frame < 232
      ? { step: "02", title: "Assign audit", detail: frame < 166 ? "Select responsible user" : "Sofia Ramirez notified" }
      : frame < 362
        ? { step: "03", title: "Count and save", detail: "Differences tracked" }
        : { step: "04", title: "Complete and report", detail: "Stock updated" };
  const cursor =
    frame < 100
      ? { x: interpolate(frame, [42, 82], [740, 1145], clamp), y: interpolate(frame, [42, 82], [315, 130], clamp), click: interpolate(frame, [75, 83, 92], [0, 1, 0], clamp) }
      : frame < 232
        ? { x: interpolate(frame, [124, 211], [648, 843], clamp), y: interpolate(frame, [124, 211], [274, 545], clamp), click: interpolate(frame, [205, 213, 221], [0, 1, 0], clamp) }
        : frame < 362
          ? { x: interpolate(frame, [248, 341], [733, 1070], clamp), y: interpolate(frame, [248, 341], [289, 588], clamp), click: interpolate(frame, [333, 341, 350], [0, 1, 0], clamp) }
          : { x: interpolate(frame, [403, 452], [1014, 1085], clamp), y: interpolate(frame, [403, 452], [357, 390], clamp), click: interpolate(frame, [437, 445, 454], [0, 1, 0], clamp) };

  return (
    <AbsoluteFill style={{ background: colors.canvas }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 5%, rgba(53,122,246,.22), transparent 34%),radial-gradient(circle at 10% 90%, rgba(118,36,70,.22), transparent 31%)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: inventoryOpacity }}><InventoryScene frame={frame} /></div>
      <div style={{ position: "absolute", inset: 0, opacity: assignOpacity }}><AssignScene frame={frame} /></div>
      <div style={{ position: "absolute", inset: 0, opacity: countOpacity }}><CountScene frame={frame} /></div>
      <div style={{ position: "absolute", inset: 0, opacity: reportOpacity }}><ReportsScene frame={frame} /></div>
      <Cursor {...cursor} />
      <div style={{ ...font, position: "absolute", left: 242, bottom: 42, zIndex: 32, display: "flex", alignItems: "center", gap: 12, border: `1px solid ${colors.border}`, borderRadius: 999, padding: "9px 14px 9px 10px", background: "rgba(9,13,22,.92)", opacity: interpolate(frame, [0, fps / 2], [0, 1], clamp) }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: colors.blue, fontSize: 11, color: "#fff", fontWeight: 700 }}>{story.step}</span>
        <span style={{ color: colors.text, fontSize: 12, fontWeight: 650 }}>{story.title}</span>
        <span style={{ color: colors.muted, fontSize: 12 }}>{story.detail}</span>
      </div>
      <div style={{ ...font, position: "absolute", right: 52, bottom: 18, color: colors.muted, fontSize: 11 }}>Illustrative demo data</div>
      <div style={{ position: "absolute", inset: 0, zIndex: 40, background: colors.canvas, opacity: endFade }} />
    </AbsoluteFill>
  );
}
