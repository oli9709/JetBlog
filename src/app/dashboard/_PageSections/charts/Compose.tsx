'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
  ResponsiveContainer
} from 'recharts';

const rawData = [
  { name: 'Jan',   uv: 590,  pv: 800,  amt: 1400, cnt: 490 },
  { name: 'Feb',   uv: 868,  pv: 967,  amt: 1506, cnt: 590 },
  { name: 'Mar',   uv: 1397, pv: 1098, amt: 989,  cnt: 350 },
  { name: 'April', uv: 1480, pv: 1200, amt: 1228, cnt: 480 },
  { name: 'May',   uv: 1520, pv: 1108, amt: 1100, cnt: 460 },
  { name: 'June',  uv: 1400, pv: 680,  amt: 1700, cnt: 380 },
];

const data = rawData.map(d => ({
  ...d,
  uv:  d.uv  || 0,
  pv:  d.pv  || 0,
  amt: d.amt || 0,
  cnt: d.cnt || 0,
}));

const Compose = () => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="p-4 bg-background-light dark:bg-background-dark min-h-[450px]">
        <CardTitle className="mb-6 text-center">Current Sales Growth:</CardTitle>
        <CardContent className="flex items-center justify-center h-[350px]">
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-background-light dark:bg-background-dark">
      <CardTitle className="mb-6 text-center">Current Sales Growth:</CardTitle>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            width={500}
            height={400}
            data={data}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20
            }}
          >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="name" scale="band" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" />
            <Bar dataKey="pv" barSize={20} fill="#413ea0" />
            <Line type="monotone" dataKey="uv" stroke="#ff7300" />
            <Scatter dataKey="cnt" fill="red" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default Compose;
