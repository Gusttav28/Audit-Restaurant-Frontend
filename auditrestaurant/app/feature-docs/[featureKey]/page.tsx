import { notFound } from "next/navigation"
import { FeatureDocumentationPage, featureKeys, isFeatureKey } from "@/app/features/feature-detail-content"

export function generateStaticParams() {
  return featureKeys.map((featureKey) => ({ featureKey }))
}

export default async function FeatureDocsPage({ params }: { params: Promise<{ featureKey: string }> }) {
  const { featureKey } = await params

  if (!isFeatureKey(featureKey)) {
    notFound()
  }

  return <FeatureDocumentationPage featureKey={featureKey} />
}
