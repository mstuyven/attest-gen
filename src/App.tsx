import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { Button } from './components/Button'
import { DateField, DateRangeField, FileField, ImageField, InputField, NumberField } from './components/InputField'
import { Certificate, CertificateType, parseBulk, renderBulk, renderCertificate } from './domain/Certificate'
import { useLocalStorage } from './hooks/useLocalStorage'

export function App() {
  const [bulkMode, setBulkMode] = useLocalStorage('bulk', true, s => s === 'true', b => `${b}`)
  const [type, setType] = useLocalStorage('type', 'camp')

  const [memberName, setMemberName] = useLocalStorage('member_name', '')
  const [memberAddress, setMemberAddress] = useLocalStorage('member_address', '')
  const [campStart, setCampStart] = useLocalStorage('camp_start', '')
  const [campEnd, setCampEnd] = useLocalStorage('camp_end', '')
  const [payment, setPayment] = useLocalStorage('payment', 0, s => parseInt(s, 10), n => n.toFixed())
  const [paymentDate, setPaymentDate] = useLocalStorage('payment_date', '')
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
    const yearStart = new Date()
    yearStart.setMonth(yearStart.getMonth() - 8)
    const year = yearStart.getFullYear()
    return {
      type: type as CertificateType,
      memberName,
      memberAddress,
      campStartDate: formatDate(campPeriod[0]),
      campEndDate: formatDate(campPeriod[1]),
      campDays: campDays ?? 0,
      membershipStartDate: formatDate(new Date(year, 8, 1).toString()),
      membershipEndDate: formatDate(new Date(year + 1, 8, 1).toString()),
      payment,
      paymentDate: formatDate(paymentDate),
      date: formatDate(new Date().toString()),
      signature,
    }
  }, [type, memberName, memberAddress, campPeriod, campDays, payment, paymentDate, signature])

  const memberNameInvalid = memberName.length === 0
  const memberAddressInvalid = memberAddress.length === 0
  const campStartInvalid = campPeriod[0].length === 0
  const campEndInvalid = campPeriod[1].length === 0 || campDays === undefined || campDays <= 0
  const paymentInvalid = payment <= 0
  const paymentDateInvalid = paymentDate.length === 0
  const signatureInvalid = signature.length === 0

  const downloadInvalid = type === 'camp'
    ? (memberNameInvalid || memberAddressInvalid || campStartInvalid || campEndInvalid || paymentInvalid || paymentDateInvalid || signatureInvalid)
    : (memberNameInvalid || memberAddressInvalid || paymentInvalid || paymentDateInvalid || signatureInvalid)

  const [output, setOutput] = useState<string>()
  const timeoutRef = useRef<number>()

  useEffect(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const pdf = renderCertificate(certificate)
      setOutput(pdf)
    }, 500)
  }, [certificate])

  const [bulkFile, setBulkFile] = useState<string>()
  const [bulkResult, setBulkResult] = useState<Record<string, string>[]>([])
  const onBulk = useCallback((file: File | undefined) => {
    if (file === undefined) {
      setBulkFile(undefined)
      return
    }
    file.text()
      .then(setBulkFile)
      .catch(() => setBulkFile(undefined))
  }, [])
  const makeBulk = useCallback(() => {
    if (!bulkFile) return
    const rows = parseBulk(bulkFile)
    setBulkResult(rows)
    setTimeout(() => {
      const results = renderBulk(rows, signature)
      setBulkResult(results)
    })
  }, [bulkFile, signature])

  return <main class='h-screen md:grid grid-cols-2'>
    <div class='m-3 flex flex-col justify-center items-center'>
      <div class='my-2 flex gap-1'>
        <Button label='Kamp' secondary disabled={type === 'camp' && !bulkMode} onClick={() => {setType('camp');setBulkMode(false)}} />
        <Button label='Lidgeld' secondary disabled={type === 'membership' && !bulkMode} onClick={() => {setType('membership');setBulkMode(false)}} />
        <Button label='Bulk' secondary disabled={bulkMode} onClick={() => setBulkMode(true)} />
      </div>
      {bulkMode === false ? <>
        <InputField label='Naam van het lid' value={memberName} onInput={setMemberName} invalid={memberNameInvalid} />
        <InputField label='Adres van het lid' value={memberAddress} onInput={setMemberAddress} invalid={memberAddressInvalid} />
        {type === 'camp' && <DateRangeField label='Periode van het kamp' value={campPeriod} onInput={setCampPeriod} invalid={[campStartInvalid, campEndInvalid]} />}
        <NumberField label='Betaald bedrag' value={payment} onInput={setPayment} invalid={paymentInvalid} />
        <DateField label='Datum betaling' value={paymentDate} onInput={setPaymentDate} invalid={paymentDateInvalid} />
        <ImageField label='Handtekening verantwoordelijke' value={signature} onInput={setSignature} invalid={signatureInvalid} />
        <Button class="my-2" label='Download attest' link={output} download={`Attest_${memberName.replaceAll(' ', '_')}`} disabled={downloadInvalid} />
      </> : <>
        <FileField label='CSV bestand' onInput={onBulk} invalid={!bulkFile} accept='.csv' />
        <ImageField label='Handtekening verantwoordelijke' value={signature} onInput={setSignature} invalid={signatureInvalid} />
        <Button class="my-2" label='Maak attesten aan' onClick={makeBulk} disabled={!bulkFile || signatureInvalid} />
      </>}
    </div>
    {bulkMode === false ? <div>
      <iframe class='w-full h-full min-h-[400px]' src={`${output}#toolbar=0&navpanes=0&view=FitH`} />
    </div> : <div class="py-4 flex flex-col items-center gap-1 h-screen overflow-y-scroll">
      {bulkResult.map(r =>
        <Button class="w-60" secondary label={r.Naam} link={r.pdf} download={`Attest_${r.Naam.replaceAll(' ', '_')}`} disabled={r.pdf === undefined} />)}
      </div>
    }
  </main>
}
