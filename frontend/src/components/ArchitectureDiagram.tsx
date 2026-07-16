import React from 'react';
import { motion } from 'framer-motion';

export const ArchitectureDiagram: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="w-full py-12 px-4 light-panel rounded-2xl relative overflow-hidden my-16 max-w-5xl mx-auto bg-white">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-brandIndigo font-semibold">AWS Serverless Stack</span>
        <h3 className="text-2xl md:text-3xl font-bold font-outfit mt-1 text-zinc-900">How ByteMentor AI Works</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-xl mx-auto">
          An always-on automated learning pipeline that delivers fresh micro-lessons without user intervention.
        </p>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10 items-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Step 1: EventBridge */}
        <motion.div 
          className="flex flex-col items-center text-center p-5 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-zinc-300 transition-colors"
          variants={itemVariants}
        >
          <div className="w-16 h-16 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4 hover:scale-105 transition-transform">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xs text-red-600 font-semibold px-2 py-0.5 bg-red-50 rounded-full border border-red-100">EventBridge</span>
          <h4 className="text-sm font-semibold text-zinc-900 mt-3">Daily Cron Trigger</h4>
          <p className="text-xs text-zinc-500 mt-2">Automatically fires every morning at 7:00 AM.</p>
        </motion.div>

        {/* Arrow 1 */}
        <div className="hidden md:flex justify-center text-zinc-400 font-mono text-xl animate-pulse">→</div>

        {/* Step 2: Lambda */}
        <motion.div 
          className="flex flex-col items-center text-center p-5 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-zinc-300 transition-colors"
          variants={itemVariants}
        >
          <div className="w-16 h-16 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-4 hover:scale-105 transition-transform">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="text-xs text-amber-600 font-semibold px-2 py-0.5 bg-amber-50 rounded-full border border-amber-100">AWS Lambda</span>
          <h4 className="text-sm font-semibold text-zinc-900 mt-3">Execution Engine</h4>
          <p className="text-xs text-zinc-500 mt-2">Processes triggers, manages integrations, & handles APIs.</p>
        </motion.div>

        {/* Arrow 2 */}
        <div className="hidden md:flex justify-center text-zinc-400 font-mono text-xl animate-pulse">→</div>

        {/* Step 3: Bedrock Nova Lite */}
        <motion.div 
          className="flex flex-col items-center text-center p-5 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-zinc-300 transition-colors"
          variants={itemVariants}
        >
          <div className="w-16 h-16 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-4 hover:scale-105 transition-transform">
            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096L3 15.187m6 5.813a2.001 2.001 0 003.524 0M14.187 15.904L15 21m0 0l.813-5.096L21 15.187M12 3v13.5m0-13.5L8.25 6.75M12 3l3.75 3.75" />
            </svg>
          </div>
          <span className="text-xs text-purple-600 font-semibold px-2 py-0.5 bg-purple-50 rounded-full border border-purple-100">Amazon Bedrock</span>
          <h4 className="text-sm font-semibold text-zinc-900 mt-3">Bedrock Nova Lite</h4>
          <p className="text-xs text-zinc-500 mt-2">Generates a formatted JSON tech lesson.</p>
        </motion.div>
      </motion.div>

      {/* Second row of connections */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-start mt-8 pt-8 border-t border-zinc-200"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* DynamoDB Database */}
        <motion.div 
          className="flex flex-col items-center text-center p-5 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-zinc-300 transition-colors"
          variants={itemVariants}
        >
          <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-3 hover:scale-105 transition-transform">
            <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75" />
            </svg>
          </div>
          <span className="text-xs text-blue-600 font-semibold px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100">Amazon DynamoDB</span>
          <h4 className="text-sm font-semibold text-zinc-900 mt-2">Lessons Table</h4>
          <p className="text-xs text-zinc-500 mt-1">Saves lessons keyed by date, tracking completion status.</p>
        </motion.div>

        {/* Web Frontend (Amplify) */}
        <motion.div 
          className="flex flex-col items-center text-center p-5 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-zinc-300 transition-colors"
          variants={itemVariants}
        >
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 mb-3 hover:scale-105 transition-transform">
            <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
            </svg>
          </div>
          <span className="text-xs text-teal-600 font-semibold px-2 py-0.5 bg-teal-50 rounded-full border border-teal-100">AWS Amplify</span>
          <h4 className="text-sm font-semibold text-zinc-900 mt-2">Vite React App</h4>
          <p className="text-xs text-zinc-500 mt-1">Queries Lambda Function URL to fetch and mark lessons.</p>
        </motion.div>

        {/* Amazon SES Email */}
        <motion.div 
          className="flex flex-col items-center text-center p-5 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-zinc-300 transition-colors"
          variants={itemVariants}
        >
          <div className="w-14 h-14 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 mb-3 hover:scale-105 transition-transform">
            <svg className="w-7 h-7 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <span className="text-xs text-sky-600 font-semibold px-2 py-0.5 bg-sky-50 rounded-full border border-sky-100">Amazon SES</span>
          <h4 className="text-sm font-semibold text-zinc-900 mt-2">Email Notifications</h4>
          <p className="text-xs text-zinc-500 mt-1">Optionally emails the full lesson directly to your inbox.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};
