import { StatisticsService } from '@/services/statistics.service';
import { handleApiError, successResponse } from '@/utils/error-handler';

const statisticsService = new StatisticsService();

export async function GET() {
  try {
    const stats = await statisticsService.getSystemStatistics();
    return successResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
