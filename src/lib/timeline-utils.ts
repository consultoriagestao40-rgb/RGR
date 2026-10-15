import { RoutineBlockWithExecution, RolePerformanceStats } from './types';

/**
 * Extracts the deadline time string ("HH:MM") from a timeWindow string (e.g., "08:00 - 08:30" -> "08:30")
 */
export function extractWindowDeadline(timeWindow: string): string {
  if (timeWindow.includes('-')) {
    const parts = timeWindow.split('-');
    return parts[1].trim();
  }
  return timeWindow.trim();
}

/**
 * Parses "YYYY-MM-DD" and "HH:MM" into a Date object safely
 */
export function parseDateTime(dateStr?: string, timeStr?: string): Date {
  const safeDateStr = dateStr && typeof dateStr === 'string' && dateStr.includes('-')
    ? dateStr 
    : new Date().toISOString().split('T')[0];

  const safeTimeStr = timeStr && typeof timeStr === 'string' && timeStr.includes(':')
    ? timeStr
    : '23:59';

  const [year, month, day] = safeDateStr.split('-').map(Number);
  const [hours, minutes] = safeTimeStr.split(':').map(Number);
  return new Date(year || 2026, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0);
}

/**
 * Evaluates whether an activity is delayed and calculates the delay in minutes.
 * @param timeWindow e.g. "08:00 - 08:30"
 * @param executionDate e.g. "2026-10-15"
 * @param completionDate Date object of completion or current time
 */
export function evaluateDelay(
  timeWindow?: string,
  executionDate?: string,
  completionDate: Date = new Date()
): { isDelayed: boolean; delayMinutes: number; deadlineStr: string } {
  if (!timeWindow) {
    return { isDelayed: false, delayMinutes: 0, deadlineStr: '23:59' };
  }

  const deadlineStr = extractWindowDeadline(timeWindow);
  const deadlineDate = parseDateTime(executionDate, deadlineStr);

  const diffMs = completionDate.getTime() - deadlineDate.getTime();
  const delayMinutes = Math.floor(diffMs / (1000 * 60));

  // A leeway tolerance of 2 minutes can be given, otherwise it's delayed
  const isDelayed = delayMinutes > 2;

  return {
    isDelayed,
    delayMinutes: isDelayed ? delayMinutes : 0,
    deadlineStr
  };
}

/**
 * Calculates real-time Chair Performance Stats
 */
export function calculateRolePerformance(blocks: RoutineBlockWithExecution[]): RolePerformanceStats {
  const totalBlocks = blocks.length;
  if (totalBlocks === 0) {
    return {
      totalBlocks: 0,
      completedBlocks: 0,
      onTimeBlocks: 0,
      delayedBlocks: 0,
      blockedBlocks: 0,
      completionRate: 0,
      punctualityRate: 0,
      governanceScore: 0,
      ratingTier: 'STABLE'
    };
  }

  let completedBlocks = 0;
  let onTimeBlocks = 0;
  let delayedBlocks = 0;
  let blockedBlocks = 0;

  blocks.forEach(b => {
    if (b.execution?.status === 'completed') {
      completedBlocks++;
      if (b.execution.isDelayed) {
        delayedBlocks++;
      } else {
        onTimeBlocks++;
      }
    } else if (b.execution?.status === 'blocked') {
      blockedBlocks++;
    }
  });

  const completionRate = Math.round((completedBlocks / totalBlocks) * 100);
  const punctualityRate = completedBlocks > 0 
    ? Math.round((onTimeBlocks / completedBlocks) * 100) 
    : 100;

  // Governance score: 60% completion rate + 40% punctuality rate
  const governanceScore = Math.round((completionRate * 0.6) + (punctualityRate * 0.4));

  let ratingTier: RolePerformanceStats['ratingTier'] = 'STABLE';
  if (governanceScore >= 90) {
    ratingTier = 'EXCELLENT';
  } else if (governanceScore >= 75) {
    ratingTier = 'STABLE';
  } else if (governanceScore >= 50) {
    ratingTier = 'ATTENTION';
  } else {
    ratingTier = 'CRITICAL';
  }

  return {
    totalBlocks,
    completedBlocks,
    onTimeBlocks,
    delayedBlocks,
    blockedBlocks,
    completionRate,
    punctualityRate,
    governanceScore,
    ratingTier
  };
}

/**
 * Categories of delay for corporate governance reporting
 */
export const DELAY_CATEGORIES = [
  { id: 'FORNECEDOR', label: 'Atraso de Terceiros / Fornecedor' },
  { id: 'SISTEMA_ERP', label: 'Instabilidade de Sistema / ERP / Internet Banking' },
  { id: 'PRIORIDADE_DIRETORIA', label: 'Demanda de Urgência Solicitada pela Diretoria' },
  { id: 'APROVACAO_PENDENTE', label: 'Aguardando Aprovação / Visto de Outro Setor' },
  { id: 'SOBRECARGA', label: 'Volume Acima do Padrão / Sobrecarga de Operação' },
  { id: 'CLIENTE', label: 'Atraso / Retenção por Parte do Cliente de Facilities' },
  { id: 'OUTRO', label: 'Outro Motivo Operacional' }
];
