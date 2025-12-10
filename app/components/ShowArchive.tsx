interface ShowArchiveProps {
  show: boolean;
  setShowArchive: (show:boolean) => void;
}

export default function ShowArchive({
  show,
  setShowArchive,
}: ShowArchiveProps) {
  return (
    <button onClick={() => setShowArchive(!show)}>Show archive</button>
  );
}
