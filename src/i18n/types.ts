import type { LOCALES } from '../constants/config'

/** サポートする言語 */
export type Locale = typeof LOCALES[number]

/** 翻訳キー */
export type TranslationKey =
  | 'appTitle'
  | 'env'
  | 'login'
  | 'logout'
  | 'email'
  | 'password'
  | 'upload'
  | 'orDrop'
  | 'aiGenerate'
  | 'adjust'
  | 'colorTemp'
  | 'saturation'
  | 'apply'
  | 'save'
  | 'download'
  | 'gallery'
  | 'language'
  | 'generating'
  | 'applied'
  | 'saved'
  | 'needImage'
  | 'promptLabel'
  | 'defaultPrompt'
  | 'apiServer'
  | 'sameHost'
  | 'cloudServer'

/** 翻訳辞書の型 */
export type Translations = Record<Locale, Record<TranslationKey, string>>
