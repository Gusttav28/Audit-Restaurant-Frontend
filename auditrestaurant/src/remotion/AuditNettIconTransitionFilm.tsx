import type {CSSProperties, ReactNode} from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BarChart3,
  Bell,
  Check,
  ClipboardCheck,
  Clock,
  Eye,
  FileText,
  Package,
  Play,
  Plus,
  Save,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const snap = Easing.bezier(0.74, 0, 0.18, 1);

const theme = {
  paper: "#f2f4f7",
  paperDeep: "#dde3eb",
  ink: "#101723",
  muted: "#697386",
  blue: "#2f73f6",
  blueSoft: "rgba(47,115,246,0.15)",
  wine: "#7d284b",
  green: "#20b879",
  line: "rgba(16, 23, 35, 0.14)",
  card: "rgba(255,255,255,0.86)",
};

const font: CSSProperties = {
  fontFamily: "Inter, Arial, sans-serif",
  letterSpacing: 0,
};

function inOut(frame: number, start: number, end: number, fade = 18) {
  return interpolate(frame, [start, start + fade, end - fade, end], [0, 1, 1, 0], {
    ...clamp,
    easing: ease,
  });
}

function pop(frame: number, start: number, duration = 24) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: ease,
  });
}

function SoftField({dim = 0}: {dim?: number}) {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 2880], [-80, 80], clamp);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 44%, #ffffff 0%, #eef1f5 36%, #dce3ec 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -120,
          background:
            "radial-gradient(circle at 32% 35%, rgba(255,255,255,.86), transparent 22%), radial-gradient(circle at 72% 70%, rgba(47,115,246,.08), transparent 28%)",
          transform: `translateX(${drift}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.22,
          backgroundImage:
            "linear-gradient(rgba(16,23,35,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,23,35,.04) 1px, transparent 1px)",
          backgroundSize: "78px 78px",
          maskImage: "radial-gradient(circle at center, black 0%, transparent 68%)",
        }}
      />
      {dim ? <div style={{position: "absolute", inset: 0, background: `rgba(255,255,255,${dim})`}} /> : null}
    </AbsoluteFill>
  );
}

function LogoMark({size = 92}: {size?: number}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.24,
        overflow: "hidden",
        boxShadow: "0 18px 45px rgba(16,23,35,.12)",
      }}
    >
      <Img
        src={staticFile("audit-flowicon-dark.png")}
        style={{
          width: size * 1.18,
          height: size * 1.18,
          marginLeft: size * -0.09,
          marginTop: size * -0.09,
          objectFit: "cover",
        }}
      />
    </div>
  );
}

function CenterIcon({
  icon,
  color,
  ring = true,
}: {
  icon: ReactNode;
  color: string;
  ring?: boolean;
}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({
    frame,
    fps,
    config: {damping: 16, stiffness: 118, mass: 0.68},
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 116,
        height: 116,
        marginLeft: -58,
        marginTop: -58,
        borderRadius: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        background: ring ? "rgba(255,255,255,.34)" : "transparent",
        border: ring ? `4px solid ${color}` : "none",
        transform: `scale(${0.64 + scale * 0.36})`,
        boxShadow: ring ? `0 22px 65px ${color}24` : "none",
      }}
    >
      {icon}
    </div>
  );
}

function IconBeat({
  from,
  duration,
  icon,
  color,
}: {
  from: number;
  duration: number;
  icon: ReactNode;
  color: string;
}) {
  const frame = useCurrentFrame();
  const local = frame - from;
  const opacity = inOut(frame, from, from + duration, 10);
  const halo = interpolate(local, [0, duration], [0.92, 1.18], clamp);

  return (
    <Sequence from={from} durationInFrames={duration}>
      <AbsoluteFill style={{opacity}}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 360,
            height: 360,
            marginLeft: -180,
            marginTop: -180,
            borderRadius: 180,
            background: `radial-gradient(circle, ${color}18, transparent 64%)`,
            transform: `scale(${halo})`,
          }}
        />
        <CenterIcon icon={icon} color={color} />
      </AbsoluteFill>
    </Sequence>
  );
}

function IntroMarks() {
  return (
    <AbsoluteFill>
      <IconBeat from={0} duration={48} icon={<Package size={54} strokeWidth={2.7} />} color={theme.wine} />
      <IconBeat from={38} duration={48} icon={<ClipboardCheck size={56} strokeWidth={2.7} />} color={theme.blue} />
      <IconBeat from={76} duration={48} icon={<Users size={56} strokeWidth={2.6} />} color={theme.green} />
      <IconBeat from={114} duration={50} icon={<BarChart3 size={56} strokeWidth={2.7} />} color={theme.ink} />
    </AbsoluteFill>
  );
}

function AStrokeAssembly() {
  const frame = useCurrentFrame();
  const draw = pop(frame, 0, 22);
  const assemble = interpolate(frame, [32, 86], [0, 1], {...clamp, easing: ease});
  const logoReveal = pop(frame, 78, 30);
  const strokesFade = interpolate(frame, [94, 122], [1, 0], clamp);
  const exit = interpolate(frame, [118, 132], [1, 0], clamp);
  const strokes = [
    {
      key: "left-leg-top",
      color: theme.blue,
      burst: {x: -170, y: -82, angle: 30},
      final: {x: -58, y: -30, angle: -62, width: 124},
    },
    {
      key: "left-leg-base",
      color: theme.ink,
      burst: {x: -156, y: 98, angle: -30},
      final: {x: -92, y: 46, angle: -62, width: 110},
    },
    {
      key: "right-leg-top",
      color: theme.blue,
      burst: {x: 122, y: -82, angle: -30},
      final: {x: 26, y: -30, angle: 62, width: 124},
    },
    {
      key: "right-leg-base",
      color: theme.ink,
      burst: {x: 116, y: 92, angle: 30},
      final: {x: 52, y: 46, angle: 62, width: 110},
    },
    {
      key: "crossbar-left",
      color: theme.blue,
      burst: {x: -8, y: 134, angle: 90},
      final: {x: -54, y: 42, angle: 0, width: 84},
    },
    {
      key: "apex",
      color: theme.ink,
      burst: {x: -8, y: -168, angle: 88},
      final: {x: -8, y: -86, angle: 90, width: 58},
    },
  ];

  return (
    <AbsoluteFill style={{opacity: exit}}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 342,
          height: 342,
          marginLeft: -171,
          marginTop: -171,
          borderRadius: 171,
          background: `radial-gradient(circle, ${theme.blueSoft}, transparent 68%)`,
          opacity: interpolate(frame, [0, 44, 112], [0, 1, 0.25], clamp),
          transform: `scale(${interpolate(frame, [0, 116], [0.92, 1.12], clamp)})`,
        }}
      />
      {strokes.map((stroke, index) => {
        const x = interpolate(assemble, [0, 1], [stroke.burst.x, stroke.final.x], clamp);
        const y = interpolate(assemble, [0, 1], [stroke.burst.y, stroke.final.y], clamp);
        const angle = interpolate(assemble, [0, 1], [stroke.burst.angle, stroke.final.angle], clamp);
        const width = interpolate(assemble, [0, 1], [94, stroke.final.width], clamp);
        const delay = index * 2;
        const strokeDraw = interpolate(frame, [delay, delay + 22], [0, 1], {...clamp, easing: ease});

        return (
          <div
            key={stroke.key}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: width * draw * strokeDraw,
              height: interpolate(assemble, [0, 1], [6, 10], clamp),
              borderRadius: 99,
              background: stroke.color,
              transformOrigin: "50% 50%",
              transform: `translate(${x}px, ${y}px) rotate(${angle}deg) translateX(-50%)`,
              opacity: strokesFade,
              boxShadow: `0 0 ${interpolate(assemble, [0, 1], [0, 16], clamp)}px ${stroke.color}45`,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 178,
          height: 178,
          marginLeft: -89,
          marginTop: -89,
          borderRadius: 44,
          background: "rgba(255,255,255,.78)",
          border: `1px solid ${theme.line}`,
          boxShadow: "0 30px 88px rgba(16,23,35,.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: logoReveal,
          transform: `scale(${0.76 + logoReveal * 0.24})`,
        }}
      >
        <LogoMark size={116} />
      </div>
    </AbsoluteFill>
  );
}

function ClassicLineBurst() {
  const frame = useCurrentFrame();
  const draw = pop(frame, 0, 26);
  const spin = interpolate(frame, [0, 76], [0, 95], clamp);
  const fade = interpolate(frame, [64, 88], [1, 0], clamp);

  return (
    <AbsoluteFill style={{opacity: fade}}>
      {[0, 60, 120, 180, 240, 300].map((angle, index) => {
        const length = 112 + (index % 2) * 18;
        return (
          <div
            key={angle}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: length * draw,
              height: 6,
              borderRadius: 99,
              background: index % 2 ? theme.blue : theme.ink,
              transformOrigin: "0 50%",
              transform: `rotate(${angle + spin}deg) translateX(70px)`,
              opacity: 0.82,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

function ComponentCard({
  icon,
  title,
  value,
  x,
  y,
  delay,
  color,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  x: number;
  y: number;
  delay: number;
  color: string;
}) {
  const frame = useCurrentFrame();
  const reveal = pop(frame, delay, 22);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 252,
        height: 118,
        borderRadius: 18,
        background: theme.card,
        border: `1px solid ${theme.line}`,
        boxShadow: "0 24px 70px rgba(16,23,35,.12)",
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 32}px) scale(${0.96 + reveal * 0.04})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 18,
          width: 38,
          height: 38,
          borderRadius: 12,
          background: `${color}18`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{...font, position: "absolute", left: 72, top: 21, color: theme.muted, fontSize: 13, fontWeight: 650}}>
        {title}
      </div>
      <div style={{...font, position: "absolute", left: 72, top: 50, color: theme.ink, fontSize: 25, fontWeight: 760}}>
        {value}
      </div>
      <div style={{position: "absolute", left: 18, right: 18, bottom: 16, height: 5, borderRadius: 99, background: "rgba(16,23,35,.08)"}}>
        <div
          style={{
            height: "100%",
            width: `${interpolate(reveal, [0, 1], [0, 72 + (delay % 4) * 7], clamp)}%`,
            borderRadius: 99,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

function ComponentsOrbit() {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [0, 108], [-740, 740], clamp);
  const logo = pop(frame, 48, 28);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 214,
          width: 1280,
          height: 3,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,.95), transparent)",
          transform: `translateX(${sweep}px)`,
          boxShadow: "0 0 22px rgba(255,255,255,.9)",
        }}
      />
      <ComponentCard icon={<Package size={22} />} title="Inventory" value="247 items" x={112} y={126} delay={8} color={theme.wine} />
      <ComponentCard icon={<ClipboardCheck size={22} />} title="Audits" value="98% sync" x={382} y={294} delay={22} color={theme.blue} />
      <ComponentCard icon={<Users size={22} />} title="Team" value="12 users" x={694} y={126} delay={36} color={theme.green} />
      <ComponentCard icon={<TrendingUp size={22} />} title="Reports" value="+18%" x={934} y={306} delay={50} color={theme.ink} />
      <div
        style={{
          position: "absolute",
          left: 548,
          top: 176,
          width: 184,
          height: 184,
          borderRadius: 48,
          background: "rgba(255,255,255,.78)",
          border: `1px solid ${theme.line}`,
          boxShadow: "0 32px 90px rgba(16,23,35,.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: logo,
          transform: `scale(${0.7 + logo * 0.3})`,
        }}
      >
        <LogoMark size={112} />
      </div>
    </AbsoluteFill>
  );
}

function MiniSidebar({active}: {active: "inventory" | "audits" | "reports"}) {
  const nav = [
    ["Inventory", <Package size={15} />, "inventory"],
    ["Audits", <ClipboardCheck size={15} />, "audits"],
    ["Reports", <FileText size={15} />, "reports"],
    ["Settings", <Settings size={15} />, "settings"],
  ] as const;

  return (
    <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 176, background: "#101723", color: "#fff"}}>
      <div style={{display: "flex", alignItems: "center", gap: 10, height: 60, padding: "0 18px", borderBottom: "1px solid rgba(255,255,255,.08)"}}>
        <LogoMark size={34} />
        <span style={{...font, fontSize: 18, fontWeight: 760}}>AuditNett</span>
      </div>
      <div style={{padding: "16px 10px"}}>
        {nav.map(([label, icon, key]) => (
          <div
            key={label}
            style={{
              ...font,
              height: 42,
              borderRadius: 11,
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "0 13px",
              marginBottom: 8,
              color: key === active ? "#fff" : "rgba(255,255,255,.56)",
              background: key === active ? theme.blue : "transparent",
              fontSize: 13,
              fontWeight: 650,
            }}
          >
            {icon}
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniShell({active, title, children}: {active: "inventory" | "audits" | "reports"; title: string; children: ReactNode}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 126,
        right: 126,
        top: 80,
        bottom: 74,
        borderRadius: 26,
        background: "#f8fafc",
        border: "1px solid rgba(16,23,35,.12)",
        overflow: "hidden",
        boxShadow: "0 36px 110px rgba(16,23,35,.2)",
      }}
    >
      <MiniSidebar active={active} />
      <div style={{position: "absolute", left: 176, right: 0, top: 0, height: 60, background: "#fff", borderBottom: "1px solid rgba(16,23,35,.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px"}}>
        <div>
          <div style={{...font, color: theme.muted, fontSize: 11}}>GoFlow Restaurant</div>
          <div style={{...font, color: theme.ink, fontSize: 16, fontWeight: 740, marginTop: 2}}>{title}</div>
        </div>
        <div style={{display: "flex", gap: 10, alignItems: "center", color: theme.ink}}>
          <Bell size={17} />
          <div style={{...font, width: 34, height: 34, borderRadius: 17, background: theme.wine, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 760}}>AA</div>
        </div>
      </div>
      <div style={{position: "absolute", left: 176, right: 0, top: 60, bottom: 0, padding: 26}}>{children}</div>
    </div>
  );
}

function ProductScene() {
  const frame = useCurrentFrame();
  const tab = frame < 96 ? "inventory" : frame < 188 ? "audits" : "reports";
  const slide = interpolate(frame, [0, 26], [54, 0], {...clamp, easing: ease});
  const fade = pop(frame, 0, 24);

  return (
    <AbsoluteFill style={{opacity: fade, transform: `translateY(${slide}px)`}}>
      {tab === "inventory" ? (
        <MiniShell active="inventory" title="Inventory">
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <div>
              <div style={{...font, color: theme.ink, fontSize: 27, fontWeight: 780}}>Bar Inventory</div>
              <div style={{...font, color: theme.muted, fontSize: 13, marginTop: 8}}>15 products - synced today</div>
            </div>
            <div style={{...font, display: "flex", alignItems: "center", gap: 8, background: theme.blue, color: "#fff", borderRadius: 11, padding: "12px 16px", fontSize: 13, fontWeight: 720}}>
              <Plus size={16} /> New Audit
            </div>
          </div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 22}}>
            {[["Total items", "247"], ["Inventory value", "CRC 422K"], ["Audits ready", "3"]].map(([label, value]) => (
              <div key={label} style={{background: "#fff", border: `1px solid ${theme.line}`, borderRadius: 14, padding: 17}}>
                <div style={{...font, color: theme.muted, fontSize: 12}}>{label}</div>
                <div style={{...font, color: theme.ink, fontSize: 27, fontWeight: 780, marginTop: 8}}>{value}</div>
              </div>
            ))}
          </div>
          <DataRows delay={18} />
        </MiniShell>
      ) : tab === "audits" ? (
        <MiniShell active="audits" title="Audits">
          <div style={{...font, color: theme.ink, fontSize: 27, fontWeight: 780}}>Create New Audit</div>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24}}>
            {[["Restaurant", "GoFlow Restaurant"], ["Inventory", "Bar"], ["Auditor", "Sofia Ramirez"], ["Due date", "2026-06-18"]].map(([label, value], index) => (
              <div key={label} style={{background: "#fff", border: `1px solid ${index === 2 ? theme.blue : theme.line}`, borderRadius: 13, padding: 16}}>
                <div style={{...font, color: theme.muted, fontSize: 12}}>{label}</div>
                <div style={{...font, color: theme.ink, fontSize: 15, fontWeight: 700, marginTop: 8}}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{position: "absolute", right: 26, bottom: 26, display: "flex", alignItems: "center", gap: 9, background: theme.green, color: "#fff", borderRadius: 12, padding: "13px 18px", ...font, fontWeight: 740}}>
            <Check size={17} /> Audit assigned
          </div>
        </MiniShell>
      ) : (
        <MiniShell active="reports" title="Reports">
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <div>
              <div style={{...font, color: theme.ink, fontSize: 27, fontWeight: 780}}>Audit Completed</div>
              <div style={{...font, color: theme.muted, fontSize: 13, marginTop: 8}}>Stock snapshot updated</div>
            </div>
            <div style={{...font, color: theme.green, fontWeight: 780, display: "flex", gap: 8, alignItems: "center"}}><Save size={18} /> Export ready</div>
          </div>
          <div style={{display: "grid", gridTemplateColumns: "1.35fr .65fr", gap: 15, marginTop: 28}}>
            <div style={{background: "#fff", border: `1px solid ${theme.line}`, borderRadius: 15, padding: 20}}>
              <div style={{...font, color: theme.ink, fontWeight: 760, marginBottom: 20}}>Inventory discrepancy</div>
              {["Gin Premium", "Tonic Water", "Lime Juice"].map((item, index) => (
                <div key={item} style={{marginBottom: 18}}>
                  <div style={{...font, display: "flex", justifyContent: "space-between", color: theme.muted, fontSize: 12, marginBottom: 8}}><span>{item}</span><span>{index === 2 ? "Reviewed" : `-${index + 1}`}</span></div>
                  <div style={{height: 8, borderRadius: 99, background: "#edf1f5"}}><div style={{height: "100%", width: `${76 - index * 20}%`, borderRadius: 99, background: theme.blue}} /></div>
                </div>
              ))}
            </div>
            <div style={{background: "#fff", border: `1px solid ${theme.line}`, borderRadius: 15, padding: 20}}>
              <Clock size={24} color={theme.blue} />
              <div style={{...font, color: theme.ink, fontSize: 36, fontWeight: 820, marginTop: 22}}>09:47</div>
              <div style={{...font, color: theme.muted, fontSize: 13, marginTop: 8}}>Inventory updated</div>
            </div>
          </div>
        </MiniShell>
      )}
    </AbsoluteFill>
  );
}

function DataRows({delay}: {delay: number}) {
  const frame = useCurrentFrame();
  const rows = [
    ["Gin Premium", "Spirits", "12 bottles", "CRC 144K"],
    ["Tonic Water", "Mixers", "8 units", "CRC 9.6K"],
    ["Lime Juice", "Fresh", "5 L", "CRC 16.5K"],
  ];
  return (
    <div style={{background: "#fff", border: `1px solid ${theme.line}`, borderRadius: 15, marginTop: 18, overflow: "hidden"}}>
      <div style={{...font, display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr", padding: "13px 18px", color: theme.muted, fontSize: 12, background: "#f3f6fa"}}>
        <span>Product</span><span>Category</span><span>Current stock</span><span>Value</span>
      </div>
      {rows.map((row, index) => {
        const reveal = pop(frame, delay + index * 7, 16);
        return (
          <div key={row[0]} style={{...font, display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr", padding: "15px 18px", borderTop: `1px solid ${theme.line}`, color: theme.ink, fontSize: 13, opacity: reveal, transform: `translateX(${(1 - reveal) * 22}px)`}}>
            <span style={{fontWeight: 720}}>{row[0]}</span><span style={{color: theme.muted}}>{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span>
          </div>
        );
      })}
    </div>
  );
}

function ClosingLogo() {
  const frame = useCurrentFrame();
  const reveal = pop(frame, 0, 30);
  const line = interpolate(frame, [24, 64], [0, 420], {...clamp, easing: snap});

  return (
    <AbsoluteFill>
      <div style={{position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 42%, rgba(47,115,246,.12), transparent 36%)"}} />
      <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: reveal, transform: `scale(${0.94 + reveal * 0.06})`}}>
        <LogoMark size={118} />
        <div style={{...font, color: theme.ink, fontSize: 48, fontWeight: 820, marginTop: 28}}>AuditNett</div>
        <div style={{...font, color: theme.muted, fontSize: 18, fontWeight: 620, marginTop: 12}}>Create. Count. Audit. Grow.</div>
        <div style={{height: 3, width: line, borderRadius: 99, marginTop: 30, background: `linear-gradient(90deg, transparent, ${theme.blue}, transparent)`}} />
      </div>
    </AbsoluteFill>
  );
}

function FilmSequence({from, duration, children}: {from: number; duration: number; children: ReactNode}) {
  return (
    <Sequence from={from} durationInFrames={duration} premountFor={24}>
      {children}
    </Sequence>
  );
}

export function AuditNettIconTransitionFilm() {
  const frame = useCurrentFrame();
  const wipe1 = interpolate(frame, [154, 178], [-1280, 1280], {...clamp, easing: snap});
  const wipe2 = interpolate(frame, [554, 582], [-1280, 1280], {...clamp, easing: snap});

  return (
    <AbsoluteFill style={{background: theme.paper}}>
      <SoftField />
      <FilmSequence from={0} duration={170}>
        <IntroMarks />
      </FilmSequence>
      <FilmSequence from={154} duration={132}>
        <AStrokeAssembly />
      </FilmSequence>
      <FilmSequence from={270} duration={150}>
        <ComponentsOrbit />
      </FilmSequence>
      <FilmSequence from={406} duration={250}>
        <ProductScene />
      </FilmSequence>
      <FilmSequence from={630} duration={150}>
        <ClosingLogo />
      </FilmSequence>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 1280,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,.94), transparent)",
          transform: `translateX(${wipe1}px) skewX(-16deg)`,
          opacity: interpolate(frame, [154, 168, 178], [0, 1, 0], clamp),
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 1280,
          background: "linear-gradient(90deg, transparent, rgba(16,23,35,.18), transparent)",
          transform: `translateX(${wipe2}px) skewX(-16deg)`,
          opacity: interpolate(frame, [554, 568, 582], [0, 1, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
}

export function AuditNettIconTransitionFilmBeforeA() {
  const frame = useCurrentFrame();
  const wipe1 = interpolate(frame, [154, 178], [-1280, 1280], {...clamp, easing: snap});
  const wipe2 = interpolate(frame, [494, 522], [-1280, 1280], {...clamp, easing: snap});

  return (
    <AbsoluteFill style={{background: theme.paper}}>
      <SoftField />
      <FilmSequence from={0} duration={170}>
        <IntroMarks />
      </FilmSequence>
      <FilmSequence from={154} duration={92}>
        <ClassicLineBurst />
      </FilmSequence>
      <FilmSequence from={210} duration={150}>
        <ComponentsOrbit />
      </FilmSequence>
      <FilmSequence from={346} duration={250}>
        <ProductScene />
      </FilmSequence>
      <FilmSequence from={570} duration={150}>
        <ClosingLogo />
      </FilmSequence>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 1280,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,.94), transparent)",
          transform: `translateX(${wipe1}px) skewX(-16deg)`,
          opacity: interpolate(frame, [154, 168, 178], [0, 1, 0], clamp),
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 1280,
          background: "linear-gradient(90deg, transparent, rgba(16,23,35,.18), transparent)",
          transform: `translateX(${wipe2}px) skewX(-16deg)`,
          opacity: interpolate(frame, [494, 508, 522], [0, 1, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
}
