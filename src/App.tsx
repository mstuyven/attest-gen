import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { Button } from './components/Button'
import { DateField, DateRangeField, ImageField, InputField, NumberField } from './components/InputField'
import { Certificate, renderCertificate } from './domain/Certificate'
import { useLocalStorage } from './hooks/useLocalStorage'

export function App() {
  const [memberName, setMemberName] = useLocalStorage('member_name', '')
  const [memberAddress, setMemberAddress] = useLocalStorage('member_address', '')
  const [campStart, setCampStart] = useLocalStorage('camp_start', '')
  const [campEnd, setCampEnd] = useLocalStorage('camp_end', '')
  const [campPayment, setCampPayment] = useLocalStorage('camp_payment', 0, s => parseInt(s, 10), n => n.toFixed())
  const [campPaymentDate, setCampPaymentDate] = useLocalStorage('camp_payment_date', '')
  const [signature, setSignature] = useState('')

  const campPeriod = useMemo<[string, string]>(() => [campStart, campEnd], [campStart, campEnd])
  const setCampPeriod = useCallback<(p: [string, string]) => void>(p => {
    setCampStart(p[0])
    setCampEnd(p[1])
  }, [setCampStart, setCampEnd])

  const campDays = useMemo(() => {
    const startDate = new Date(campPeriod[0])
    const endDate = new Date(campPeriod[1])
    const days = Math.floor((endDate.getTime() - startDate.getTime())/(1000*60*60*24))
    return isNaN(days) ? undefined : days
  }, [campPeriod])

  const certificate = useMemo<Certificate>(() => {
    const formatDate = (str?: string) => {
      return str ? new Date(str).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''
    }
    return {
      memberName,
      memberAddress,
      campStartDate: formatDate(campPeriod[0]),
      campEndDate: formatDate(campPeriod[1]),
      campDays: campDays ?? 0,
      campPayment,
      campPaymentDate: formatDate(campPaymentDate),
      date: formatDate(new Date().toString()),
      signature,
    }
  }, [memberName, memberAddress, campPeriod, campDays, campPayment, campPaymentDate, signature])

  const memberNameInvalid = memberName.length === 0
  const memberAddressInvalid = memberAddress.length === 0
  const campStartInvalid = campPeriod[0].length === 0
  const campEndInvalid = campPeriod[1].length === 0 || campDays === undefined || campDays <= 0
  const campPaymentInvalid = campPayment <= 0
  const campPaymentDateInvalid = campPaymentDate.length === 0
  const signatureInvalid = signature.length === 0

  const downloadInvalid = memberNameInvalid || memberAddressInvalid || campStartInvalid || campEndInvalid || campPaymentInvalid || campPaymentDateInvalid || signatureInvalid

  const [output, setOutput] = useState<string>()
  const timeoutRef = useRef<number>()

  useEffect(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const pdf = renderCertificate(certificate)
      setOutput(pdf)
    }, 500)
  }, [certificate])

  return <main class='h-screen md:grid grid-cols-2'>
    <div class='m-3 flex flex-col justify-center items-center'>
      <InputField label='Naam van het lid' value={memberName} onInput={setMemberName} invalid={memberNameInvalid} />
      <InputField label='Adres van het lid' value={memberAddress} onInput={setMemberAddress} invalid={memberAddressInvalid} />
      <DateRangeField label='Periode van het kamp' value={campPeriod} onInput={setCampPeriod} invalid={[campStartInvalid, campEndInvalid]} />
      <NumberField label='Betaald bedrag' value={campPayment} onInput={setCampPayment} invalid={campPaymentInvalid} />
      <DateField label='Datum betaling' value={campPaymentDate} onInput={setCampPaymentDate} invalid={campPaymentDateInvalid} />
      <ImageField label='Handtekening verantwoordelijke' value={signature} onInput={setSignature} invalid={signatureInvalid} />
      <Button label='Download attest' link={output} download={`Attest_${memberName.replaceAll(' ', '_')}`} disabled={downloadInvalid} />
    </div>
    <div>
      <iframe class='w-full h-full min-h-[400px]' src={`${output}#toolbar=0&navpanes=0&view=FitH`} />
    </div>
  </main>
}
