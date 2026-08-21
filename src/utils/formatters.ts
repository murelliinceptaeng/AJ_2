import { CreditClass } from '../types';

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString: string | undefined | null): string {
  if (!dateTimeString) return '-';
  try {
    const d = new Date(dateTimeString);
    if (isNaN(d.getTime())) return dateTimeString;
    return d.toLocaleString('pt-BR');
  } catch {
    return dateTimeString;
  }
}

export function formatDocument(doc: string | undefined | null): string {
  if (!doc) return '-';
  const clean = doc.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return doc;
}

export function getCreditClassLabel(creditClass: CreditClass): string {
  switch (creditClass) {
    case 'CLASSE_I':
      return 'Classe I - Trabalhista';
    case 'CLASSE_II':
      return 'Classe II - Garantia Real';
    case 'CLASSE_III':
      return 'Classe III - Quirografário';
    case 'CLASSE_IV':
      return 'Classe IV - ME / EPP';
    case 'EXTRACONCURSAL':
      return 'Extraconcursal';
    default:
      return creditClass;
  }
}

export function getCreditClassShortLabel(creditClass: CreditClass): string {
  switch (creditClass) {
    case 'CLASSE_I':
      return 'Classe I';
    case 'CLASSE_II':
      return 'Classe II';
    case 'CLASSE_III':
      return 'Classe III';
    case 'CLASSE_IV':
      return 'Classe IV';
    case 'EXTRACONCURSAL':
      return 'Extraconcursal';
    default:
      return creditClass;
  }
}

export function getCreditClassColor(creditClass: CreditClass): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (creditClass) {
    case 'CLASSE_I':
      return {
        bg: 'bg-emerald-50 text-emerald-800',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'CLASSE_II':
      return {
        bg: 'bg-blue-50 text-blue-800',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'CLASSE_III':
      return {
        bg: 'bg-amber-50 text-amber-800',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'CLASSE_IV':
      return {
        bg: 'bg-purple-50 text-purple-800',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'EXTRACONCURSAL':
      return {
        bg: 'bg-slate-100 text-slate-800',
        text: 'text-slate-700',
        border: 'border-slate-300',
        dot: 'bg-slate-500',
      };
  }
}

export function calculateDaysRemaining(dueDateStr: string): number {
  const parts = dueDateStr.split('-');
  if (parts.length !== 3) return 0;
  const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateStayPeriod(
  startDateStr: string,
  baseDays: number = 180,
  extended: boolean = false,
  extendedDays: number = 180
): {
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  percentElapsed: number;
  isExpired: boolean;
  endDateFormatted: string;
} {
  const totalDays = extended ? baseDays + extendedDays : baseDays;
  const parts = startDateStr.split('-');
  if (parts.length !== 3) {
    return {
      totalDays,
      daysElapsed: 0,
      daysRemaining: totalDays,
      percentElapsed: 0,
      isExpired: false,
      endDateFormatted: '-',
    };
  }

  const start = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const end = new Date(start);
  end.setDate(end.getDate() + totalDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const elapsedMs = today.getTime() - start.getTime();
  const daysElapsed = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const percentElapsed = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
  const isExpired = daysRemaining === 0 && daysElapsed >= totalDays;

  const endDay = String(end.getDate()).padStart(2, '0');
  const endMonth = String(end.getMonth() + 1).padStart(2, '0');
  const endYear = end.getFullYear();

  return {
    totalDays,
    daysElapsed,
    daysRemaining,
    percentElapsed,
    isExpired,
    endDateFormatted: `${endDay}/${endMonth}/${endYear}`,
  };
}
