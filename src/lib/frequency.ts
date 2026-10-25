import { DailyRitual, RoutineBlock } from './types';

export const WEEK_DAYS = [
  { value: 1, label: 'Seg', fullName: 'Segunda-feira' },
  { value: 2, label: 'Ter', fullName: 'Terça-feira' },
  { value: 3, label: 'Qua', fullName: 'Quarta-feira' },
  { value: 4, label: 'Qui', fullName: 'Quinta-feira' },
  { value: 5, label: 'Sex', fullName: 'Sexta-feira' },
  { value: 6, label: 'Sáb', fullName: 'Sábado' },
  { value: 0, label: 'Dom', fullName: 'Domingo' }
];

/**
 * Data oficial de implantação/lançamento da plataforma RGR.
 * Por protocolo de governança, nenhuma rotina, rito ou penalidade existe retroativamente antes desta data.
 */
export const SYSTEM_START_DATE = '2026-10-15';

export function isBeforeSystemStart(dateStr: string): boolean {
  return dateStr < SYSTEM_START_DATE;
}

/**
 * Converte string 'YYYY-MM-DD' em Date local sem distorção de fuso horário.
 */
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/**
 * Retorna se a data cai em sábado (6) ou domingo (0).
 */
export function isWeekend(dateStr: string): boolean {
  const d = parseLocalDate(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Retorna o dia da semana: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb.
 */
export function getDayOfWeek(dateStr: string): number {
  return parseLocalDate(dateStr).getDay();
}

/**
 * Converte qualquer data (YYYY-MM-DD ou ISO) para o formato brasileiro padrão: DD/MM/AAAA.
 * Ex: '2026-10-25' -> '25/10/2026'
 */
export function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  // Se já estiver no padrão DD/MM/AAAA:
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;

  const cleanDate = trimmed.includes('T') ? trimmed.split('T')[0] : trimmed.split(' ')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR');
    }
  } catch (e) {}

  return dateStr;
}

/**
 * Verifica se a data é o primeiro dia útil do mês.
 */
export function isFirstBusinessDayOfMonth(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Encontra o primeiro dia útil (seg a sex)
  for (let day = 1; day <= 7; day++) {
    const candidate = new Date(year, month, day);
    const dow = candidate.getDay();
    if (dow !== 0 && dow !== 6) {
      return date.getDate() === day;
    }
  }
  return false;
}

/**
 * Verifica se a data é o último dia útil do mês.
 */
export function isLastBusinessDayOfMonth(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = daysInMonth; day >= daysInMonth - 6; day--) {
    const candidate = new Date(year, month, day);
    const dow = candidate.getDay();
    if (dow !== 0 && dow !== 6) {
      return date.getDate() === day;
    }
  }
  return false;
}

/**
 * Verifica se a data é o quinto dia útil do mês (data padrão CLT para pagamento de salários e VA).
 */
export function isFifthBusinessDayOfMonth(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth();
  let count = 0;
  for (let day = 1; day <= 31; day++) {
    const candidate = new Date(year, month, day);
    if (candidate.getMonth() !== month) break;
    const dow = candidate.getDay();
    if (dow !== 0 && dow !== 6) {
      count++;
      if (count === 5) {
        return date.getDate() === day;
      }
    }
  }
  return false;
}

/**
 * Regra de Ouro: Avalia se um rito deve ser executado na data específica.
 */
export function isRitualScheduledForDate(ritual: DailyRitual, dateStr: string): boolean {
  const date = parseLocalDate(dateStr);
  const dow = date.getDay(); // 0 a 6
  const isWeekendDay = dow === 0 || dow === 6;
  const frequency = ritual.frequency || 'daily';

  // 1. MODO DIÁRIO
  if (frequency === 'daily') {
    // Se o rito explicitamente definiu dias específicos da semana:
    if (ritual.weekDays && ritual.weekDays.length > 0) {
      return ritual.weekDays.includes(dow);
    }
    // Se explicitamente configurado para incluir finais de semana:
    if (ritual.includeWeekends) {
      return true;
    }
    // Padrão de rotina operacional corporativa: NÃO executa em finais de semana (Seg a Sex apenas)
    return !isWeekendDay;
  }

  // 2. MODO SEMANAL (ex: 2x ou 3x na semana)
  if (frequency === 'weekly') {
    if (ritual.weekDays && ritual.weekDays.length > 0) {
      return ritual.weekDays.includes(dow);
    }
    // Se for semanal sem dias declarados, padrão é segunda-feira
    return dow === 1;
  }

  // 3. MODO MENSAL
  if (frequency === 'monthly') {
    if (ritual.monthlyType === 'first_business_day') {
      return isFirstBusinessDayOfMonth(date);
    }
    if (ritual.monthlyType === 'fifth_business_day') {
      return isFifthBusinessDayOfMonth(date);
    }
    if (ritual.monthlyType === 'last_business_day') {
      return isLastBusinessDayOfMonth(date);
    }
    if (ritual.monthDay) {
      return date.getDate() === ritual.monthDay;
    }
    // Padrão: dia 01 do mês
    return date.getDate() === 1;
  }

  return true;
}

/**
 * Retorna texto formatado legível da frequência para badges e telas.
 */
export function formatRitualFrequency(ritual: DailyRitual): string {
  const freq = ritual.frequency || 'daily';

  if (freq === 'daily') {
    if (ritual.weekDays && ritual.weekDays.length > 0) {
      if (ritual.weekDays.length === 5 && !ritual.weekDays.includes(0) && !ritual.weekDays.includes(6)) {
        return 'Diário (Seg a Sex)';
      }
      if (ritual.weekDays.length === 7) {
        return 'Diário (Todos os dias)';
      }
      const names = ritual.weekDays.map(d => WEEK_DAYS.find(w => w.value === d)?.label).filter(Boolean).join(', ');
      return `Diário (${names})`;
    }
    if (ritual.includeWeekends) {
      return 'Diário (Inclui Finais de Semana)';
    }
    return 'Diário (Seg a Sex)';
  }

  if (freq === 'weekly') {
    if (ritual.weekDays && ritual.weekDays.length > 0) {
      const labels = ritual.weekDays.map(d => WEEK_DAYS.find(w => w.value === d)?.label).filter(Boolean);
      const count = labels.length;
      if (count === 1) {
        const full = WEEK_DAYS.find(w => w.value === ritual.weekDays![0])?.fullName;
        return `Semanal (Toda ${full || labels[0]})`;
      }
      return `Semanal (${count}x/sem: ${labels.join(', ')})`;
    }
    return 'Semanal (1x/semana)';
  }

  if (freq === 'monthly') {
    if (ritual.monthlyType === 'first_business_day') {
      return 'Mensal (1º dia útil)';
    }
    if (ritual.monthlyType === 'fifth_business_day') {
      return 'Mensal (5º dia útil)';
    }
    if (ritual.monthlyType === 'last_business_day') {
      return 'Mensal (Último dia útil)';
    }
    if (ritual.monthDay) {
      return `Mensal (Todo dia ${ritual.monthDay.toString().padStart(2, '0')})`;
    }
    return 'Mensal (1º dia do mês)';
  }

  return 'Diário (Seg a Sex)';
}

/**
 * Avalia se um bloco de rotina operacional (POP) deve ser executado na data específica.
 */
export function isBlockScheduledForDate(block: RoutineBlock, dateStr: string): boolean {
  const date = parseLocalDate(dateStr);
  const dow = date.getDay(); // 0 a 6
  const isWeekendDay = dow === 0 || dow === 6;
  const freq = block.frequency || 'daily';

  if (freq === 'daily') {
    // Se for diário, executa em dias úteis
    return !isWeekendDay;
  }

  if (freq === 'weekly') {
    if (block.dayOfWeek !== undefined && block.dayOfWeek !== null) {
      return block.dayOfWeek === dow;
    }
    // padrão se não especificado: sexta-feira
    return dow === 5;
  }

  if (freq === 'monthly') {
    if (block.dayOfMonth) {
      // 999 = Último dia útil do mês (compra de VT)
      if (block.dayOfMonth === 999) {
        return isLastBusinessDayOfMonth(date);
      }
      // 555 = 5º dia útil do mês (salários e VA)
      if (block.dayOfMonth === 555) {
        return isFifthBusinessDayOfMonth(date);
      }
      return date.getDate() === block.dayOfMonth;
    }
    return date.getDate() === 1;
  }

  return true;
}

/**
 * Formata a periodicidade de um POP para exibição elegante no card.
 */
export function formatBlockFrequency(block: RoutineBlock): { label: string; badgeColor: string; isMonthly: boolean; isWeekly: boolean } {
  const freq = block.frequency || 'daily';

  if (freq === 'daily') {
    return {
      label: 'Diário (Seg a Sex)',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      isMonthly: false,
      isWeekly: false
    };
  }

  if (freq === 'weekly') {
    const dayName = block.dayOfWeek !== undefined && block.dayOfWeek !== null 
      ? WEEK_DAYS.find(w => w.value === block.dayOfWeek)?.label || 'Semanal'
      : 'Semanal';
    return {
      label: `Semanal (${dayName})`,
      badgeColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      isMonthly: false,
      isWeekly: true
    };
  }

  if (freq === 'monthly') {
    let dayStr = 'Mensal';
    if (block.dayOfMonth === 999) {
      dayStr = 'Mensal (Último dia útil)';
    } else if (block.dayOfMonth === 555) {
      dayStr = 'Mensal (5º dia útil)';
    } else if (block.dayOfMonth) {
      dayStr = `Mensal (Dia ${String(block.dayOfMonth).padStart(2, '0')})`;
    }
    return {
      label: dayStr,
      badgeColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      isMonthly: true,
      isWeekly: false
    };
  }

  return {
    label: 'Diário',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    isMonthly: false,
    isWeekly: false
  };
}

/**
 * Encontra a próxima data de dia útil (Segunda a Sexta) a partir de uma data fornecida.
 */
export function getNextBusinessDay(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

