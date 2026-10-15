import { DailyRitual } from './types';

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
 * Regra de Ouro: Avalia se um rito deve ser executado na data específica.
 */
export function isRitualScheduledForDate(ritual: DailyRitual, dateStr: string): boolean {
  // Não existem ritos agendados retroativamente antes da criação da plataforma
  if (isBeforeSystemStart(dateStr)) {
    return false;
  }

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
