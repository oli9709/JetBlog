'use client';

import dynamic from 'next/dynamic';
import SummaryCard from './SummaryCard';
import { Icons } from '@/components/Icons';

const ComposeChart = dynamic(() => import('../../_PageSections/charts/Compose'), { ssr: false });
const BarChart = dynamic(() => import('../../_PageSections/charts/Bar'), { ssr: false });
const PieChart = dynamic(() => import('../../_PageSections/charts/Pie'), { ssr: false });

interface DashboardStats {
  credits: number;
  sitesCount: number;
  totalArticles: number;
  publishedArticles: number;
}

interface DashboardProps {
  stats: DashboardStats;
}

const Dashboard = ({ stats }: DashboardProps) => {
  return (
    <div className="w-11/12 space-y-6">
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          card_title={'Kreditlar'}
          icon={<Icons.CircleDollarSign />}
          content_main={stats.credits}
          content_secondary={'Qolgan AI maqola kreditlari'}
        />
        <SummaryCard
          card_title={'Saytlar'}
          icon={<Icons.Link />}
          content_main={stats.sitesCount}
          content_secondary={'Ulangan WordPress saytlar'}
        />
        <SummaryCard
          card_title={'Maqolalar'}
          icon={<Icons.FileText />}
          content_main={stats.totalArticles}
          content_secondary={'Jami yaratilgan maqolalar'}
        />
        <SummaryCard
          card_title={'Nashr etilgan'}
          icon={<Icons.ScreenShare />}
          content_main={stats.publishedArticles}
          content_secondary={'WordPress-ga yuklangan maqolalar'}
        />
      </div>
      <div>
        <ComposeChart />
      </div>
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-4">
        <div className="md:col-span-3">
          <BarChart />
        </div>
        <div className="md:col-span-1">
          <PieChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
