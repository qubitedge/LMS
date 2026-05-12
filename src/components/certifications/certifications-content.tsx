'use client';

import { FileText, Download, ShieldCheck, ExternalLink, Calendar, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CertificationsContentProps {
  profile: {
    full_name: string;
    offer_letter_url?: string;
    certificate_url?: string;
    created_at: string;
    domain?: string;
  };
}

export default function CertificationsContent({ profile }: CertificationsContentProps) {
  const documents = [
    {
      title: 'Offer Letter',
      description: 'Official internship offer letter from Qubitedge.',
      url: profile.offer_letter_url,
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Completion Certificate',
      description: 'Certificate of completion for your successful internship.',
      url: profile.certificate_url,
      icon: ShieldCheck,
      color: 'amber',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-100',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-5xl font-black mb-3 tracking-tight" style={{ fontFamily: 'Playfair Display', color: '#1A1A2E' }}>
            My Documents
          </h1>
          <p className="text-lg font-bold text-[#7182C7]">
            Access your official internship records and certifications.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/40 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#4A5DB5] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <User size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#7182C7]">Intern Profile</p>
            <p className="text-md font-black text-[#1A1A2E]">{profile.full_name}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {documents.map((doc, index) => (
          <motion.div
            key={doc.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white/70 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 group">
              <CardContent className="p-0">
                <div className={`h-3 bg-gradient-to-r ${doc.color === 'blue' ? 'from-blue-400 to-blue-600' : 'from-amber-400 to-amber-600'}`} />
                <div className="p-8 md:p-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className={`w-16 h-16 rounded-[1.5rem] ${doc.bgColor} flex items-center justify-center ${doc.textColor} shadow-inner`}>
                      <doc.icon size={32} />
                    </div>
                    {doc.url ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck size={12} /> Issued
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest">
                        Pending
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-[#1A1A2E] mb-2">{doc.title}</h2>
                    <p className="text-sm font-bold text-[#7182C7] leading-relaxed">
                      {doc.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#A0ACDC] uppercase tracking-widest">
                      <Calendar size={14} />
                      {doc.url ? 'Available Now' : 'Check back later'}
                    </div>
                    {doc.url ? (
                      <div className="flex gap-3">
                        <Button 
                          variant="outline"
                          onClick={() => window.open(doc.url, '_blank')}
                          className="h-12 rounded-xl border-slate-200 font-black text-[#7182C7] hover:bg-slate-50"
                        >
                          <ExternalLink size={16} className="mr-2" /> View
                        </Button>
                        <a href={doc.url} download={`${doc.title}.pdf`}>
                          <Button 
                            className={`h-12 rounded-xl font-black text-white shadow-xl ${doc.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'}`}
                          >
                            <Download size={16} className="mr-2" /> Download
                          </Button>
                        </a>
                      </div>
                    ) : (
                      <Button 
                        disabled 
                        className="h-12 rounded-xl bg-slate-100 text-slate-400 font-black cursor-not-allowed"
                      >
                        Not Yet Issued
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-8 rounded-[2.5rem] bg-[#E9EEF9]/50 border border-white shadow-inner flex flex-col md:flex-row items-center gap-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-sm flex-shrink-0">
          <Calendar size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-[#1A1A2E] leading-relaxed">
            Certificates and offer letters are issued by the administrative team. If you believe there is an error or your documents are missing after completion, please contact your supervisor.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
