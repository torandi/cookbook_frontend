import RecipeEditPage from './edit'

type PageProps = {
	params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
	const { id } = await params

	return <RecipeEditPage recipeId={Number(id)} />
}
