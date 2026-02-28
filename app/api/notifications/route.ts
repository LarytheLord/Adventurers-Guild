// app/api/notifications/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/api-auth';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    // Users can only see their own notifications
    const userId = authUser.id;
    const type = searchParams.get('type');
    const isRead = searchParams.get('is_read');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Build query
    let query = supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        title,
        message,
        type,
        data,
        read_at,
        created_at,
        users (
          name,
          email
        )
      `)
      .eq('user_id', userId)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    // Add filters if provided
    if (type) {
      query = query.eq('type', type);
    }
    if (isRead !== null) {
      if (isRead === 'true') {
        query = query.not('read_at', 'is', null);
      } else if (isRead === 'false') {
        query = query.is('read_at', null);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ notifications: data, success: true });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return Response.json({ error: 'Failed to fetch notifications', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['user_id', 'title', 'message', 'type'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Create the notification
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: body.user_id,
        title: body.title,
        message: body.message,
        type: body.type,
        data: body.data || null
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ notification: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return Response.json({ error: 'Failed to create notification', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { notification_id, is_read } = body;
    const user_id = authUser.id;

    // Validate required fields
    if (!notification_id || !user_id) {
      return Response.json({ error: 'Notification ID and User ID are required', success: false }, { status: 400 });
    }

    // Check if notification belongs to user
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notification_id)
      .single();

    if (notificationError || !notification) {
      return Response.json({ error: 'Notification not found', success: false }, { status: 404 });
    }

    if (notification.user_id !== user_id) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    // Update the notification
    const { data, error } = await supabase
      .from('notifications')
      .update({
        read_at: is_read ? new Date().toISOString() : null
      })
      .eq('id', notification_id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ notification: data, success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return Response.json({ error: 'Failed to update notification', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { notification_id } = body;
    const user_id = authUser.id;

    // Validate required fields
    if (!notification_id || !user_id) {
      return Response.json({ error: 'Notification ID and User ID are required', success: false }, { status: 400 });
    }

    // Check if notification belongs to user
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notification_id)
      .single();

    if (notificationError || !notification) {
      return Response.json({ error: 'Notification not found', success: false }, { status: 404 });
    }

    if (notification.user_id !== user_id) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    // Delete the notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notification_id);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ message: 'Notification deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return Response.json({ error: 'Failed to delete notification', success: false }, { status: 500 });
  }
}

// API to mark all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const user_id = authUser.id;

    // Mark all notifications for user as read
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user_id)
      .is('read_at', null);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ message: 'All notifications marked as read', success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return Response.json({ error: 'Failed to mark notifications as read', success: false }, { status: 500 });
  }
}