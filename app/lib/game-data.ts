import gameDataExport from './game-data.json';

export type GameDataKind = 'item' | 'recipe' | 'skill' | 'creature' | 'location' | 'npc' | 'system' | 'other';
export type GameDataValue = string | number | boolean;
export type GameDataConfidence = 'engine' | 'observed' | 'inferred';

export type GameDataRecord = {
  id: string;
  name: string;
  kind: GameDataKind;
  fields: Record<string, GameDataValue>;
  notes?: string;
  source: {
    file: string;
    objectPath?: string;
    build?: string;
    extractedAt?: string;
    confidence: GameDataConfidence;
  };
};

export type GameDataExport = {
  version: 1;
  build?: string;
  exportedAt?: string | null;
  records: GameDataRecord[];
};

const gameDataKinds = new Set<GameDataKind>(['item', 'recipe', 'skill', 'creature', 'location', 'npc', 'system', 'other']);
const privateFieldNames = /^(?:player|character|account|auth|token|secret|password|inventory|bank|coordinates?|position|command(?:file)?|session)/i;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function publicFields(value: unknown) {
  if (!isObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => (
      (typeof fieldValue === 'string' || typeof fieldValue === 'number' || typeof fieldValue === 'boolean')
      && Number.isFinite(typeof fieldValue === 'number' ? fieldValue : 0)
    )).filter(([key]) => !privateFieldNames.test(key)).map(([key, fieldValue]) => [key, fieldValue as GameDataValue]),
  );
}

function parseRecord(value: unknown): GameDataRecord | null {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.kind !== 'string' || !gameDataKinds.has(value.kind as GameDataKind) || !isObject(value.source)) return null;
  if (typeof value.source.file !== 'string' || typeof value.source.confidence !== 'string' || !['engine', 'observed', 'inferred'].includes(value.source.confidence)) return null;
  return {
    id: value.id.slice(0, 200),
    name: value.name.slice(0, 200),
    kind: value.kind as GameDataKind,
    fields: publicFields(value.fields),
    ...(typeof value.notes === 'string' ? { notes: value.notes.slice(0, 2000) } : {}),
    source: {
      file: value.source.file.slice(0, 200),
      ...(typeof value.source.objectPath === 'string' ? { objectPath: value.source.objectPath.slice(0, 300) } : {}),
      ...(typeof value.source.build === 'string' ? { build: value.source.build.slice(0, 100) } : {}),
      ...(typeof value.source.extractedAt === 'string' ? { extractedAt: value.source.extractedAt.slice(0, 80) } : {}),
      confidence: value.source.confidence as GameDataConfidence,
    },
  };
}

const imported = gameDataExport as Partial<GameDataExport>;

export const gameDataBuild = typeof imported.build === 'string' ? imported.build : 'unknown build';
export const gameDataExportedAt = typeof imported.exportedAt === 'string' ? imported.exportedAt : null;
export const gameDataRecords: GameDataRecord[] = Array.isArray(imported.records)
  ? imported.records.map(parseRecord).filter((record): record is GameDataRecord => record !== null)
  : [];
