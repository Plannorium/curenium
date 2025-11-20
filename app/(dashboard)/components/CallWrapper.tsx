"use client";

import { useParams } from 'next/navigation';
import Chat from './Chat';
import CallPage from '../call/[callId]/page';

export default function CallWrapper() {
  const params = useParams();
  const callId = params?.callId as string;

  return callId ? <CallPage /> : <Chat />;
}