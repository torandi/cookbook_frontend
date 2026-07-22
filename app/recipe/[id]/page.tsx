import RecipeDisplay from './recipe'

type PageProps = {
	params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
	const { id } = await params

	return <RecipeDisplay recipeId={Number(id)} />
}
