
interface Props {
	label: string
	link?: string
	download?: string
}
export function Button({ label, link, download }: Props) {
	return <a
		class='my-2 rounded bg-cyan-800 hover:bg-cyan-900 transition-colors text-cyan-50 py-1 px-3 cursor-pointer'
		href={link}
		download={download}
	>{label}</a>
}
