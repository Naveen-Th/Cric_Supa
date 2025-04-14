
import { useState } from 'react';
import { useCricket } from '@/context/CricketContext';
import MainLayout from '@/components/layout/MainLayout';
import PlayerSearch from '@/components/admin/PlayerSearch';
import PlayersTable from '@/components/admin/PlayersTable';
import PlayerEditDialog from '@/components/admin/PlayerEditDialog';
import { Player } from '@/types/cricket';

const AllPlayers = () => {
  const { players, teams, updatePlayer } = useCricket();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teams.find(t => t.id === player.teamId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
        players={filteredPlayers}
        teams={teams}
        onEditPlayer={handleEditPlayer}
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
