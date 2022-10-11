import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { DateField, DateRangeField, InputField, NumberField } from './components/InputField'
import { Certificate, renderCertificate } from './domain/Certificate'

export function App() {
  const [memberName, setMemberName] = useState('')
  const [memberAddress, setMemberAddress] = useState('')
  const [campPeriod, setCampPeriod] = useState<[string, string]>(['', ''])
  const [campPayment, setCampPayment] = useState(0)
  const [campPaymentDate, setCampPaymentDate] = useState('')

  const certificate = useMemo<Certificate>(() => {
    const startDate = new Date(campPeriod[0])
    const endDate = new Date(campPeriod[1])
    const days = Math.floor((endDate.getTime() - startDate.getTime())/(1000*60*60*24))

    return {
      memberName,
      memberAddress,
      campStartDate: campPeriod[0] ? startDate.toLocaleDateString('nl-BE') : '',
      campEndDate: campPeriod[1] ? endDate.toLocaleDateString('nl-BE') : '',
      campDays: isNaN(days) ? 0 : days,
      campPayment,
      campPaymentDate: campPaymentDate ? new Date(campPaymentDate).toLocaleDateString('nl-BE') : '',
      date: new Date().toLocaleDateString('nl-BE'),
    }
  }, [memberName, memberAddress, campPeriod, campPayment, campPaymentDate])

  const output = useMemo(() => {
    return renderCertificate(certificate)
  }, [certificate])

  const [preview, setPreview] = useState<string>()
  const timeoutRef = useRef<number>()

  useEffect(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setPreview(output)
    }, 500)
  }, [certificate, output])

  return <main class='h-screen md:grid grid-cols-2'>
    <div class='m-3 flex flex-col justify-center items-center'>
      <InputField label='Naam van het lid' value={memberName} onInput={setMemberName} />
      <InputField label='Adres van het lid' value={memberAddress} onInput={setMemberAddress} />
      <DateRangeField label='Periode van het kamp' value={campPeriod} onInput={setCampPeriod} />
      <NumberField label='Betaald bedrag' value={campPayment} onInput={setCampPayment} />
      <DateField label='Datum betaling' value={campPaymentDate} onInput={setCampPaymentDate} />
    </div>
    <div>
      <object class='w-full h-full min-h-[400px]' data={`${preview}#toolbar=0&navpanes=0&view=FitH`} type='application/pdf' />
    </div>
  </main>
}
