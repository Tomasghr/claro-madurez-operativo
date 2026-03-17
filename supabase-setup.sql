-- ─── TABLAS PARA MODELO OPERATIVO ─────────────────────────────────────────────
-- Ejecutar en el SQL Editor de Supabase

-- 1. Tabla de evaluaciones
CREATE TABLE IF NOT EXISTS evaluaciones_op (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  direccion        TEXT,
  rol              TEXT,
  score_global     DECIMAL(4,2),
  score_talento    DECIMAL(4,2),
  score_organizacion DECIMAL(4,2),
  score_liderazgo  DECIMAL(4,2),
  score_procesos   DECIMAL(4,2),
  score_tecnologia DECIMAL(4,2),
  score_cadena     DECIMAL(4,2),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de respuestas individuales
CREATE TABLE IF NOT EXISTS respuestas_op (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluacion_id   UUID REFERENCES evaluaciones_op(id) ON DELETE CASCADE,
  subdimension_id TEXT NOT NULL,
  dimension_key   TEXT NOT NULL,
  valor           INTEGER CHECK (valor BETWEEN 1 AND 4),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (evaluacion_id, subdimension_id)
);

-- 3. Habilitar Row Level Security
ALTER TABLE evaluaciones_op ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_op   ENABLE ROW LEVEL SECURITY;

-- 4. Políticas permisivas (lectura y escritura pública con anon key)
CREATE POLICY "allow_all_evaluaciones_op" ON evaluaciones_op
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_respuestas_op" ON respuestas_op
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Habilitar Realtime (para actualizaciones en tiempo real en el tablero)
ALTER PUBLICATION supabase_realtime ADD TABLE evaluaciones_op;
ALTER PUBLICATION supabase_realtime ADD TABLE respuestas_op;
