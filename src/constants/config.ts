/**
 * アプリケーション定数
 * マジックナンバーを集約して保守性を向上
 */

/** 画像処理に関する設定 */
export const IMAGE_CONFIG = {
  /** AI生成画像のキャンバスサイズ */
  canvas: {
    width: 1024,
    height: 1024,
  },
  /** プレビュー画像の最大サイズ */
  preview: {
    maxWidth: 1280,
    maxHeight: 1280,
  },
  /** アップロード可能な最大ファイルサイズ (10MB) */
  maxFileSize: 10 * 1024 * 1024,
  /** 許可するファイルタイプ */
  allowedTypes: /image\/(png|jpe?g)/,
} as const

/** スライダー（色調補正）の設定 */
export const SLIDER_CONFIG = {
  min: -100,
  max: 100,
  default: 0,
} as const

/** 色温度調整の設定 */
export const COLOR_TEMP_CONFIG = {
  /** 正規化用オフセット */
  offset: 100,
  /** 正規化用除数 */
  divisor: 200,
  /** 暖色オーバーレイの色 */
  warmColor: 'rgba(255,200,100,',
  /** 暖色オーバーレイの係数 */
  warmCoefficient: 0.08,
} as const

/** 彩度調整の設定 */
export const SATURATION_CONFIG = {
  /** 正規化用除数 */
  divisor: 100,
  /** 明るさ調整の係数 */
  coefficient: 0.05,
} as const

/** タイミング設定 */
export const TIMING_CONFIG = {
  /** デバウンス時間 (ms) */
  debounceMs: 100,
  /** モック保存の待機時間 (ms) */
  mockSaveDelayMs: 300,
} as const

/** APIサーバー設定 */
export const API_SERVERS = [
  { id: 'same', url: '', label: 'sameHost' },
  { id: 'cloud', url: 'https://mabl-cosme-api-ixi7x7b23a-an.a.run.app', label: 'cloudServer' },
] as const

export type ApiServerId = typeof API_SERVERS[number]['id']

/** 対応言語 */
export const LOCALES = ['ja', 'en', 'zh'] as const
export type Locale = typeof LOCALES[number]
