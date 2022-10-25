
interface Props {
	label: string
	link?: string
	download?: string
	disabled?: boolean
}
export function Button({ label, link, download, disabled }: Props) {
	return <a
		class={`my-2 rounded bg-cyan-800 hover:bg-cyan-900 transition-colors text-cyan-50 py-1 px-3 cursor-pointer select-none ${disabled ? 'bg-rose-800 hover:bg-rose-800 cursor-default' : ''}`}
		href={disabled ? undefined : link}
		download={download}
	>{label}</a>
}
