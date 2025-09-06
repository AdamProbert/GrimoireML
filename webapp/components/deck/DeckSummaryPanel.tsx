import Heading from '../Heading';
import StatRow from '../ui/StatRow';

export default function DeckSummaryPanel() {
  return (
    <div className="panel h-full flex flex-col p-4 gap-4">
      <Heading level={3} className="text-sm tracking-wide">
        Summary
      </Heading>
      <div className="space-y-3 text-xs text-[color:var(--color-text-subtle)]">
        <div>
          <div className="uppercase tracking-wide mb-1 text-[10px] text-[color:var(--color-text-muted)]">
            Mana Curve (mock)
          </div>
          <div className="flex items-end gap-1 h-20">
            {[2, 5, 7, 4, 3].map((v, i) => (
              <div
                key={i}
                style={{ height: v * 6 }}
                className="w-4 rounded-sm bg-[color:var(--color-accent-primary)]/30 border border-[color:var(--color-accent-primary)]/40"
              />
            ))}
          </div>
        </div>
        <div className="rune-divider" />
        <div className="space-y-1">
          <div className="uppercase tracking-wide mb-1 text-[10px] text-[color:var(--color-text-muted)]">
            Planned Stats
          </div>
          <StatRow label="Cards" value={<span>0/60</span>} />
          <StatRow label="Avg MV" value="—" subtle />
          <StatRow label="Colors" value="—" subtle />
        </div>
        <div className="rune-divider" />
        <div>
          <div className="uppercase tracking-wide mb-1 text-[10px] text-[color:var(--color-text-muted)]">
            AI Rationale
          </div>
          <p className="text-[11px] leading-relaxed">
            Future area for generated explanations describing synergy, strategy, and
            suggested upgrades.
          </p>
        </div>
      </div>
    </div>
  );
}
