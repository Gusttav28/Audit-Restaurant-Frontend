import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const sharpEase = Easing.bezier(0.7, 0, 0.2, 1);

const steps = [
  {
    title: "Create restaurants",
    detail: "Open workspaces for every location",
    metric: "3 sites",
    start: 128,
  },
  {
    title: "Manage inventory",
    detail: "Track stock, counts, and categories",
    metric: "247 items",
    start: 166,
  },
  {
    title: "Run audits",
    detail: "Review tasks, evidence, and comments",
    metric: "98% sync",
    start: 204,
  },
  {
    title: "Insights & growth",
    detail: "See trends before they become costs",
    metric: "+18%",
    start: 242,
  },
];

const StepCard = ({
  title,
  detail,
  metric,
  start,
  index,
}: {
  title: string;
  detail: string;
  metric: string;
  start: number;
  index: number;
}) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [start, start + 22], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const active = interpolate(frame, [start + 8, start + 22, start + 52], [0, 1, 0.34], clamp);
  const fill = interpolate(frame, [start + 8, start + 46], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 86 + index * 162,
        width: 828,
        height: 132,
        borderRadius: 34,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(239,245,255,0.78))",
        border: "1px solid rgba(15, 44, 92, 0.12)",
        boxShadow: `0 ${20 + active * 18}px ${70 + active * 42}px rgba(3, 16, 44, ${0.1 + active * 0.11})`,
        opacity: appear,
        transform: `translateX(${interpolate(appear, [0, 1], [68, 0], clamp)}px) scale(${interpolate(
          appear,
          [0, 1],
          [0.96, 1],
          clamp,
        )})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 28,
          width: 76,
          height: 76,
          borderRadius: 24,
          background: "linear-gradient(135deg, #061936, #1e5fff)",
          transform: `scale(${1 + active * 0.08})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 34,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: 0,
          }}
        >
          {index + 1}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 132,
          top: 24,
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 34,
          fontWeight: 850,
          color: "#061936",
          letterSpacing: 0,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: "absolute",
          left: 132,
          top: 72,
          width: 440,
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 21,
          fontWeight: 650,
          color: "rgba(6, 25, 54, 0.58)",
          letterSpacing: 0,
          lineHeight: 1.15,
        }}
      >
        {detail}
      </div>
      <div
        style={{
          position: "absolute",
          right: 32,
          top: 31,
          width: 150,
          height: 54,
          borderRadius: 999,
          background: active > 0.6 ? "#061936" : "rgba(6,25,54,0.06)",
          color: active > 0.6 ? "#ffffff" : "#061936",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 22,
          fontWeight: 850,
          letterSpacing: 0,
        }}
      >
        {metric}
      </div>
      <div
        style={{
          position: "absolute",
          left: 132,
          right: 32,
          bottom: 20,
          height: 7,
          borderRadius: 999,
          background: "rgba(6, 25, 54, 0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${fill * 100}%`,
            height: "100%",
            borderRadius: 999,
            background: "linear-gradient(90deg, #061936, #1e5fff)",
          }}
        />
      </div>
    </div>
  );
};

const FloatingStat = ({
  label,
  value,
  left,
  top,
  delay,
  exit,
}: {
  label: string;
  value: string;
  left: number;
  top: number;
  delay: number;
  exit: number;
}) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [delay, delay + 24], [0, 1], { ...clamp, easing: ease });
  const fade = interpolate(frame, [exit, exit + 18], [1, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 214,
        height: 142,
        borderRadius: 30,
        background: "rgba(255, 255, 255, 0.86)",
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 28px 80px rgba(3, 16, 44, 0.18)",
        opacity: appear * fade,
        transform: `translateY(${interpolate(appear, [0, 1], [34, 0], clamp)}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 24,
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 32,
          fontWeight: 900,
          color: "#061936",
          letterSpacing: 0,
        }}
      >
        {value}
      </div>
      <div
        style={{
          position: "absolute",
          left: 24,
          bottom: 24,
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 18,
          fontWeight: 750,
          color: "rgba(6, 25, 54, 0.56)",
          letterSpacing: 0,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const AuditFlowLoading = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nameIn = spring({
    frame,
    fps,
    config: { damping: 19, stiffness: 72, mass: 0.9 },
  });
  const nameExit = interpolate(frame, [1.8 * fps, 2.45 * fps], [0, 1], {
    ...clamp,
    easing: sharpEase,
  });
  const logoStage = interpolate(frame, [2.12 * fps, 3.05 * fps], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const darkLogo = interpolate(frame, [3.35 * fps, 4.18 * fps], [0, 1], {
    ...clamp,
    easing: sharpEase,
  });
  const walkthroughReveal = interpolate(frame, [3.95 * fps, 4.85 * fps], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const walkthroughExit = interpolate(frame, [9.25 * fps, 10.05 * fps], [0, 1], {
    ...clamp,
    easing: sharpEase,
  });
  const finalReveal = interpolate(frame, [9.7 * fps, 10.75 * fps], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const finalHold = interpolate(frame, [11.3 * fps, 12 * fps], [1, 0.94], clamp);
  const sweep = interpolate(frame, [0.2 * fps, 11.6 * fps], [-920, 1280], clamp);
  const cursorY = interpolate(frame, [4.35 * fps, 8.4 * fps], [1030, 1518], clamp);
  const cursorX = interpolate(frame, [4.35 * fps, 8.4 * fps], [836, 760], clamp);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 24%, rgba(30, 95, 255, 0.18), transparent 32%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 48%, #ffffff 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(120deg, transparent 0%, transparent 42%, rgba(30,95,255,0.12) 50%, transparent 58%, transparent 100%)",
          transform: `translateX(${sweep}px)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 12% 8%, rgba(30,95,255,0.12), transparent 28%), radial-gradient(circle at 92% 88%, rgba(6,25,54,0.11), transparent 32%)",
          opacity: interpolate(frame, [2.8 * fps, 4 * fps, 11.8 * fps], [0, 1, 0.42], clamp),
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 88,
          right: 88,
          top: 512,
          height: 446,
          opacity: interpolate(nameIn, [0, 0.4], [0, 1], clamp) * (1 - nameExit),
          transform: `translateY(${interpolate(nameIn, [0, 1], [80, 0], clamp) - nameExit * 220}px) scale(${interpolate(
            nameIn,
            [0, 1],
            [0.92, 1],
            clamp,
          )})`,
        }}
      >
        <Img
          src={staticFile("audit-flow-white.jpg")}
          style={{
            width: "100%",
            height: 350,
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        <div
          style={{
            marginTop: 54,
            height: 12,
            width: `${interpolate(frame, [18, 54], [0, 100], clamp)}%`,
            borderRadius: 999,
            background: "linear-gradient(90deg, #061936, #1e5fff)",
            boxShadow: "0 0 34px rgba(30, 95, 255, 0.42)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 184,
          top: 222,
          width: 712,
          height: 712,
          opacity: logoStage * (1 - finalReveal),
          transform: `translateY(${interpolate(logoStage, [0, 1], [160, 0], clamp) - walkthroughReveal * 94}px) scale(${interpolate(
            logoStage,
            [0, 1],
            [0.82, 1],
            clamp,
          )}) rotate(${interpolate(frame, [2.12 * fps, 3.2 * fps], [-5, 0], clamp)}deg)`,
        }}
      >
        <Img
          src={staticFile("audit-flowicon-light.png")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: 1 - darkLogo,
          }}
        />
        <Img
          src={staticFile("audit-flowicon-dark.png")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: darkLogo,
            transform: `scale(${interpolate(darkLogo, [0, 1], [1.04, 1], clamp)})`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 70,
          top: 842,
          width: 940,
          height: 838,
          borderRadius: 54,
          background: "rgba(255, 255, 255, 0.62)",
          border: "1px solid rgba(255,255,255,0.74)",
          boxShadow: "0 46px 140px rgba(3, 16, 44, 0.16)",
          opacity: walkthroughReveal * (1 - walkthroughExit),
          transform: `translateY(${interpolate(walkthroughReveal, [0, 1], [150, 0], clamp) - walkthroughExit * 140}px)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 56,
            top: 38,
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 25,
            fontWeight: 850,
            color: "rgba(6, 25, 54, 0.54)",
            letterSpacing: 0,
          }}
        >
          Restaurant operations in one flow
        </div>
        {steps.map((step, index) => (
          <StepCard key={step.title} {...step} index={index} />
        ))}
      </div>

      <FloatingStat label="Locations" value="Multi" left={96} top={572} delay={140} exit={276} />
      <FloatingStat label="Inventory" value="Live" left={332} top={572} delay={176} exit={276} />
      <FloatingStat label="Audits" value="Fast" left={568} top={572} delay={212} exit={276} />
      <FloatingStat label="Insights" value="Clear" left={804} top={572} delay={248} exit={276} />

      <div
        style={{
          position: "absolute",
          left: cursorX,
          top: cursorY,
          width: 76,
          height: 76,
          borderRadius: 999,
          background: "rgba(30, 95, 255, 0.18)",
          border: "3px solid rgba(30, 95, 255, 0.48)",
          opacity: walkthroughReveal * (1 - walkthroughExit),
          transform: `scale(${1 + Math.sin(frame / 5) * 0.05})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 20,
            width: 30,
            height: 30,
            borderRadius: 999,
            background: "#1e5fff",
            boxShadow: "0 0 34px rgba(30, 95, 255, 0.52)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 94,
          top: 352,
          width: 892,
          height: 1216,
          borderRadius: 64,
          background: "linear-gradient(180deg, #061936 0%, #020817 100%)",
          boxShadow: "0 58px 150px rgba(1, 8, 22, 0.34)",
          opacity: finalReveal,
          transform: `translateY(${interpolate(finalReveal, [0, 1], [160, 0], clamp)}px) scale(${finalHold})`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 24%, rgba(30, 95, 255, 0.2), transparent 34%)",
          }}
        />
        <Img
          src={staticFile("auditflow-dark-blue.jpg")}
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            top: 300,
            width: 780,
            height: 438,
            objectFit: "contain",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 112,
            top: 758,
            width: 668,
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 42,
            fontWeight: 850,
            lineHeight: 1.08,
            textAlign: "center",
            color: "#ffffff",
            letterSpacing: 0,
          }}
        >
          Create. Count. Audit. Grow.
        </div>
        <div
          style={{
            position: "absolute",
            left: 126,
            right: 126,
            top: 910,
            height: 8,
            borderRadius: 999,
            background: "linear-gradient(90deg, #ffffff, #7ba7ff, #1e5fff)",
            opacity: interpolate(finalReveal, [0.2, 1], [0, 1], clamp),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
