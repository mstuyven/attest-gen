import jsPDF from 'jspdf'
import stampSrc from '../stamp.jpg'
import watermarkSrc from '../watermark.jpg'

const ORG = {
	orgName: 'Scouts Jan Berchmans',
	orgAddress: 'Veerstraat 14, 9160 Lokeren',
	orgPlace: 'Lokeren',
	orgContact: 'groepsleiding@scoutsheirbrug.be',
	orgResponsible: 'Miro Stuyven',
}

export type CertificateType = 'camp' | 'membership'

export interface Certificate {
	type: CertificateType
	memberName: string
	memberAddress: string
	campStartDate: string
	campEndDate: string
	campDays: number
	membershipStartDate: string
	membershipEndDate: string
	payment: number
	paymentDate: string
	date: string
	signature: string
}

const A4_WIDTH = 210

export function renderCertificate(certificate: Certificate) {
	const isCamp = certificate.type === 'camp'

	const doc = new jsPDF()
	function font({ size, color, style }: { size?: number; color?: string; style?: 'bold' }) {
		doc.setFontSize(size ?? 16)
		doc.setTextColor(color ?? '#000')
		doc.setFont('Helvetica', 'normal', style === 'bold' ? 'bold' : 'normal')
	}

	let y = 10
	const x = 10
	const x1 = 14
	const x2 = 57

	function title(label: string) {
		y += 10
		font({ size: 20, style: 'bold' })
		doc.text(label, x, y)
		y += 10
	}

	function image(src: string, x: number, y: number, w: number, h: number) {
		const img = new Image()
		img.src = src
		doc.addImage(img, '', x, y, w, h)
	}

	function section(label: string | null, lines: number) {
		doc.rect(x, y, A4_WIDTH - (2 * x), (label ? 12 : 4) + lines * 10)
		if (label) {
			font({ size: 13, color: '#666', style: 'bold' })
			doc.text(label, x + 2, y + 7)
		}
		y += (label ? 17 : 9)
	}

	function field(label: string, value: string) {
		font({ size: 15, style: 'bold' })
		doc.text(`${label}:`, x1, y)
		font({ size: 15 })
		doc.text(value, x2, y)
		y += 10
	}

	image(watermarkSrc, 30, 30, A4_WIDTH - 60, (A4_WIDTH - 60) * 1860 / 1616)

	title(isCamp ? 'Attest deelname aan scoutskamp' : 'Attest lidmaatschap jeugdbeweging')

	section(isCamp ? 'Gegevens van de deelnemer' : 'Gegevens van het lid', 2)
	field('Naam', certificate.memberName)
	field('Adres', certificate.memberAddress)

	section('Gegevens van de organisatie', 3)
	field('Naam', ORG.orgName)
	field('Adres', ORG.orgAddress)
	field('E-mailadres', ORG.orgContact)

	if (isCamp) {
		section('Gegevens van het kamp', 4)
		field('Periode', `${certificate.campStartDate} - ${certificate.campEndDate}`)
		field('Aantal dagen', `${certificate.campDays}`)
	} else {
		section('Gegevens van het lidmaatschap', 3)
		field('Periode', `${certificate.membershipStartDate} - ${certificate.membershipEndDate}`)
	}
	field('Betaald bedrag', `${certificate.payment} euro`)
	field('Datum betaling', certificate.paymentDate)

	section(null, 6)
	font({ size: 13, color: '#666', style: 'bold' })
	doc.text('Handtekening verantwoordelijke', x + 2, y)
	doc.text('Stempel van de organisatie', x + 125, y)
	image(stampSrc, x + 135, y + 5, 40, 40)
	if (certificate.signature.length > 0) {
		image(certificate.signature, x1, y + 5, 50, 50 * 731 / 1587)
	}
	y += 50
	font({ size: 15 })
	doc.text(`Opgemaakt op ${certificate.date} te ${ORG.orgPlace}`, x1, y)

	return doc.output('datauristring', { filename: `Attest ${certificate.memberName}` })
}

export function parseBulk(text: string) {
	const lines = text.split('\n').map(line => line.trim())
  const array = lines.map((line) => {
    const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    return columns.map((column) => column.replace(/^"(.*)"$/, '$1'));
  })
	const header = array[0]
	return array.slice(1).map(row => Object.fromEntries(header.map((k, i) => [k, row[i]])))
}

export function renderBulk(rows: Record<string, string>[], signature: string) {
	const results: Record<string, string>[] = []
	for (const row of rows) {
		const campPeriod = row.Aanwezig.match(/^(\d+) juli - (\d+) juli$/)?.slice(1, 3).map(s => Number(s))
		if (!campPeriod) {
			results.push({ ...row, error: 'ongeldige kamp periode' })
			continue
		}
		const payment = Number(row.Bedrag.replace(/^€\s*/, ''))
		if (payment <= 0 || !row.Datum) {
			results.push({ ...row, error: 'geen betaling' })
			continue
		}
		const certificate: Certificate = {
			type: 'camp',
			date: new Date().toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
			memberName: row.Naam,
			memberAddress: row.Adres,
			campStartDate: `${campPeriod[0]}/07/2023`,
			campEndDate: `${campPeriod[1]}/07/2023`,
			campDays: campPeriod[1] - campPeriod[0],
			paymentDate: row.Datum,
			payment: payment,
			membershipStartDate: '',
			membershipEndDate: '',
			signature: signature,
		}
		results.push({ ...row, pdf: renderCertificate(certificate) })
	}
	return results
}
