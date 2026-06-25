import { Mail, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-32 relative z-10 min-h-screen flex items-center">
      <div className="container mx-auto px-6 mt-12">
        <div className="flex flex-col lg:flex-row gap-16 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="lg:w-1/3">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">联系我们</h2>
            <p className="text-zinc-400 mb-12">
              我们很乐意听到您的声音，团队随时为您提供帮助。请填写表单，或直接发送邮件。
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">邮箱</h4>
                  <div className="space-y-2 text-sm text-zinc-400">
                    <p><span className="text-zinc-500 w-16 inline-block">售前客服</span> support@uniqmagx.com</p>
                    <p><span className="text-zinc-500 w-16 inline-block">售后支持</span> service@uniqmagx.com</p>
                    <p><span className="text-zinc-500 w-16 inline-block">商务合作</span> hello@uniqmagx.com</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">服务时间</h4>
                  <p className="text-sm text-zinc-400">周一至周五，9:00-18:00（GMT+8）<br/>我们通常会在 12-24 小时内回复。</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">公司地址</h4>
                  <p className="text-sm text-zinc-400">深圳市宝安区前海科兴科学园<br/>8栋 1207 室</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="lg:w-2/3">
            <form className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-zinc-300">姓名</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600"
                    placeholder="您的名字"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-zinc-300">邮箱</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <label htmlFor="subject" className="text-sm font-medium text-zinc-300">咨询主题</label>
                <select 
                  id="subject" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
                >
                  <option value="pre-sale" className="bg-zinc-900">售前咨询</option>
                  <option value="after-sale" className="bg-zinc-900">售后支持</option>
                  <option value="business" className="bg-zinc-900">商务合作</option>
                  <option value="other" className="bg-zinc-900">其他事项</option>
                </select>
              </div>
              
              <div className="space-y-2 mb-8">
                <label htmlFor="message" className="text-sm font-medium text-zinc-300">留言内容</label>
                <textarea 
                  id="message" 
                  rows={5}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 resize-none"
                  placeholder="请详细描述您的问题..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(102,105,227,0.3)] hover:shadow-[0_0_30px_rgba(102,105,227,0.5)]"
              >
                发送消息
              </button>
              
              <p className="text-xs text-zinc-500 text-center mt-4">
                本站点表单仅供展示，正式提交请直接发送邮件至 support@uniqmagx.com
              </p>
            </form>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Contact;
