import { useCallback, useState } from 'preact/hooks'

type Result<T> = [T, (value: T | null | undefined) => void]

export function useLocalStorage(key: string, defaultValue: string): Result<string>
export function useLocalStorage<T>(key: string, defaultValue: T, parse: (s: string) => T, stringify: (e: T) => string): Result<T>
export function useLocalStorage<T>(key: string, defaultValue: T, parse?: (s: string) => T, stringify?: (e: T) => string): Result<T> {
	const _key = `attest_gen.${key}`
	const getter = useCallback(() => {
		const raw = localStorage.getItem(_key)
		if (raw === null) {
			return defaultValue
		} else if (parse === undefined) {
			return raw as unknown as T
		}
		return parse(raw)
	}, [_key, defaultValue, parse])

	const [state, setState] = useState(getter())

	const setter = useCallback((value: T | null | undefined) => {
		if (value == null) {
			localStorage.removeItem(_key)
			setState(defaultValue)
		} else if (stringify !== undefined) {
			localStorage.setItem(_key, stringify(value))
			setState(value)
		} else {
			localStorage.setItem(_key, value as unknown as string)
			setState(value)
		}
	}, [_key, defaultValue, stringify])

	return [state, setter]
}
