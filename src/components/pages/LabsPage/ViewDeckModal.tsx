import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/Dialog';
import { YearDistribution } from '../../ui/YearDistribution/YearDistribution';
import { Deck } from '../../../types/deck';

interface ViewDeckModalProps {
  deck: Deck;
  onClose: () => void;
}

export const ViewDeckModal: React.FC<ViewDeckModalProps> = ({ deck, onClose }) => {
  const songs = deck.songs || [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{deck.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="font-semibold">Songs</h3>
          <ul className="list-disc pl-5">
            {songs.map(song => (
              <li key={song.id}>{song.title} ({song.year})</li>
            ))}
          </ul>
          <div className="mt-4">
            <YearDistribution songs={songs} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
