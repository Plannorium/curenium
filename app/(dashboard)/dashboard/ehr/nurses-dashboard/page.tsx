import { FC } from 'react';
import Vitals from './components/Vitals';
import Notes from './components/Notes';
import Medications from './components/Medications';

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  const patientId = "6565f24217343423b6723b78"; // Replace with dynamic patient ID

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Nurses Dashboard</h1>
          <Vitals patientId={patientId} />
          <Notes patientId={patientId} />
          <Medications patientId={patientId} />
        </div>
      </div>
    </div>
  );
};

export default page;