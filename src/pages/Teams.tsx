import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useCricket } from '@/context/CricketContext';
import TeamCard from '@/components/TeamCard';
import EmptyState from '@/components/ui/empty-state';

const Teams = () => {
  const { teams, loading } = useCricket();
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cricket-accent"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
        <p className="text-muted-foreground">
          Manage your cricket teams. View, add, edit, and delete teams.
        </p>
      </div>
      
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Teams Available"
          description="Get started by creating your first cricket team."
        />
      )}
    </MainLayout>
  );
};

export default Teams;
