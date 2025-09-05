import { Title, Text, Alert } from '@mantine/core';

export const metadata = { title: 'Deck Builder - GrimoireML' };

export default function DecksPage() {
  return (
    <div className="space-y-6">
      <div>
        <Title order={2}>Deck Builder (Early Stub)</Title>
        <Text size="sm" c="dimmed">Planned: drag-and-drop zones, curve + synergy insights, AI suggestions.</Text>
      </div>
      <Alert variant="light" color="brand" title="Coming Soon" radius="md">
        This space will evolve into an interactive deck workspace. For now it just proves routing & shell layout.
      </Alert>
    </div>
  );
}
