"use client"

import { useState } from "react"
import type { FeatureKey } from "./feature-detail-content"
import WorldMap from "@/components/ui/world-map"

const remoteAccessDots = [
  {
    start: { lat: 9.93, lng: -84.08, label: "AuditNett" },
    end: { lat: 25.76, lng: -80.19, label: "Maya Chen" },
  },
  {
    start: { lat: 9.93, lng: -84.08, label: "AuditNett" },
    end: { lat: 40.42, lng: -3.7, label: "Gustavo Camacho" },
  },
  {
    start: { lat: 9.93, lng: -84.08, label: "AuditNett" },
    end: { lat: 51.51, lng: -0.13, label: "Aisha Patel" },
  },
]

const stepsByFeature: Record<FeatureKey, string[]> = {
  "inventory-database": ["Restaurant", "Inventory table", "Audit count"],
  authentication: ["Login", "Team access", "Permissions"],
  "audit-functions": ["Previous stock", "Current count", "Difference"],
  "authorized-area": ["Inventory", "Audits", "Settings"],
  "real-time-tasks": ["Assign", "Notify", "Complete"],
  "analytics-api": ["Metrics", "Chart", "Export"],
  reports: ["Metrics", "Chart", "Export"],
  "remote-access": ["Maya", "Gustavo", "Aisha"],
}

function StepControls({ steps, activeStep, setActiveStep }: { steps: string[]; activeStep: number; setActiveStep: (step: number) => void }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {steps.map((step, index) => (
        <button
          key={step}
          type="button"
          onClick={() => setActiveStep(index)}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${activeStep === index
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
        >
          {step}
        </button>
      ))}
    </div>
  )
}

export default function InteractiveFeaturePreview({ featureKey }: { featureKey: FeatureKey }) {
  const [activeStep, setActiveStep] = useState(0)
  const steps = stepsByFeature[featureKey]

  if (featureKey === "inventory-database") {
    const restaurant = activeStep === 0 ? "GoFlow Restaurant" : activeStep === 1 ? "GoFlow Bar Template" : "GoFlow Kitchen Template"
    const inventory = activeStep === 0 ? "All inventories" : activeStep === 1 ? "Bar inventory" : "Kitchen inventory"
    const auditCount = activeStep === 2 ? "5 audits available" : "3 audits available"
    return (
      <div className="auditflow-feature-video rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Restaurant selector</p>
            <h2 className="text-xl font-semibold text-foreground">Inventory table management</h2>
          </div>
          <button type="button" onClick={() => setActiveStep(2)} className="auditflow-video-pulse rounded-full border border-border bg-background px-3 py-1 text-xs text-primary">
            {auditCount}
          </button>
        </div>
        <button type="button" onClick={() => setActiveStep((activeStep + 1) % 2)} className="auditflow-video-pulse mb-4 flex w-full items-center justify-between rounded-xl border border-border bg-background/70 px-4 py-3 text-left transition-colors hover:border-primary/40">
          <span className="text-sm font-medium text-foreground">{restaurant}</span>
          <span className="text-xs text-muted-foreground">{inventory}</span>
        </button>
        <div className="overflow-hidden rounded-xl border border-border">
          {[
            ["Premium coffee", "Beverages", activeStep === 1 ? "28 kg" : "24 kg", "$192"],
            ["Prep containers", "Storage", "38 units", "$304"],
            ["Production sauce", "Kitchen", activeStep === 2 ? "15 L" : "12 L", "$96"],
          ].map(([item, category, stock, value], index) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`auditflow-video-row ${activeStep === index ? "border-primary/40 bg-primary/10" : "bg-background/60"} grid w-full grid-cols-[1.2fr_0.9fr_0.7fr_0.6fr] gap-3 border-b border-border px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-primary/10`}
            >
              <span className="font-medium text-foreground">{item}</span>
              <span className="text-muted-foreground">{category}</span>
              <span className="text-muted-foreground">{stock}</span>
              <span className="text-right font-mono text-foreground">{value}</span>
            </button>
          ))}
        </div>
        <StepControls steps={steps} activeStep={activeStep} setActiveStep={setActiveStep} />
      </div>
    )
  }

  if (featureKey === "authentication") {
    return (
      <div className="auditflow-feature-video rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-sm text-muted-foreground">Secure login</p>
            <div className="mt-4 space-y-3">
              <button type="button" onClick={() => setActiveStep(0)} className="auditflow-video-row h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-muted-foreground hover:border-primary/40">user@goflow.example</button>
              <button type="button" onClick={() => setActiveStep(0)} className="auditflow-video-row h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-left font-mono text-sm text-muted-foreground hover:border-primary/40">••••••••</button>
              <button type="button" onClick={() => setActiveStep(1)} className="auditflow-video-pulse w-full rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground">Sign in</button>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-sm text-muted-foreground">Team access list</p>
            <div className="mt-4 space-y-3">
              {[
                ["Owner account", "Full admin"],
                ["Audit user", "Read + Audit"],
                ["Viewer account", "Read only"],
              ].map(([name, role], index) => (
                <button key={name} type="button" onClick={() => setActiveStep(index)} className={`auditflow-video-row flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${activeStep === index ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}>
                  <span className="font-medium text-foreground">{name}</span>
                  <span className="text-muted-foreground">{role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <StepControls steps={steps} activeStep={activeStep} setActiveStep={setActiveStep} />
      </div>
    )
  }

  if (featureKey === "audit-functions") {
    const rows = [
      ["Premium gin", "12", activeStep === 1 ? "9" : "—", activeStep === 2 ? "-3" : "Pending"],
      ["Tonic water", "8", activeStep === 1 ? "7" : "—", activeStep === 2 ? "-1" : "Pending"],
      ["Lime juice", "5 L", activeStep === 1 ? "4 L" : "—", activeStep === 2 ? "Merma" : "Pending"],
    ]
    return (
      <div className="auditflow-feature-video rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Inventory audit</p>
            <h2 className="text-xl font-semibold text-foreground">Previous vs current stock</h2>
          </div>
          <span className="auditflow-video-pulse rounded-full border border-yellow-500/20 bg-yellow-500/15 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-300">{activeStep === 2 ? "Compared" : "In progress"}</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          {rows.map(([item, previous, current, diff], index) => (
            <button key={item} type="button" onClick={() => setActiveStep((activeStep + 1) % steps.length)} className="auditflow-video-row grid w-full grid-cols-[1fr_0.7fr_0.7fr_0.7fr] gap-3 border-b border-border bg-background/60 px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-primary/10">
              <span className="font-medium text-foreground">{item}</span>
              <span className="text-muted-foreground">Prev {previous}</span>
              <span className="text-muted-foreground">Now {current}</span>
              <span className="text-right font-medium text-accent">{diff}</span>
            </button>
          ))}
        </div>
        <StepControls steps={steps} activeStep={activeStep} setActiveStep={setActiveStep} />
      </div>
    )
  }

  if (featureKey === "authorized-area") {
    return (
      <div className="auditflow-feature-video rounded-2xl border border-border bg-card p-5 shadow-xl">
        <p className="text-sm text-muted-foreground">Permission-based UI</p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">Protected sections</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Inventory", "Visible", "Read access"],
            ["Audits", "Allowed", "Read + Audit"],
            ["Settings", "Locked", "Admin only"],
          ].map(([section, state, rule], index) => (
            <button key={section} type="button" onClick={() => setActiveStep(index)} className={`auditflow-video-pulse rounded-xl border p-4 text-left transition-colors ${activeStep === index ? "border-primary bg-primary/10" : "border-border bg-background/70 hover:border-primary/40"}`}>
              <p className="font-medium text-foreground">{section}</p>
              <p className={state === "Locked" ? "mt-4 text-sm text-destructive" : "mt-4 text-sm text-primary"}>{activeStep === index ? "Checking..." : state}</p>
              <p className="mt-1 text-xs text-muted-foreground">{rule}</p>
            </button>
          ))}
        </div>
        <StepControls steps={steps} activeStep={activeStep} setActiveStep={setActiveStep} />
      </div>
    )
  }

  if (featureKey === "real-time-tasks") {
    return (
      <div className="auditflow-feature-video rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Admin assignment</p>
            <h2 className="text-xl font-semibold text-foreground">Audit task queue</h2>
          </div>
          <span className="auditflow-video-pulse rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">{activeStep + 1} new</span>
        </div>
        <div className="space-y-3">
          {[
            ["Bar count", "Assigned to Audit User", "Due today"],
            ["Kitchen review", "Helper: Team member", "Tomorrow"],
            ["Storage audit", "Temporary collaborator", "Pending"],
          ].map(([task, user, due], index) => (
            <button key={task} type="button" onClick={() => setActiveStep(index)} className={`auditflow-video-row flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${activeStep === index ? "border-primary bg-primary/10" : "border-border bg-background/70 hover:border-primary/40"}`}>
              <div>
                <p className="font-medium text-foreground">{task}</p>
                <p className="text-muted-foreground">{user}</p>
              </div>
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">{due}</span>
            </button>
          ))}
        </div>
        <StepControls steps={steps} activeStep={activeStep} setActiveStep={setActiveStep} />
      </div>
    )
  }

  if (featureKey === "analytics-api" || featureKey === "reports") {
    const metric = activeStep === 0 ? "$8.4k value" : activeStep === 1 ? "18 audits" : "Export ready"
    return (
      <div className="auditflow-feature-video rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{featureKey === "reports" ? "Report view" : "Analytics view"}</p>
            <h2 className="text-xl font-semibold text-foreground">Metrics, charts, and tables</h2>
          </div>
          <button type="button" onClick={() => setActiveStep(2)} className="auditflow-video-pulse rounded-full border border-border bg-background px-3 py-1 text-xs text-primary">{metric}</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["$8.4k value", "18 audits", "7 issues"].map((item, index) => (
            <button key={item} type="button" onClick={() => setActiveStep(index)} className={`auditflow-video-row rounded-xl border p-4 text-center font-semibold text-foreground transition-colors ${activeStep === index ? "border-primary bg-primary/10" : "border-border bg-background/70 hover:border-primary/40"}`}>{item}</button>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-border bg-background/70 p-4">
          <div className="flex h-32 items-end gap-3">
            {[64, 42, 82, 55, 74, 48].map((height, index) => (
              <button key={index} type="button" onClick={() => setActiveStep(index % steps.length)} className="auditflow-video-bar flex-1 rounded-t-lg bg-primary/70 transition-colors hover:bg-primary" style={{ height: `${activeStep === index % steps.length ? Math.min(100, height + 16) : height}%`, animationDelay: `${index * 0.18}s` }} />
            ))}
          </div>
        </div>
        <StepControls steps={steps} activeStep={activeStep} setActiveStep={setActiveStep} />
      </div>
    )
  }

  return (
    <div className="auditflow-feature-video overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Remote workspace</p>
          <h2 className="text-xl font-semibold text-foreground">Multi-location access</h2>
        </div>
        <span className="auditflow-video-pulse rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">{steps[activeStep]} online</span>
      </div>
      <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-xl border border-border bg-background/70">
        <div className="absolute inset-x-2 top-9 sm:inset-x-5 sm:top-7">
          <WorldMap dots={remoteAccessDots} lineColor="#0f6cb4" className="opacity-95" />
        </div>
        {[
          { name: "Maya Chen", task: "Bar audit", style: { left: "8%", top: "48%" }, line: "left-1/2 top-full h-8 -rotate-[18deg]" },
          { name: "Gustavo Camacho", task: "Kitchen inventory", style: { left: "34%", top: "34%" }, line: "left-1/2 top-full h-7 rotate-[20deg]" },
          { name: "Aisha Patel", task: "Storage count", style: { right: "7%", bottom: "18%" }, line: "left-1/2 bottom-full h-8 rotate-[34deg]" },
        ].map((location, index) => (
          <button key={location.name} type="button" onClick={() => setActiveStep(index)} style={location.style} className={`auditflow-video-marker absolute z-10 flex items-center gap-2 rounded-2xl border px-3 py-2 text-left text-xs transition-colors ${activeStep === index ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/40"}`}>
            <span className={`pointer-events-none absolute w-px origin-top rounded-full ${activeStep === index ? "bg-primary" : "bg-primary/45"} ${location.line}`} />
            <span className={`h-2 w-2 rounded-full ${activeStep === index ? "bg-primary-foreground" : "bg-primary"}`} />
            <span className="leading-tight">
              <span className="block font-medium">{location.name}</span>
              <span className={`block text-[11px] ${activeStep === index ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{location.task}</span>
            </span>
          </button>
        ))}
      </div>
      <StepControls steps={steps} activeStep={activeStep} setActiveStep={setActiveStep} />
    </div>
  )
}
