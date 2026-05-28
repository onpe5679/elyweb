import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function getNotificationEmail(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('company_settings')
    .select('value_ko')
    .eq('key', 'notification_email')
    .single();
  return data?.value_ko || null;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { error: dbError } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name,
        email,
        message,
        status: 'new',
      });

    if (dbError) {
      console.error('Error saving contact submission:', dbError);
      return NextResponse.json(
        { error: 'Failed to submit message' },
        { status: 500, headers: corsHeaders }
      );
    }

    let adminEmailSent = false;
    let userEmailSent = false;

    if (resend) {
      const notificationEmail = await getNotificationEmail();
      console.log('[Contact API] Resend configured, notification_email:', notificationEmail);
      console.log('[Contact API] From email:', resendFromEmail);

      if (notificationEmail) {
        try {
          const adminResult = await resend.emails.send({
            from: `Studio Elysian <${resendFromEmail}>`,
            to: notificationEmail,
            subject: `[문의] ${name}님의 새로운 문의`,
            html: `
              <h2>새로운 문의가 접수되었습니다</h2>
              <p><strong>이름:</strong> ${name}</p>
              <p><strong>이메일:</strong> ${email}</p>
              <p><strong>메시지:</strong></p>
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${message}</div>
              <hr />
              <p style="color: #666; font-size: 12px;">이 이메일은 Studio Elysian 웹사이트 문의 폼에서 자동으로 발송되었습니다.</p>
            `,
          });
          if (adminResult.error) {
            console.error('[Contact API] Admin email rejected by Resend:', adminResult.error);
          } else {
            console.log('[Contact API] Admin email sent:', adminResult.data?.id);
            adminEmailSent = true;
          }
        } catch (adminEmailError) {
          console.error('[Contact API] Failed to send admin email:', adminEmailError);
        }
      }

      try {
        const userResult = await resend.emails.send({
          from: `Studio Elysian <${resendFromEmail}>`,
          to: email,
          subject: `[Studio Elysian] 문의가 접수되었습니다`,
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif;">
              <h2 style="color: #333;">문의해 주셔서 감사합니다</h2>
              <p>${name}님, 안녕하세요!</p>
              <p>문의가 정상적으로 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <h3 style="color: #666; font-size: 14px;">문의 내용</h3>
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${message}</div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #999; font-size: 12px;">
                본 메일은 발신 전용입니다. 추가 문의 사항은 웹사이트를 통해 연락 부탁드립니다.
              </p>
              <p style="color: #999; font-size: 12px;">© Studio Elysian</p>
            </div>
          `,
        });
        if (userResult.error) {
          console.error('[Contact API] User confirmation email rejected by Resend:', userResult.error);
        } else {
          console.log('[Contact API] User confirmation email sent:', userResult.data?.id);
          userEmailSent = true;
        }
      } catch (userEmailError) {
        console.error('[Contact API] Failed to send user confirmation email:', userEmailError);
      }
    } else {
      console.log('[Contact API] Resend not configured - RESEND_API_KEY missing');
    }

    return NextResponse.json(
      { success: true, adminEmailSent, userEmailSent, message: 'Message saved' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
