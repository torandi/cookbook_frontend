import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function FullCard(props: any) {
	return (
		<Card {...props} >
			<CardContent>
				{props.children}
			</CardContent>
		</Card>
	)
}
