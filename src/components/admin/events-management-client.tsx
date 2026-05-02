'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BookOpen, Calendar, Video, Link as LinkIcon, Shield, 
  CalendarCheck, TrendingUp, User 
} from 'lucide-react';
import DayEditDialog from '@/components/admin/day-edit-dialog';
import EventEditDialog from '@/components/admin/event-edit-dialog';
import ModuleEditDialog from '@/components/admin/module-edit-dialog';

interface EventsManagementClientProps {
  events: any[] | null;
}

export default function EventsManagementClient({ events }: EventsManagementClientProps) {
  return (
    <div className="relative pb-10 min-h-screen">
      <div className="bg-mesh opacity-20" />
      
      <div className="relative z-10 px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-black mb-3 tracking-tighter" 
              style={{ fontFamily: 'Playfair Display', color: '#1A1A2E' }}
            >
              Event Control Center
            </motion.h1>
            <p className="text-xl font-bold text-[#7182C7] flex items-center gap-3">
              <Shield size={20} className="text-[#4A5DB5]" />
              Manage all company training programs and curriculum modules.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <EventEditDialog />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-20">
          {!events || events.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-32 text-[#7182C7] bg-white/40 backdrop-blur-3xl rounded-[4rem] border-4 border-dashed border-slate-100"
            >
              <BookOpen size={80} className="opacity-10 mb-6" />
              <p className="text-3xl font-black italic">No Events Scheduled</p>
              <p className="font-bold opacity-60 mt-2">Begin by deploying a new training event above.</p>
            </motion.div>
          ) : events.map((event, idx) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {/* Event Card Header */}
              <div className="group relative mb-10 p-8 rounded-[3rem] bg-white shadow-2xl shadow-blue-900/5 border border-slate-50 overflow-hidden transition-all hover:shadow-blue-900/10">
                <div className="absolute top-0 right-0 p-8">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${event.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    {event.is_active ? '● Active Program' : '○ Draft Mode'}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#4A5DB5] to-[#1A1A2E] flex items-center justify-center text-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <CalendarCheck size={40} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-5xl font-black text-[#1A1A2E] tracking-tight mb-2 italic">
                      {event.title}
                    </h2>
                    <p className="text-lg font-bold text-[#7182C7] max-w-2xl">
                      {event.description || 'No description provided for this event.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ModuleEditDialog eventId={event.id} />
                    <EventEditDialog event={event} />
                  </div>
                </div>
                
                <div className="mt-8 flex items-center gap-6 pt-8 border-t border-slate-50">
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-[#4A5DB5]" />
                     <p className="text-xs font-black text-[#1A1A2E] uppercase tracking-widest">
                       {event.weeks?.length || 0} Modules Integrated
                     </p>
                   </div>
                   <div className="h-4 w-[1px] bg-slate-200" />
                   <p className="text-xs font-bold text-[#A0ACDC]">
                     Created on {new Date(event.created_at).toLocaleDateString()}
                   </p>
                </div>
              </div>

              {/* Modules List */}
              <div className="grid grid-cols-1 gap-12 pl-12 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#4A5DB5]/20 via-[#4A5DB5]/10 to-transparent rounded-full ml-[-2px]" />
                
                {(event.weeks as any[])?.sort((a: any, b: any) => a.week_number - b.week_number).map((week, wIdx) => (
                  <div key={week.id} className="relative">
                    {/* Connector line dot */}
                    <div className="absolute left-[-54px] top-8 w-4 h-4 rounded-full bg-white border-4 border-[#4A5DB5] z-10" />
                    
                    <div className="flex items-center justify-between mb-6 group/mod">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-lg border border-slate-50 flex items-center justify-center text-[#4A5DB5] group-hover/mod:scale-110 transition-transform">
                          <TrendingUp size={24} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-[#1A1A2E] flex items-center gap-3">
                            {week.title}
                            {!week.is_visible && (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-md border border-rose-100">
                                Hidden
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-3 text-xs font-bold text-[#A0ACDC] mt-1">
                            <Calendar size={14} />
                            <span>{week.start_date}</span>
                            <span>→</span>
                            <span>{week.end_date || 'Ongoing'}</span>
                          </div>
                        </div>
                      </div>
                      <ModuleEditDialog eventId={event.id} module={week} />
                    </div>

                    <Card className="rounded-[3rem] bg-white shadow-xl border-none overflow-hidden group/card hover:shadow-2xl transition-all duration-500">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-none">
                              <TableHead className="font-black text-[#1A1A2E] px-10 py-8 w-[120px]">Day</TableHead>
                              <TableHead className="font-black text-[#1A1A2E]">Topic & Curriculum</TableHead>
                              <TableHead className="font-black text-[#1A1A2E] text-center">Materials</TableHead>
                              <TableHead className="font-black text-[#1A1A2E] text-right px-10">Manage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(week.days as any[]).sort((a: any, b: any) => a.day_number - b.day_number).map((day) => (
                              <TableRow key={day.id} className="hover:bg-blue-50/20 transition-colors border-b-slate-50 last:border-none group/row">
                                <TableCell className="px-10 py-8 font-black text-[#4A5DB5] text-lg">
                                  {day.day_number}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-black text-xl text-[#1A1A2E] group-hover/row:text-[#2238A4] transition-colors leading-tight">
                                      {day.topic}
                                    </p>
                                    <p className="text-xs font-bold text-[#7182C7] flex items-center gap-1.5 mt-2">
                                      <User size={12} className="text-[#A0ACDC]" /> 
                                      Instructor: <span className="text-[#1A1A2E]">{day.tutor_name || 'TBA'}</span>
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-4">
                                    {day.video_url && (
                                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm" title="Video Session Available">
                                        <Video size={18} />
                                      </div>
                                    )}
                                    {day.resource_link && (
                                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm" title="External Resources Available">
                                        <LinkIcon size={18} />
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right px-10">
                                  <DayEditDialog day={day} />
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={4} className="p-8 bg-slate-50/30">
                                <div className="flex justify-center">
                                  <DayEditDialog weekId={week.id} />
                                </div>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
