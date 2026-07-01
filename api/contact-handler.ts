export interface ContactFormPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactEnv {
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  TO_EMAIL: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  'pre-sale': '售前咨询',
  'after-sale': '售后支持',
  business: '商务合作',
  other: '其他事项',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
  });
}

export function validateContactPayload(
  data: unknown,
): { ok: true; data: ContactFormPayload } | { ok: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { ok: false, error: '无效的请求数据' };
  }

  const { name, email, subject, message } = data as Record<string, unknown>;

  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return { ok: false, error: '请填写姓名' };
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: '请填写有效的邮箱地址' };
  }

  if (!subject || typeof subject !== 'string' || !SUBJECT_LABELS[subject]) {
    return { ok: false, error: '请选择咨询主题' };
  }

  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    return { ok: false, error: '留言内容至少 5 个字符' };
  }

  return {
    ok: true,
    data: {
      name: name.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
    },
  };
}

export async function sendContactEmail(
  payload: ContactFormPayload,
  env: ContactEnv,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!env.RESEND_API_KEY) {
    return { ok: false, error: '邮件服务未配置' };
  }

  const subjectLabel = SUBJECT_LABELS[payload.subject];
  const html = `
    <h2>网站联系表单新消息</h2>
    <p><strong>姓名：</strong>${escapeHtml(payload.name)}</p>
    <p><strong>邮箱：</strong>${escapeHtml(payload.email)}</p>
    <p><strong>主题：</strong>${escapeHtml(subjectLabel)}</p>
    <p><strong>留言：</strong></p>
    <p>${escapeHtml(payload.message).replace(/\n/g, '<br>')}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [env.TO_EMAIL],
      reply_to: payload.email,
      subject: `[网站咨询] ${subjectLabel} - ${payload.name}`,
      html,
    }),
  });

  if (!response.ok) {
    console.error('Resend API error:', response.status, await response.text());
    return { ok: false, error: '邮件发送失败，请稍后重试' };
  }

  return { ok: true };
}

export async function handleContactRequest(
  request: Request,
  env: ContactEnv,
): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await request.json();
    const validated = validateContactPayload(body);

    if (!validated.ok) {
      return jsonResponse({ error: validated.error }, 400);
    }

    const result = await sendContactEmail(validated.data, env);

    if (!result.ok) {
      return jsonResponse({ error: result.error }, 500);
    }

    return jsonResponse({ success: true, message: '消息已发送，我们会尽快回复您' }, 200);
  } catch {
    return jsonResponse({ error: '请求处理失败' }, 500);
  }
}
