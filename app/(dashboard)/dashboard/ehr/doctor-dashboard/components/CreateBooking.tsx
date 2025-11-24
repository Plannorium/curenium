"use client";

import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateBookingProps {}

const CreateBooking: FC<CreateBookingProps> = ({}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [service, setService] = useState('');
  const [type, setType] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ name, contact, service, type, scheduledAt });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Booking</h2>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact</label>
        <Input
          id="contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="mt-1 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service</label>
        <Input
          id="service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="mt-1 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
        <Select onValueChange={setType} value={type}>
          <SelectTrigger className="mt-1 dark:bg-gray-700 dark:text-white">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-700 dark:text-white">
            <SelectItem value="teleconsult">Teleconsult</SelectItem>
            <SelectItem value="clinic">Clinic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scheduled At</label>
        <Input
          id="scheduledAt"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="mt-1 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Create Booking</Button>
    </form>
  );
};

export default CreateBooking;