'use client';

import { useEffect, useState } from 'react';

interface Update {
  id: string;
  milestoneName: string;
  description: string;
  progressPct: number;
  updateDate: string;
  photoUrls: string[];
}

export function ConstructionFeed() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch or call from API
    // const fetchUpdates = async () => { ... }
    setUpdates([
      {
        id: '1',
        milestoneName: 'Foundation Completed',
        description: 'The foundation for Tower A has been successfully laid according to structural specs.',
        progressPct: 15,
        updateDate: '2026-03-10',
        photoUrls: [],
      },
      {
         id: '2',
         milestoneName: '5th Floor Slabs Cast',
         description: 'Recent progress on Tower B includes completion of 5th floor slab casting.',
         progressPct: 40,
         updateDate: '2026-03-18',
         photoUrls: [],
       }
    ]);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading progress...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Construction Progress</h3>
        <span className="text-blue-600 font-bold">{updates[0]?.progressPct}% Complete</span>
      </div>

      <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-10">
        {updates.map((update) => (
          <div key={update.id} className="relative pl-8">
            <div className="absolute -top-1 -left-[11px] w-5 h-5 rounded-full bg-blue-600 border-4 border-white dark:border-slate-900" />
            <div className="text-sm text-slate-500 mb-1">{new Date(update.updateDate).toLocaleDateString()}</div>
            <h4 className="font-bold text-lg">{update.milestoneName}</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-2">{update.description}</p>
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${update.progressPct}%` }}
                />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
