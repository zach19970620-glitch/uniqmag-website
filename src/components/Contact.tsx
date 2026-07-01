import { useState, type FormEvent } from 'react';
import { Mail, MapPin, Clock, QrCode, Loader2 } from 'lucide-react';
import contactData from '../data/contact.json';

const SUBJECT_OPTIONS = [
  { value: 'pre-sale', label: '售前咨询' },
  { value: 'after-sale', label: '售后支持' },
  { value: 'business', label: '商务合作' },
  { value: 'other', label: '其他事项' },
] as const;

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState<string>(SUBJECT_OPTIONS[0].value);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setFeedback('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setStatus('error');
        setFeedback(data.error ?? '发送失败，请稍后重试');
        return;
      }

      setStatus('success');
      setFeedback(data.message ?? '消息已发送，我们会尽快回复您');
      setName('');
      setEmail('');
      setSubject(SUBJECT_OPTIONS[0].value);
      setMessage('');
    } catch {
      setStatus('error');
      setFeedback('网络错误，请检查连接后重试');
    }
  };

  return (
    <section id="contact" className="py-32 relative z-10 min-h-screen flex items-center">
      <div className="container mx-auto px-6 mt-12">
        <div className="flex flex-col lg:flex-row gap-16 max-w-6xl mx-auto">
          
          <div className="lg:w-1/3">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{contactData.title}</h2>
            <p className="text-zinc-400 mb-12">
              {contactData.subtitle}
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">邮箱</h4>
                  <div className="space-y-2 text-sm text-zinc-400">
                    {contactData.emails.map((item) => (
                      <p key={item.label}>
                        <span className="text-zinc-500 w-16 inline-block">{item.label}</span> {item.address}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">服务时间</h4>
                  <p className="text-sm text-zinc-400 whitespace-pre-line">{contactData.hours}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">公司地址</h4>
                  <p className="text-sm text-zinc-400 whitespace-pre-line">{contactData.address}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary shrink-0">
                  <QrCode size={18} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-3">微信公众号</h4>
                  <img
                    src={contactData.wechat.qrcode}
                    alt="UNIQMAG 微信公众号"
                    className="w-36 h-36 rounded-xl border border-white/10 bg-white"
                  />
                  <p className="text-sm text-zinc-400 mt-3">{contactData.wechat.hint}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <form className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-zinc-300">姓名</label>
                  <input 
                    type="text" 
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={status === 'loading'}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 disabled:opacity-50"
                    placeholder="您的名字"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-zinc-300">邮箱</label>
                  <input 
                    type="email" 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === 'loading'}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 disabled:opacity-50"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <label htmlFor="subject" className="text-sm font-medium text-zinc-300">咨询主题</label>
                <select 
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none disabled:opacity-50"
                >
                  {SUBJECT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-zinc-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2 mb-8">
                <label htmlFor="message" className="text-sm font-medium text-zinc-300">留言内容</label>
                <textarea 
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  minLength={5}
                  disabled={status === 'loading'}
                  rows={5}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 resize-none disabled:opacity-50"
                  placeholder="请详细描述您的问题..."
                />
              </div>
              
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(102,105,227,0.3)] hover:shadow-[0_0_30px_rgba(102,105,227,0.5)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    发送中...
                  </>
                ) : (
                  '发送消息'
                )}
              </button>

              {feedback && (
                <p
                  className={`text-sm text-center mt-4 ${
                    status === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {feedback}
                </p>
              )}
              
              <p className="text-xs text-zinc-500 text-center mt-4">
                {contactData.formDisclaimer}
              </p>
            </form>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Contact;
