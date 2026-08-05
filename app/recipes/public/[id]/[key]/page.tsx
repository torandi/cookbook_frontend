import PublicRecipeDisplay from './display'

type PageProps = {
	params: Promise<{ id: string, key: string }>
}

export default async function Page({ params }: PageProps) {
	const { id, key } = await params

	return <PublicRecipeDisplay recipeId={Number(id)} shareKey={key} />
}
