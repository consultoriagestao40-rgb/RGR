import { NextResponse } from 'next/server';
import { 
  getRoles, 
  getAllBlocks, 
  getRitualsForRole, 
  getExecutionsForDate, 
  getMinutes, 
  getUsers,
  getActions 
} from '@/lib/store';
import { 
  computeLeaderboard, 
  computeWeeklyPerformance, 
  computeMonthlyPerformance, 
  computeAnnualEvolution 
} from '@/lib/performance-service';
import { SYSTEM_START_DATE } from '@/lib/frequency';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const selectedDate = dateParam < SYSTEM_START_DATE ? SYSTEM_START_DATE : dateParam;

    const [roles, blocks, minutes, users] = await Promise.all([
      getRoles(),
      getAllBlocks(),
      getMinutes(),
      getUsers()
    ]);

    // Fetch all rituals for all roles
    const ritualsByRole = await Promise.all(roles.map(r => getRitualsForRole(r.id)));
    const allRituals = ritualsByRole.flat();

    // Fetch executions for date
    const executions = await getExecutionsForDate(selectedDate);

    // Compute metrics
    const leaderboard = computeLeaderboard(
      roles,
      blocks,
      allRituals,
      executions,
      {},
      minutes,
      users,
      selectedDate
    );

    const weekly = computeWeeklyPerformance(roles, leaderboard, selectedDate);
    const monthly = computeMonthlyPerformance(roles, leaderboard, selectedDate);
    const annual = computeAnnualEvolution(roles, leaderboard, selectedDate);

    return NextResponse.json({
      selectedDate,
      leaderboard,
      weekly,
      monthly,
      annual
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json({ error: 'Failed to calculate performance' }, { status: 500 });
  }
}
