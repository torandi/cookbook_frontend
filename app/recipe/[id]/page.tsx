import { useRecipe } from '@/app/backend/recipe'
import { RecipeType } from '@/app/types/recipe'

import FullCard from '@/app/components/fullcard';
import Spinner from '@/app/components/spinner';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
	const { recipe, error, isLoading } = useRecipe(id)

	console.log(recipe)

	// todo: instead of stack, use flex to work better on mobile
	return (
		<>
		{ isLoading ? (<Spinner/>) :(
			<Stack direction="row" spacing={2}>
				<FullCard className="w-1/2">
				</FullCard>
				<FullCard className="w-1/2">
				</FullCard>
			</Stack>
		)}
		</>
	)
}
