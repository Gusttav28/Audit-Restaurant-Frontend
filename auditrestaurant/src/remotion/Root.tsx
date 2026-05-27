import { Composition } from "remotion";
import { AuditFlowLoading } from "./AuditFlowLoading";
import { AuditNettLaunchFilm } from "./AuditNettLaunchFilm";
import { AuditNettWorkflowDemo } from "./AuditNettWorkflowDemo";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="AuditFlowLoading"
        component={AuditFlowLoading}
        durationInFrames={360}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="AuditNettWorkflowDemo"
        component={AuditNettWorkflowDemo}
        durationInFrames={492}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="AuditNettLaunchFilm"
        component={AuditNettLaunchFilm}
        durationInFrames={796}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
