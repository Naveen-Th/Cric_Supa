import { useState } from 'react';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import PlayerSearch from '@/components/admin/PlayerSearch';
import PlayersTable from '@/components/admin/PlayersTable';
import PlayerEditDialog from '@/components/admin/PlayerEditDialog';
import { Player } from '@/types/cricket';

type SortField = 'name' | 'teamName';
type SortOrder = 'asc' | 'desc';

const AllPlayers = () => {
  const { players, teams, updatePlayer } = useCricket();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Filter players based on search term
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teams.find(t => t.id === player.teamId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered players
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortField === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      const teamA = teams.find(t => t.id === a.teamId)?.name || '';
      const teamB = teams.find(t => t.id === b.teamId)?.name || '';
      return sortOrder === 'asc'
        ? teamA.localeCompare(teamB)
        : teamB.localeCompare(teamA);
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowEditDialog(true);
  };
  
  const handleSaveEdit = (updatedPlayer: Player) => {
    updatePlayer(updatedPlayer);
    setShowEditDialog(false);
    setEditingPlayer(null);
  };
  
  return (
    <MainLayout isAdmin>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Players</h1>
      </div>
      
      <PlayerSearch 
        onSearch={setSearchTerm}
        initialSearchTerm={searchTerm}
      />
      
      <PlayersTable 
        players={sortedPlayers}
        teams={teams}
        onEditPlayer={handleEditPlayer}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
      
      <PlayerEditDialog 
        player={editingPlayer}
        teams={teams}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSaveEdit}
      />
    </MainLayout>
  );
};

export default AllPlayers;
