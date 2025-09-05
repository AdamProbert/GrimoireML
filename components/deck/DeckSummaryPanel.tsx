export default function DeckSummaryPanel() {
  return (
    <div className="panel h-full flex flex-col p-4 gap-4">
      <h3 className="text-sm font-semibold tracking-wide text-gradient-brand">Summary</h3>
      <div className="space-y-3 text-xs text-[color:var(--color-text-subtle)]">
        <div>
          <div className="uppercase tracking-wide mb-1 text-[10px] text-[color:var(--color-text-muted)]">Mana Curve (mock)</div>
          <div className="flex items-end gap-1 h-20">
            {[2,5,7,4,3].map((v,i) => (
              <div key={i} style={{ height: v * 6 }} className="w-4 bg-[color:var(--color-accent-teal)]/40 rounded-sm" />
            ))}
          </div>
        </div>
        <div className="rune-divider" />
        <div>
          <div className="uppercase tracking-wide mb-1 text-[10px] text-[color:var(--color-text-muted)]">Planned Stats</div>
          <ul className="space-y-1">
            <li>Cards: <span className="text-[color:var(--color-text-primary)]">0/60</span></li>
            <li>Avg Mana Value: —</li>
            <li>Colors: —</li>
          </ul>
        </div>
        <div className="rune-divider" />
        <div>
          <div className="uppercase tracking-wide mb-1 text-[10px] text-[color:var(--color-text-muted)]">AI Rationale</div>
          <p className="text-[11px] leading-relaxed">Future area for generated explanations describing synergy, strategy, and suggested upgrades.</p>
        </div>
      </div>
    </div>
  );
}
