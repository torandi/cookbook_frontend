import PlanDisplayPage from './display'

type PageProps = {
	params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
	const { id } = await params
	return <PlanDisplayPage planId={Number(id)} />
}
