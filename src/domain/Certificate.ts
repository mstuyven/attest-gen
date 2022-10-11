import jsPDF from 'jspdf'

const ORG = {
	orgName: 'Scouts Jan Berchmans',
	orgAddress: 'Veerstraat 14, 9160 Lokeren',
	orgContact: 'groepsleiding@scoutsheirbrug.be',
}

export interface Certificate {
	memberName: string
	memberAddress: string
	campStartDate: string
	campEndDate: string
	campDays: number
	campPayment: number
	campPaymentDate: string
	date: string
}

const A4_WIDTH = 210

export function renderCertificate(certificate: Certificate) {
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

	title('Attest van deelname aan scoutskamp')

	section('Gegevens van de deelnemer', 2)
	field('Naam', certificate.memberName)
	field('Adres', certificate.memberAddress)

	section('Gegevens van de organisatie', 3)
	field('Naam', ORG.orgName)
	field('Adres', ORG.orgAddress)
	field('E-mailadres', ORG.orgContact)

	section('Gegevens van het kamp', 4)
	field('Periode', `${certificate.campStartDate} - ${certificate.campEndDate}`)
	field('Aantal dagen', `${certificate.campDays}`)
	field('Betaald bedrag', `${certificate.campPayment} euro`)
	field('Datum betaling', certificate.campPaymentDate)

	section(null, 6)
	field('Datum', certificate.date)

	return doc.output('datauristring', { filename: `Attest ${certificate.memberName}` })
}