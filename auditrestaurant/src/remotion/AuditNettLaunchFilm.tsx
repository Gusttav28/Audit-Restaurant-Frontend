import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AuditNettWorkflowDemo } from "./AuditNettWorkflowDemo";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const theme = {
  background: "#05070d",
  panel: "#0d1422",
  panelRaised: "#121d30",
  border: "#202f46",
  white: "#f5f7fb",
  muted: "#90a0b8",
  blue: "#337cf5",
  blueGlow: "rgba(51,124,245,0.28)",
  wine: "#7d284b",
  green: "#31d18b",
};

const font: CSSProperties = {
  fontFamily: "Inter, Arial, sans-serif",
  letterSpacing: 0,
};

function fadeUp(frame: number, start: number, duration = 22) {
  const progress = interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: ease,
  });
  return {
    opacity: progress,
    transform: `translateY(${(1 - progress) * 30}px)`,
  };
}

function exit(frame: number, start: number, duration = 16) {
  return interpolate(frame, [start, start + duration], [1, 0], {
    ...clamp,
    easing: ease,
  });
}

function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 12 : 17 }}>
      <div style={{ height: compact ? 42 : 58, width: compact ? 42 : 58, overflow: "hidden", borderRadius: compact ? 12 : 16 }}>
        <Img
          src={staticFile("audit-flowicon-dark.png")}
          style={{ height: compact ? 49 : 68, width: compact ? 49 : 68, marginLeft: compact ? -3.5 : -5, marginTop: compact ? -3.5 : -5, objectFit: "cover" }}
        />
      </div>
      <span style={{ ...font, color: theme.white, fontSize: compact ? 25 : 40, fontWeight: 740 }}>AuditNett</span>
    </div>
  );
}

function Halo() {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 42%, rgba(51,124,245,.18), transparent 34%), radial-gradient(circle at 82% 16%, rgba(125,40,75,.17), transparent 30%)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(54,71,96,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(54,71,96,.08) 1px, transparent 1px)", backgroundSize: "72px 72px", maskImage: "radial-gradient(circle at center, black 15%, transparent 72%)" }} />
    </>
  );
}

function IntroScene() {
  const frame = useCurrentFrame();
  const sceneOut = exit(frame, 82);
  const lineWidth = interpolate(frame, [18, 53], [0, 460], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ opacity: sceneOut }}>
      <Halo />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={fadeUp(frame, 4)}><LogoLockup /></div>
        <div style={{ ...fadeUp(frame, 22), ...font, marginTop: 36, color: theme.muted, fontSize: 20, fontWeight: 520, textTransform: "uppercase" }}>
          Inventory audit operations
        </div>
        <div style={{ height: 2, width: lineWidth, marginTop: 23, background: `linear-gradient(90deg, transparent, ${theme.blue}, transparent)` }} />
      </div>
    </AbsoluteFill>
  );
}

function Capability({ title, detail, index }: { title: string; detail: string; index: number }) {
  const frame = useCurrentFrame();
  const reveal = fadeUp(frame, 32 + index * 9, 20);
  return (
    <div
      style={{
        ...reveal,
        ...font,
        flex: 1,
        minHeight: 112,
        padding: "21px 22px",
        borderRadius: 16,
        border: `1px solid ${theme.border}`,
        background: "rgba(13,20,34,.82)",
      }}
    >
      <div style={{ width: 28, height: 3, borderRadius: 99, background: index % 2 ? theme.wine : theme.blue, marginBottom: 17 }} />
      <div style={{ color: theme.white, fontSize: 18, fontWeight: 650 }}>{title}</div>
      <div style={{ color: theme.muted, fontSize: 14, marginTop: 9 }}>{detail}</div>
    </div>
  );
}

function PromiseScene() {
  const frame = useCurrentFrame();
  const sceneOut = exit(frame, 105);
  return (
    <AbsoluteFill style={{ opacity: sceneOut, padding: "86px 92px" }}>
      <Halo />
      <div style={{ ...fadeUp(frame, 5), ...font, color: theme.blue, fontSize: 17, fontWeight: 650 }}>CONNECTED OPERATIONS</div>
      <div style={{ ...fadeUp(frame, 12), ...font, color: theme.white, marginTop: 22, fontSize: 62, fontWeight: 740, lineHeight: 1.08 }}>
        Every inventory audit.
        <br />
        One accountable flow.
      </div>
      <div style={{ ...fadeUp(frame, 25), ...font, marginTop: 22, color: theme.muted, width: 720, lineHeight: 1.6, fontSize: 20 }}>
        Assign work, capture counts, resolve variance, and turn every completed audit into a reliable stock update.
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 51 }}>
        <Capability title="Multi-restaurant" detail="Scoped inventories" index={0} />
        <Capability title="Assigned tasks" detail="Right user, right work" index={1} />
        <Capability title="Audit reports" detail="Ready to export" index={2} />
      </div>
    </AbsoluteFill>
  );
}

function WorkflowFrame() {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 24], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <Halo />
      <div style={{ position: "absolute", top: 38, left: 52, right: 52, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: reveal }}>
        <LogoLockup compact />
        <div style={{ ...font, display: "flex", alignItems: "center", gap: 13, borderRadius: 999, border: `1px solid ${theme.border}`, padding: "11px 18px", color: theme.muted, fontSize: 14, background: "rgba(13,20,34,.85)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: theme.green, boxShadow: `0 0 18px ${theme.green}` }} />
          Product walkthrough
        </div>
      </div>
      <div style={{ ...font, position: "absolute", left: 52, top: 111, color: theme.white, fontSize: 39, fontWeight: 720, opacity: reveal }}>
        Create. Assign. Audit. Report.
      </div>
      <div style={{ ...font, position: "absolute", left: 52, top: 162, color: theme.muted, fontSize: 16, opacity: reveal }}>
        A connected audit process for modern restaurant operations.
      </div>
      <div
        style={{
          position: "absolute",
          left: 52,
          right: 52,
          top: 190,
          bottom: 25,
          borderRadius: 20,
          overflow: "hidden",
          border: `1px solid ${theme.border}`,
          boxShadow: `0 30px 90px ${theme.blueGlow}`,
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 20}px)`,
        }}
      >
        <div style={{ position: "absolute", left: 127, top: 0, transform: "scale(0.72)", transformOrigin: "top left", width: 1280, height: 720 }}>
          <AuditNettWorkflowDemo />
        </div>
      </div>
    </AbsoluteFill>
  );
}

function FinalScene() {
  const frame = useCurrentFrame();
  const button = fadeUp(frame, 40, 20);
  return (
    <AbsoluteFill style={{ background: theme.background }}>
      <Halo />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div style={fadeUp(frame, 6)}><LogoLockup /></div>
        <div style={{ ...fadeUp(frame, 18), ...font, marginTop: 38, textAlign: "center", color: theme.white, fontSize: 58, lineHeight: 1.12, fontWeight: 730 }}>
          Make every count
          <br />
          traceable.
        </div>
        <div style={{ ...fadeUp(frame, 29), ...font, color: theme.muted, fontSize: 21, marginTop: 22 }}>
          Inventory audits built for restaurant teams.
        </div>
        <div
          style={{
            ...button,
            ...font,
            marginTop: 44,
            padding: "17px 34px",
            borderRadius: 12,
            background: theme.blue,
            boxShadow: `0 14px 44px ${theme.blueGlow}`,
            color: "#fff",
            fontSize: 18,
            fontWeight: 650,
          }}
        >
          Start your workspace at auditnett.com
        </div>
      </div>
    </AbsoluteFill>
  );
}

function MarketingSequence({ children, from, duration }: { children: ReactNode; from: number; duration: number }) {
  return (
    <Sequence from={from} durationInFrames={duration} premountFor={30}>
      {children}
    </Sequence>
  );
}

export function AuditNettLaunchFilm() {
  return (
    <AbsoluteFill style={{ background: theme.background }}>
      <MarketingSequence from={0} duration={96}><IntroScene /></MarketingSequence>
      <MarketingSequence from={78} duration={124}><PromiseScene /></MarketingSequence>
      <MarketingSequence from={184} duration={510}><WorkflowFrame /></MarketingSequence>
      <MarketingSequence from={670} duration={126}><FinalScene /></MarketingSequence>
    </AbsoluteFill>
  );
}
