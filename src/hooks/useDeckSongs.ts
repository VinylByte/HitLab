import { useState, useEffect } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  year?: number;
  [key: string]: any;
}

export function useDeckSongs(deckId: string) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deckId) return;
    setLoading(true);
    fetch(`/api/decks/${deckId}/songs`)
      .then(res => res.json())
      .then(data => {
        const songsWithYear = data.map((song: any) => {
          if (song.year !== undefined) return song;
          let year: number | undefined;
          if (song.release_year) year = song.release_year;
          else if (song.release_date) year = new Date(song.release_date).getFullYear();
          return { ...song, year };
        });
        setSongs(songsWithYear);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [deckId]);

  return { songs, loading, error };
}
