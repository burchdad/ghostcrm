import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';


export const dynamic = 'force-dynamic';
// This endpoint handles sending trial reminder notifications
export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting trial notification processing...');

    // Get trials expiring in the next 3 days
    const { data: expiringTrials, error: fetchError } = await supabase
      .rpc('get_expiring_trials', { days_ahead: 3 });

    if (fetchError) {
      console.error('Error fetching expiring trials:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch expiring trials' }, { status: 500 });
    }

    if (!expiringTrials || expiringTrials.length === 0) {
      console.log('No trials expiring soon');
      return NextResponse.json({ 
        message: 'No trials expiring soon',
        notifications_sent: 0
      });
    }

    console.log(`Found ${expiringTrials.length} trials expiring soon`);

    let notificationsSent = 0;
    let errorCount = 0;
    const results: any[] = [];

    for (const trial of expiringTrials) {
      try {
        // Get user details for the notification
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('id', trial.user_id)
          .single();

        if (userError || !userData) {
          console.error(`Error fetching user data for ${trial.user_id}:`, userError);
          errorCount++;
          continue;
        }

        const daysRemaining = trial.days_remaining;
        const trialEndDate = new Date(trial.trial_end_date);

        // Check if we've already sent a notification for this milestone
        const { data: existingNotification } = await supabase
          .from('user_notifications')
          .select('id')
          .eq('user_id', trial.user_id)
          .eq('type', 'trial_reminder')
          .eq('metadata->days_remaining', daysRemaining)
          .single();

        if (existingNotification) {
          console.log(`Notification already sent for user ${trial.user_id} with ${daysRemaining} days remaining`);
          continue;
        }

        // Send notification (email, in-app, etc.)
        const notificationResult = await sendTrialReminderNotification({
          user: userData,
          daysRemaining,
          trialEndDate,
          hasPaymentMethod: !!trial.payment_method_id
        });

        // Record the notification in the database
        const { error: notificationError } = await supabase
          .from('user_notifications')
          .insert({
            user_id: trial.user_id,
            type: 'trial_reminder',
            title: `Your trial expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
            message: notificationResult.message,
            metadata: {
              days_remaining: daysRemaining,
              trial_end_date: trial.trial_end_date,
              has_payment_method: !!trial.payment_method_id
            },
            sent_at: new Date().toISOString()
          });

        if (notificationError) {
          console.error(`Error recording notification for user ${trial.user_id}:`, notificationError);
          errorCount++;
        } else {
          notificationsSent++;
          results.push({
            user_id: trial.user_id,
            email: userData.email,
            days_remaining: daysRemaining,
            status: 'sent'
          });
        }

        // Update billing status to indicate reminder was sent
        if (daysRemaining <= 3) {
          await supabase
            .from('user_billing')
            .update({
              billing_status: 'trial_ending',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', trial.user_id);
        }

      } catch (error) {
        console.error(`Error processing notification for user ${trial.user_id}:`, error);
        errorCount++;
        results.push({
          user_id: trial.user_id,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`Trial notification processing completed. Sent: ${notificationsSent}, Errors: ${errorCount}`);

    return NextResponse.json({
      message: 'Trial notification processing completed',
      notifications_sent: notificationsSent,
      errors: errorCount,
      total_found: expiringTrials.length,
      results
    });

  } catch (error) {
    console.error('Error in trial notification job:', error);
    return NextResponse.json(
      { error: 'Trial notification job failed' },
      { status: 500 }
    );
  }
}

// Helper function to send trial reminder notifications
async function sendTrialReminderNotification({
  user,
  daysRemaining,
  trialEndDate,
  hasPaymentMethod
}: {
  user: { email: string; first_name?: string; last_name?: string };
  daysRemaining: number;
  trialEndDate: Date;
  hasPaymentMethod: boolean;
}) {
  const firstName = user.first_name || 'there';
  
  let subject: string;
  let message: string;

  if (daysRemaining === 1) {
    subject = 'Your GhostCRM trial expires tomorrow!';
    message = hasPaymentMethod 
      ? `Hi ${firstName}, your 14-day GhostCRM trial expires tomorrow. Don't worry - we'll automatically continue your subscription with your saved payment method.`
      : `Hi ${firstName}, your 14-day GhostCRM trial expires tomorrow! Add a payment method to continue using GhostCRM without interruption.`;
  } else {
    subject = `Your GhostCRM trial expires in ${daysRemaining} days`;
    message = hasPaymentMethod
      ? `Hi ${firstName}, your 14-day GhostCRM trial expires in ${daysRemaining} days. Your subscription will automatically continue with your saved payment method.`
      : `Hi ${firstName}, your 14-day GhostCRM trial expires in ${daysRemaining} days. Add a payment method now to ensure uninterrupted access to GhostCRM.`;
  }

  // Here you would integrate with your email service (SendGrid, etc.)
  // For now, we'll just log the notification
  console.log(`Sending trial reminder to ${user.email}: ${subject}`);
  
  // Example integration with SendGrid or similar:
  /*
  try {
    await sendEmail({
      to: user.email,
      subject,
      html: generateTrialReminderEmail({
        firstName,
        daysRemaining,
        trialEndDate,
        hasPaymentMethod
      })
    });
  } catch (emailError) {
    console.error('Error sending email:', emailError);
    throw emailError;
  }
  */

  return {
    subject,
    message,
    channel: 'email',
    status: 'sent' // or 'failed' if email sending fails
  };
}
