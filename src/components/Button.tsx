
interface Props {
	label: string
}
export function Button({ label }: Props) {
	return <button class='rounded bg-cyan-800 hover:bg-cyan-900 transition-colors text-cyan-50 py-1 px-3'>{label}</button>
}
