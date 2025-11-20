"use client"; 
 

 import React, { useState, useEffect } from 'react'; 
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; 
 import { Button } from '@/components/ui/button'; 
 import { XIcon, MessageSquare, Loader2 } from 'lucide-react'; 
 

 interface User { 
   id: string; 
   _id: string; 
   fullName: string; 
   image?: string; 
   role?: string; 
   email?: string; 
   isOnline?: boolean; 
 } 
 

 interface Channel { 
   _id: string; 
   name: string; 
 } 
 

 interface UserProfileCardProps { 
   user: User; 
   onClose: () => void; 
   onStartChat: (roomId: string) => void; 
   currentUserId?: string; 
 } 
 

 export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onClose, onStartChat, currentUserId }) => { 
   const [userChannels, setUserChannels] = useState<Channel[]>([]); 
   const [isLoading, setIsLoading] = useState(false); 
 

   useEffect(() => { 
     const fetchUserChannels = async () => { 
       if (! user ?._id) return; 
       setIsLoading(true); 
       try { 
         const response = await fetch(`/api/users/${ user ._id}/channels`); 
         if (response.ok) { 
           const data: { channels: Channel[] } = await response.json(); 
           setUserChannels(data.channels || []); 
         } 
       } catch (error) { 
         console.error("Failed to fetch user's channels", error); 
       } finally { 
         setIsLoading(false); 
       } 
     }; 
     fetchUserChannels(); 
   }, [ user ?._id]); 
 

   if (! user ) return null; 
 

   return ( 
     <div className ="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in-50"> 
       <div className ="relative w-full max-w-sm m-4"> 
         <div className ="absolute top-2 right-2"> 
           <Button variant ="ghost" size ="sm" className ="p-2 rounded-full" onClick ={onClose}> 
             <XIcon size ={18} /> 
           </Button> 
         </div> 
         <div className ="p-8 bg-background/85 dark:bg-slate-900/80 rounded-xl shadow-2xl border-border/30 "> 
           <div className ="flex flex-col items-center text-center"> 
             <Avatar className ="h-24 w-24 border-4 border-background shadow-lg"> 
               <AvatarImage src ={ user .image || undefined} /> 
               <AvatarFallback className ="text-3xl bg-primary/10 text-primary"> 
                 {( user .fullName || "").split(" ").map( n  => n [0]).join("").slice(0, 2)} 
               </AvatarFallback> 
             </Avatar> 
             <h3 className ="text-2xl font-bold mt-4 text-foreground">{ user .fullName}</h3> 
             { user .role && <p className ="text-sm text-muted-foreground font-medium">{ user .role}</p>} 
 

             <div className ="mt-6 w-full text-left"> 
               <h4 className ="font-semibold text-foreground mb-2">Channels</h4> 
               <div className ="flex flex-wrap gap-2"> 
                 {isLoading ? ( 
                   <div className ="flex items-center justify-center w-full"> 
                     <Loader2 className ="animate-spin text-primary" size ={24} /> 
                   </div> 
                 ) : userChannels.length > 0 ? userChannels.map( channel  => ( 
                   <span key ={ channel ._id} className ="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full"># { channel .name}</span> 
                 )) : ( 
                   <p className ="text-xs text-muted-foreground">Not a member of any channels yet.</p> 
                 )} 
               </div> 
             </div> 
 

           { user ._id !== currentUserId  && ( 
             <div className ="mt-8"> 
               <Button 
                 className ="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/40" 
                 onClick ={() => {
                   if (currentUserId) {
                     const room = [currentUserId, user._id].sort().join("--");
                     onStartChat(room);
                   }
                 }}
               > 
                 <MessageSquare size ={16} className ="mr-2" /> 
                 Message 
               </Button> 
             </div> 
           )} 
         </div> 
       </div> 
     </div> 
     </div> 
   ); 
 };