import { NextRequest, NextResponse } from 'next/server';
import { CALENDAR_PROVIDERS, CalendarConfig, CalendarProvider } from '@/lib/calendar/providers';


export const dynamic = 'force-dynamic';
// Mock storage - replace with actual database
let userCalendarConfigs: CalendarConfig[] = [];

export async function GET(request: NextRequest) {
  try {
    // Get user's calendar configurations
    return NextResponse.json({
      success: true,
      data: {
        providers: CALENDAR_PROVIDERS,
        userConfigs: userCalendarConfigs,
        hasActiveConfig: userCalendarConfigs.some(config => config.isActive)
      }
    });
  } catch (error) {
    console.error('Error fetching calendar config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, providerId, config } = body;

    switch (action) {
      case 'add_provider':
        const provider = CALENDAR_PROVIDERS.find(p => p.id === providerId);
        if (!provider) {
          return NextResponse.json(
            { success: false, error: 'Invalid calendar provider' },
            { status: 400 }
          );
        }

        // Deactivate other configs if this is being set as active
        if (config.isActive) {
          userCalendarConfigs = userCalendarConfigs.map(c => ({ ...c, isActive: false }));
        }

        const newConfig: CalendarConfig = {
          providerId,
          credentials: config.credentials || {},
          settings: {
            syncDirection: config.settings?.syncDirection || 'bidirectional',
            defaultDuration: config.settings?.defaultDuration || 30,
            autoCreateMeetings: config.settings?.autoCreateMeetings || true,
            timezone: config.settings?.timezone || 'America/New_York',
            businessHours: config.settings?.businessHours || {
              start: '09:00',
              end: '17:00',
              days: [1, 2, 3, 4, 5]
            }
          },
          isActive: config.isActive || false,
          lastSync: new Date().toISOString()
        };

        userCalendarConfigs.push(newConfig);

        return NextResponse.json({
          success: true,
          message: `${provider.displayName} calendar connected successfully`,
          data: newConfig
        });

      case 'update_provider':
        const configIndex = userCalendarConfigs.findIndex(c => c.providerId === providerId);
        if (configIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Calendar configuration not found' },
            { status: 404 }
          );
        }

        // Deactivate other configs if this is being set as active
        if (config.isActive) {
          userCalendarConfigs = userCalendarConfigs.map(c => ({ ...c, isActive: false }));
        }

        userCalendarConfigs[configIndex] = { ...userCalendarConfigs[configIndex], ...config };

        return NextResponse.json({
          success: true,
          message: 'Calendar configuration updated',
          data: userCalendarConfigs[configIndex]
        });

      case 'remove_provider':
        userCalendarConfigs = userCalendarConfigs.filter(c => c.providerId !== providerId);

        return NextResponse.json({
          success: true,
          message: 'Calendar provider removed',
          data: { providerId }
        });

      case 'sync_calendar':
        const activeConfig = userCalendarConfigs.find(c => c.providerId === providerId);
        if (!activeConfig) {
          return NextResponse.json(
            { success: false, error: 'No active calendar configuration found' },
            { status: 400 }
          );
        }

        // TODO: Implement actual calendar sync logic
        activeConfig.lastSync = new Date().toISOString();

        return NextResponse.json({
          success: true,
          message: 'Calendar synced successfully',
          data: {
            providerId,
            lastSync: activeConfig.lastSync,
            eventsCount: Math.floor(Math.random() * 10) + 1 // Mock count
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in calendar config API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
