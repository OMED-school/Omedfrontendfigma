# Multi‑Tenancy — Optionen & Vorgehen

Kurzüberblick
- Ziel: mehrere Schulen (Tenants) zuverlässig zu trennen und trotzdem wartbar zu bleiben.
- Empfehlung für Demo/erste Schule: bei deinem aktuellen Setup bleiben (Single‑Tenant). Multi‑Tenant nur einführen, wenn nötig.

Empfehlungen (Kurz)
- Empfohlenes Modell: zentrale Supabase‑Instanz mit `tenants`‑Tabelle und `tenant_id` auf Datenzeilen.
- Alternative: pro‑Schule eigenes Supabase‑Projekt — hohes Betriebsaufwand, stärkere Isolation.

Wesentliche Schritte zum Multi‑Tenant (zusammengefasst)
1) Tenants‑Tabelle
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

2) `tenant_id` Spalte zu bestehenden Tabellen hinzufügen
```sql
ALTER TABLE profiles ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE ideas ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE comments ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE votes ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE comment_votes ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE messages ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE notifications ADD COLUMN tenant_id UUID REFERENCES tenants(id);
```

3) RLS‑Strategie (Beispiel für `ideas`)
```sql
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ideas: tenant scoped select" ON ideas
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Ideas: tenant scoped insert" ON ideas
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND author_id = auth.uid()
  );
```

4) Onboarding / Trigger
- Passe die `handle_new_user` Trigger‑Funktion so an, dass neue Profile ein `tenant_id` erhalten (z. B. Default‑Tenant oder Tenant, den ein School‑Admin zuvor erstellt hat).

5) Migration / Backfill
- Erstelle zuerst einen Tenant für die bestehende Schule, dann backfille alle existierenden Zeilen mit dessen `id`.
```sql
-- Beispiel: Tenant anlegen
INSERT INTO tenants (name, slug) VALUES ('Default School','default-school') RETURNING id;

-- Backfill (UUID ersetzen)
UPDATE profiles SET tenant_id = '<DEFAULT_TENANT_UUID>' WHERE tenant_id IS NULL;
-- analog für ideas, comments, votes, comment_votes, messages, notifications
```

6) App‑Anpassungen
- Beim Signup/Onboarding `tenant_id` setzen (z. B. School‑Admin erstellt Tenant, danach Signups zuordnen).
- Dank RLS müssen Queries in der App i.d.R. nicht extra gefiltert werden, die Policies sorgen für Isolation.

Entscheidungshilfe
- Single‑Tenant (aktuelles Setup): schnell, einfach für Demo und einzelne Schule — weiterverwenden.
- Multi‑Tenant (zentrale Instanz): empfiehlt sich bei vielen Schulen, erlaubt Feature‑Rollout und zentralen Betrieb.
- Separate Projekte: bei rechtlichen/abonement‑Gründen oder strikter Isolation erforderlich.

Nächste Schritte (wenn du Multi‑Tenant willst)
- Ich kann ein vollständiges SQL‑Migrationsskript erzeugen (Tenants, Spalten, Policies, Backfill, Trigger).
- Oder ich kann nur die RLS‑Policy‑Vorlagen in `SUPABASE_SETUP.md` ergänzen.

Für jetzt: Du bleibst beim Single‑Tenant für Demo und Schule — keine Änderungen nötig in [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

Datei erstellt von: Team‑Dokumentation
