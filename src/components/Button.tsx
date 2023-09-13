
interface Props {
	label: string
	link?: string
	download?: string
	disabled?: boolean
	secondary?: boolean
	class?: string
	onClick?: () => void
}
export function Button({ label, link, download, disabled, secondary, class: clazz, onClick }: Props) {
	return <a
		class={`rounded ${secondary ? disabled ? 'bg-gray-800 hover:bg-gray-800' : 'bg-gray-600 hover:bg-gray-700' : disabled ? 'bg-rose-800 hover:bg-rose-800' : 'bg-cyan-800 hover:bg-cyan-900'} transition-colors text-cyan-50 py-1 px-3 cursor-pointer select-none ${disabled ? 'cursor-default' : ''} ${clazz ? clazz : ''}`}
		href={disabled ? undefined : link}
		download={download}
		onClick={onClick}
	>{label}</a>
}
