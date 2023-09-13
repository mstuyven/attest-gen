import { JSX } from 'preact'
import { useCallback, useRef, useState } from 'preact/hooks'

interface InputProps {
	value: string
	onInput: (value: string, e: JSX.TargetedEvent<HTMLInputElement>) => void
	type?: string
	invalid?: boolean
}
function Input({ value, onInput, type = 'text', invalid }: InputProps) {
	return <input
		class={`rounded bg-gray-300 text-gray-900 p-1 px-2 w-full outline-1 ${invalid ? 'outline outline-rose-700 focus:outline-2' : ''}`}
		type={type}
		value={value}
		onInput={e => onInput((e.target as HTMLInputElement).value, e)} />
}

interface InputFieldProps {
	label: string
	value: string
	onInput: (value: string) => void
	invalid?: boolean
}
export function InputField({ label, value, onInput, invalid }: InputFieldProps) {
	return <div class='mb-1 w-96'>
		<label class='block'>{label}</label>
		<Input value={value} onInput={onInput} invalid={invalid} />
	</div>
}

interface NumberFieldProps {
	label: string
	value: number
	onInput: (value: number) => void
	invalid?: boolean
}
export function NumberField({ label, value, onInput, invalid }: NumberFieldProps) {
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
		<Input value={str} onInput={onStrInput} type='number' invalid={invalid} />
	</div>
}

interface DateFieldProps {
	label: string
	value: string
	onInput: (value: string) => void
	invalid?: boolean
}
export function DateField({ label, value, onInput, invalid }: DateFieldProps) {
	return <div class='mb-1 w-96'>
		<label class='block'>{label}</label>
		<Input value={value} onInput={onInput} type='date' invalid={invalid} />
	</div>
}

interface DateRangeFieldProps {
	label: string
	value: [string, string]
	onInput: (value: [string, string]) => void
	invalid?: [boolean, boolean]
}
export function DateRangeField({ label, value, onInput, invalid }: DateRangeFieldProps) {
	return <div class='mb-1 w-96'>
		<label class='block'>{label}</label>
		<div class='flex gap-2'>
			<Input value={value[0]} onInput={s => onInput([s, value[1]])} type='date' invalid={invalid?.[0]} />
			<Input value={value[1]} onInput={e => onInput([value[0], e])} type='date' invalid={invalid?.[1]} />
		</div>
	</div>
}

interface FileFieldProps {
	label: string
	onInput: (value: File | undefined) => void
	accept?: string
	invalid?: boolean
}
export function FileField({ label, onInput, accept, invalid }: FileFieldProps) {
	const ref = useRef<HTMLInputElement>(null)
	const [name, setName] = useState<string>('')

	const onFileInput = useCallback(() => {
		if (ref.current?.files) {
			for (const file of ref.current.files) {
				setName(file.name)
				onInput(file)
			}
		} else {
			setName('')
			onInput(undefined)
		}
	}, [ref, onInput])

	return <div class='mb-1 w-96'>
		<label class='block'>{label}</label>
		<input
			ref={ref}
			class={`rounded bg-gray-300 text-gray-900 p-1 px-2 w-full outline-1 ${invalid ? 'outline outline-rose-700 focus:outline-2' : ''}`}
			type='file'
			accept={accept}
			value={name}
			onInput={onFileInput} />
	</div>
}

interface ImageFieldProps {
	label: string
	value: string
	onInput: (value: string) => void
	invalid?: boolean
}
export function ImageField({ label, onInput, invalid }: ImageFieldProps) {
	const onFileInput = useCallback((file: File | undefined) => {
		if (file === undefined) {
			onInput('')
			return
		}
		file.arrayBuffer().then(buf => {
			const array = new Uint8Array(buf)
			const blob = new Blob([array], { type: 'image/jpeg' })
			const url = URL.createObjectURL(blob)
			onInput(url)
		})
	}, [onInput])

	return <FileField label={label} onInput={onFileInput} accept='image/jpeg' invalid={invalid} />
}
