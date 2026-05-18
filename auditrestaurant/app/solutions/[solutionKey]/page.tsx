import { notFound } from "next/navigation"
import { isSolutionKey, SolutionDetailPage, solutionKeys } from "../solution-detail-content"

export function generateStaticParams() {
  return solutionKeys.map((solutionKey) => ({ solutionKey }))
}

export default async function PublicSolutionPage({ params }: { params: Promise<{ solutionKey: string }> }) {
  const { solutionKey } = await params

  if (!isSolutionKey(solutionKey)) {
    notFound()
  }

  return <SolutionDetailPage solutionKey={solutionKey} />
}
