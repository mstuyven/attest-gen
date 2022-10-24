import { JSX } from 'preact'
import { useCallback, useRef, useState } from 'preact/hooks'

interface InputProps {
	value: string
	onInput: (value: string, e: JSX.TargetedEvent<HTMLInputElement>) => void
	type?: string
}
function Input({ value, onInput, type = 'text' }: InputProps) {
	return <input
		class='rounded border-gray-800 bg-gray-300 text-gray-900 p-1 px-2 w-full'
		type={type}
		value={value}
		onInput={e => onInput((e.target as HTMLInputElement).value, e)} />
}

interface InputFieldProps {
	label: string
	value: string
	onInput: (value: string) => void
}
export function InputField({ label, value, onInput }: InputFieldProps) {
	return <div class='mb-1 w-96'>
		<label class='block'>{label}</label>
		<Input value={value} onInput={onInput} />
	</div>
}

interface NumberFieldProps {
	label: string
	value: number
	onInput: (value: number) => void
}
export function NumberField({ label, value, onInput }: NumberFieldProps) {
	const [str, setStr] = useState(value.toString())

	const onStrInput = useCallback((s: string) => {
		const parsed = Number(s)
		if (s.length > 0 && !isNaN(parsed)) {
			setStr(parsed.toString())
			onInput(parsed)
		}
	}, [onInput])

	return <div class='mb-1 w-96'>
		<label class='block'>{label}</label>
		<Input value={str} onInput={onStrInput} type='number' />
	</div>
}

interface DateFieldProps {
	label: string
	value: string
	onInput: (value: string) => void
}
export function DateField({ label, value, onInput }: DateFieldProps) {
	return <div class='mb-1 w-96'>
		<label class='block'>{label}</label>
		<Input value={value} onInput={onInput} type='date' />
	</div>
}

interface DateRangeFieldProps {
	label: string
	value: [string, string]
	onInput: (value: [string, string]) => void
}
export function DateRangeField({ label, value, onInput }: DateRangeFieldProps) {
	return <div class='mb-1 w-96'>
		<label class='block'>{label}</label>
		<div class='flex gap-2'>
			<Input value={value[0]} onInput={s => onInput([s, value[1]])} type='date' />
			<Input value={value[1]} onInput={e => onInput([value[0], e])} type='date' />
		</div>
	</div>
}

interface ImageFieldProps {
	label: string
	value: string
	onInput: (value: string) => void
}
export function ImageField({ label, onInput }: ImageFieldProps) {
	const ref = useRef<HTMLInputElement>(null)
	const [name, setName] = useState<string>('')

	const onFileInput = useCallback(() => {
		if (ref.current?.files) {
			for (const file of ref.current.files) {
				setName(file.name)
				file.arrayBuffer().then(buf => {
					const array = new Uint8Array(buf)
					const blob = new Blob([array], { type: 'image/jpeg' })
					const url = URL.createObjectURL(blob)
					onInput(url)
				})
			}
		} else {
			setName('')
			onInput('')
		}
	}, [ref, onInput])

	return <div class='mb-1 w-96'>
		<label class='block'>{label}</label>
		<input
			ref={ref}
			class='rounded border-gray-800 bg-gray-300 text-gray-900 p-1 px-2 w-full'
			type='file'
			accept='image/jpeg'
			value={name}
			onInput={onFileInput} />
	</div>
}
