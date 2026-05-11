import { Composition } from "remotion";
import { AuditFlowLoading } from "./AuditFlowLoading";

export const RemotionRoot = () => {
  return (
    <Composition
      id="AuditFlowLoading"
      component={AuditFlowLoading}
      durationInFrames={360}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
