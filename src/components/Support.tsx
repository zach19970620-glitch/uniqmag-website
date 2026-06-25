import { useState, useEffect } from 'react';
import { HelpCircle, FileText, Truck, RefreshCw, ShieldCheck, ChevronDown, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import supportData from '../../support.json';

const Support = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const tabs = [
    { id: 'faq', title: '常见问题', icon: <HelpCircle size={18} /> },
    { id: 'shipping', title: '运输政策', icon: <Truck size={18} /> },
    { id: 'refund', title: '退货退款', icon: <RefreshCw size={18} /> },
    { id: 'terms', title: '服务条款', icon: <FileText size={18} /> },
    { id: 'privacy', title: '隐私政策', icon: <ShieldCheck size={18} /> },
  ];

  const activeSection = supportData.sections.find(s => s.id === activeTab);

  return (
    <div className="pt-24 pb-32 relative z-10 min-h-screen">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 mt-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md text-xs font-medium text-zinc-300 mb-6 border border-white/10 tracking-widest uppercase">
              SUPPORT CENTER
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{supportData.hero.title}</h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              {supportData.hero.subtitle}
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4 shrink-0">
            <div className="glass-panel rounded-2xl p-4 sticky top-32">
              <nav className="flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'bg-white/10 text-white font-medium border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    <span className={activeTab === tab.id ? 'text-primary' : ''}>{tab.icon}</span>
                    {tab.title}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-white/10 px-4">
                <h4 className="text-sm font-medium text-white mb-2">需要更多帮助？</h4>
                <p className="text-xs text-zinc-500 mb-4 leading-relaxed">如果在这里找不到您需要的答案，我们的支持团队随时准备为您服务。</p>
                <Link 
                  to="/contact" 
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium border border-primary/20"
                >
                  <MessageSquare size={16} />
                  联系客服
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10"
              >
                {activeSection && (
                  <>
                    <div className="mb-10 pb-10 border-b border-white/10">
                      <h2 className="text-3xl font-bold text-white mb-4">{activeSection.title}</h2>
                      <p className="text-zinc-400 text-lg leading-relaxed">{activeSection.intro}</p>
                    </div>

                    {/* FAQ Type Render */}
                    {activeSection.type === 'faq' && activeSection.faq && (
                      <div className="space-y-4">
                        {activeSection.faq.map((item, idx) => (
                          <div 
                            key={idx} 
                            className={`border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 ${
                              openFaqIndex === idx ? 'bg-white/5 border-white/20' : 'bg-transparent hover:bg-white/[0.02]'
                            }`}
                          >
                            <button
                              onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                              className="w-full flex items-center justify-between p-6 text-left"
                            >
                              <span className="font-medium text-white pr-8">{item.question}</span>
                              <span className={`text-zinc-500 transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180 text-primary' : ''}`}>
                                <ChevronDown size={20} />
                              </span>
                            </button>
                            <AnimatePresence>
                              {openFaqIndex === idx && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <div className="px-6 pb-6 text-zinc-400 leading-relaxed font-light border-t border-white/5 pt-4 mt-2">
                                    {item.answer}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Policy Type Render */}
                    {activeSection.type === 'policy' && activeSection.blocks && (
                      <div className="space-y-12">
                        {activeSection.blocks.map((block, idx) => (
                          <div key={idx} className="policy-block">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                              <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                              {block.heading}
                            </h3>
                            
                            {block.paragraphs && (
                              <div className="space-y-4 mb-6">
                                {block.paragraphs.map((p, pIdx) => (
                                  <p key={pIdx} className="text-zinc-400 leading-relaxed font-light">{p}</p>
                                ))}
                              </div>
                            )}
                            
                            {block.list && (
                              <ul className="space-y-3 mb-6">
                                {block.list.map((item, lIdx) => (
                                  <li key={lIdx} className="flex items-start gap-3 text-zinc-400 leading-relaxed font-light">
                                    <span className="text-primary mt-1.5 shrink-0">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {/* @ts-ignore */}
                            {block.orderedList && (
                              <ol className="space-y-3 mb-6 counter-reset-list">
                                {/* @ts-ignore */}
                                {block.orderedList.map((item: string, oIdx: number) => (
                                  <li key={oIdx} className="flex items-start gap-3 text-zinc-400 leading-relaxed font-light">
                                    <span className="text-primary font-mono text-sm mt-1 shrink-0 bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center">{oIdx + 1}</span>
                                    <span className="pt-0.5">{item}</span>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
